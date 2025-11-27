import { Router, Request, Response } from "express";
import { getUserInfoFromRequest } from "../shared/expressAuth";
import { userRepo } from "../index";

const router = Router();

/**
 * POST /api/users/sync - Create or update user in MongoDB (called after Firebase auth)
 */
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const { userId, userEmail } = await getUserInfoFromRequest(req);

    console.log(`Syncing user: ${userId} (${userEmail})`);

    // Check if user already exists
    let user = await userRepo.getUserById(userId);

    if (user) {
      // Update existing user
      user = await userRepo.updateLastLogin(userId);
      console.log(`✅ User updated: ${userId}`);
    } else {
      // Create new user
      user = await userRepo.createUser({
        userId,
        email: userEmail || req.body.email || '',
        displayName: req.body.displayName,
        photoURL: req.body.photoURL,
        emailVerified: req.body.emailVerified || false,
        provider: req.body.provider || 'email',
        metadata: req.body.metadata,
      });
      console.log(`✅ New user created: ${userId}`);
    }

    res.json(user);
  } catch (error: any) {
    console.error("Error in syncUser:", error);
    res.status(500).json({ message: "Failed to sync user", error: error.message });
  }
});

/**
 * GET /api/users/me - Get current user's information
 */
router.get("/me", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);

    const user = await userRepo.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error: any) {
    console.error("Error in getCurrentUser:", error);
    res.status(500).json({ message: "Failed to get user", error: error.message });
  }
});

/**
 * PATCH /api/users/me - Update current user's information
 */
router.patch("/me", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);

    const user = await userRepo.updateUser(userId, {
      displayName: req.body.displayName,
      photoURL: req.body.photoURL,
      emailVerified: req.body.emailVerified,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ User updated: ${userId}`);

    res.json(user);
  } catch (error: any) {
    console.error("Error in updateCurrentUser:", error);
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
});

/**
 * DELETE /api/users/me - Delete current user from MongoDB
 */
router.delete("/me", async (req: Request, res: Response) => {
  try {
    const { userId } = await getUserInfoFromRequest(req);

    const deleted = await userRepo.deleteUser(userId);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ User deleted from MongoDB: ${userId}`);

    res.status(204).send();
  } catch (error: any) {
    console.error("Error in deleteCurrentUser:", error);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
});

export default router;
