import { HttpRequest } from "@azure/functions";
import { getFirebaseAdmin } from "../firebase/admin";

/**
 * Extract and verify user ID from Firebase Auth token
 * This verifies the token sent from the frontend and returns the user's UID
 */
export async function getUserIdFromRequest(req: HttpRequest): Promise<string> {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No authorization token provided");
  }

  try {
    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);
    
    // Verify the Firebase ID token
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Return the verified user ID
    return decodedToken.uid;
  } catch (error: any) {
    console.error("Token verification error:", error.message);
    throw new Error("Invalid or expired token");
  }
}

