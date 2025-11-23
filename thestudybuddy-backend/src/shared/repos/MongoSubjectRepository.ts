import { SubjectRepository } from "./SubjectRepository";
import { Subject } from "../types";
import SubjectModel from "../../models/Subject";

/**
 * MongoDB implementation of SubjectRepository
 * Uses Mongoose to interact with MongoDB Atlas
 */
export class MongoSubjectRepository implements SubjectRepository {
  
  /**
   * Create a new subject for a user
   */
  async createSubject(
    userId: string,
    data: { name: string; color: string; userEmail?: string }
  ): Promise<Subject> {
    const subject = await SubjectModel.create({
      userId,
      userEmail: data.userEmail,
      name: data.name,
      color: data.color,
    });

    return this.toSubject(subject);
  }

  /**
   * Get all subjects for a user
   * Sorted by most recently created first
   */
  async getSubjectsByUser(userId: string): Promise<Subject[]> {
    const subjects = await SubjectModel.find({ userId }).sort({ createdAt: -1 });
    return subjects.map(this.toSubject);
  }

  /**
   * Get a single subject by ID (must belong to user)
   */
  async getSubjectById(
    userId: string,
    subjectId: string
  ): Promise<Subject | null> {
    const subject = await SubjectModel.findOne({ _id: subjectId, userId });
    return subject ? this.toSubject(subject) : null;
  }

  /**
   * Update a subject (must belong to user)
   */
  async updateSubject(
    userId: string,
    subjectId: string,
    data: { name?: string; color?: string }
  ): Promise<Subject | null> {
    const subject = await SubjectModel.findOneAndUpdate(
      { _id: subjectId, userId },
      { $set: data },
      { new: true } // Return updated document
    );
    
    return subject ? this.toSubject(subject) : null;
  }

  /**
   * Delete a subject (must belong to user)
   * TODO: In production, also cascade delete notes and flashcards
   */
  async deleteSubject(
    userId: string,
    subjectId: string
  ): Promise<void> {
    await SubjectModel.deleteOne({ _id: subjectId, userId });
    
    // TODO: Delete associated notes and flashcards
    // await NoteModel.deleteMany({ subjectId });
    // await FlashcardModel.deleteMany({ subjectId });
  }

  /**
   * Convert Mongoose document to plain Subject type
   * This ensures the return type matches the interface
   */
  private toSubject(doc: any): Subject {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      userEmail: doc.userEmail,
      name: doc.name,
      color: doc.color,
      createdAt: doc.createdAt.toISOString(),
    };
  }
}
