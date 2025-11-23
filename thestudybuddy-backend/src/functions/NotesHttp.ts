import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import { noteRepo } from "../index";
import { ErrorResponse } from "../shared/types";

/**
 * GET /api/notes/{subjectId} - List all notes for a subject
 */
app.http("getNotesBySubject", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "notes/{subjectId}",
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

      const notes = await noteRepo.getNotesForSubject(userId, subjectId);

      return {
        status: 200,
        jsonBody: notes,
      };
    } catch (error) {
      context.error("Error in getNotesBySubject:", error);
      return {
        status: 500,
        jsonBody: { message: "Internal server error" } as ErrorResponse,
      };
    }
  },
});

/**
 * DELETE /api/notes/{id} - Delete a note
 */
app.http("deleteNote", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "notes/delete/{id}",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { userId } = await getUserInfoFromRequest(request);
      const id = request.params.id;

      if (!id) {
        return {
          status: 400,
          jsonBody: { message: "Note ID is required" } as ErrorResponse,
        };
      }

      // TODO: Also delete blob storage (PDF and text) and associated flashcards
      await noteRepo.deleteNote(userId, id);

      return {
        status: 204,
      };
    } catch (error) {
      context.error("Error in deleteNote:", error);
      return {
        status: 500,
        jsonBody: { message: "Internal server error" } as ErrorResponse,
      };
    }
  },
});

