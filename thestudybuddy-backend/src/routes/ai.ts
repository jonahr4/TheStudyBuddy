import { Router, Request, Response } from "express";
import { getUserInfoFromRequest } from "../shared/expressAuth";
import { noteRepo } from "../index";
import { AzureOpenAI } from "openai";
import { BlobServiceClient } from "@azure/storage-blob";
import ChatMessage from "../models/ChatMessage";

const router = Router();

// Azure OpenAI configuration
const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const openaiApiKey = process.env.AZURE_OPENAI_API_KEY;
const openaiDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

// Blob Storage configuration
const storageConnectionString = process.env.STORAGE_CONNECTION_STRING;
const textContainerName = process.env.STORAGE_NOTES_TEXT_CONTAINER;

let openaiClient: AzureOpenAI | null = null;
let textContainerClient: any = null;

if (openaiEndpoint && openaiApiKey && openaiDeploymentName) {
  openaiClient = new AzureOpenAI({
    endpoint: openaiEndpoint,
    apiKey: openaiApiKey,
    apiVersion: "2024-12-01-preview",
  });
}

if (storageConnectionString && textContainerName) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);
  textContainerClient = blobServiceClient.getContainerClient(textContainerName);
}

/**
 * Fetch text content from Azure Blob Storage
 */
async function fetchNoteText(textUrl: string): Promise<string> {
  try {
    const url = new URL(textUrl);
    const blobName = url.pathname.split('/').slice(2).join('/');

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
 */
router.post("/chat", async (req: Request, res: Response) => {
  try {
    if (!openaiClient || !textContainerClient) {
      return res.status(503).json({
        message: "AI service not configured. Please check Azure OpenAI and Storage settings."
      });
    }

    const { userId } = await getUserInfoFromRequest(req);
    const { subjectId, message } = req.body;

    if (!subjectId || !message) {
      return res.status(400).json({ message: "subjectId and message are required" });
    }

    console.log(`Chat request for subject ${subjectId}`);
    console.log(`User message: ${message}`);

    // 1. Load chat history from MongoDB (last 20 messages)
    const chatHistory = await ChatMessage.find({
      userId,
      subjectId,
    })
      .sort({ timestamp: 1 })
      .limit(20)
      .exec();

    console.log(`Loaded ${chatHistory.length} previous messages from database`);

    // 2. Fetch all notes for the subject
    const notes = await noteRepo.getNotesForSubject(userId, subjectId);

    if (notes.length === 0) {
      return res.json({
        reply: "You don't have any notes uploaded for this subject yet. Please upload some PDF notes first, and I'll be able to help you study!",
      });
    }

    console.log(`Found ${notes.length} notes for this subject`);

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
      return res.json({
        reply: "Your notes are still being processed for text extraction. Please try triggering text extraction first, or wait a moment and try again.",
      });
    }

    console.log(`Successfully fetched text from ${noteTexts.length} notes`);

    // 4. Build context from all note texts
    let contextText = noteTexts.join('\n\n');
    const originalLength = contextText.length;

    const MAX_CONTEXT_CHARS = 40000;
    const BEGINNING_CHARS = 15000;
    const END_CHARS = 15000;
    const MIDDLE_SAMPLE_CHARS = 10000;

    let truncationNote = "";

    if (contextText.length > MAX_CONTEXT_CHARS) {
      console.warn(`Context too large (${contextText.length} chars). Applying smart truncation...`);

      const beginning = contextText.substring(0, BEGINNING_CHARS);
      const end = contextText.substring(contextText.length - END_CHARS);

      const middleStart = BEGINNING_CHARS;
      const middleEnd = contextText.length - END_CHARS;
      const middleLength = middleEnd - middleStart;

      let middle = "";
      if (middleLength > 0) {
        const sampleSize = Math.floor(MIDDLE_SAMPLE_CHARS / 3);
        const quarter = middleStart + Math.floor(middleLength * 0.25);
        const half = middleStart + Math.floor(middleLength * 0.5);
        const threeQuarter = middleStart + Math.floor(middleLength * 0.75);

        middle = contextText.substring(quarter, quarter + sampleSize) + "\n...\n" +
                 contextText.substring(half, half + sampleSize) + "\n...\n" +
                 contextText.substring(threeQuarter, threeQuarter + sampleSize);
      }

      contextText = beginning + "\n\n[... middle sections sampled ...]\n\n" +
                    middle + "\n\n[... continuing to end ...]\n\n" + end;

      truncationNote = `\n\nNOTE: These notes are very long (${originalLength} characters). I'm analyzing the beginning, key middle sections, and ending. If you need information from a specific section, please ask!`;

      console.log(`✂️ Truncated from ${originalLength} to ${contextText.length} chars (beginning + middle samples + end)`);
    }

    const contextPreview = contextText.substring(0, 500);
    console.log(`Context preview: ${contextPreview}...`);

    // 5. Build messages for Azure OpenAI
    const systemInstructions = `You are **The Study Buddy**, a friendly AI tutor created by Jonah Rothman and Sean Tomany, Boston University students. Your job is to help the user understand their class material using the notes and PDF text that will always be provided to you.
        RULES TO FOLLOW:
        1. Introduce yourself naturally as The Study Buddy ONLY if you havent already in the past chat context. This is for users to know who you are but you should not repeat this introduction in every response.
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
        You are **The Study Buddy**, a helpful study partner created by two BU students Jonah Rothman and Sean Tomany to make learning easier. Here are the student's notes:
        ${contextText}
        ${truncationNote}

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
      content: message,
    });

    // 6. Call Azure OpenAI Chat Completions
    console.log(`Calling Azure OpenAI with deployment: ${openaiDeploymentName}`);

    const completion = await openaiClient.chat.completions.create({
      model: openaiDeploymentName!,
      messages: messages,
      max_completion_tokens: 4000,
    });

    console.log(`OpenAI completion object:`, JSON.stringify(completion, null, 2));
    console.log(`Choices:`, completion.choices);
    console.log(`First choice:`, completion.choices[0]);

    const aiReply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    console.log(`AI response: ${aiReply.substring(0, 100)}...`);

    // 7. Save both user message and AI response to database
    await ChatMessage.create({
      userId,
      subjectId,
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    await ChatMessage.create({
      userId,
      subjectId,
      role: 'assistant',
      content: aiReply,
      timestamp: new Date(),
    });

    console.log('✅ Chat messages saved to database');

    res.json({
      reply: aiReply,
    });

  } catch (error: any) {
    console.error("Error in chatWithAI:", error);
    res.status(500).json({
      message: "Failed to generate AI response",
      error: error.message
    });
  }
});

export default router;
