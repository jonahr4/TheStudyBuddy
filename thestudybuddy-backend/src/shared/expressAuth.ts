import { Request } from "express";

/**
 * User info extracted from Firebase Auth token
 */
export interface UserInfo {
  userId: string;
  userEmail?: string;
}

/**
 * Extract and verify user info from Firebase Auth token (Express version)
 *
 * TODO: Implement real Firebase ID token verification
 * For now, decodes JWT without cryptographic verification (dev only)
 */
export async function getUserInfoFromRequest(req: Request): Promise<UserInfo> {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Extract token but skip verification for now (would need Firebase Admin SDK)
    const token = authHeader.substring(7);

    // TEMPORARY: Decode JWT without verification (for development only)
    // In production, you MUST verify with Firebase Admin SDK
    try {
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());

      const userId = payload.user_id || payload.uid;
      const userEmail = payload.email;

      if (userId) {
        console.log(`✅ Using real Firebase UID: ${userId} (${userEmail || 'no email'})`);
        return { userId, userEmail };
      }
    } catch (err) {
      console.warn("Failed to decode token, using dev-user-id");
    }
  }

  // Fallback for dev
  console.log("⚠️ No token found, using dev-user-id");
  return { userId: "dev-user-id", userEmail: "dev@test.com" };
}

/**
 * Legacy function for backwards compatibility
 * Use getUserInfoFromRequest() for new code
 */
export async function getUserIdFromRequest(req: Request): Promise<string> {
  const userInfo = await getUserInfoFromRequest(req);
  return userInfo.userId;
}
