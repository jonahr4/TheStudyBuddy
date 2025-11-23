import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserIdFromRequest } from "../shared/auth";
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
      const userId = await getUserIdFromRequest(request);
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
 * POST /api/notes/upload - Upload a new note
 * For now, stores metadata with placeholder blobUrl until Azure Blob Storage is ready
 */
app.http("uploadNote", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "notes/upload",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = await getUserIdFromRequest(request);
      const body = await request.json() as {
        fileName: string;
        fileSize: number;
        subjectId: string;
      };

      // Validate required fields
      if (!body.fileName || !body.fileSize || !body.subjectId) {
        return {
          status: 400,
          jsonBody: { message: "fileName, fileSize, and subjectId are required" } as ErrorResponse,
        };
      }

      // Check 10-note limit per subject
      const existingNotes = await noteRepo.getNotesForSubject(userId, body.subjectId);
      if (existingNotes.length >= 10) {
        return {
          status: 400,
          jsonBody: { message: "Maximum 10 notes per subject" } as ErrorResponse,
        };
      }

      // TODO: When Azure Blob Storage is ready, upload file and get real blobUrl
      // For now, use placeholder URL
      const placeholderBlobUrl = `placeholder://pending-upload/${body.fileName}`;

      const note = await noteRepo.createNote(userId, {
        fileName: body.fileName,
        fileSize: body.fileSize,
        blobUrl: placeholderBlobUrl,
        subjectId: body.subjectId,
      });

      return {
        status: 201,
        jsonBody: note,
      };
    } catch (error) {
      context.error("Error in uploadNote:", error);
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
      const userId = await getUserIdFromRequest(request);
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

