import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import { noteRepo } from "../index";
import { ErrorResponse } from "../shared/types";
import { deleteBlobsForNote } from "../shared/services/textExtraction";

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

      // Get the note first so we can delete its blobs
      const note = await noteRepo.getNoteById(userId, id);
      if (!note) {
        return {
          status: 404,
          jsonBody: { message: "Note not found" } as ErrorResponse,
        };
      }

      // Delete blob storage (PDF and text)
      context.log(`Deleting blobs for note: ${id}`);
      try {
        await deleteBlobsForNote(note, (msg) => context.log(msg));
      } catch (error) {
        context.error("Error deleting blobs:", error);
        // Continue with note deletion even if blob deletion fails
      }

      // Delete the note from database
      await noteRepo.deleteNote(userId, id);
      context.log(`✅ Note deleted: ${id}`);

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

