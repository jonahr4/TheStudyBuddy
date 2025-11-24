import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { noteRepo } from "../index";
import { ErrorResponse } from "../shared/types";
import { BlobServiceClient } from "@azure/storage-blob";
import { getUserInfoFromRequest } from "../shared/auth";

const connectionString = process.env.STORAGE_CONNECTION_STRING;
const rawContainerName = process.env.STORAGE_NOTES_RAW_CONTAINER;
const textContainerName = process.env.STORAGE_NOTES_TEXT_CONTAINER;

if (!connectionString) {
  throw new Error("STORAGE_CONNECTION_STRING is not set in environment variables");
}

if (!rawContainerName) {
  throw new Error("STORAGE_NOTES_RAW_CONTAINER is not set in environment variables");
}

if (!textContainerName) {
  throw new Error("STORAGE_NOTES_TEXT_CONTAINER is not set in environment variables");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const rawContainerClient = blobServiceClient.getContainerClient(rawContainerName);
const textContainerClient = blobServiceClient.getContainerClient(textContainerName);

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

      context.log(`Processing text extraction for note: ${noteId} (user: ${userId})`);

      // 1. Fetch the note from the repo
      const note = await noteRepo.getNoteById(userId, noteId);
      if (!note) {
        return {
          status: 404,
          jsonBody: { message: "Note not found" } as ErrorResponse,
        };
      }

      // 2. Download the PDF using Azure SDK (no public access needed)
      context.log(`Downloading PDF from blob storage...`);
      
      // Extract blob name from the full URL or use note metadata
      // Blob name format: userId/subjectId/timestamp-filename.pdf
      const blobName = `${note.userId}/${note.subjectId}/${blobUrl.split('/').pop()}`;
      context.log(`Blob name: ${blobName}`);
      
      const blobClient = rawContainerClient.getBlobClient(blobName);
      const downloadResponse = await blobClient.download();
      
      if (!downloadResponse.readableStreamBody) {
        throw new Error("Failed to download PDF: no stream body");
      }
      
      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(Buffer.from(chunk));
      }
      const pdfBuffer = Buffer.concat(chunks);
      context.log(`PDF downloaded, size: ${pdfBuffer.length} bytes`);

      // 3. Extract text using pdf-parse
      context.log(`Extracting text from PDF...`);
      const pdfParse = require("pdf-parse");
      const textResult = await pdfParse(pdfBuffer);
      const extractedText = textResult.text || "";
      context.log(`✅ Extracted ${extractedText.length} characters of text`);

      if (!extractedText.trim()) {
        context.warn("No text extracted from PDF (might be image-based)");
      }

      // 4. Upload the text to notes-text container
      const textBlobName = `${note.userId}/${note.subjectId}/${note.id}.txt`;
      context.log(`Uploading text to blob: ${textBlobName}`);
      const blockBlobClient = textContainerClient.getBlockBlobClient(textBlobName);

      await blockBlobClient.uploadData(Buffer.from(extractedText), {
        blobHTTPHeaders: { blobContentType: "text/plain; charset=utf-8" },
      });

      const textUrl = blockBlobClient.url;
      context.log(`✅ Text uploaded to: ${textUrl}`);

      // 5. Update the note's textUrl
      const updatedNote = await noteRepo.updateNote(note.userId, note.id, { textUrl });
      if (!updatedNote) {
        throw new Error("Failed to update note with textUrl");
      }

      context.log(`✅ Note updated with textUrl`);

      return {
        status: 200,
        jsonBody: {
          success: true,
          textUrl: textUrl,
          textLength: extractedText.length,
        },
      };

    } catch (error: any) {
      context.error("Error in processNoteText:", error);
      return {
        status: 500,
        jsonBody: { message: "Failed to extract text", error: error.message } as ErrorResponse,
      };
    }
  },
});

