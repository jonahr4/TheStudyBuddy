// src/shared/storage/blobClient.ts

import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.STORAGE_CONNECTION_STRING;
const rawContainerName = process.env.STORAGE_NOTES_RAW_CONTAINER;

if (!connectionString) {
  throw new Error("STORAGE_CONNECTION_STRING is not set in environment variables");
}

if (!rawContainerName) {
  throw new Error("STORAGE_NOTES_RAW_CONTAINER is not set in environment variables");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const rawContainerClient = blobServiceClient.getContainerClient(rawContainerName);

/**
 * Upload a PDF into the notes-raw container.
 */
export async function uploadPdfToRawContainer(params: {
  userId: string;
  subjectId: string;
  fileBuffer: Buffer;
  originalFileName: string;
}): Promise<{ blobName: string; blobUrl: string }> {
  const { userId, subjectId, fileBuffer, originalFileName } = params;

  // Sanitize filename to avoid weird characters in blob path
  const safeFileName = originalFileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");

  // Example pattern: userId/subjectId/1679876543210-chapter1.pdf
  const blobName = `${userId}/${subjectId}/${Date.now()}-${safeFileName}`;

  const blockBlobClient = rawContainerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: {
      blobContentType: "application/pdf",
    },
  });

  return {
    blobName,
    blobUrl: blockBlobClient.url,
  };
}

