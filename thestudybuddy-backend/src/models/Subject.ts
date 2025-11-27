import mongoose, { Schema, Document } from "mongoose";

/**
 * TypeScript interface for type safety
 * This defines what properties a Subject document should have
 */
export interface ISubject extends Document {
  userId: string;      // Firebase UID of the user who owns this subject
  userEmail?: string;  // User's email address (for easier debugging/admin)
  name: string;        // Subject name (e.g., "Biology 101")
  color: string;       // Hex color for UI display (e.g., "#6481b9ff")
  createdAt: Date;     // Timestamp when subject was created
}

/**
 * MongoDB Schema Definition
 * This defines the structure of documents in the "subjects" collection
 */
const SubjectSchema = new Schema<ISubject>({
  userId: { 
    type: String, 
    required: true,
    index: true  // Add index for faster queries by userId
  },
  userEmail: {
    type: String,
    required: false  // Optional for backwards compatibility
  },
  name: { 
    type: String, 
    required: true 
  },
  color: { 
    type: String, 
    default: "#3B82F6"  // Default to indigo-600 to match your theme
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

/**
 * WHAT'S HAPPENING:
 * 
 * 1. Schema defines the structure: what fields exist, their types, and rules
 * 2. required: true - Field must be provided when creating a subject
 * 3. default: value - If not provided, use this default value
 * 4. index: true - Makes queries by userId faster (important for multi-user app)
 * 5. mongoose.model() - Creates a "Subject" model that maps to "subjects" collection
 * 6. The model provides CRUD methods: create(), find(), findById(), etc.
 */

export default mongoose.model<ISubject>("Subject", SubjectSchema);
