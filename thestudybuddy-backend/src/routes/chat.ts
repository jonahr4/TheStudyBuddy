import { Router, Request, Response } from "express";
import { getUserInfoFromRequest } from "../shared/expressAuth";
import ChatMessage from "../models/ChatMessage";

const router = Router();

/**
 * GET /api/chat/stats - Get chat statistics for current user
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);

    const totalMessages = await ChatMessage.countDocuments({ userId });
    const uniqueSubjects = await ChatMessage.distinct('subjectId', { userId });

    const recentChats = await ChatMessage.aggregate([
      { $match: { userId } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$subjectId',
          lastMessage: { $first: '$content' },
          lastTimestamp: { $first: '$timestamp' },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { lastTimestamp: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalMessages,
      totalConversations: uniqueSubjects.length,
      recentChats,
    });
  } catch (error: any) {
    console.error("Error fetching chat stats:", error);
    res.status(500).json({
      message: "Failed to fetch chat statistics",
      error: error.message
    });
  }
});

/**
 * GET /api/chat/history/:subjectId - Get chat history for a specific subject
 */
router.get("/history/:subjectId", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const { subjectId } = req.params;

    if (!subjectId) {
      return res.status(400).json({ message: "subjectId is required" });
    }

    const limit = parseInt(req.query.limit as string || '50', 10);

    const messages = await ChatMessage.find({
      userId,
      subjectId,
    })
      .sort({ timestamp: 1 })
      .limit(limit)
      .select('role content timestamp')
      .exec();

    console.log(`Found ${messages.length} messages for subject ${subjectId}`);

    res.json({
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    });

  } catch (error: any) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      message: "Failed to fetch chat history",
      error: error.message
    });
  }
});

/**
 * DELETE /api/chat/history/:subjectId - Clear chat history for a specific subject
 */
router.delete("/history/:subjectId", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const { subjectId } = req.params;

    if (!subjectId) {
      return res.status(400).json({ message: "subjectId is required" });
    }

    const result = await ChatMessage.deleteMany({
      userId,
      subjectId,
    });

    console.log(`Deleted ${result.deletedCount} messages for subject ${subjectId}`);

    res.json({
      message: `Cleared ${result.deletedCount} messages`,
      deletedCount: result.deletedCount,
    });

  } catch (error: any) {
    console.error("Error clearing chat history:", error);
    res.status(500).json({
      message: "Failed to clear chat history",
      error: error.message
    });
  }
});

export default router;
