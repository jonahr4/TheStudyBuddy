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
 * Retry logic for rate-limited API calls
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  context?: InvocationContext
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.code === 'RateLimitReached';
      const retryAfter = parseInt(error?.headers?.['retry-after'] || '60');
      
      if (isRateLimit && attempt < maxRetries) {
        const waitTime = Math.min(retryAfter * 1000, 120000); // Max 2 minutes
        context?.warn(`Rate limit hit. Retrying in ${waitTime/1000} seconds... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error; // Not rate limit or max retries reached
      }
    }
  }
  throw new Error('Max retries reached');
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

      let contextText = noteTexts.join('\n\n');
      const originalLength = contextText.length;
      context.log(`Using text from ${noteTexts.length} notes (${originalLength} chars)`);

      // Smart truncation for flashcard generation
      // For flashcards, we need less context than chat since we're creating specific Q&A
      const MAX_CONTEXT_CHARS = 30000; // ~7.5K tokens, leave room for reasoning + response
      const BEGINNING_CHARS = 12000;   // Introduction and key concepts
      const END_CHARS = 12000;         // Summary and conclusions
      const MIDDLE_SAMPLE_CHARS = 6000; // Sample from middle
      
      let truncationNote = "";
      
      if (contextText.length > MAX_CONTEXT_CHARS) {
        context.warn(`Context too large for flashcards (${contextText.length} chars). Applying smart truncation...`);
        
        const beginning = contextText.substring(0, BEGINNING_CHARS);
        const end = contextText.substring(contextText.length - END_CHARS);
        
        // Sample from middle section
        const middleStart = BEGINNING_CHARS;
        const middleEnd = contextText.length - END_CHARS;
        const middleLength = middleEnd - middleStart;
        
        let middle = "";
        if (middleLength > 0) {
          const sampleSize = Math.floor(MIDDLE_SAMPLE_CHARS / 2);
          const half = middleStart + Math.floor(middleLength * 0.5);
          
          middle = contextText.substring(half, half + sampleSize);
        }
        
        contextText = beginning + "\n\n[... middle content sampled ...]\n\n" + 
                      middle + "\n\n[... continuing to end ...]\n\n" + end;
        
        truncationNote = "\nNote: Created flashcards from beginning, key middle sections, and ending of notes.";
        
        context.log(`✂️ Truncated from ${originalLength} to ${contextText.length} chars for flashcard generation`);
      }

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
${truncationNote}

Return ONLY the JSON array, no other text.`;

      context.log('Calling Azure OpenAI to generate flashcards...');

      // Use retry logic for rate-limited calls
      const completion = await retryWithBackoff(
        () => openaiClient.chat.completions.create({
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
          max_completion_tokens: 4000,
          // Disable reasoning to get actual response content
          reasoning_effort: "none" as any,
        }),
        3,
        context
      );

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
