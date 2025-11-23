import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import { noteRepo } from "../index";
import { ChatRequest, ChatResponse, ErrorResponse } from "../shared/types";
import { AzureOpenAI } from "openai";
import { BlobServiceClient } from "@azure/storage-blob";

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

      // 1. Fetch all notes for the subject
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

      // 2. Fetch extracted text from all notes with textUrl
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

      // 3. Build context from all note texts
      const contextText = noteTexts.join('\n\n');
      const contextPreview = contextText.substring(0, 500);
      context.log(`Context preview: ${contextPreview}...`);

      // 4. Build messages for Azure OpenAI
      const messages: any[] = [
        {
          role: "system",
          content: `You are a helpful study assistant. Answer questions based ONLY on the provided note content. 
If the answer is not in the notes, say so politely. Be concise but thorough.

Here are the student's notes:
${contextText}`,
        },
      ];

      // Add chat history if provided
      if (body.chatHistory && body.chatHistory.length > 0) {
        for (const msg of body.chatHistory) {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }

      // Add current user message
      messages.push({
        role: "user",
        content: body.message,
      });

      // 5. Call Azure OpenAI Chat Completions
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

