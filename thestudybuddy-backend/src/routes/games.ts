import { Router, Request, Response } from "express";
import { getUserInfoFromRequest } from "../shared/expressAuth";
import GameStats from "../models/GameStats";

const router = Router();

/**
 * POST /api/games/results - Save a game result
 */
router.post("/results", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const { flashcardSetId, gameType, score, time, moves, difficulty, stars } = req.body;

    if (!flashcardSetId || !gameType || score === undefined || !time || !moves || !difficulty || !stars) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find or create game stats for this user/set/gameType combination
    let gameStats = await GameStats.findOne({
      userId,
      flashcardSetId,
      gameType,
    });

    const newResult = {
      score,
      time,
      moves,
      difficulty,
      stars,
      completedAt: new Date(),
    };

    if (gameStats) {
      // Update existing stats
      gameStats.results.push(newResult);
      gameStats.totalGamesPlayed += 1;
      
      // Update best score
      if (score > gameStats.bestScore) {
        gameStats.bestScore = score;
      }
      
      // Update best time (lower is better)
      if (!gameStats.bestTime || time < gameStats.bestTime) {
        gameStats.bestTime = time;
      }
      
      // Calculate new average score
      const totalScore = gameStats.results.reduce((sum, r) => sum + r.score, 0);
      gameStats.averageScore = Math.round(totalScore / gameStats.results.length);
      
      // Keep only last 50 results to prevent unbounded growth
      if (gameStats.results.length > 50) {
        gameStats.results = gameStats.results.slice(-50);
      }
      
      await gameStats.save();
    } else {
      // Create new game stats
      gameStats = await GameStats.create({
        userId,
        flashcardSetId,
        gameType,
        results: [newResult],
        totalGamesPlayed: 1,
        bestScore: score,
        bestTime: time,
        averageScore: score,
      });
    }

    console.log(`✅ Game result saved for user ${userId}, set ${flashcardSetId}`);
    res.json(gameStats);
  } catch (error: any) {
    console.error("Error saving game result:", error);
    res.status(500).json({ message: "Failed to save game result", error: error.message });
  }
});

/**
 * GET /api/games/stats/:flashcardSetId - Get game stats for a specific flashcard set
 */
router.get("/stats/:flashcardSetId", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const { flashcardSetId } = req.params;
    const { gameType = 'matching' } = req.query;

    const gameStats = await GameStats.findOne({
      userId,
      flashcardSetId,
      gameType,
    });

    if (!gameStats) {
      return res.json({
        totalGamesPlayed: 0,
        bestScore: 0,
        bestTime: null,
        averageScore: 0,
        results: [],
      });
    }

    res.json(gameStats);
  } catch (error: any) {
    console.error("Error getting game stats:", error);
    res.status(500).json({ message: "Failed to get game stats", error: error.message });
  }
});

/**
 * GET /api/games/stats - Get all game stats for the current user
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);

    const gameStats = await GameStats.find({ userId });

    // Aggregate overall stats
    const overallStats = {
      totalGamesPlayed: gameStats.reduce((sum, g) => sum + g.totalGamesPlayed, 0),
      totalSetsPlayed: gameStats.length,
      overallBestScore: Math.max(...gameStats.map(g => g.bestScore), 0),
      statsBySet: gameStats,
    };

    res.json(overallStats);
  } catch (error: any) {
    console.error("Error getting all game stats:", error);
    res.status(500).json({ message: "Failed to get game stats", error: error.message });
  }
});

/**
 * GET /api/games/recent - Get recent game results for the current user
 */
router.get("/recent", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);
    const { limit = 10 } = req.query;

    const gameStats = await GameStats.find({ userId });

    // Flatten and sort all results by date
    const allResults = gameStats.flatMap(gs => 
      gs.results.map(r => ({
        score: r.score,
        time: r.time,
        moves: r.moves,
        difficulty: r.difficulty,
        stars: r.stars,
        completedAt: r.completedAt,
        flashcardSetId: gs.flashcardSetId,
        gameType: gs.gameType,
      }))
    );

    // Sort by completedAt descending and take limit
    const recentResults = allResults
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, Number(limit));

    res.json(recentResults);
  } catch (error: any) {
    console.error("Error getting recent game results:", error);
    res.status(500).json({ message: "Failed to get recent results", error: error.message });
  }
});

export default router;

