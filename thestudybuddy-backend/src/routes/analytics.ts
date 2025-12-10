import { Router, Request, Response } from "express";
import { getUserInfoFromRequest } from "../shared/expressAuth";
import UserAnalytics from "../models/UserAnalytics";
import Subject from "../models/Subject";
import NoteModel from "../models/Note";
import FlashcardSet from "../models/FlashcardSet";
import ChatMessage from "../models/ChatMessage";

const router = Router();

/**
 * Helper function to get start of day
 */
function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * POST /api/analytics/track - Track a user event
 */
router.post("/track", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const { eventType, metadata } = req.body;

    if (!eventType) {
      return res.status(400).json({ message: "eventType is required" });
    }

    let analytics = await UserAnalytics.findOne({ userId });

    if (!analytics) {
      // Create new analytics document
      analytics = await UserAnalytics.create({
        userId,
        firstLogin: new Date(),
        lastLogin: new Date(),
        lastActivity: new Date(),
      });
    }

    // Update last activity
    analytics.lastActivity = new Date();

    // Get today's activity entry
    const today = getStartOfDay();
    let todayActivity = analytics.dailyActivity.find(
      a => a.date.getTime() === today.getTime()
    );

    if (!todayActivity) {
      todayActivity = {
        date: today,
        logins: 0,
        chatMessages: 0,
        notesUploaded: 0,
        flashcardsCreated: 0,
        flashcardsStudied: 0,
        gamesPlayed: 0,
        subjectsCreated: 0,
        timeSpent: 0,
      };
      analytics.dailyActivity.push(todayActivity);
    }

    // Track specific events
    switch (eventType) {
      case 'login':
        analytics.totalLogins += 1;
        todayActivity.logins += 1;
        analytics.lastLogin = new Date();
        if (!analytics.firstLogin) {
          analytics.firstLogin = new Date();
        }
        break;

      case 'session_start':
        analytics.currentSessionStart = new Date();
        break;

      case 'session_end':
        if (analytics.currentSessionStart) {
          const duration = Math.floor((Date.now() - analytics.currentSessionStart.getTime()) / 1000);
          analytics.sessions.push({
            startTime: analytics.currentSessionStart,
            endTime: new Date(),
            duration,
            pagesVisited: metadata?.pagesVisited || [],
            actionsPerformed: metadata?.actionsPerformed || 0,
          });
          analytics.totalTimeSpent += duration;
          todayActivity.timeSpent += duration;

          // Update average session duration
          const totalDuration = analytics.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
          analytics.averageSessionDuration = Math.floor(totalDuration / analytics.sessions.length);

          analytics.currentSessionStart = undefined;
        }
        break;

      case 'chat_message':
        analytics.totalChatMessages += 1;
        todayActivity.chatMessages += 1;
        analytics.featuresUsed.chat = true;
        break;

      case 'note_uploaded':
        analytics.totalNotesUploaded += 1;
        todayActivity.notesUploaded += 1;
        analytics.featuresUsed.notes = true;
        break;

      case 'flashcard_set_created':
        analytics.totalFlashcardSetsCreated += 1;
        todayActivity.flashcardsCreated += 1;
        analytics.featuresUsed.flashcards = true;
        break;

      case 'flashcard_studied':
        analytics.totalFlashcardsStudied += 1;
        todayActivity.flashcardsStudied += 1;
        analytics.featuresUsed.flashcards = true;
        break;

      case 'game_played':
        analytics.totalGamesPlayed += 1;
        todayActivity.gamesPlayed += 1;
        analytics.featuresUsed.games = true;
        break;

      case 'subject_created':
        analytics.totalSubjectsCreated += 1;
        todayActivity.subjectsCreated += 1;
        break;

      case 'page_visit':
        // Track page visits in current session
        if (metadata?.page && analytics.currentSessionStart) {
          const currentSession = analytics.sessions[analytics.sessions.length - 1];
          if (currentSession && !currentSession.endTime) {
            // Still in session
          }
        }
        break;

      default:
        console.warn(`Unknown event type: ${eventType}`);
    }

    await analytics.save();

    res.json({ success: true, analytics });
  } catch (error: any) {
    console.error("Error tracking analytics:", error);
    res.status(500).json({ message: "Failed to track event", error: error.message });
  }
});

/**
 * GET /api/analytics/me - Get current user's analytics
 */
router.get("/me", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);

    let analytics = await UserAnalytics.findOne({ userId });

    if (!analytics) {
      // Create analytics document if it doesn't exist and populate current counts
      const subjectCount = await Subject.countDocuments({ userId });
      const noteCount = await NoteModel.countDocuments({ userId });
      const flashcardSetCount = await FlashcardSet.countDocuments({ userId });
      const chatMessageCount = await ChatMessage.countDocuments({
        userId,
        role: 'user'
      });

      analytics = await UserAnalytics.create({
        userId,
        subjectCount,
        noteCount,
        flashcardSetCount,
        chatMessageCount,
        firstLogin: new Date(),
        lastLogin: new Date(),
        lastActivity: new Date(),
      });
    } else {
      // Update current counts
      analytics.subjectCount = await Subject.countDocuments({ userId });
      analytics.noteCount = await NoteModel.countDocuments({ userId });
      analytics.flashcardSetCount = await FlashcardSet.countDocuments({ userId });
      analytics.chatMessageCount = await ChatMessage.countDocuments({
        userId,
        role: 'user'
      });
      await analytics.save();
    }

    res.json(analytics);
  } catch (error: any) {
    console.error("Error getting analytics:", error);
    res.status(500).json({ message: "Failed to get analytics", error: error.message });
  }
});

/**
 * GET /api/analytics/summary - Get aggregated analytics summary (admin only for now)
 */
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);

    // TODO: Add admin check here

    const allAnalytics = await UserAnalytics.find({});

    const summary = {
      totalUsers: allAnalytics.length,
      totalLogins: allAnalytics.reduce((sum, a) => sum + a.totalLogins, 0),
      totalChatMessages: allAnalytics.reduce((sum, a) => sum + a.totalChatMessages, 0),
      totalNotesUploaded: allAnalytics.reduce((sum, a) => sum + a.totalNotesUploaded, 0),
      totalFlashcardSets: allAnalytics.reduce((sum, a) => sum + a.totalFlashcardSetsCreated, 0),
      totalFlashcardsStudied: allAnalytics.reduce((sum, a) => sum + a.totalFlashcardsStudied, 0),
      totalGamesPlayed: allAnalytics.reduce((sum, a) => sum + a.totalGamesPlayed, 0),
      totalSubjects: allAnalytics.reduce((sum, a) => sum + a.totalSubjectsCreated, 0),
      totalTimeSpent: allAnalytics.reduce((sum, a) => sum + a.totalTimeSpent, 0),
      averageSessionDuration: Math.floor(
        allAnalytics.reduce((sum, a) => sum + a.averageSessionDuration, 0) / allAnalytics.length
      ),
      activeUsers: {
        today: allAnalytics.filter(a => {
          if (!a.lastActivity) return false;
          const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
          return a.lastActivity.getTime() > dayAgo;
        }).length,
        thisWeek: allAnalytics.filter(a => {
          if (!a.lastActivity) return false;
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          return a.lastActivity.getTime() > weekAgo;
        }).length,
        thisMonth: allAnalytics.filter(a => {
          if (!a.lastActivity) return false;
          const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          return a.lastActivity.getTime() > monthAgo;
        }).length,
      },
      featureAdoption: {
        chat: allAnalytics.filter(a => a.featuresUsed?.chat).length,
        flashcards: allAnalytics.filter(a => a.featuresUsed?.flashcards).length,
        games: allAnalytics.filter(a => a.featuresUsed?.games).length,
        notes: allAnalytics.filter(a => a.featuresUsed?.notes).length,
      },
    };

    res.json(summary);
  } catch (error: any) {
    console.error("Error getting analytics summary:", error);
    res.status(500).json({ message: "Failed to get summary", error: error.message });
  }
});

/**
 * POST /api/analytics/sync-counts - Sync current counts for user
 */
router.post("/sync-counts", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);

    let analytics = await UserAnalytics.findOne({ userId });

    if (!analytics) {
      analytics = await UserAnalytics.create({ userId });
    }

    // Update all current counts
    analytics.subjectCount = await Subject.countDocuments({ userId });
    analytics.noteCount = await NoteModel.countDocuments({ userId });
    analytics.flashcardSetCount = await FlashcardSet.countDocuments({ userId });
    analytics.chatMessageCount = await ChatMessage.countDocuments({
      userId,
      role: 'user'
    });

    await analytics.save();

    res.json(analytics);
  } catch (error: any) {
    console.error("Error syncing counts:", error);
    res.status(500).json({ message: "Failed to sync counts", error: error.message });
  }
});

export default router;
