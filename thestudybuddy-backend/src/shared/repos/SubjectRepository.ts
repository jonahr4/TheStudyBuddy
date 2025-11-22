import { Subject } from "../types";

/**
 * Repository interface for Subject operations
 * This interface can be implemented by:
 * - InMemorySubjectRepository (for local dev/testing)
 * - MongoSubjectRepository (for production with MongoDB Atlas)
 */
export interface SubjectRepository {
  /**
   * Create a new subject for a user
   */
  createSubject(
    userId: string,
    data: { name: string; color: string }
  ): Promise<Subject>;

  /**
   * Get all subjects for a user
   */
  getSubjectsByUser(userId: string): Promise<Subject[]>;

  /**
   * Get a single subject by ID (must belong to user)
   */
  getSubjectById(
    userId: string,
    subjectId: string
  ): Promise<Subject | null>;

  /**
   * Update a subject (must belong to user)
   */
  updateSubject(
    userId: string,
    subjectId: string,
    data: { name?: string; color?: string }
  ): Promise<Subject | null>;

  /**
   * Delete a subject (must belong to user)
   * TODO: In production, also cascade delete notes and flashcards
   */
  deleteSubject(
    userId: string,
    subjectId: string
  ): Promise<void>;
}

