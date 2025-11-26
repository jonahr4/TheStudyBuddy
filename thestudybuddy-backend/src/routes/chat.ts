import { Router } from "express";

const router = Router();

// Placeholder routes
router.post("/", (req, res) => {
  res.json({ message: "Chat endpoint - coming soon" });
});

router.get("/history/:subjectId", (req, res) => {
  res.json({ messages: [] });
});

router.delete("/history/:subjectId", (req, res) => {
  res.status(204).send();
});

router.get("/stats", (req, res) => {
  res.json({ totalMessages: 0, totalConversations: 0 });
});

export default router;
