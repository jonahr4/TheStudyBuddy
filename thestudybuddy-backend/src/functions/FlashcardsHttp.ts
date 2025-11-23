import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import { flashcardRepo } from "../index";
import { ErrorResponse } from "../shared/types";

/**
 * GET /api/flashcards/{subjectId} - Get all flashcards for a subject
 */
app.http("getFlashcardsBySubject", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "flashcards/{subjectId}",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const subjectId = request.params.subjectId;

      if (!subjectId) {
        return {
          status: 400,
          jsonBody: { message: "Subject ID is required" } as ErrorResponse,
        };
      }

      const flashcards = await flashcardRepo.getFlashcardsForSubject(userId, subjectId);

      return {
        status: 200,
        jsonBody: flashcards,
      };
    } catch (error) {
      context.error("Error in getFlashcardsBySubject:", error);
      return {
        status: 500,
        jsonBody: { message: "Internal server error" } as ErrorResponse,
      };
    }
  },
});

