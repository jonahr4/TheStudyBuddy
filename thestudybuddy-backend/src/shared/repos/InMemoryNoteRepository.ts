import { randomUUID } from "crypto";
import { Note } from "../types";
import { NoteRepository } from "./NoteRepository";

/**
 * In-memory implementation of NoteRepository for local development
 */
export class InMemoryNoteRepository implements NoteRepository {
  private notes: Map<string, Note> = new Map();

  async createNote(
    userId: string,
    data: {
      fileName: string;
      fileSize: number;
      blobUrl: string;
      textUrl?: string | null;
      subjectId: string;
    }
  ): Promise<Note> {
    const note: Note = {
      id: randomUUID(),
      fileName: data.fileName,
      fileSize: data.fileSize,
      blobUrl: data.blobUrl,
      textUrl: data.textUrl || null,
      subjectId: data.subjectId,
      userId,
      uploadedAt: new Date().toISOString(),
    };

    this.notes.set(note.id, note);
    return note;
  }

  async getNotesForSubject(
    userId: string,
    subjectId: string
  ): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId && note.subjectId === subjectId
    );
  }

  async getNoteById(userId: string, noteId: string): Promise<Note | null> {
    const note = this.notes.get(noteId);
    if (!note || note.userId !== userId) {
      return null;
    }
    return note;
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    const note = await this.getNoteById(userId, noteId);
    if (note) {
      this.notes.delete(noteId);
      // TODO: Also delete blob storage and associated flashcards
    }
  }
}

