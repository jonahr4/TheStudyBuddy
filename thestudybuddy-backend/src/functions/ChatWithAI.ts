import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import { noteRepo } from "../index";
import { ChatRequest, ChatResponse, ErrorResponse } from "../shared/types";
import { AzureOpenAI } from "openai";
import { BlobServiceClient } from "@azure/storage-blob";
import ChatMessage from "../models/ChatMessage";

// Azure OpenAI configuration
const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const openaiApiKey = process.env.AZURE_OPENAI_API_KEY;
const openaiDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

// Blob Storage configuration
const storageConnectionString = process.env.STORAGE_CONNECTION_STRING;
const textContainerName = process.env.STORAGE_NOTES_TEXT_CONTAINER;

if (!openaiEndpoint || !openaiApiKey || !openaiDeploymentName) {
  throw new Error("Azure OpenAI configuration is missing in environment variables");
}

if (!storageConnectionString || !textContainerName) {
  throw new Error("Storage configuration is missing in environment variables");
}

const openaiClient = new AzureOpenAI({
  endpoint: openaiEndpoint,
  apiKey: openaiApiKey,
  apiVersion: "2024-12-01-preview",
});

const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);
const textContainerClient = blobServiceClient.getContainerClient(textContainerName);

/**
 * Fetch text content from Azure Blob Storage
 */
async function fetchNoteText(textUrl: string): Promise<string> {
  try {
    // Extract blob name from URL
    const url = new URL(textUrl);
    const blobName = url.pathname.split('/').slice(2).join('/'); // Remove container name
    
    const blobClient = textContainerClient.getBlobClient(blobName);
    const downloadResponse = await blobClient.download();
    
    if (!downloadResponse.readableStreamBody) {
      return "";
    }
    
    const chunks: Buffer[] = [];
    for await (const chunk of downloadResponse.readableStreamBody) {
      chunks.push(Buffer.from(chunk));
    }
    
    return Buffer.concat(chunks).toString('utf-8');
  } catch (error) {
    console.error(`Failed to fetch text from ${textUrl}:`, error);
    return "";
  }
}

/**
 * POST /api/ai/chat - Chat with AI about a subject's notes using RAG
 * 
 * Body: {
 *   subjectId: string;
 *   message: string;
 *   chatHistory?: ChatMessage[];
 * }
 */
app.http("chatWithAI", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "ai/chat",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const body = await request.json() as ChatRequest;

      // Validate required fields
      if (!body.subjectId || !body.message) {
        return {
          status: 400,
          jsonBody: { message: "subjectId and message are required" } as ErrorResponse,
        };
      }

      context.log(`Chat request for subject ${body.subjectId}`);
      context.log(`User message: ${body.message}`);

      // 1. Load chat history from MongoDB (last 20 messages)
      const chatHistory = await ChatMessage.find({
        userId,
        subjectId: body.subjectId,
      })
        .sort({ timestamp: 1 })
        .limit(20)
        .exec();

      context.log(`Loaded ${chatHistory.length} previous messages from database`);

      // 2. Fetch all notes for the subject
      const notes = await noteRepo.getNotesForSubject(userId, body.subjectId);
      
      if (notes.length === 0) {
        return {
          status: 200,
          jsonBody: {
            reply: "You don't have any notes uploaded for this subject yet. Please upload some PDF notes first, and I'll be able to help you study!",
          } as ChatResponse,
        };
      }

      context.log(`Found ${notes.length} notes for this subject`);

      // 3. Fetch extracted text from all notes with textUrl
      const noteTexts: string[] = [];
      for (const note of notes) {
        if (note.textUrl && !note.textUrl.includes('placeholder')) {
          const text = await fetchNoteText(note.textUrl);
          if (text.trim()) {
            noteTexts.push(`\n--- From: ${note.fileName} ---\n${text}`);
          }
        }
      }

      if (noteTexts.length === 0) {
        return {
          status: 200,
          jsonBody: {
            reply: "Your notes are still being processed for text extraction. Please try triggering text extraction first, or wait a moment and try again.",
          } as ChatResponse,
        };
      }

      context.log(`Successfully fetched text from ${noteTexts.length} notes`);

      // 4. Build context from all note texts
      const contextText = noteTexts.join('\n\n');
      const contextPreview = contextText.substring(0, 500);
      context.log(`Context preview: ${contextPreview}...`);

      // 5. Build messages for Azure OpenAI
      const systemInstructions = `You are **The Study Buddy**, a friendly AI tutor created by Jonah Rothman and Sean Tomany, Boston University students. Your job is to help the user understand their class material using the notes and PDF text that will always be provided to you.
          RULES TO FOLLOW:
          1. Introduce yourself naturally as The Study Buddy if you havent already in the past chat context. This is for users to know who you are and what you do on your first message.
          2. Keep your answers short, clear, and friendly — never ramble.
          3. Always end your response with a question to keep the conversation going.
          4. try not to create diagrams or complex visual layouts.
          5. The user will provide context from their PDFs or notes.
          6. Your first priority is to answer using that context, quoting the exact text if you think that will help the user understand your answer better
            - Example: "In your notes it says, 'photosynthesis occurs in the chloroplast,' which means…"
          7. Try not to invent facts outside the provided PDF text unless the user explicitly asks for general knowledge.
          8. Break explanations into simple steps, but stay concise.
          9. If you need more information or the question is unclear, ask a short clarifying question.
          10. Stay friendly, encouraging, and conversational — you are here to help, not lecture.

          Your identity:
          You are **The Study Buddy**, a helpful study partner created by two BU students Jonah Rothman and Sean Tomany to make learning easierHere are the student's notes:
          ${contextText}

          Now begin acting as The Study Buddy.`;

      const messages: any[] = [
        {
          role: "system",
          content: systemInstructions,
        },
      ];

      // Add chat history from database
      for (const msg of chatHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }

      // Add current user message
      messages.push({
        role: "user",
        content: body.message,
      });

      // 6. Call Azure OpenAI Chat Completions
      context.log(`Calling Azure OpenAI with deployment: ${openaiDeploymentName}`);
      
      const completion = await openaiClient.chat.completions.create({
        model: openaiDeploymentName!,
        messages: messages,
        max_completion_tokens: 4000, // Increased to allow for reasoning tokens + actual response
        // Note: gpt-5-nano only supports default temperature of 1
      });

      // Debug: Log the full completion object
      context.log(`OpenAI completion object:`, JSON.stringify(completion, null, 2));
      context.log(`Choices:`, completion.choices);
      context.log(`First choice:`, completion.choices[0]);
      
      const aiReply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      
      context.log(`AI response: ${aiReply.substring(0, 100)}...`);

      // 7. Save both user message and AI response to database
      await ChatMessage.create({
        userId,
        subjectId: body.subjectId,
        role: 'user',
        content: body.message,
        timestamp: new Date(),
      });

      await ChatMessage.create({
        userId,
        subjectId: body.subjectId,
        role: 'assistant',
        content: aiReply,
        timestamp: new Date(),
      });

      context.log('✅ Chat messages saved to database');

      return {
        status: 200,
        jsonBody: {
          reply: aiReply,
        } as ChatResponse,
      };

    } catch (error: any) {
      context.error("Error in chatWithAI:", error);
      return {
        status: 500,
        jsonBody: { 
          message: "Failed to generate AI response", 
          error: error.message 
        } as ErrorResponse,
      };
    }
  },
});

