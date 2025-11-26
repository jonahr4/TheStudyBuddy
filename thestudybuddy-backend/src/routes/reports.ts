import { Router } from "express";

const router = Router();

// Placeholder routes
router.post("/", (req, res) => {
  res.json({ message: "Report submitted - coming soon" });
});

router.get("/", (req, res) => {
  res.json({ reports: [] });
});

export default router;
