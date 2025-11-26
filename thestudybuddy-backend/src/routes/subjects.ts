import { Router, Request, Response } from "express";
import { getUserInfoFromRequest } from "../shared/expressAuth";
import { MongoSubjectRepository } from "../shared/repos/MongoSubjectRepository";
import { CreateSubjectRequest, UpdateSubjectRequest } from "../shared/types";

const router = Router();
const subjectRepo = new MongoSubjectRepository();

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

    // TODO: Also cascade delete notes and flashcards for this subject
    await subjectRepo.deleteSubject(userId, id);

    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteSubject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
