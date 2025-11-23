import { HttpRequest } from "@azure/functions";

/**
 * Extract and verify user ID from Firebase Auth token
 * 
 * TODO: Implement full Firebase Admin SDK verification
 * - Install firebase-admin
 * - Initialize with service account credentials
 * - Verify ID token from Authorization header
 * - Extract and return the verified UID
 * 
 * For now, this is a stub for local development.
 */
export async function getUserIdFromRequest(req: HttpRequest): Promise<string> {
  const authHeader = req.headers.get("authorization");
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    // TODO: Verify the token with firebase-admin
    // const token = authHeader.substring(7);
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // return decodedToken.uid;
    
    // For now, return a dev user ID for local testing
    return "dev-user-id";
  }
  
  // For local development without auth, return a fixed dev user
  // In production, you might want to return 401 Unauthorized instead
  return "dev-user-id";
}

