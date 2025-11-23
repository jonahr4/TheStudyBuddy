import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserIdFromRequest } from "../shared/auth";
import { noteRepo } from "../index";
import { ErrorResponse } from "../shared/types";
import Busboy from "busboy";
import { Readable } from "stream";

/**
 * POST /api/notes/upload - Upload a PDF note
 * 
 * Expects multipart/form-data with:
 * - subjectId: string
 * - file: PDF file
 */
app.http("uploadNote", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "notes/upload",
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = await getUserIdFromRequest(request);

      // Parse multipart/form-data
      const contentType = request.headers.get("content-type");
      if (!contentType || !contentType.includes("multipart/form-data")) {
        return {
          status: 400,
          jsonBody: { message: "Content-Type must be multipart/form-data" } as ErrorResponse,
        };
      }

      const result = await parseMultipartForm(request, contentType);

      if (!result.subjectId) {
        return {
          status: 400,
          jsonBody: { message: "subjectId field is required" } as ErrorResponse,
        };
      }

      if (!result.file) {
        return {
          status: 400,
          jsonBody: { message: "file field is required" } as ErrorResponse,
        };
      }

      // Validate PDF file
      if (!result.file.filename.toLowerCase().endsWith(".pdf")) {
        return {
          status: 400,
          jsonBody: { message: "Only PDF files are allowed" } as ErrorResponse,
        };
      }

      // TODO: Upload to Azure Blob Storage
      // - Upload PDF to blob storage
      // - Get the blob URL
      // - Extract text from PDF (using Azure Document Intelligence or pdf-parse)
      // - Upload extracted text to blob storage
      // - Get the text blob URL

      // For now, create a placeholder Note with fake URLs
      const placeholderBlobUrl = `https://example.com/dev/${userId}/${result.subjectId}/${result.file.filename}`;
      
      const note = await noteRepo.createNote(userId, {
        fileName: result.file.filename,
        fileSize: result.file.data.length, // Size of the uploaded file in bytes
        blobUrl: placeholderBlobUrl,
        textUrl: null, // Will be set after text extraction
        subjectId: result.subjectId,
      });

      context.log(`Note uploaded: ${note.id} (placeholder URL for now)`);

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
 * Helper function to parse multipart/form-data
 */
interface ParsedFile {
  filename: string;
  mimetype: string;
  data: Buffer;
}

interface ParsedFormData {
  subjectId?: string;
  file?: ParsedFile;
}

async function parseMultipartForm(
  request: HttpRequest,
  contentType: string
): Promise<ParsedFormData> {
  return new Promise((resolve, reject) => {
    const result: ParsedFormData = {};
    
    const busboy = Busboy({ headers: { "content-type": contentType } });

    busboy.on("field", (fieldname, value) => {
      if (fieldname === "subjectId") {
        result.subjectId = value;
      }
    });

    busboy.on("file", (fieldname, file, info) => {
      if (fieldname === "file") {
        const chunks: Buffer[] = [];
        
        file.on("data", (chunk) => {
          chunks.push(chunk);
        });

        file.on("end", () => {
          result.file = {
            filename: info.filename,
            mimetype: info.mimeType,
            data: Buffer.concat(chunks),
          };
        });
      }
    });

    busboy.on("finish", () => {
      resolve(result);
    });

    busboy.on("error", (error) => {
      reject(error);
    });

    // Convert request body to stream and pipe to busboy
    const body = request.body;
    let bodyBuffer: Buffer;
    
    if (body instanceof ArrayBuffer) {
      bodyBuffer = Buffer.from(body);
    } else if (typeof body === "string") {
      bodyBuffer = Buffer.from(body);
    } else {
      throw new Error("Unsupported body type");
    }
    
    const stream = Readable.from(bodyBuffer);
    stream.pipe(busboy);
  });
}

