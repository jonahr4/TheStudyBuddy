import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  userId: string;
  subjectId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const ChatMessageSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  subjectId: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient querying by user and subject
ChatMessageSchema.index({ userId: 1, subjectId: 1, timestamp: 1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
