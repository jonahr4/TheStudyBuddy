import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getUserInfoFromRequest } from "../shared/auth";
import { noteRepo } from "../index";
import { ErrorResponse } from "../shared/types";
import { uploadPdfToRawContainer } from "../shared/storage/blobClient";
import { extractTextFromNote } from "../shared/services/textExtraction";
import Busboy from "busboy";
import { Readable } from "stream";

// Helper to convert Web ReadableStream to Node.js Buffer
async function readableStreamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  
  return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
}

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
      const { userId, userEmail } = await getUserInfoFromRequest(request);

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

      // Optional: Check file size (max 10MB)
      const maxBytes = 10 * 1024 * 1024;
      if (result.file.data.byteLength > maxBytes) {
        return {
          status: 400,
          jsonBody: { message: "File size must be <= 10MB" } as ErrorResponse,
        };
      }

      // Upload to Azure Blob Storage
      let blobUrl: string;
      let blobName: string;

      try {
        const uploadResult = await uploadPdfToRawContainer({
          userId,
          subjectId: result.subjectId,
          fileBuffer: result.file.data,
          originalFileName: result.file.filename,
        });

        blobUrl = uploadResult.blobUrl;
        blobName = uploadResult.blobName;
        context.log(`✅ Uploaded PDF to blob: ${blobName}`);
      } catch (err) {
        context.error("❌ Error uploading to Azure Blob Storage:", err);
        return {
          status: 500,
          jsonBody: { message: "Failed to upload file to storage" } as ErrorResponse,
        };
      }

      // Create Note object with real blob URL
      const note = await noteRepo.createNote(userId, {
        fileName: result.file.filename,
        fileSize: result.file.data.length, // Size of the uploaded file in bytes
        blobUrl: blobUrl,
        textUrl: null, // Will be set after text extraction
        subjectId: result.subjectId,
        userEmail,
      });

      context.log(`✅ Note created: ${note.id} with blob URL: ${blobUrl}`);

      // Automatically extract text from the PDF
      context.log(`🔄 Starting automatic text extraction...`);
      const extractionResult = await extractTextFromNote(
        note.id,
        userId,
        blobUrl,
        (msg) => context.log(msg)
      );

      if (extractionResult.success) {
        context.log(`✅ Text extraction completed: ${extractionResult.textLength} characters`);
        // Update note with textUrl
        note.textUrl = extractionResult.textUrl;
      } else {
        context.warn(`⚠️ Text extraction failed: ${extractionResult.error}`);
      }

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
  return new Promise(async (resolve, reject) => {
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

    try {
      // Convert request body to stream and pipe to busboy
      const body = request.body;
      let bodyBuffer: Buffer;
      
      if (body instanceof ReadableStream) {
        // Handle Web ReadableStream (Azure Functions v4)
        bodyBuffer = await readableStreamToBuffer(body);
      } else if (body instanceof ArrayBuffer) {
        bodyBuffer = Buffer.from(body);
      } else if (typeof body === "string") {
        bodyBuffer = Buffer.from(body);
      } else if (Buffer.isBuffer(body)) {
        bodyBuffer = body;
      } else if (body && typeof body === "object" && "buffer" in body) {
        // Handle Uint8Array or similar
        bodyBuffer = Buffer.from(body as any);
      } else {
        // Log the actual type for debugging
        console.error("Unknown body type:", typeof body, body?.constructor?.name);
        throw new Error(`Unsupported body type: ${typeof body}, constructor: ${body?.constructor?.name}`);
      }
      
      const stream = Readable.from(bodyBuffer);
      stream.pipe(busboy);
    } catch (err) {
      reject(err);
    }
  });
}

