import express from "express";
import VersionUpdateModel from "../models/VersionUpdate";

const router = express.Router();

/**
 * GET /api/version-updates
 * Get all version updates, sorted by release date (newest first)
 */
router.get("/", async (req, res) => {
  try {
    const updates = await VersionUpdateModel.find()
      .sort({ releaseDate: -1 })
      .limit(10); // Only return last 10 versions

    res.json(updates);
  } catch (error) {
    console.error("Error fetching version updates:", error);
    res.status(500).json({ message: "Failed to fetch version updates" });
  }
});

/**
 * GET /api/version-updates/latest
 * Get the latest version update
 */
router.get("/latest", async (req, res) => {
  try {
    const latestUpdate = await VersionUpdateModel.findOne()
      .sort({ releaseDate: -1 });

    if (!latestUpdate) {
      return res.status(404).json({ message: "No version updates found" });
    }

    res.json(latestUpdate);
  } catch (error) {
    console.error("Error fetching latest version update:", error);
    res.status(500).json({ message: "Failed to fetch latest version update" });
  }
});

export default router;
