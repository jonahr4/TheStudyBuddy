import { config } from "dotenv";
import { connectMongo } from "../db/connectMongo";
import VersionUpdateModel from "../models/VersionUpdate";

config();

const versionUpdates = [
  {
    version: "1.0",
    title: "Welcome to Study Buddy!",
    description: "The first official deployment of Study Buddy - your AI-powered study companion. Upload your notes, generate flashcards, and chat with AI about your course materials.",
    features: [
      "Create and organize subjects for your courses",
      "Upload PDF notes (up to 10 per subject)",
      "AI-generated flashcards from your notes using Azure OpenAI",
      "Subject-specific AI chat with RAG retrieval",
      "Secure Firebase authentication",
      "Personalized dashboard to track your progress"
    ],
    releaseDate: new Date("2024-11-20"),
  },
  {
    version: "1.1",
    title: "Mobile Improvements & Resource Limits",
    description: "Enhanced mobile experience and enforced user resource limits to ensure optimal performance for all users.",
    features: [
      "Enforced user upload limits: 10 subjects, 10 notes per subject, 20 flashcard sets per subject",
      "Completely redesigned mobile dashboard with vertical scrolling feed and quick stats",
      "Fixed Chat page layout issues - header now always visible on mobile",
      "Improved responsive design across all pages for 400x800 phone screens",
      "Added glassmorphism effects and polished UI with better subject selectors",
      "Hidden landing page images on mobile for cleaner layout",
      "Better button and text sizing for mobile devices",
      "Fixed flashcard count display on subjects page"
    ],
    releaseDate: new Date("2024-11-27"),
  },
];

async function seedVersionUpdates() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await connectMongo();

    console.log("🗑️  Clearing existing version updates...");
    await VersionUpdateModel.deleteMany({});

    console.log("📝 Seeding version updates...");
    for (const update of versionUpdates) {
      await VersionUpdateModel.create(update);
      console.log(`   ✅ Created version ${update.version}: ${update.title}`);
    }

    console.log("\n✨ Version updates seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding version updates:", error);
    process.exit(1);
  }
}

seedVersionUpdates();
