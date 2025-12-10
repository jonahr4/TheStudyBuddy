import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionLog {
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  pagesVisited: string[];
  actionsPerformed: number;
}

export interface IActivityCount {
  date: Date; // Start of day
  logins: number;
  chatMessages: number;
  notesUploaded: number;
  flashcardsCreated: number;
  flashcardsStudied: number;
  gamesPlayed: number;
  subjectsCreated: number;
  timeSpent: number; // in seconds
}

export interface IUserAnalytics extends Document {
  userId: string;

  // Lifetime totals
  totalLogins: number;
  totalChatMessages: number;
  totalNotesUploaded: number;
  totalFlashcardSetsCreated: number;
  totalFlashcardsStudied: number;
  totalGamesPlayed: number;
  totalSubjectsCreated: number;
  totalTimeSpent: number; // in seconds

  // Current counts
  subjectCount: number;
  noteCount: number;
  flashcardSetCount: number;
  chatMessageCount: number;

  // Timestamps
  firstLogin: Date;
  lastLogin: Date;
  lastActivity: Date;

  // Session tracking
  currentSessionStart?: Date;
  sessions: ISessionLog[];

  // Daily activity (last 90 days)
  dailyActivity: IActivityCount[];

  // Feature usage
  featuresUsed: {
    chat: boolean;
    flashcards: boolean;
    games: boolean;
    notes: boolean;
  };

  // Engagement metrics
  averageSessionDuration: number; // in seconds
  mostActiveDay?: string; // day of week
  mostActiveHour?: number; // 0-23

  createdAt: Date;
  updatedAt: Date;
}

const SessionLogSchema = new Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
  },
  pagesVisited: {
    type: [String],
    default: [],
  },
  actionsPerformed: {
    type: Number,
    default: 0,
  },
});

const ActivityCountSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  logins: {
    type: Number,
    default: 0,
  },
  chatMessages: {
    type: Number,
    default: 0,
  },
  notesUploaded: {
    type: Number,
    default: 0,
  },
  flashcardsCreated: {
    type: Number,
    default: 0,
  },
  flashcardsStudied: {
    type: Number,
    default: 0,
  },
  gamesPlayed: {
    type: Number,
    default: 0,
  },
  subjectsCreated: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
});

const UserAnalyticsSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Lifetime totals
    totalLogins: {
      type: Number,
      default: 0,
    },
    totalChatMessages: {
      type: Number,
      default: 0,
    },
    totalNotesUploaded: {
      type: Number,
      default: 0,
    },
    totalFlashcardSetsCreated: {
      type: Number,
      default: 0,
    },
    totalFlashcardsStudied: {
      type: Number,
      default: 0,
    },
    totalGamesPlayed: {
      type: Number,
      default: 0,
    },
    totalSubjectsCreated: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    },

    // Current counts
    subjectCount: {
      type: Number,
      default: 0,
    },
    noteCount: {
      type: Number,
      default: 0,
    },
    flashcardSetCount: {
      type: Number,
      default: 0,
    },
    chatMessageCount: {
      type: Number,
      default: 0,
    },

    // Timestamps
    firstLogin: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    lastActivity: {
      type: Date,
    },

    // Session tracking
    currentSessionStart: {
      type: Date,
    },
    sessions: {
      type: [SessionLogSchema],
      default: [],
    },

    // Daily activity
    dailyActivity: {
      type: [ActivityCountSchema],
      default: [],
    },

    // Feature usage
    featuresUsed: {
      chat: {
        type: Boolean,
        default: false,
      },
      flashcards: {
        type: Boolean,
        default: false,
      },
      games: {
        type: Boolean,
        default: false,
      },
      notes: {
        type: Boolean,
        default: false,
      },
    },

    // Engagement metrics
    averageSessionDuration: {
      type: Number,
      default: 0,
    },
    mostActiveDay: {
      type: String,
    },
    mostActiveHour: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Keep only last 100 sessions and 90 days of activity
UserAnalyticsSchema.pre('save', function() {
  // @ts-ignore - Type assertion for 'this' context
  if (this.sessions && Array.isArray(this.sessions) && this.sessions.length > 100) {
    this.sessions = this.sessions.slice(-100);
  }

  // @ts-ignore - Type assertion for 'this' context
  if (this.dailyActivity && Array.isArray(this.dailyActivity) && this.dailyActivity.length > 90) {
    this.dailyActivity = this.dailyActivity.slice(-90);
  }
});

export default mongoose.model<IUserAnalytics>('UserAnalytics', UserAnalyticsSchema);
