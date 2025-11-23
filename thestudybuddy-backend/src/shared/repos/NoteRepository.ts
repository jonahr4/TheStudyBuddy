import { Note } from "../types";

/**
 * Repository interface for Note operations
 */
export interface NoteRepository {
  /**
   * Create a new note
   */
  createNote(
    userId: string,
    data: {
      fileName: string;
      blobUrl: string;
      textUrl?: string | null;
      subjectId: string;
    }
  ): Promise<Note>;

  /**
   * Get all notes for a subject (must belong to user)
   */
  getNotesForSubject(
    userId: string,
    subjectId: string
  ): Promise<Note[]>;

  /**
   * Get a single note by ID (must belong to user)
   */
  getNoteById(
    userId: string,
    noteId: string
  ): Promise<Note | null>;

  /**
   * Delete a note (must belong to user)
   * TODO: In production, also delete blob storage and associated flashcards
   */
  deleteNote(
    userId: string,
    noteId: string
  ): Promise<void>;
}

