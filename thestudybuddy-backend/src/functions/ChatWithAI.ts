import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserIdFromRequest } from "../shared/auth";
import { noteRepo } from "../index";
import { ChatRequest, ChatResponse, ErrorResponse } from "../shared/types";

/**
 * POST /api/ai/chat - Chat with AI about a subject's notes
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
      const userId = await getUserIdFromRequest(request);
      const body = await request.json() as ChatRequest;

      // Validate required fields
      if (!body.subjectId || !body.message) {
        return {
          status: 400,
          jsonBody: { message: "subjectId and message are required" } as ErrorResponse,
        };
      }

      // TODO: Implement real RAG (Retrieval Augmented Generation) chat
      // 1. Fetch all notes for the subject
      // 2. Read extracted text from each note's textUrl
      // 3. Build embeddings for the question (using Azure OpenAI embeddings)
      // 4. Search for relevant note chunks using vector similarity
      // 5. Build a prompt with:
      //    - System message: "You are a study assistant..."
      //    - Context: Relevant note excerpts
      //    - Chat history: Previous messages
      //    - User message: Current question
      // 6. Call Azure OpenAI Chat Completions
      // 7. Return the AI response

      // For now, fetch notes to show we're thinking about them
      const notes = await noteRepo.getNotesForSubject(userId, body.subjectId);
      
      context.log(`Chat request for subject ${body.subjectId} with ${notes.length} notes available`);
      context.log(`User message: ${body.message}`);
      if (body.chatHistory) {
        context.log(`Chat history length: ${body.chatHistory.length}`);
      }

      // Return a stubbed response
      const response: ChatResponse = {
        reply: `This is a stubbed AI response. I can see you have ${notes.length} note(s) for this subject. ` +
               `Your question was: "${body.message}". ` +
               `Later, I will use Azure OpenAI to analyze your notes and provide a real answer based on your content.`,
      };

      return {
        status: 200,
        jsonBody: response,
      };
    } catch (error) {
      context.error("Error in chatWithAI:", error);
      return {
        status: 500,
        jsonBody: { message: "Internal server error" } as ErrorResponse,
      };
    }
  },
});

