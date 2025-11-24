import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import FlashcardSet from "../models/FlashcardSet";
import { ErrorResponse } from "../shared/types";

/**
 * GET /api/flashcards/{subjectId} - Get all flashcard sets for a subject
 */
app.http("getFlashcardSetsBySubject", {
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

      const flashcardSets = await FlashcardSet.find({ userId, subjectId })
        .sort({ createdAt: -1 })
        .exec();

      return {
        status: 200,
        jsonBody: flashcardSets,
      };
    } catch (error: any) {
      context.error("Error in getFlashcardSetsBySubject:", error);
      return {
        status: 500,
        jsonBody: { 
          message: "Failed to fetch flashcard sets",
          error: error.message 
        } as ErrorResponse,
      };
    }
  },
});

/**
 * GET /api/flashcards/set/{setId} - Get a specific flashcard set
 */
app.http("getFlashcardSet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "flashcards/set/{setId}",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const setId = request.params.setId;

      if (!setId) {
        return {
          status: 400,
          jsonBody: { message: "Set ID is required" } as ErrorResponse,
        };
      }

      const flashcardSet = await FlashcardSet.findOne({ _id: setId, userId }).exec();

      if (!flashcardSet) {
        return {
          status: 404,
          jsonBody: { message: "Flashcard set not found" } as ErrorResponse,
        };
      }

      return {
        status: 200,
        jsonBody: flashcardSet,
      };
    } catch (error: any) {
      context.error("Error in getFlashcardSet:", error);
      return {
        status: 500,
        jsonBody: { 
          message: "Failed to fetch flashcard set",
          error: error.message 
        } as ErrorResponse,
      };
    }
  },
});

/**
 * DELETE /api/flashcards/set/{setId} - Delete a flashcard set
 */
app.http("deleteFlashcardSet", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "flashcards/set/{setId}",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const setId = request.params.setId;

      if (!setId) {
        return {
          status: 400,
          jsonBody: { message: "Set ID is required" } as ErrorResponse,
        };
      }

      const result = await FlashcardSet.findOneAndDelete({ _id: setId, userId }).exec();

      if (!result) {
        return {
          status: 404,
          jsonBody: { message: "Flashcard set not found" } as ErrorResponse,
        };
      }

      return {
        status: 200,
        jsonBody: { message: "Flashcard set deleted successfully" },
      };
    } catch (error: any) {
      context.error("Error in deleteFlashcardSet:", error);
      return {
        status: 500,
        jsonBody: { 
          message: "Failed to delete flashcard set",
          error: error.message 
        } as ErrorResponse,
      };
    }
  },
});

