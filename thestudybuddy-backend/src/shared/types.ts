/**
 * Shared TypeScript types for The Study Buddy backend
 */

export interface Subject {
  id: string;         // subject id (stringified ObjectId or UUID)
  name: string;
  color: string;      // e.g. "#4f46e5" or "bg-blue-500"
  userId: string;     // Firebase UID
  createdAt: string;  // ISO timestamp
}

export interface Note {
  _id: string;
  fileName: string;        // original filename.pdf
  blobUrl: string;         // Azure Blob URL for the PDF (or placeholder for now)
  textUrl?: string | null; // Azure Blob URL for extracted text, if available
  subjectId: string;
  userId: string;
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

