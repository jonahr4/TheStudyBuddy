import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectMongo } from './db/connectMongo';
import { getUserInfoFromRequest } from './shared/auth';
import { subjectRepo, noteRepo, userRepo } from './index';
import FlashcardSet from './models/FlashcardSet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware  
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://thestudybuddy.app',
      'https://www.thestudybuddy.app',
      /^https:\/\/.*\.ondigitalocean\.app$/,
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    ]
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Auth middleware
async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const userInfo = await getUserInfoFromRequest(req as any);
    if (!userInfo || !userInfo.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    (req as any).user = userInfo;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// Health check endpoints
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    message: 'The Study Buddy API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ SUBJECTS ROUTES ============
app.get('/api/subjects', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const subjects = await subjectRepo.getSubjectsByUser(userId);
    res.json(subjects);
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/subjects', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId, userEmail } = (req as any).user;
    const { name, color } = req.body;
    
    if (!name || !color) {
      return res.status(400).json({ message: 'name and color are required' });
    }
    
    const subject = await subjectRepo.createSubject(userId, { name, color, userEmail });
    res.status(201).json(subject);
  } catch (error: any) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/subjects/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }
    
    const subject = await subjectRepo.getSubjectById(userId, id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error: any) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/subjects/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }
    
    const subject = await subjectRepo.updateSubject(userId, id, req.body);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error: any) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/subjects/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }
    
    await subjectRepo.deleteSubject(userId, id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============ NOTES ROUTES ============
app.get('/api/notes/:subjectId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const { subjectId } = req.params;
    
    const notes = await noteRepo.getNotesForSubject(userId, subjectId);
    res.json({ notes });
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/notes/:noteId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const { noteId } = req.params;
    
    await noteRepo.deleteNote(noteId, userId);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Note: For full implementation, you'll need to add:
// - POST /api/notes/upload (with multer middleware for file uploads)
// - POST /api/notes/extract-text/:id
// - These require Azure Blob Storage and Azure OpenAI integrations
// See NotesUpload.ts and ProcessNoteText.ts for the full implementation

// ============ FLASHCARDS ROUTES ============
app.get('/api/flashcards', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const flashcards = await FlashcardSet.find({ userId })
      .sort({ createdAt: -1 })
      .populate('subjectId', 'name color')
      .exec();
    res.json(flashcards);
  } catch (error: any) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/flashcards/:subjectId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const { subjectId } = req.params;
    
    const flashcards = await FlashcardSet.find({ userId, subjectId })
      .sort({ createdAt: -1 })
      .exec();
    res.json(flashcards);
  } catch (error: any) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Note: Additional routes needed:
// - POST /api/flashcards/generate (requires Azure OpenAI for AI generation)
// - POST /api/flashcards (create flashcard set)
// - DELETE /api/flashcards/:id
// - PUT /api/flashcards/:id (update progress)
// See FlashcardsHttp.ts and GenerateFlashcards.ts

// ============ CHAT ROUTES ============
// Note: Chat routes require Azure OpenAI integration
// See ChatWithAI.ts and GetChatHistory.ts for full implementation
// - POST /api/ai/chat
// - GET /api/chat/history/:subjectId
// - GET /api/chat/stats
// - DELETE /api/chat/history/:subjectId

// ============ REPORTS ROUTES ============
// See ReportsHttp.ts for implementation
// - POST /api/reports
// - GET /api/reports

// ============ USERS ROUTES ============
app.post('/api/users/sync', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId, userEmail } = (req as any).user;
    
    // Check if user exists, if not create them
    let user = await userRepo.getUserById(userId);
    
    if (user) {
      // Update last login
      user = await userRepo.updateLastLogin(userId);
    } else {
      // Create new user
      user = await userRepo.createUser({
        userId,
        email: userEmail || req.body.email || '',
        displayName: req.body.displayName,
        photoURL: req.body.photoURL,
        emailVerified: req.body.emailVerified || false,
        provider: req.body.provider || 'email',
        metadata: req.body.metadata,
      });
    }
    
    res.json(user);
  } catch (error: any) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/users/me', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user;
    const user = await userRepo.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
// ============ YOUTUBE ROUTES ============
// See YouTubeRecommendations.ts for implementation
// - GET /api/youtube/recommendations?subjectId=xxx

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectMongo();
    console.log('✅ MongoDB connected successfully');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;

