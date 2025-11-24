import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcard {
  front: string;
  back: string;
  studied?: boolean;
}

export interface IFlashcardSet extends Document {
  userId: string;
  subjectId: string;
  name: string;
  description?: string;
  flashcards: IFlashcard[];
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema({
  front: {
    type: String,
    required: true,
  },
  back: {
    type: String,
    required: true,
  },
  studied: {
    type: Boolean,
    default: false,
  },
});

const FlashcardSetSchema: Schema = new Schema(
  {
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
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    flashcards: [FlashcardSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
FlashcardSetSchema.index({ userId: 1, subjectId: 1 });

export default mongoose.model<IFlashcardSet>('FlashcardSet', FlashcardSetSchema);
