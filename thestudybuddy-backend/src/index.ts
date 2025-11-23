import { app } from "@azure/functions";
import { MongoSubjectRepository } from "./shared/repos/MongoSubjectRepository";
import { InMemoryNoteRepository } from "./shared/repos/InMemoryNoteRepository";
import { InMemoryFlashcardRepository } from "./shared/repos/InMemoryFlashcardRepository";
import { connectMongo } from "./db/connectMongo";
import { initializeFirebaseAdmin } from "./firebase/admin";

// Initialize Firebase Admin for token verification
initializeFirebaseAdmin();

// Connect to MongoDB on startup
connectMongo().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});

// Initialize singleton repositories
// Subject repository now uses MongoDB!
export const subjectRepo = new MongoSubjectRepository();
// Note: Notes and Flashcards still use in-memory for now, will be replaced later
export const noteRepo = new InMemoryNoteRepository();
export const flashcardRepo = new InMemoryFlashcardRepository();

// Import all HTTP functions
import "./functions/SubjectsHttp";
import "./functions/NotesHttp";
import "./functions/NotesUpload";
import "./functions/FlashcardsHttp";
// import "./functions/GenerateFlashcards"; // TODO: Create this function
import "./functions/ChatWithAI";

// Export the app for Azure Functions to discover
export default app;

