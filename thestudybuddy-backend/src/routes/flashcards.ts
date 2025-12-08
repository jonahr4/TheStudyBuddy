import { Router, Request, Response } from "express";
import { getUserInfoFromRequest } from "../shared/expressAuth";
import FlashcardSet from "../models/FlashcardSet";
import { noteRepo } from "../index";
import { AzureOpenAI } from "openai";
import { BlobServiceClient } from "@azure/storage-blob";

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
 * Retry logic for rate-limited API calls
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.code === 'RateLimitReached';
      const retryAfter = parseInt(error?.headers?.['retry-after'] || '60');

      if (isRateLimit && attempt < maxRetries) {
        const waitTime = Math.min(retryAfter * 1000, 120000); // Max 2 minutes
        console.warn(`Rate limit hit. Retrying in ${waitTime/1000} seconds... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
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
 * GET /api/flashcards - Get all flashcard sets for current user
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);

    const flashcardSets = await FlashcardSet.find({ userId })
      .sort({ createdAt: -1 })
      .populate('subjectId', 'name color')
      .exec();

    res.json(flashcardSets);
  } catch (error: any) {
    console.error("Error in getAllFlashcardSets:", error);
    res.status(500).json({
      message: "Failed to fetch flashcard sets",
      error: error.message
    });
  }
});

/**
 * GET /api/flashcards/:subjectId - Get all flashcard sets for a subject
 */
router.get("/:subjectId", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const { subjectId } = req.params;

    if (!subjectId) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    const flashcardSets = await FlashcardSet.find({ userId, subjectId })
      .sort({ createdAt: -1 })
      .exec();

    res.json(flashcardSets);
  } catch (error: any) {
    console.error("Error in getFlashcardSetsBySubject:", error);
    res.status(500).json({
      message: "Failed to fetch flashcard sets",
      error: error.message
    });
  }
});

/**
 * GET /api/flashcards/set/:setId - Get a specific flashcard set
 */
router.get("/set/:setId", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const { setId } = req.params;

    if (!setId) {
      return res.status(400).json({ message: "Set ID is required" });
    }

    const flashcardSet = await FlashcardSet.findOne({ _id: setId, userId }).exec();

    if (!flashcardSet) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }

    res.json(flashcardSet);
  } catch (error: any) {
    console.error("Error in getFlashcardSet:", error);
    res.status(500).json({
      message: "Failed to fetch flashcard set",
      error: error.message
    });
  }
});

/**
 * DELETE /api/flashcards/set/:setId - Delete a flashcard set
 */
router.delete("/set/:setId", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const { setId } = req.params;

    if (!setId) {
      return res.status(400).json({ message: "Set ID is required" });
    }

    const result = await FlashcardSet.findOneAndDelete({ _id: setId, userId }).exec();

    if (!result) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }

    res.json({ message: "Flashcard set deleted successfully" });
  } catch (error: any) {
    console.error("Error in deleteFlashcardSet:", error);
    res.status(500).json({
      message: "Failed to delete flashcard set",
      error: error.message
    });
  }
});

/**
 * PATCH /api/flashcards/set/:setId/card/:cardIndex/studied - Update studied status of a flashcard
 */
router.patch("/set/:setId/card/:cardIndex/studied", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const { setId, cardIndex } = req.params;
    const cardIdx = parseInt(cardIndex || '0');

    if (!setId) {
      return res.status(400).json({ message: "Set ID is required" });
    }

    const { studied } = req.body;

    if (typeof studied !== 'boolean') {
      return res.status(400).json({ message: "studied field must be a boolean" });
    }

    const flashcardSet = await FlashcardSet.findOne({ _id: setId, userId }).exec();

    if (!flashcardSet) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }

    if (cardIdx < 0 || cardIdx >= flashcardSet.flashcards.length) {
      return res.status(400).json({ message: "Invalid card index" });
    }

    flashcardSet.flashcards[cardIdx].studied = studied;
    await flashcardSet.save();

    console.log(`✅ Updated flashcard ${cardIdx} studied status to ${studied}`);

    res.json(flashcardSet);
  } catch (error: any) {
    console.error("Error in updateFlashcardStudied:", error);
    res.status(500).json({
      message: "Failed to update flashcard studied status",
      error: error.message
    });
  }
});

/**
 * POST /api/flashcards/generate - Generate flashcards using AI
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    if (!openaiClient || !textContainerClient) {
      return res.status(503).json({
        message: "AI service not configured. Please check Azure OpenAI and Storage settings."
      });
    }

    const { userId } = await getUserInfoFromRequest(req);
    const { subjectId, name, description, difficulty = 'medium', cardCount = '10-15' } = req.body;

    if (!subjectId || !name) {
      return res.status(400).json({ message: "subjectId and name are required" });
    }

    console.log(`Generating flashcards for subject ${subjectId}`);
    console.log(`Set name: ${name}`);
    console.log(`Difficulty: ${difficulty}`);
    console.log(`Card count: ${cardCount}`);
    if (description) {
      console.log(`Focus: ${description}`);
    }

    const notes = await noteRepo.getNotesForSubject(userId, subjectId);

    if (notes.length === 0) {
      return res.status(400).json({ message: "No notes found for this subject. Please upload notes first." });
    }

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
      return res.status(400).json({ message: "No processed notes found. Please extract text from your notes first." });
    }

    let contextText = noteTexts.join('\n\n');
    const originalLength = contextText.length;
    console.log(`Using text from ${noteTexts.length} notes (${originalLength} chars)`);

    const MAX_CONTEXT_CHARS = 30000;
    const BEGINNING_CHARS = 12000;
    const END_CHARS = 12000;
    const MIDDLE_SAMPLE_CHARS = 6000;

    let truncationNote = "";

    if (contextText.length > MAX_CONTEXT_CHARS) {
      console.warn(`Context too large for flashcards (${contextText.length} chars). Applying smart truncation...`);

      const beginning = contextText.substring(0, BEGINNING_CHARS);
      const end = contextText.substring(contextText.length - END_CHARS);

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

      console.log(`✂️ Truncated from ${originalLength} to ${contextText.length} chars for flashcard generation`);
    }

    const focusInstruction = description
      ? `Focus specifically on: ${description}`
      : 'Cover the main concepts from the notes';

    // Parse card count range
    const [minCards, maxCards] = cardCount.split('-').map(Number);

    // Calculate target number of cards (aim for max of range)
    const targetCards = maxCards;

    // Define difficulty instructions
    const difficultyInstructions: Record<string, string> = {
      easy: 'Make the questions straightforward and focus on basic recall of key terms and definitions. Answers should be simple and direct.',
      medium: 'Create questions that test understanding of concepts. Mix recall with application and comprehension questions.',
      hard: 'Generate challenging questions that require analysis, synthesis, and deep understanding. Include questions that connect multiple concepts and require critical thinking.'
    };

    const difficultyText = difficultyInstructions[difficulty] || difficultyInstructions.medium;

    const prompt = `You are creating flashcards to help a student study. ${focusInstruction}

Create EXACTLY ${targetCards} flashcards based on the following notes.

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${difficultyText}

Each flashcard should have:
- A clear, concise question or prompt on the FRONT
- A complete, helpful answer on the BACK

IMPORTANT: Generate exactly ${targetCards} flashcards, no more and no less.

Return ONLY a valid JSON array in this exact format:
[
  {"front": "Question or term", "back": "Answer or definition"},
  {"front": "Question or term", "back": "Answer or definition"}
]

Here are the student's notes:
${contextText}
${truncationNote}

Return ONLY the JSON array with exactly ${targetCards} flashcards, no other text.`;

    console.log('Calling Azure OpenAI to generate flashcards...');

    const completion = await retryWithBackoff(
      () => openaiClient!.chat.completions.create({
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
        reasoning_effort: "none" as any,
      }),
      3
    );

    console.log('Full completion object:', JSON.stringify(completion, null, 2));

    const message = completion.choices[0]?.message;
    console.log('Message object:', JSON.stringify(message, null, 2));

    let aiResponse = message?.content || "";

    if (!aiResponse) {
      aiResponse = (message as any)?.reasoning_content || (message as any)?.refusal || "";
    }

    console.log(`AI Response received (length: ${aiResponse.length}): ${aiResponse.substring(0, 500)}...`);

    let flashcards;
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      // Clean up common AI JSON errors before parsing
      let cleanedJson = jsonMatch[0];

      // Fix malformed properties like: "who: "back": -> "back":
      cleanedJson = cleanedJson.replace(/"[^"]+:\s+"(front|back)":/g, '"$1":');

      flashcards = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", aiResponse);
      return res.status(500).json({ message: "Failed to parse AI-generated flashcards" });
    }

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(500).json({ message: "AI did not generate valid flashcards" });
    }

    flashcards = flashcards.filter(card => card.front && card.back);

    if (flashcards.length === 0) {
      return res.status(500).json({ message: "No valid flashcards were generated" });
    }

    // Trim to max cards if AI generated too many
    if (flashcards.length > maxCards) {
      console.log(`AI generated ${flashcards.length} cards, trimming to ${maxCards} (max for range ${cardCount})`);
      flashcards = flashcards.slice(0, maxCards);
    }

    console.log(`Generated ${flashcards.length} flashcards`);

    const flashcardSet = await FlashcardSet.create({
      userId,
      subjectId,
      name,
      description: description || '',
      difficulty,
      cardCount,
      flashcards,
    });

    console.log(`✅ Flashcard set created: ${flashcardSet._id}`);

    res.status(201).json(flashcardSet);

  } catch (error: any) {
    console.error("Error in generateFlashcards:", error);
    res.status(500).json({
      message: "Failed to generate flashcards",
      error: error.message
    });
  }
});

export default router;
