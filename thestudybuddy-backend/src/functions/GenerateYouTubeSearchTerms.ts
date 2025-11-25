import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import { noteRepo } from "../index";
import { ErrorResponse } from "../shared/types";
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

interface GenerateSearchTermsResponse {
  searchTerms: string[];
  combinedQuery: string;
}

/**
 * POST /api/youtube/generate-search-terms - Generate YouTube search terms from subject notes using AI
 * 
 * Body: {
 *   subjectId: string;
 *   subjectName: string;
 * }
 */
app.http("generateYouTubeSearchTerms", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "youtube/generate-search-terms",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const body = await request.json() as { subjectId: string; subjectName: string };

      // Validate required fields
      if (!body.subjectId || !body.subjectName) {
        return {
          status: 400,
          jsonBody: { message: "subjectId and subjectName are required" } as ErrorResponse,
        };
      }

      context.log(`Generating YouTube search terms for subject: ${body.subjectName} (${body.subjectId})`);

      // 1. Fetch all notes for the subject
      const notes = await noteRepo.getNotesForSubject(userId, body.subjectId);
      
      if (notes.length === 0) {
        context.log("No notes found for this subject");
        return {
          status: 200,
          jsonBody: {
            searchTerms: [body.subjectName],
            combinedQuery: body.subjectName,
          } as GenerateSearchTermsResponse,
        };
      }

      context.log(`Found ${notes.length} notes for this subject`);

      // 2. Fetch extracted text from all notes with textUrl
      const noteTexts: string[] = [];
      let totalChars = 0;
      
      for (const note of notes) {
        if (note.textUrl && !note.textUrl.includes('placeholder')) {
          const text = await fetchNoteText(note.textUrl);
          if (text.trim()) {
            noteTexts.push(text);
            totalChars += text.length;
          }
        }
      }

      if (noteTexts.length === 0) {
        context.log("No extracted text found in notes");
        return {
          status: 200,
          jsonBody: {
            searchTerms: [body.subjectName],
            combinedQuery: body.subjectName,
          } as GenerateSearchTermsResponse,
        };
      }

      context.log(`Successfully fetched text from ${noteTexts.length} notes (${totalChars} total characters)`);

      // 3. Combine all note texts (limit to ~50k chars to avoid token limits)
      const maxContextLength = 50000;
      let contextText = noteTexts.join('\n\n');
      if (contextText.length > maxContextLength) {
        contextText = contextText.substring(0, maxContextLength) + "\n[Content truncated...]";
        context.log(`Context truncated from ${totalChars} to ${maxContextLength} characters`);
      }

      // 4. Build AI prompt for generating YouTube search terms
      // Keep context preview shorter to match ChatWithAI pattern
      const contextPreview = contextText.substring(0, 500);
      context.log(`Context preview: ${contextPreview}...`);

      const systemPrompt = `You are an AI that analyzes educational content and generates YouTube search queries.

Analyze these notes and identify the 3 most important educational topics that would have good YouTube tutorials or lectures.

Rules:
- Return ONLY a JSON array with 3 search terms
- Each term should be 3-6 words and include educational keywords like "tutorial", "explained", "introduction to", "lecture", etc.
- Make terms SPECIFIC and SEARCHABLE (e.g., "introduction to Jungian archetypes" instead of just "Jungian Archetypes")
- Focus on concepts that are commonly taught and have educational videos
- NO subject names, NO markdown, ONLY the JSON array

Good examples:
["introduction to mitosis biology", "photosynthesis explained", "cell division tutorial"]

Bad examples:
["Biology", "Science Concepts", "Chapter 3"]

Course notes:
${contextText}`;

      context.log("Calling Azure OpenAI to generate search terms...");
      context.log(`Using deployment: ${openaiDeploymentName}`);

      // 5. Call Azure OpenAI to generate search terms
      const completion = await openaiClient.chat.completions.create({
        model: openaiDeploymentName!,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Generate 3-5 YouTube search terms for finding educational videos about the main topics in these ${body.subjectName} notes. Return ONLY a JSON array of strings.`,
          },
        ],
        max_completion_tokens: 4000, // Match ChatWithAI - reasoning models need more tokens
        // Note: gpt-5-nano only supports default temperature of 1
      });

      // Debug: Log the full completion object (same as ChatWithAI)
      context.log(`OpenAI completion object:`, JSON.stringify(completion, null, 2));
      context.log(`Choices:`, completion.choices);
      context.log(`First choice:`, completion.choices[0]);
      
      const aiResponse = completion.choices[0]?.message?.content?.trim() || "";
      
      context.log(`Raw AI response: ${aiResponse}`);

      if (!aiResponse) {
        context.warn("AI returned empty response, using fallback");
        return {
          status: 200,
          jsonBody: {
            searchTerms: [body.subjectName],
            combinedQuery: body.subjectName,
          } as GenerateSearchTermsResponse,
        };
      }

      // 6. Parse AI response as JSON
      let searchTerms: string[];
      try {
        // Remove markdown code blocks if present
        let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        searchTerms = JSON.parse(cleanResponse);
        
        // Validate it's an array of strings
        if (!Array.isArray(searchTerms) || searchTerms.length === 0) {
          throw new Error("AI response is not a valid array");
        }
        
        // Filter to only strings and limit to 3 terms
        searchTerms = searchTerms
          .filter(term => typeof term === 'string' && term.trim().length > 0)
          .slice(0, 3);
          
        context.log(`Successfully parsed ${searchTerms.length} search terms:`, searchTerms);
        
      } catch (parseError) {
        context.warn("Failed to parse AI response as JSON:", parseError);
        context.log("Using fallback search terms");
        searchTerms = [`${body.subjectName} tutorial`];
      }

      // 7. Use the FIRST search term directly (AI already made it specific and searchable)
      // Don't add subject name - it makes queries too specific and limits results
      const combinedQuery = searchTerms[0] || `${body.subjectName} tutorial`;

      context.log(`✅ Generated combined query: "${combinedQuery}"`);

      return {
        status: 200,
        jsonBody: {
          searchTerms,
          combinedQuery,
        } as GenerateSearchTermsResponse,
      };

    } catch (error: any) {
      context.error("Error in generateYouTubeSearchTerms:", error);
      return {
        status: 500,
        jsonBody: { 
          message: "Failed to generate search terms", 
          error: error.message 
        } as ErrorResponse,
      };
    }
  },
});
