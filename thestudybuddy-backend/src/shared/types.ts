/**
 * Shared TypeScript types for The Study Buddy backend
 */

export interface Subject {
  id: string;         // subject id (stringified ObjectId or UUID)
  name: string;
  color: string;      // e.g. "#4f46e5" or "bg-blue-500"
  userId: string;     // Firebase UID
  userEmail?: string; // User's email (optional for backwards compatibility)
  createdAt: string;  // ISO timestamp
  noteCount?: number; // Number of notes in this subject
  flashcardCount?: number; // Number of flashcard sets in this subject
}

export interface Note {
  id: string;              // note id (stringified ObjectId)
  fileName: string;        // original filename.pdf
  blobUrl: string;         // Azure Blob URL for the PDF (placeholder until blob storage ready)
  textUrl?: string | null; // Azure Blob URL for extracted text, if available
  fileSize: number;        // file size in bytes
  subjectId: string;       // subject this note belongs to
  userId: string;          // Firebase UID of owner
  userEmail?: string;      // User's email (optional for backwards compatibility)
  uploadedAt: string;      // ISO timestamp
}

export interface Flashcard {
  _id: string;
  question: string;
  answer: string;
  subjectId: string;
  noteId: string;
  userId: string;
  createdAt: string;       // ISO timestamp
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Request/Response types for API endpoints
export interface CreateSubjectRequest {
  name: string;
  color: string;
}

export interface UpdateSubjectRequest {
  name?: string;
  color?: string;
}

export interface GenerateFlashcardsRequest {
  noteId: string;
  subjectId: string;
}

export interface ChatRequest {
  subjectId: string;
  message: string;
  chatHistory?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
}

export interface ErrorResponse {
  message: string;
}

