import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import { noteRepo } from "../index";
import { ErrorResponse } from "../shared/types";
import { AzureOpenAI } from "openai";
import { BlobServiceClient } from "@azure/storage-blob";
import FlashcardSet from "../models/FlashcardSet";

// Azure OpenAI configuration
const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const openaiApiKey = process.env.AZURE_OPENAI_API_KEY;
const openaiDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

// Blob Storage configuration
const storageConnectionString = process.env.STORAGE_CONNECTION_STRING;
const textContainerName = process.env.STORAGE_NOTES_TEXT_CONTAINER;

if (!openaiEndpoint || !openaiApiKey || !openaiDeploymentName) {
  throw new Error("Azure OpenAI configuration is missing");
}

if (!storageConnectionString || !textContainerName) {
  throw new Error("Storage configuration is missing");
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
 * POST /api/flashcards/generate
 * Generate flashcards using AI based on subject notes
 * 
 * Body: {
 *   subjectId: string;
 *   name: string;
 *   description?: string;
 * }
 */
app.http("generateFlashcards", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "flashcards/generate",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const body = await request.json() as any;

      if (!body.subjectId || !body.name) {
        return {
          status: 400,
          jsonBody: { message: "subjectId and name are required" } as ErrorResponse,
        };
      }

      context.log(`Generating flashcards for subject ${body.subjectId}`);
      context.log(`Set name: ${body.name}`);
      if (body.description) {
        context.log(`Focus: ${body.description}`);
      }

      // Fetch all notes for the subject
      const notes = await noteRepo.getNotesForSubject(userId, body.subjectId);
      
      if (notes.length === 0) {
        return {
          status: 400,
          jsonBody: { message: "No notes found for this subject. Please upload notes first." } as ErrorResponse,
        };
      }

      // Fetch extracted text from all notes
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
          status: 400,
          jsonBody: { message: "No processed notes found. Please extract text from your notes first." } as ErrorResponse,
        };
      }

      const contextText = noteTexts.join('\n\n');
      context.log(`Using text from ${noteTexts.length} notes`);

      // Build AI prompt
      const focusInstruction = body.description 
        ? `Focus specifically on: ${body.description}` 
        : 'Cover the main concepts from the notes';

      const prompt = `You are creating flashcards to help a student study. ${focusInstruction}

Create 10-15 flashcards based on the following notes. Each flashcard should have:
- A clear, concise question or prompt on the FRONT
- A complete, helpful answer on the BACK

Return ONLY a valid JSON array in this exact format:
[
  {"front": "Question or term", "back": "Answer or definition"},
  {"front": "Question or term", "back": "Answer or definition"}
]

Here are the student's notes:
${contextText}

Return ONLY the JSON array, no other text.`;

      context.log('Calling Azure OpenAI to generate flashcards...');

      const completion = await openaiClient.chat.completions.create({
        model: openaiDeploymentName!,
        messages: [
          {
            role: "system",
            content: "You are a helpful tutor creating study flashcards. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_completion_tokens: 8000, // Increased to allow for reasoning tokens + actual response
      });

      // Debug: Log the full completion object structure
      context.log('Full completion object:', JSON.stringify(completion, null, 2));
      
      // Handle reasoning models that use reasoning_content
      const message = completion.choices[0]?.message;
      context.log('Message object:', JSON.stringify(message, null, 2));
      
      let aiResponse = message?.content || "";
      
      // If content is empty, try reasoning_content or refusal
      if (!aiResponse) {
        aiResponse = (message as any)?.reasoning_content || (message as any)?.refusal || "";
      }
      
      context.log(`AI Response received (length: ${aiResponse.length}): ${aiResponse.substring(0, 500)}...`);

      // Parse the JSON response
      let flashcards;
      try {
        // Try to extract JSON from the response (in case AI adds extra text)
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error("No JSON array found in response");
        }
        flashcards = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        context.error("Failed to parse AI response:", parseError);
        context.error("Raw response:", aiResponse);
        return {
          status: 500,
          jsonBody: { message: "Failed to parse AI-generated flashcards" } as ErrorResponse,
        };
      }

      // Validate flashcards
      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        return {
          status: 500,
          jsonBody: { message: "AI did not generate valid flashcards" } as ErrorResponse,
        };
      }

      // Ensure each flashcard has front and back
      flashcards = flashcards.filter(card => card.front && card.back);

      if (flashcards.length === 0) {
        return {
          status: 500,
          jsonBody: { message: "No valid flashcards were generated" } as ErrorResponse,
        };
      }

      context.log(`Generated ${flashcards.length} flashcards`);

      // Save to database
      const flashcardSet = await FlashcardSet.create({
        userId,
        subjectId: body.subjectId,
        name: body.name,
        description: body.description || '',
        flashcards,
      });

      context.log(`✅ Flashcard set created: ${flashcardSet._id}`);

      return {
        status: 201,
        jsonBody: flashcardSet,
      };

    } catch (error: any) {
      context.error("Error in generateFlashcards:", error);
      return {
        status: 500,
        jsonBody: { 
          message: "Failed to generate flashcards", 
          error: error.message 
        } as ErrorResponse,
      };
    }
  },
});
