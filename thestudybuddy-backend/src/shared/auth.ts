import { HttpRequest } from "@azure/functions";

/**
 * Extract and verify user ID from Firebase Auth token
 * 
 * TODO: Implement real Firebase ID token verification
 * For now, returns a fixed dev user ID for local development
 */
export async function getUserIdFromRequest(req: HttpRequest): Promise<string> {
  const authHeader = req.headers.get("authorization");
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    // TODO: Verify Firebase ID token from Authorization: Bearer <token> header
    // const token = authHeader.substring(7);
    // const admin = getFirebaseAdmin();
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // return decodedToken.uid;
    
    // For now, return a fixed dev user id
    return "dev-user-id";
  }
  
  // For now, return a fixed dev user id if no token (for local dev only)
  return "dev-user-id";
}

