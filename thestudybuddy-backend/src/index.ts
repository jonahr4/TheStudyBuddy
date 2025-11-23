import { app } from "@azure/functions";
import { InMemorySubjectRepository } from "./shared/repos/InMemorySubjectRepository";
import { InMemoryNoteRepository } from "./shared/repos/InMemoryNoteRepository";
import { InMemoryFlashcardRepository } from "./shared/repos/InMemoryFlashcardRepository";

// Initialize singleton repositories
// These will be replaced with Mongo implementations later
export const subjectRepo = new InMemorySubjectRepository();
export const noteRepo = new InMemoryNoteRepository();
export const flashcardRepo = new InMemoryFlashcardRepository();

// Import all HTTP functions
import "./functions/SubjectsHttp";
import "./functions/NotesHttp";
import "./functions/NotesUpload";
import "./functions/FlashcardsHttp";
import "./functions/GenerateFlashcards";
import "./functions/ChatWithAI";

// Export the app for Azure Functions to discover
export default app;

