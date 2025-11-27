import { Flashcard } from "../types";

/**
 * Repository interface for Flashcard operations
 */
export interface FlashcardRepository {
  /**
   * Create multiple flashcards at once (bulk insert)
   */
  createFlashcards(
    userId: string,
    flashcards: Array<{
      question: string;
      answer: string;
      subjectId: string;
      noteId: string;
    }>
  ): Promise<Flashcard[]>;

  /**
   * Get all flashcards for a subject (must belong to user)
   */
  getFlashcardsForSubject(
    userId: string,
    subjectId: string
  ): Promise<Flashcard[]>;

  /**
   * Get all flashcards for a specific note (must belong to user)
   */
  getFlashcardsForNote(
    userId: string,
    noteId: string
  ): Promise<Flashcard[]>;
}

