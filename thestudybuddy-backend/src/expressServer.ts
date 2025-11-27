import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { connectMongo } from "./db/connectMongo";
import { initializeFirebaseAdmin } from "./firebase/admin";

// Load environment variables from .env file
config();

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

// Import Express routes
import subjectsRoutes from "./routes/subjects";
import notesRoutes from "./routes/notes";
import flashcardsRoutes from "./routes/flashcards";
import chatRoutes from "./routes/chat";
import aiRoutes from "./routes/ai";
import usersRoutes from "./routes/users";
import reportsRoutes from "./routes/reports";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Study Buddy API is running",
    timestamp: new Date().toISOString(),
    mongodb: "connected"
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Study Buddy API v1.0",
    endpoints: [
      "GET /api/subjects",
      "POST /api/subjects",
      "GET /api/subjects/:id",
      "PUT /api/subjects/:id",
      "DELETE /api/subjects/:id",
      "GET /api/notes/:subjectId",
      "POST /api/notes/upload",
      "DELETE /api/notes/delete/:id",
      "GET /api/flashcards",
      "GET /api/flashcards/:subjectId",
      "POST /api/flashcards/generate",
      "DELETE /api/flashcards/set/:setId",
      "POST /api/chat",
      "GET /api/chat/history/:subjectId",
      "DELETE /api/chat/history/:subjectId",
      "POST /api/reports",
      "GET /api/users/me"
    ]
  });
});

// API Routes
app.use("/api/subjects", subjectsRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/flashcards", flashcardsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/reports", reportsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB first
    await connectMongo();
    console.log("✅ MongoDB connected");

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 API docs: http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Only start if running directly (not when imported)
if (require.main === module) {
  startServer();
}

export default app;
