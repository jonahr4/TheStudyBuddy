import { randomUUID } from "crypto";
import { Subject } from "../types";
import { SubjectRepository } from "./SubjectRepository";

/**
 * In-memory implementation of SubjectRepository for local development
 * 
 * This will be replaced with MongoSubjectRepository in production
 */
export class InMemorySubjectRepository implements SubjectRepository {
  private subjects: Map<string, Subject> = new Map();

  async createSubject(
    userId: string,
    data: { name: string; color: string }
  ): Promise<Subject> {
    const subject: Subject = {
      _id: randomUUID(),
      name: data.name,
      color: data.color,
      userId,
      createdAt: new Date().toISOString(),
    };

    this.subjects.set(subject._id, subject);
    return subject;
  }

  async getSubjectsByUser(userId: string): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(
      (subject) => subject.userId === userId
    );
  }

  async getSubjectById(
    userId: string,
    subjectId: string
  ): Promise<Subject | null> {
    const subject = this.subjects.get(subjectId);
    if (!subject || subject.userId !== userId) {
      return null;
    }
    return subject;
  }

  async updateSubject(
    userId: string,
    subjectId: string,
    data: { name?: string; color?: string }
  ): Promise<Subject | null> {
    const subject = await this.getSubjectById(userId, subjectId);
    if (!subject) {
      return null;
    }

    const updated: Subject = {
      ...subject,
      ...(data.name && { name: data.name }),
      ...(data.color && { color: data.color }),
    };

    this.subjects.set(subjectId, updated);
    return updated;
  }

  async deleteSubject(userId: string, subjectId: string): Promise<void> {
    const subject = await this.getSubjectById(userId, subjectId);
    if (subject) {
      this.subjects.delete(subjectId);
      // TODO: Also delete associated notes and flashcards
    }
  }
}

