import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string; // Firebase UID
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  provider: string; // 'email', 'google', etc.
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

const UserSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    photoURL: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      required: true,
      default: 'email',
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      creationTime: String,
      lastSignInTime: String,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Index for efficient email lookups
UserSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', UserSchema);

