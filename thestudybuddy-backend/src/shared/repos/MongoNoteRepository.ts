import { NoteRepository } from "./NoteRepository";
import { Note } from "../types";
import NoteModel from "../../models/Note";

/**
 * MongoDB implementation of NoteRepository
 * Uses Mongoose to interact with MongoDB Atlas
 * Stores note metadata - actual files are in Azure Blob Storage
 */
export class MongoNoteRepository implements NoteRepository {
  
  /**
   * Create a new note for a subject
   */
  async createNote(
    userId: string,
    data: { fileName: string; fileSize: number; blobUrl: string; textUrl?: string | null; subjectId: string }
  ): Promise<Note> {
    const noteData: any = {
      userId,
      subjectId: data.subjectId,
      fileName: data.fileName,
      fileSize: data.fileSize,
      blobUrl: data.blobUrl,
    };
    
    if (data.textUrl) {
      noteData.textUrl = data.textUrl;
    }
    
    const note = await NoteModel.create(noteData);
    return this.toNote(note);
  }

  /**
   * Get all notes for a subject (must belong to user)
   * Sorted by most recently uploaded first
   */
  async getNotesForSubject(userId: string, subjectId: string): Promise<Note[]> {
    const notes = await NoteModel.find({ userId, subjectId }).sort({ uploadedAt: -1 });
    return notes.map(this.toNote);
  }

  /**
   * Get a single note by ID (must belong to user)
   */
  async getNoteById(
    userId: string,
    noteId: string
  ): Promise<Note | null> {
    const note = await NoteModel.findOne({ _id: noteId, userId });
    return note ? this.toNote(note) : null;
  }

  /**
   * Update a note's textUrl (must belong to user)
   */
  async updateNote(
    userId: string,
    noteId: string,
    data: { textUrl?: string | null }
  ): Promise<Note | null> {
    const note = await NoteModel.findOneAndUpdate(
      { _id: noteId, userId },
      { $set: data },
      { new: true }
    );
    return note ? this.toNote(note) : null;
  }

  /**
   * Delete a note (must belong to user)
   * TODO: In production, also delete from Azure Blob Storage and associated flashcards
   */
  async deleteNote(
    userId: string,
    noteId: string
  ): Promise<void> {
    await NoteModel.deleteOne({ _id: noteId, userId });
    
    // TODO: Delete from Azure Blob Storage
    // await blobService.deleteBlob(blobUrl);
    
    // TODO: Delete associated flashcards
    // await FlashcardModel.deleteMany({ noteId });
  }

  /**
   * Convert Mongoose document to plain Note type
   * This ensures the return type matches the interface
   */
  private toNote(doc: any): Note {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      subjectId: doc.subjectId,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      blobUrl: doc.blobUrl,
      textUrl: doc.textUrl || null,
      uploadedAt: doc.uploadedAt.toISOString(),
    };
  }
}
