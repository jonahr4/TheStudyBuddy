import { Router, Request, Response } from "express";
import { getUserInfoFromRequest } from "../shared/expressAuth";
import { Report } from "../models/Report";

const router = Router();

/**
 * POST /api/reports - Submit a bug report or feature request
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const user = await getUserInfoFromRequest(req);
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, description } = req.body;

    if (!type || !description) {
      return res.status(400).json({ error: 'Type and description are required' });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ error: 'Description must be at least 10 characters' });
    }

    const report = new Report({
      userId: user.userId,
      userEmail: user.userEmail || 'unknown',
      type,
      description: description.trim(),
      status: 'new',
    });

    await report.save();

    console.log(`Report submitted by user ${user.userId}`);

    res.status(201).json({
      message: 'Report submitted successfully',
      reportId: report._id,
    });
  } catch (error: any) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

/**
 * GET /api/reports - Get all reports for current user
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const user = await getUserInfoFromRequest(req);
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reports = await Report.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ reports });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;
