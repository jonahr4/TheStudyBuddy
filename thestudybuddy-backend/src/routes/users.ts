import { Router } from "express";

const router = Router();

// Placeholder routes
router.get("/me", (req, res) => {
  res.json({ message: "User endpoint - coming soon" });
});

router.post("/sync", (req, res) => {
  res.json({ message: "User sync - coming soon" });
});

export default router;
