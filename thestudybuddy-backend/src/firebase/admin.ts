import * as admin from "firebase-admin";

/**
 * Initialize Firebase Admin SDK
 * This is used to verify Firebase Auth tokens from the frontend
 */

let firebaseInitialized = false;

export function initializeFirebaseAdmin() {
  if (firebaseInitialized) {
    return admin;
  }

  // For local development, we can use the Application Default Credentials
  // or initialize without credentials (will work with emulator or public tokens)
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "thestudybuddy-8da15",
    });
    firebaseInitialized = true;
    console.log("✅ Firebase Admin initialized");
  } catch (error: any) {
    // Already initialized
    if (error.code === 'app/duplicate-app') {
      firebaseInitialized = true;
    } else {
      console.error("❌ Firebase Admin initialization error:", error);
    }
  }

  return admin;
}

/**
 * Get Firebase Admin instance
 */
export function getFirebaseAdmin() {
  if (!firebaseInitialized) {
    initializeFirebaseAdmin();
  }
  return admin;
}
