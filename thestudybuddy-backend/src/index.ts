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

