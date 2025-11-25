import { app } from "@azure/functions";
import { MongoSubjectRepository } from "./shared/repos/MongoSubjectRepository";
import { MongoNoteRepository } from "./shared/repos/MongoNoteRepository";
import { MongoUserRepository } from "./shared/repos/MongoUserRepository";
import { connectMongo } from "./db/connectMongo";

// Connect to MongoDB on startup
connectMongo().catch(err => {
  console.error("Failed to connect to MongoDB:", err);
});

// Initialize singleton repositories
export const subjectRepo = new MongoSubjectRepository();
export const noteRepo = new MongoNoteRepository();
export const userRepo = new MongoUserRepository();

// Import all HTTP functions
import "./functions/UserHttp";
import "./functions/SubjectsHttp";
import "./functions/NotesHttp";
import "./functions/NotesUpload";
import "./functions/ProcessNoteText";
import "./functions/ChatWithAI";
import "./functions/GetChatHistory";
import "./functions/FlashcardsHttp";
import "./functions/GenerateFlashcards";
import "./functions/YouTubeRecommendations";
import "./functions/GenerateYouTubeSearchTerms";

// Export the app for Azure Functions to discover
export default app;

