import { app } from "@azure/functions";
import { InMemorySubjectRepository } from "./shared/repos/InMemorySubjectRepository";
import { InMemoryNoteRepository } from "./shared/repos/InMemoryNoteRepository";
import { InMemoryFlashcardRepository } from "./shared/repos/InMemoryFlashcardRepository";

// Initialize singleton repositories
// Using in-memory implementations for now
// Will be replaced with MongoDB implementations later
export const subjectRepo = new InMemorySubjectRepository();
export const noteRepo = new InMemoryNoteRepository();
export const flashcardRepo = new InMemoryFlashcardRepository();

// Import all HTTP functions
import "./functions/SubjectsHttp";
import "./functions/NotesHttp";
import "./functions/NotesUpload";
import "./functions/ProcessNoteText";
import "./functions/FlashcardsHttp";
// import "./functions/GenerateFlashcards"; // TODO: Create this function
import "./functions/ChatWithAI";

// Export the app for Azure Functions to discover
export default app;

