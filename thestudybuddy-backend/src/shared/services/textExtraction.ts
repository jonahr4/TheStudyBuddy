import { BlobServiceClient } from "@azure/storage-blob";
import { noteRepo } from "../../index";
import pdfParse from "pdf-parse";

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

interface TextExtractionResult {
  success: boolean;
  textUrl: string;
  textLength: number;
  error?: string;
}

/**
 * Extract text from a PDF note and save it to blob storage
 * @param noteId - The ID of the note
 * @param userId - The user ID who owns the note
 * @param blobUrl - The URL of the PDF blob
 * @param logger - Optional logger function
 * @returns TextExtractionResult
 */
export async function extractTextFromNote(
  noteId: string,
  userId: string,
  blobUrl: string,
  logger?: (message: string) => void
): Promise<TextExtractionResult> {
  const log = logger || console.log;
  
  try {
    log(`Processing text extraction for note: ${noteId} (user: ${userId})`);

    // 1. Fetch the note from the repo
    const note = await noteRepo.getNoteById(userId, noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // 2. Download the PDF using Azure SDK
    log(`Downloading PDF from blob storage...`);
    
    // Extract blob name from the full URL or use note metadata
    // Blob name format: userId/subjectId/timestamp-filename.pdf
    const blobName = `${note.userId}/${note.subjectId}/${blobUrl.split('/').pop()}`;
    log(`Blob name: ${blobName}`);
    
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
    log(`PDF downloaded, size: ${pdfBuffer.length} bytes`);

    // 3. Extract text using pdf-parse
    log(`Extracting text from PDF...`);
    const textResult = await pdfParse(pdfBuffer);
    const extractedText = textResult.text || "";
    log(`✅ Extracted ${extractedText.length} characters of text`);

    if (!extractedText.trim()) {
      log("⚠️ No text extracted from PDF (might be image-based)");
    }

    // 4. Upload the text to notes-text container
    const textBlobName = `${note.userId}/${note.subjectId}/${note.id}.txt`;
    log(`Uploading text to blob: ${textBlobName}`);
    const blockBlobClient = textContainerClient.getBlockBlobClient(textBlobName);

    await blockBlobClient.uploadData(Buffer.from(extractedText), {
      blobHTTPHeaders: { blobContentType: "text/plain; charset=utf-8" },
    });

    const textUrl = blockBlobClient.url;
    log(`✅ Text uploaded to: ${textUrl}`);

    // 5. Update the note's textUrl
    const updatedNote = await noteRepo.updateNote(note.userId, note.id, { textUrl });
    if (!updatedNote) {
      throw new Error("Failed to update note with textUrl");
    }

    log(`✅ Note updated with textUrl`);

    return {
      success: true,
      textUrl: textUrl,
      textLength: extractedText.length,
    };

  } catch (error: any) {
    log(`❌ Error in text extraction: ${error.message}`);
    return {
      success: false,
      textUrl: "",
      textLength: 0,
      error: error.message,
    };
  }
}

/**
 * Delete both the PDF and text blobs for a note
 * @param note - The note object containing userId, subjectId, blobUrl, and textUrl
 * @param logger - Optional logger function
 */
export async function deleteBlobsForNote(
  note: { userId: string; subjectId: string; id: string; blobUrl: string; textUrl?: string | null },
  logger?: (message: string) => void
): Promise<void> {
  const log = logger || console.log;
  
  try {
    // Delete PDF blob from raw container
    if (note.blobUrl) {
      const pdfBlobName = `${note.userId}/${note.subjectId}/${note.blobUrl.split('/').pop()}`;
      log(`Deleting PDF blob: ${pdfBlobName}`);
      
      const pdfBlobClient = rawContainerClient.getBlobClient(pdfBlobName);
      await pdfBlobClient.deleteIfExists();
      log(`✅ PDF blob deleted`);
    }

    // Delete text blob from text container
    if (note.textUrl) {
      const textBlobName = `${note.userId}/${note.subjectId}/${note.id}.txt`;
      log(`Deleting text blob: ${textBlobName}`);
      
      const textBlobClient = textContainerClient.getBlobClient(textBlobName);
      await textBlobClient.deleteIfExists();
      log(`✅ Text blob deleted`);
    }
  } catch (error: any) {
    log(`❌ Error deleting blobs: ${error.message}`);
    throw error;
  }
}

