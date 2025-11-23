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

/**
 * Delete a blob from Azure Storage by URL
 */
export async function deleteBlobByUrl(blobUrl: string): Promise<void> {
  if (!blobUrl || blobUrl.startsWith("placeholder://")) {
    // Skip deletion for placeholder URLs
    return;
  }

  try {
    // Parse blob name from URL
    // Example URL: https://studybuddystorage.blob.core.windows.net/notes-raw/userId/subjectId/file.pdf
    const url = new URL(blobUrl);
    const pathParts = url.pathname.split('/');
    
    // Remove the first empty element and container name
    const containerName = pathParts[1];
    const blobName = pathParts.slice(2).join('/');

    if (!blobName) {
      console.warn(`Could not extract blob name from URL: ${blobUrl}`);
      return;
    }

    // Get the container client
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    // Delete the blob
    await blobClient.deleteIfExists();
    console.log(`✅ Deleted blob: ${blobName}`);
  } catch (error) {
    console.error(`❌ Error deleting blob from URL ${blobUrl}:`, error);
    // Don't throw - we don't want deletion to fail if blob is already gone
  }
}

