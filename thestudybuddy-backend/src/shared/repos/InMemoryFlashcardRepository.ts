import { randomUUID } from "crypto";
import { Flashcard } from "../types";
import { FlashcardRepository } from "./FlashcardRepository";

/**
 * In-memory implementation of FlashcardRepository for local development
 */
export class InMemoryFlashcardRepository implements FlashcardRepository {
  private flashcards: Map<string, Flashcard> = new Map();

  async createFlashcards(
    userId: string,
    flashcards: Array<{
      question: string;
      answer: string;
      subjectId: string;
      noteId: string;
    }>
  ): Promise<Flashcard[]> {
    const created: Flashcard[] = [];

    for (const data of flashcards) {
      const flashcard: Flashcard = {
        _id: randomUUID(),
        question: data.question,
        answer: data.answer,
        subjectId: data.subjectId,
        noteId: data.noteId,
        userId,
        createdAt: new Date().toISOString(),
      };

      this.flashcards.set(flashcard._id, flashcard);
      created.push(flashcard);
    }

    return created;
  }

  async getFlashcardsForSubject(
    userId: string,
    subjectId: string
  ): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(
      (card) => card.userId === userId && card.subjectId === subjectId
    );
  }

  async getFlashcardsForNote(
    userId: string,
    noteId: string
  ): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(
      (card) => card.userId === userId && card.noteId === noteId
    );
  }
}

