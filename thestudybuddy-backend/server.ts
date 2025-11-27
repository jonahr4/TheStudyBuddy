import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectMongo } from "src/db/connectMongo";
import subjectsRoutes from "routes/subjects";

/**
 * Load environment variables from .env.local
 * This reads your MONGODB_URI and other secrets
 */
dotenv.config({ path: ".env.local" });

/**
 * Initialize Express app
 * Express is a web framework that handles HTTP requests/responses
 */
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * MIDDLEWARE SETUP
 * Middleware are functions that process requests before they reach your routes
 */

// 1. CORS - Allows your frontend (different domain) to call this API
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5174", // Your Vite dev server
  credentials: true
}));

// 2. JSON Parser - Converts incoming JSON request bodies into JavaScript objects
app.use(express.json());

// 3. Request Logger - Logs every incoming request (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * ROUTES
 * Map URL paths to route handlers
 */

// Health check endpoint - verify server is running
app.get("/", (req, res) => {
  res.json({ 
    message: "Study Buddy API is running",
    timestamp: new Date().toISOString(),
    mongodb: "connected"
  });
});

// Subject routes - all /api/subjects/* requests go to subjects router
app.use("/api/subjects", subjectsRoutes);

/**
 * ERROR HANDLING MIDDLEWARE
 * Catches any errors that weren't handled in routes
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

/**
 * START SERVER
 * Connect to MongoDB, then start listening for HTTP requests
 */
async function startServer() {
  try {
    // Connect to MongoDB first
    await connectMongo();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 API docs: http://localhost:${PORT}/`);
      console.log(`🎯 Test endpoint: POST http://localhost:${PORT}/api/subjects`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

/**
 * WHAT'S HAPPENING - STEP BY STEP:
 * 
 * 1. Load Environment Variables
 *    - dotenv reads .env.local file
 *    - Makes process.env.MONGODB_URI available
 * 
 * 2. Create Express App
 *    - app = express() creates a web server
 *    - It will handle HTTP requests (GET, POST, PUT, DELETE)
 * 
 * 3. Add Middleware
 *    - cors() - Allows frontend to call this API from different domain
 *    - express.json() - Parses JSON request bodies
 *    - Logger - Prints every request to console
 * 
 * 4. Register Routes
 *    - GET / - Health check (test if server is running)
 *    - /api/subjects - All subject operations (delegated to subjects router)
 * 
 * 5. Error Handling
 *    - Catches any unhandled errors
 *    - Sends proper error response to client
 * 
 * 6. Start Server
 *    - connectMongo() - Establish MongoDB connection
 *    - app.listen() - Start accepting HTTP requests on port 3000
 * 
 * REQUEST FLOW EXAMPLE:
 * 
 * Client sends: POST http://localhost:3000/api/subjects
 * Body: { "userId": "user123", "name": "Biology", "color": "#A3C1FF" }
 * 
 * 1. Request hits Express server
 * 2. CORS middleware checks if frontend is allowed
 * 3. express.json() parses the JSON body
 * 4. Logger prints: "POST /api/subjects"
 * 5. Router matches /api/subjects → subjects.ts router
 * 6. POST / handler in subjects.ts runs
 * 7. Subject.create() inserts into MongoDB
 * 8. Response sent back: { "_id": "...", "userId": "user123", "name": "Biology", ... }
 */
