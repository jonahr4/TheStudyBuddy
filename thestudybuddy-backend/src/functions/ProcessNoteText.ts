import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { ErrorResponse } from "../shared/types";
import { getUserInfoFromRequest } from "../shared/auth";
import { extractTextFromNote } from "../shared/services/textExtraction";

/**
 * POST /api/process-text - Extract text from PDF and save to blob storage
 * 
 * Expects JSON body:
 * - noteId: string
 * - blobUrl: string
 * 
 * Returns:
 * - success: boolean
 * - textUrl: string
 * 
 * Note: This endpoint is now optional as text extraction happens automatically on upload.
 * It can be used to re-extract text if needed.
 */
app.http("processNoteText", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "process-text",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      // Get authenticated user
      const { userId } = await getUserInfoFromRequest(request);
      
      // Parse request body
      const body = await request.json() as { noteId?: string; blobUrl?: string };
      const { noteId, blobUrl } = body;

      if (!noteId || !blobUrl) {
        return {
          status: 400,
          jsonBody: { message: "noteId and blobUrl are required" } as ErrorResponse,
        };
      }

      // Use the shared text extraction function
      const result = await extractTextFromNote(
        noteId,
        userId,
        blobUrl,
        (msg) => context.log(msg)
      );

      if (result.success) {
        return {
          status: 200,
          jsonBody: result,
        };
      } else {
        return {
          status: 500,
          jsonBody: { 
            message: "Failed to extract text", 
            error: result.error 
          } as ErrorResponse,
        };
      }

    } catch (error: any) {
      context.error("Error in processNoteText:", error);
      return {
        status: 500,
        jsonBody: { message: "Failed to extract text", error: error.message } as ErrorResponse,
      };
    }
  },
});

