import { app } from "@azure/functions";
import { MongoSubjectRepository } from "./shared/repos/MongoSubjectRepository";
import { MongoNoteRepository } from "./shared/repos/MongoNoteRepository";
import { InMemoryFlashcardRepository } from "./shared/repos/InMemoryFlashcardRepository";
import { connectMongo } from "./db/connectMongo";

// Connect to MongoDB on startup
connectMongo().catch(err => {
  console.error("Failed to connect to MongoDB:", err);
});

// Initialize singleton repositories
// Subjects and Notes now use MongoDB!
export const subjectRepo = new MongoSubjectRepository();
export const noteRepo = new MongoNoteRepository();
// Note: Flashcards still use in-memory for now, will be replaced later
export const flashcardRepo = new InMemoryFlashcardRepository();

// Import all HTTP functions
import "./functions/SubjectsHttp";
import "./functions/NotesHttp";
import "./functions/NotesUpload";
import "./functions/ProcessNoteText";
import "./functions/FlashcardsHttp";
// import "./functions/GenerateFlashcards"; // TODO: Create this function
import "./functions/ChatWithAI";
import "./functions/GetChatHistory";

// Export the app for Azure Functions to discover
export default app;

