import { Router, Request, Response } from "express";
import { getUserInfoFromRequest } from "../shared/expressAuth";
import { MongoSubjectRepository } from "../shared/repos/MongoSubjectRepository";
import { CreateSubjectRequest, UpdateSubjectRequest } from "../shared/types";
import { LIMITS, isValidStringLength } from "../config/limits";
import { MongoNoteRepository } from "../shared/repos/MongoNoteRepository";
import FlashcardSet from "../models/FlashcardSet";
import { deleteBlobsForNote } from "../shared/services/textExtraction";

const router = Router();
const subjectRepo = new MongoSubjectRepository();
const noteRepo = new MongoNoteRepository();

/**
 * GET /api/subjects - List all subjects for current user
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const subjects = await subjectRepo.getSubjectsByUser(userId);
    res.json(subjects);
  } catch (error) {
    console.error("Error in getSubjects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/subjects - Create a new subject
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, userEmail } = await getUserInfoFromRequest(req);
    const body = req.body as CreateSubjectRequest;

    // Validate required fields
    if (!body.name || !body.color) {
      return res.status(400).json({ message: "name and color are required" });
    }

    // Security: Validate subject name length
    if (!isValidStringLength(body.name, LIMITS.MAX_SUBJECT_NAME_LENGTH)) {
      return res.status(400).json({
        message: `Subject name must be between 1 and ${LIMITS.MAX_SUBJECT_NAME_LENGTH} characters`,
      });
    }

    // Security: Enforce subject limit per user
    const existingSubjects = await subjectRepo.getSubjectsByUser(userId);
    if (existingSubjects.length >= LIMITS.MAX_SUBJECTS_PER_USER) {
      return res.status(403).json({
        message: `Subject limit reached. Maximum ${LIMITS.MAX_SUBJECTS_PER_USER} subjects allowed per user.`,
        currentCount: existingSubjects.length,
        maxAllowed: LIMITS.MAX_SUBJECTS_PER_USER
      });
    }

    const subject = await subjectRepo.createSubject(userId, {
      name: body.name,
      color: body.color,
      userEmail,
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error("Error in createSubject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/subjects/:id - Get a single subject by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    const subject = await subjectRepo.getSubjectById(userId, id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (error) {
    console.error("Error in getSubject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PUT /api/subjects/:id - Update a subject
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    const body = req.body as UpdateSubjectRequest;
    const subject = await subjectRepo.updateSubject(userId, id, body);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (error) {
    console.error("Error in updateSubject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/subjects/:id - Delete a subject
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    console.log(`🗑️ Deleting subject ${id} and all related data...`);

    // 1. Get all notes for this subject so we can delete their blobs
    const notes = await noteRepo.getNotesForSubject(userId, id);
    console.log(`Found ${notes.length} notes to delete`);

    // 2. Delete blobs for each note
    for (const note of notes) {
      try {
        await deleteBlobsForNote(note, (msg) => console.log(msg));
      } catch (error) {
        console.error(`Failed to delete blobs for note ${note.id}:`, error);
        // Continue even if blob deletion fails
      }
    }

    // 3. Delete all notes for this subject
    for (const note of notes) {
      try {
        await noteRepo.deleteNote(userId, note.id);
      } catch (error) {
        console.error(`Failed to delete note ${note.id}:`, error);
      }
    }
    console.log(`✅ Deleted ${notes.length} notes`);

    // 4. Delete all flashcard sets for this subject
    const flashcardResult = await FlashcardSet.deleteMany({
      userId,
      subjectId: id
    });
    console.log(`✅ Deleted ${flashcardResult.deletedCount} flashcard sets`);

    // 5. Finally, delete the subject itself
    await subjectRepo.deleteSubject(userId, id);
    console.log(`✅ Deleted subject ${id}`);

    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteSubject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
