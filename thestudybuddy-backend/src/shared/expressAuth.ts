import { Request } from "express";
import { getFirebaseAdmin } from "../firebase/admin";

/**
 * User info extracted from Firebase Auth token
 */
export interface UserInfo {
  userId: string;
  userEmail?: string;
}

/**
 * Extract and VERIFY user info from Firebase Auth token
 * Uses Firebase Admin SDK to cryptographically verify the token signature
 */
export async function getUserInfoFromRequest(req: Request): Promise<UserInfo> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No authorization token provided");
  }

  const token = authHeader.substring(7);

  try {
    // ✅ VERIFY the token with Firebase Admin SDK
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);

    console.log(`✅ Token verified for user: ${decodedToken.uid} (${decodedToken.email || 'no email'})`);

    return {
      userId: decodedToken.uid,
      userEmail: decodedToken.email,
    };
  } catch (error: any) {
    console.error("❌ Token verification failed:", error.message);
    throw new Error("Invalid or expired authentication token");
  }
}

/**
 * Legacy function for backwards compatibility
 * Use getUserInfoFromRequest() for new code
 */
export async function getUserIdFromRequest(req: Request): Promise<string> {
  const userInfo = await getUserInfoFromRequest(req);
  return userInfo.userId;
}
