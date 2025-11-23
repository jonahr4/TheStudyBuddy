import mongoose, { Schema, Document } from "mongoose";

/**
 * Note document interface for MongoDB
 * Stores metadata about uploaded notes - actual files will be in Azure Blob Storage
 */
export interface INote extends Document {
  userId: string;          // Firebase UID of the owner
  userEmail?: string;      // User's email address (for easier debugging/admin)
  subjectId: string;       // ID of the subject this note belongs to
  fileName: string;        // Original filename (e.g., "Chapter1.pdf")
  blobUrl: string;         // Azure Blob Storage URL for the PDF (placeholder for now)
  textUrl?: string;        // Azure Blob Storage URL for extracted text (optional, set later)
  fileSize: number;        // File size in bytes
  uploadedAt: Date;        // When the note was uploaded
}

/**
 * Mongoose schema for Note documents
 */
const NoteSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true, // Index for fast user queries
  },
  userEmail: {
    type: String,
    required: false, // Optional for backwards compatibility
  },
  subjectId: {
    type: String,
    required: true,
    index: true, // Index for fast subject queries
  },
  fileName: {
    type: String,
    required: true,
  },
  blobUrl: {
    type: String,
    required: true,
    default: "placeholder://pending-blob-upload", // Placeholder until blob storage is ready
  },
  textUrl: {
    type: String,
    required: false, // Optional - will be set after text extraction
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient subject + user queries
NoteSchema.index({ userId: 1, subjectId: 1 });

const NoteModel = mongoose.model<INote>("Note", NoteSchema);

export default NoteModel;
