import mongoose, { Schema, Document } from 'mongoose';

export interface IGameResult {
  score: number;
  time: number; // in seconds
  moves: number;
  difficulty: 'easy' | 'medium' | 'hard';
  stars: number; // 1-3 stars
  completedAt: Date;
}

export interface IGameStats extends Document {
  userId: string;
  flashcardSetId: string;
  gameType: 'matching'; // Can be extended for other games
  results: IGameResult[];
  totalGamesPlayed: number;
  bestScore: number;
  bestTime: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const GameResultSchema = new Schema({
  score: {
    type: Number,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
  moves: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  stars: {
    type: Number,
    min: 1,
    max: 3,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

const GameStatsSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    flashcardSetId: {
      type: String,
      required: true,
      index: true,
    },
    gameType: {
      type: String,
      enum: ['matching'],
      required: true,
      default: 'matching',
    },
    results: {
      type: [GameResultSchema],
      default: [],
    },
    totalGamesPlayed: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    bestTime: {
      type: Number,
      default: null,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
GameStatsSchema.index({ userId: 1, flashcardSetId: 1, gameType: 1 }, { unique: true });

export default mongoose.model<IGameStats>('GameStats', GameStatsSchema);

