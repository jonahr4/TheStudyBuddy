import mongoose from "mongoose";

/**
 * Connect to MongoDB Atlas
 * This function establishes a connection to your MongoDB database.
 * It uses the connection string from environment variables.
 */
export async function connectMongo() {
  try {
    // Connect to MongoDB using the URI from .env.local
    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "studybuddy"  // Specify your database name
    });
    console.log("✅ MongoDB connected successfully.");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit if we can't connect to the database
  }
}

/**
 * WHAT'S HAPPENING:
 * 
 * 1. mongoose.connect() - Establishes connection to MongoDB Atlas
 * 2. process.env.MONGODB_URI - Connection string from your .env.local file
 * 3. dbName: "studybuddy" - Creates/uses a database called "studybuddy"
 * 4. If connection fails, the server exits (process.exit(1))
 * 5. Once connected, all mongoose models will use this connection
 */
