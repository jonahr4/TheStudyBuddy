import { Router } from "express";

const router = Router();

// Placeholder routes - will implement full logic from Azure Functions
router.get("/", (req, res) => {
  res.json({ message: "Flashcards endpoint - coming soon" });
});

router.get("/:subjectId", (req, res) => {
  res.json({ message: "Flashcards by subject - coming soon" });
});

router.post("/generate", (req, res) => {
  res.json({ message: "Generate flashcards - coming soon" });
});

router.get("/set/:setId", (req, res) => {
  res.json({ message: "Get flashcard set - coming soon" });
});

router.delete("/set/:setId", (req, res) => {
  res.status(204).send();
});

export default router;
