import { Router, Request, Response } from "express";
import { getUserInfoFromRequest } from "../shared/expressAuth";
import { MongoNoteRepository } from "../shared/repos/MongoNoteRepository";
import { uploadPdfToRawContainer } from "../shared/storage/blobClient";
import { extractTextFromNote, deleteBlobsForNote } from "../shared/services/textExtraction";
import Busboy from "busboy";
import { LIMITS, isValidFileSize, isValidFileType } from "../config/limits";

const router = Router();
const noteRepo = new MongoNoteRepository();

/**
 * GET /api/notes/:subjectId - List all notes for a subject
 */
router.get("/:subjectId", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const subjectId = req.params.subjectId;

    if (!subjectId) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    const notes = await noteRepo.getNotesForSubject(userId, subjectId);
    res.json(notes);
  } catch (error) {
    console.error("Error in getNotesBySubject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/notes/upload - Upload a PDF note
 * Expects multipart/form-data with subjectId and file
 */
router.post("/upload", async (req: Request, res: Response) => {
  try {
    const { userId, userEmail } = await getUserInfoFromRequest(req);

    // Parse multipart/form-data
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({ message: "Content-Type must be multipart/form-data" });
    }

    const result = await parseMultipartForm(req);

    if (!result.subjectId) {
      return res.status(400).json({ message: "subjectId field is required" });
    }

    if (!result.file) {
      return res.status(400).json({ message: "file field is required" });
    }

    // Security: Check notes per subject limit
    const existingNotes = await noteRepo.getNotesForSubject(userId, result.subjectId);
    if (existingNotes.length >= LIMITS.MAX_NOTES_PER_SUBJECT) {
      return res.status(403).json({
        message: `Note limit reached for this subject. Maximum ${LIMITS.MAX_NOTES_PER_SUBJECT} notes allowed per subject.`,
        currentCount: existingNotes.length,
        maxAllowed: LIMITS.MAX_NOTES_PER_SUBJECT
      });
    }

    // Security: Validate file type
    if (!isValidFileType(result.file.filename)) {
      return res.status(400).json({
        message: `Only PDF files are allowed. Allowed types: ${LIMITS.ALLOWED_FILE_TYPES.join(', ')}`
      });
    }

    // Security: Validate file size
    if (!isValidFileSize(result.file.data.byteLength)) {
      return res.status(400).json({
        message: `File size must be between 1 byte and ${LIMITS.MAX_FILE_SIZE_MB}MB`
      });
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
      console.log(`✅ Uploaded PDF to blob: ${blobName}`);
    } catch (err) {
      console.error("❌ Error uploading to Azure Blob Storage:", err);
      return res.status(500).json({ message: "Failed to upload file to storage" });
    }

    // Create Note object
    const note = await noteRepo.createNote(userId, {
      fileName: result.file.filename,
      fileSize: result.file.data.length,
      blobUrl: blobUrl,
      textUrl: null,
      subjectId: result.subjectId,
      userEmail,
    });

    console.log(`✅ Note created: ${note.id} with blob URL: ${blobUrl}`);

    // Automatically extract text from the PDF
    console.log(`🔄 Starting automatic text extraction...`);
    const extractionResult = await extractTextFromNote(
      note.id,
      userId,
      blobUrl,
      (msg) => console.log(msg)
    );

    if (extractionResult.success) {
      console.log(`✅ Text extraction completed: ${extractionResult.textLength} characters`);
      note.textUrl = extractionResult.textUrl;
    } else {
      console.warn(`⚠️ Text extraction failed: ${extractionResult.error}`);
    }

    res.status(201).json(note);
  } catch (error) {
    console.error("Error in uploadNote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/notes/delete/:id - Delete a note
 */
router.delete("/delete/:id", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "Note ID is required" });
    }

    // Get the note first so we can delete its blobs
    const note = await noteRepo.getNoteById(userId, id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Delete blob storage (PDF and text)
    console.log(`Deleting blobs for note: ${id}`);
    try {
      await deleteBlobsForNote(note, (msg) => console.log(msg));
    } catch (error) {
      console.error("Error deleting blobs:", error);
      // Continue with note deletion even if blob deletion fails
    }

    // Delete the note from database
    await noteRepo.deleteNote(userId, id);
    console.log(`✅ Note deleted: ${id}`);

    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteNote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
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

function parseMultipartForm(req: Request): Promise<ParsedFormData> {
  return new Promise((resolve, reject) => {
    const result: ParsedFormData = {};
    const contentType = req.headers["content-type"];

    if (!contentType) {
      return reject(new Error("No content-type header"));
    }

    const busboy = Busboy({ headers: { "content-type": contentType } });

    busboy.on("field", (fieldname: string, value: string) => {
      if (fieldname === "subjectId") {
        result.subjectId = value;
      }
    });

    busboy.on("file", (fieldname: string, file: NodeJS.ReadableStream, info: { filename: string; encoding: string; mimeType: string }) => {
      if (fieldname === "file") {
        const chunks: Buffer[] = [];

        file.on("data", (chunk: Buffer) => {
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

    busboy.on("error", (error: Error) => {
      reject(error);
    });

    req.pipe(busboy);
  });
}

export default router;
