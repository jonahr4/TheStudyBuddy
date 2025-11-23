# The Study Buddy

The Study Buddy is an AI-powered learning tool that helps students upload homework notes, turn them into flashcards, and chat with an AI that understands their content.

This Azure-first edition uses Azure Functions, Azure OpenAI, MongoDB Atlas, and DigitalOcean background workers.

---

## Table of Contents
- [MVP Features](#mvp-features)
- [Stretch Features](#stretch-features)
- [Tech Stack](#tech-stack-azure-centric)
- [How It Works](#how-it-works)
- [Backend Architecture Overview](#backend-architecture-overview)
- [Local Development Setup](#local-development-setup)
- [Development Phases](#development-phases-for-thestudybuddy)
  - [Phase 1 — Frontend Skeleton](#phase-1--frontend-skeleton-)
  - [Phase 2 — Frontend UI Components & Firebase Auth Integration](#phase-2--frontend-ui-components--firebase-auth-integration-)
  - [Phase 3 — Deploy Frontend](#phase-3--deploy-frontend-)
  - [Phase 4 — Backend Development (Azure + MongoDB)](#phase-4--backend-development-azure--mongodb--in-progress)
  - [Phase 5 — Connect Frontend and Backend](#phase-5--connect-frontend-and-backend--partially-complete)
  - [Phase 6 — Stretch Features](#phase-6--stretch-features)

---

# MVP Features

- **Subject-Based Organization** - Create and manage subjects (e.g., Biology 101, Calculus II)
- **Upload Notes** - Upload up to 10 PDF notes per subject
- **AI-Generated Flashcards** - Azure OpenAI creates flashcard decks from your notes
- **Subject-Specific Chat** - AI chatbot that understands your notes, organized by subject
- **Firebase Authentication** - Secure login with email/password and Google sign-in
- **Dashboard** - Overview of subjects, flashcard decks, and chat history
- **Deployment** - Azure Static Web Apps hosting

---

# Stretch Features

- AI-generated quizzes  
- Daily streaks (Duolingo-style)  
- YouTube video recommendations  
- Related article discovery  
- Mindmaps with ToDiagram  
- XP, achievements, and gamification  
- Study analytics dashboard  

---

# Tech Stack (Azure-Centric)

**Frontend**
- React (Vite) + TailwindCSS
- Firebase Auth (email/password + Google sign-in)
- React Router DOM (client-side routing)
- Azure Static Web Apps (hosting)

**Backend**
- Express.js API or Azure Functions (REST API endpoints)
- Azure Functions (serverless compute for AI processing)
- Azure OpenAI (GPT-4o-mini for flashcards + chat)
- Azure Blob Storage (PDF files + extracted text storage)
- Azure Cognitive Search (optional - for vector retrieval/RAG)

**Database**
- MongoDB Atlas (users, subjects, notes metadata, flashcards)

**Optional Microservices**
- DigitalOcean Droplet or App Platform (YouTube/article workers)

**DevOps**
- GitHub Actions (CI/CD)
- Sentry + Azure Monitor (error tracking & logging)

---

# How It Works

1. User logs in (Firebase Auth with email/password or Google)
2. User creates subjects (e.g., "Biology 101", "Calculus II")
3. User uploads PDF notes to specific subjects (up to 10 per subject) → Azure Blob Storage
4. Azure Functions extract text from PDFs
5. Azure OpenAI generates subject-specific flashcards + embeddings
6. MongoDB stores subjects, notes, decks, chats, and metadata
7. User studies flashcards filtered by subject
8. User chats with AI about specific subject content using RAG retrieval
9. Optional DO worker fetches video/article recommendations per subject  

---

# Backend Architecture Overview

**MongoDB Collections:**
- **users**: Store email, name (from Firebase Auth)
- **subjects**: Store name, color, userId (user's custom subjects)
- **notes**: Store metadata (fileName, blobUrl, textUrl, subjectId)
- **flashcards**: Store AI-generated flashcards (question, answer, subjectId)

**Azure Blob Storage:**
- Store uploaded raw PDF files
- Store extracted text versions of notes

**Azure Functions (Serverless Processing):**
- **Process Note Text**: Download PDF from Blob → Extract text → Upload text to Blob
- **Generate Flashcards**: Use Azure OpenAI (GPT-4o-mini) to create flashcards from note text
- **Generate Chat Responses**: Use RAG (Retrieval-Augmented Generation) with note context

**Azure OpenAI Integration:**
- Flashcard generation with custom prompts
- AI chat assistant with subject-specific context
- Optional: Note summarization or preprocessing

**Backend API (Express.js or Azure Functions):**
- `POST/GET/PUT/DELETE /api/subjects` - Subject CRUD operations
- `POST /api/notes/upload` - Upload file to Azure Blob + save metadata to MongoDB
- `POST /api/flashcards/generate` - Trigger Azure Function to generate flashcards
- `POST /api/ai/chat` - Send chat message, get AI response with RAG context
- `GET /api/flashcards/:subjectId` - Retrieve flashcards for a subject
- `GET /api/notes/:subjectId` - Get all notes for a subject

---

# Local Development Setup

Follow these steps to get The Study Buddy running on your local machine.

## Prerequisites
- **Node.js** (v18 or higher) and **npm** installed
- **Git** installed
- A code editor (VS Code recommended)

## Installation Steps

### 1. Clone the Repository
```bash
# Clone the repo
git clone https://github.com/jonahr4/TheStudyBuddy.git

# Navigate into the project
cd TheStudyBuddy
```

### 2. Navigate to Frontend Directory
```bash
cd thestudybuddy-frontend
```

### 3. Install Dependencies
This will install all required packages including React, Vite, TailwindCSS, Firebase, and React Router.

```bash
npm install
```

**What gets installed:**
- `react` (v19.2.0) & `react-dom` - UI framework
- `react-router-dom` (v7.9.6) - Client-side routing
- `firebase` (v12.6.0) - Authentication and analytics
- `vite` (v7.2.4) - Build tool and dev server
- `tailwindcss` (v3.4.18) - CSS framework
- `autoprefixer` & `postcss` - CSS processing
- `eslint` - Code linting

### 4. Set Up Environment Variables

**Contact Jonah for Firebase credentials!**

Create a `.env.local` file in the `thestudybuddy-frontend` directory:

```bash
# Create the file
touch .env.local

# Open it in your editor and add these variables:
VITE_FIREBASE_API_KEY=<get_from_jonah>
VITE_FIREBASE_AUTH_DOMAIN=<get_from_jonah>
VITE_FIREBASE_PROJECT_ID=<get_from_jonah>
VITE_FIREBASE_STORAGE_BUCKET=<get_from_jonah>
VITE_FIREBASE_MESSAGING_SENDER_ID=<get_from_jonah>
VITE_FIREBASE_APP_ID=<get_from_jonah>
VITE_FIREBASE_MEASUREMENT_ID=<get_from_jonah>
```

> **Important:** The `.env.local` file is already in `.gitignore` so your credentials won't be committed to Git.

### 5. Enable Firebase Authentication (Firebase Console)
If you have access to the Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **TheStudyBuddy** project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Email/Password** provider
5. Enable **Google** provider
   - Add authorized domains (localhost is already included)
   - No additional configuration needed for development

### 6. Set Up Backend (Optional - for full functionality)

To enable Subjects CRUD operations with MongoDB:

**Navigate to backend directory:**
```bash
cd ../thestudybuddy-backend
npm install
```

**Contact Jonah for MongoDB credentials!**

Create a `local.settings.json` file in `thestudybuddy-backend`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MONGODB_URI": "<get_from_jonah>",
    "FIREBASE_PROJECT_ID": "thestudybuddy-8da15"
  },
  "Host": {
    "CORS": "*"
  }
}
```

**Start the backend:**
```bash
npm run start
```

Backend will run on `http://localhost:7071`

> **Note:** The frontend will work without the backend (using mock data), but Subjects CRUD will only work with the backend running.

### 7. Start the Frontend Development Server
```bash
cd ../thestudybuddy-frontend
npm run dev
```

You should see output like:
```
VITE v7.2.4  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**The app is now running at** `http://localhost:5173` 🎉

### 8. Verify Installation
Open your browser to `http://localhost:5173` and you should see:
- ✅ Landing page with gradient background
- ✅ Navbar with "Study Buddy" branding
- ✅ Buttons and navigation working
- ✅ Login page accessible at `/login`
- ✅ Create subjects and see them persist (if backend is running)

## Quick Command Reference

### Frontend Commands (thestudybuddy-frontend)
```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter to check code quality
npm run lint
```

### Backend Commands (thestudybuddy-backend)
```bash
# Start Azure Functions backend
npm run start

# Build TypeScript
npm run build

# Watch mode for development
npm run watch
```

## Project Structure
```
TheStudyBuddy/
├── thestudybuddy-frontend/     # React + Vite frontend
│   ├── src/
│   │   ├── assets/             # Images and static files
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Navigation bar with links
│   │   │   ├── Layout.jsx      # Page wrapper with navbar
│   │   │   ├── PrivateRoute.jsx # Protected route wrapper
│   │   │   ├── SubjectModal.jsx # Create/edit subject modal
│   │   │   └── ConfirmDialog.jsx # Delete confirmation dialog
│   │   ├── contexts/           # React Context providers
│   │   │   ├── SubjectContext.jsx # Subject state management
│   │   │   └── NoteContext.jsx    # Note state management
│   │   ├── firebase/           # Firebase configuration
│   │   │   ├── config.js       # Firebase initialization
│   │   │   └── AuthContext.jsx # Auth state management
│   │   ├── services/           # API service layer
│   │   │   └── api.ts          # Backend API calls with auth
│   │   ├── pages/              # Route pages
│   │   │   ├── Landing.jsx     # Homepage with hero section
│   │   │   ├── Login.jsx       # Authentication page
│   │   │   ├── SignUp.jsx      # Registration with first name
│   │   │   ├── Dashboard.jsx   # Overview of subjects, decks, and chats
│   │   │   ├── Subjects.jsx    # List all subjects, create new ones
│   │   │   ├── SubjectDetail.jsx # Manage notes for a specific subject
│   │   │   ├── Flashcards.jsx  # Study flashcards (filter by subject)
│   │   │   ├── Chat.jsx        # AI chat (switch between subjects)
│   │   │   ├── TestBackend.jsx # Backend connection test page
│   │   │   └── NotFound.jsx    # 404 page
│   │   ├── App.jsx             # Main app with routes
│   │   ├── index.css           # Global styles and theming
│   │   └── main.jsx            # App entry point
│   ├── .env.local              # Environment variables (git-ignored)
│   └── package.json            # Dependencies
├── thestudybuddy-backend/      # Azure Functions + TypeScript backend
│   ├── src/
│   │   ├── db/
│   │   │   └── connectMongo.ts # MongoDB connection utility with retry logic
│   │   ├── firebase/
│   │   │   └── admin.ts        # Firebase Admin SDK initialization
│   │   ├── functions/
│   │   │   ├── SubjectsHttp.ts # Subject CRUD API endpoints (complete)
│   │   │   ├── NotesHttp.ts    # GET/DELETE notes endpoints
│   │   │   ├── NotesUpload.ts  # POST /api/notes/upload (multipart/form-data)
│   │   │   ├── ProcessNoteText.ts # Text extraction (not yet implemented)
│   │   │   ├── FlashcardsHttp.ts  # Flashcards API (not yet implemented)
│   │   │   └── ChatWithAI.ts      # AI chat API (not yet implemented)
│   │   ├── models/
│   │   │   ├── Subject.ts      # Mongoose Subject schema
│   │   │   └── Note.ts         # Mongoose Note schema with indexes
│   │   ├── shared/
│   │   │   ├── auth.ts         # Firebase token verification
│   │   │   ├── types.ts        # TypeScript interfaces (Subject, Note, etc.)
│   │   │   ├── apiContracts.md # API documentation
│   │   │   ├── repos/          # Repository pattern implementations
│   │   │   │   ├── SubjectRepository.ts # Subject repo interface
│   │   │   │   ├── MongoSubjectRepository.ts # MongoDB subject implementation
│   │   │   │   ├── NoteRepository.ts # Note repo interface
│   │   │   │   ├── MongoNoteRepository.ts # MongoDB note implementation
│   │   │   │   ├── InMemorySubjectRepository.ts # In-memory subject (dev)
│   │   │   │   ├── InMemoryNoteRepository.ts    # In-memory note (dev)
│   │   │   │   ├── FlashcardRepository.ts       # Flashcard repo interface
│   │   │   │   └── InMemoryFlashcardRepository.ts # In-memory flashcard (dev)
│   │   │   └── storage/        # Azure Blob Storage utilities
│   │   │       └── blobClient.ts # Upload/delete blob operations
│   │   └── index.ts            # Main entry point with MongoDB/Firebase init
│   ├── local.settings.json     # Azure Functions config (git-ignored)
│   └── package.json            # Dependencies
└── README.md                   # This file
```

## Page Navigation Flow
- **/** - Landing page (hero with call-to-action)
- **/login** - Sign in with email/password or Google
- **/dashboard** - Main dashboard showing:
  - Left: Subjects list (click to manage)
  - Center: Recent flashcard decks (by subject)
  - Right: Chat history count
- **/subjects** - View all subjects, create new ones
- **/subjects/:id** - Upload and manage up to 10 PDF notes per subject
- **/flashcards** - Study flashcards (filter by subject using tabs)
- **/chat** - Chat with AI (switch between subjects)

## Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Troubleshooting

### Frontend Issues
- **Port already in use?** Change the port in `vite.config.js` or kill the process using port 5174
- **Firebase errors?** Double-check your `.env.local` file has all required variables
- **Module not found?** Run `npm install` again to ensure all dependencies are installed

### Backend Issues
- **Port 7071 already in use?** Kill the process: `lsof -ti:7071 | xargs kill -9`
- **MongoDB connection failed?** Verify `MONGODB_URI` in `local.settings.json`
- **Firebase token verification errors?** Ensure `FIREBASE_PROJECT_ID` matches your frontend project
- **CORS errors?** Check that `CORS: "*"` is set in `local.settings.json`

### Full Stack Testing
- Visit `http://localhost:5174/test-backend` to verify backend connection
- Create a subject to test the full authentication flow
- Check browser console and terminal for detailed error messages

---

# Development Phases for TheStudyBuddy

## Phase 1 — Frontend Skeleton ✅
Build the structure of the frontend with subject-based organization.

Tasks:
- ✅ Create project with Vite + React + Tailwind
- ✅ Set up routing with React Router DOM
- ✅ Implement subject-based architecture:
  - ✅ Subjects page - View all subjects, create new ones
  - ✅ Subject Detail page - Manage up to 10 PDF notes per subject
  - ✅ Dashboard with three sections:
    - Left: Subjects list (clickable to navigate to subject detail)
    - Center: Recent flashcard decks with subject labels
    - Right: Chat history count with link to chat
- ✅ Create core pages:
  - ✅ Landing Page (hero section with gradient background)
  - ✅ Login Page (email/password form + Google sign-in button)
  - ✅ Dashboard (three-column layout: subjects, decks, chat)
  - ✅ Subjects Page (subject cards with note counts and actions)
  - ✅ Subject Detail Page (drag-and-drop upload UI, note list)
  - ✅ Flashcards Page (subject selector tabs, deck filtering)
  - ✅ Chat Page (subject switcher, message interface)
  - ✅ Not Found Page (404 error page)
- ✅ Create layout components:
  - ✅ Navbar (Dashboard, Subjects, Flashcards, Chat, Login)
  - ✅ Layout wrapper (navbar + content area)
- ✅ Global theming system:
  - ✅ Reusable CSS classes (.btn-primary, .btn-secondary, .card, .input, .badge, etc.)
  - ✅ Gradient background system (pink-to-purple with custom shapes)
  - ✅ Dark mode support configured
  - ✅ Consistent indigo color scheme across all pages
- ✅ Firebase Auth setup:
  - ✅ Firebase SDK installed
  - ✅ Firebase config with environment variables
  - ✅ Login UI with email/password and Google sign-in
- ✅ Initialize GitHub repo and commit

Outcome:
A fully styled, navigable app with subject-based organization, mock data, and Firebase Auth configured (not yet functional).

---

## Phase 2 — Frontend UI Components & Firebase Auth Integration ✅
Build interactive UI elements and connect Firebase authentication.

Tasks:
- ✅ Firebase Auth integration:
  - ✅ Create AuthContext for global auth state
  - ✅ Wire up Login page (email/password + Google sign-in)
  - ✅ Add protected routes for authenticated pages (PrivateRoute component)
  - ✅ Add logout functionality to navbar
  - ✅ Create Sign Up page with first name field
  - ✅ Store first name in user profile (displayName)
  - ✅ Display first name (up to 10 chars) in navbar
  - ✅ Add logo (IMG_3002.png) to navbar
  - ✅ Add animated purple indicator to navbar
- ✅ Subject management UI:
  - ✅ Create new subject modal with color picker
  - ✅ Edit subject functionality
  - ✅ Delete subject with confirmation dialog
  - ✅ Subject cards with note/deck counts
  - ✅ Empty states for no subjects
- ✅ Note upload UI:
  - ✅ Implement drag-and-drop functionality
  - ✅ Add file preview in selected files list
  - ✅ File size/type validation (PDF only, 10MB max)
  - ✅ Enforce 10-note limit per subject
  - ✅ Upload multiple files at once
  - ⬜ Progress bars for individual file uploads
- ⬜ Flashcard interface:
  - ⬜ Add flip animation
  - ⬜ Deck navigation (previous/next card)
  - ⬜ Card counter (e.g., "5 / 25")
  - ⬜ Mark cards as "mastered"
- ⬜ Chat interface:
  - ⬜ Scrollable message history
  - ⬜ Typing indicator animation
  - ⬜ Message timestamps
  - ⬜ Auto-scroll to latest message
- ✅ UI polish:
  - ✅ Add loading states and spinners
  - ✅ Error handling UI (error alerts)
  - ✅ Confirmation modals for destructive actions (ConfirmDialog component)
  - ✅ Responsive design for mobile/tablet
  - ✅ Empty states for all pages
  - ✅ Gradient backgrounds with blur effects

Outcome:
✅ Fully interactive frontend with Firebase Auth working, Subjects fully functional with real data, mock data remaining for notes/decks/chats, polished animations, and responsive design.

---

## Phase 3 — Deploy Frontend ✅
Deploy the frontend before the backend exists.

Tasks:
- ✅ Create Azure Static Web App
- ✅ Connect GitHub repo
- ✅ Configure build settings
- ✅ Verify automatic deployments on push

Outcome:
✅ Publicly accessible frontend site hosted on Azure.

---

## Phase 4 — Backend Development (Azure + MongoDB) 🚧 In Progress
Build the backend API and serverless functions to support core features with subject-based organization.

### Current Status
✅ **Subjects fully functional** - Complete end-to-end implementation with authenticated CRUD operations  
🔄 **Backend running locally** - Azure Functions working on localhost:7071  
⏳ **Production deployment pending** - Need to deploy Azure Functions to cloud  
⏳ **Notes, Flashcards, Chat** - Not yet implemented (coming next)

### MongoDB Models & Setup
- ✅ Set up MongoDB Atlas cluster (`studybuddy` database)
- ✅ Connected MongoDB to backend with connection pooling
- ⬜ Create `users` collection schema (email, name, createdAt)
- ✅ **Created `subjects` collection schema** (name, color, userId, createdAt)
  - ✅ Implemented Mongoose model with validation
  - ✅ Created MongoSubjectRepository with full CRUD operations
  - ✅ Added userId index for fast user-specific queries
  - ✅ Tested with real data - working perfectly!
- ✅ **Created `notes` collection schema** (fileName, blobUrl, textUrl, fileSize, subjectId, userId, uploadedAt)
  - ✅ Implemented Mongoose model with validation
  - ✅ Created MongoNoteRepository with full CRUD operations
  - ✅ Added indexes on userId and subjectId for fast queries
  - ✅ Compound index on (userId, subjectId) for efficient filtering
  - ✅ Tested with real uploads - working perfectly!
- ⬜ Create `flashcards` collection schema (question, answer, subjectId, noteId, createdAt)
- ✅ Write MongoDB connection utility (with retry logic and error handling)
- ✅ Test database connections and CRUD operations (subjects fully working)

### API Routes (Azure Functions HTTP Triggers)
- ✅ **Set up Azure Functions v4 TypeScript project**
- ✅ **Implemented Firebase Admin SDK for token verification**
  - ✅ Extracts Bearer token from Authorization header
  - ✅ Verifies token with Firebase Admin
  - ✅ Returns actual user's Firebase UID
  - ✅ Ensures users only see their own data
- ✅ **Subject API fully implemented:**
  - ✅ `POST /api/subjects` - Create new subject (authenticated)
  - ✅ `GET /api/subjects` - List all subjects for authenticated user
  - ✅ `GET /api/subjects/:id` - Get single subject details
  - ✅ `PUT /api/subjects/:id` - Update subject (name, color)
  - ✅ `DELETE /api/subjects/:id` - Delete subject
  - ✅ All routes enforce user ownership validation
  - ✅ Proper error handling with status codes
- ✅ **Note API implemented:**
  - ✅ `GET /api/notes/:subjectId` - Get all notes for a subject (authenticated, sorted by date)
  - ✅ `POST /api/notes/upload` - Upload PDF to Azure Blob + save metadata to MongoDB
  - ✅ `DELETE /api/notes/:id` - Delete note from MongoDB AND Azure Blob Storage
  - ✅ All routes enforce user ownership validation
  - ✅ Proper cleanup of orphaned blobs on deletion
- ⬜ Create `GET /api/flashcards/:subjectId` - Get all flashcards for a subject
- ✅ Add error handling with try/catch blocks
- ✅ Configure CORS for local development

### Azure Blob Storage Integration ✅
- ✅ **Set up Azure Storage Account** (`studybuddystorage`) with containers:
  - ✅ `notes-raw` - stores uploaded PDF files
  - ✅ `notes-text` - ready for extracted text (not yet used)
- ✅ **Installed Azure Blob Storage SDK** (`@azure/storage-blob`)
- ✅ **Created blob service client** with connection string in `local.settings.json`
- ✅ **Implemented `POST /api/notes/upload` endpoint:**
  - ✅ Accepts file from multipart/form-data
  - ✅ Validates file type (PDF only) and size (max 10MB)
  - ✅ Generates unique blob name with timestamp
  - ✅ Uploads file to `notes-raw` container
  - ✅ Saves note metadata to MongoDB (fileName, blobUrl, subjectId, userId, fileSize)
  - ✅ Returns note metadata to client
- ✅ **Implemented blob deletion** - deletes from Azure Blob Storage when note is deleted
- ✅ **Created `blobClient.ts`** with `uploadPdfToRawContainer()` and `deleteBlobByUrl()`
- ⬜ Add SAS token generation for secure file access (pending)

### Azure Functions - Text Extraction
- ⬜ Create Azure Function `ProcessNoteText` (Blob trigger or HTTP trigger)
- ⬜ Install PDF parsing library (`pdf-parse` or Azure Form Recognizer)
- ⬜ Implement text extraction logic:
  - ⬜ Download PDF from Blob Storage
  - ⬜ Extract text from PDF
  - ⬜ Upload extracted text to `notes-text` container
  - ⬜ Update note document in MongoDB with `textUrl`
- ⬜ Add error handling for corrupted/unreadable PDFs
- ⬜ Test with sample PDFs

### Azure Functions - Flashcard Generation
- ⬜ Create Azure Function `GenerateFlashcards` (HTTP trigger)
- ⬜ Install Azure OpenAI SDK (`@azure/openai`)
- ⬜ Set up Azure OpenAI client with API key and endpoint
- ⬜ Implement `POST /api/flashcards/generate` endpoint:
  - ⬜ Accept `noteId` and `subjectId` in request body
  - ⬜ Fetch extracted text from Blob Storage
  - ⬜ Create prompt for GPT-4o-mini: "Generate 10 flashcards from this text..."
  - ⬜ Call Azure OpenAI API with text + prompt
  - ⬜ Parse response and extract flashcards (question/answer pairs)
  - ⬜ Save flashcards to MongoDB with `subjectId`, `noteId`, `userId`
  - ⬜ Return generated flashcards to client
- ⬜ Add retry logic for OpenAI API failures
- ⬜ Handle rate limits and token limits

### Azure Functions - RAG/AI Chat Logic
- ⬜ Create Azure Function `ChatWithAI` (HTTP trigger)
- ⬜ Implement `POST /api/ai/chat` endpoint:
  - ⬜ Accept `message`, `subjectId`, `chatHistory` in request body
  - ⬜ Fetch all notes for the subject from MongoDB
  - ⬜ Download extracted text for all subject notes from Blob
  - ⬜ Combine note texts into context window (chunk if needed)
  - ⬜ Build RAG prompt: "You are a study assistant. Based on these notes: {context}. User asks: {message}"
  - ⬜ Call Azure OpenAI with system prompt + user message + chat history
  - ⬜ Return AI response to client
- ⬜ Implement chat history storage in MongoDB (optional)
- ⬜ Add streaming support for real-time responses (optional)
- ⬜ Test with sample subject notes and questions

### Optional: Azure Cognitive Search (Vector Retrieval)
- ⬜ Set up Azure Cognitive Search service
- ⬜ Create search index for note embeddings
- ⬜ Generate embeddings for note text using Azure OpenAI
- ⬜ Store embeddings in Cognitive Search
- ⬜ Implement vector search for relevant note retrieval in RAG

### Testing & Deployment
- ✅ **Local testing fully working:**
  - ✅ Created test page at `/test-backend` for API validation
  - ✅ Backend running on localhost:7071
  - ✅ Frontend running on localhost:5174
  - ✅ CORS configured for local development
  - ✅ Subjects CRUD operations tested and working
  - ✅ User authentication and isolation verified
- ⬜ Write unit tests for API routes
- ⬜ Write integration tests for Azure Functions
- ⬜ Test end-to-end: upload → extract → generate flashcards → chat
- ⬜ **Deploy Azure Functions to Azure Cloud** (currently only running locally)
- ⬜ Set up environment variables in Azure Portal
- ⬜ Configure CORS for production frontend domain
- ⬜ Update frontend `VITE_API_URL` to point to deployed Azure Functions
- ⬜ Test deployed endpoints from production frontend

**Current Status:** Backend is fully functional locally but not yet deployed to Azure cloud. Production frontend uses mock data until backend is deployed.

Outcome (when complete):
Backend supports all core functionality with subject-based organization, AI-powered flashcards, and RAG chat.

---

## Phase 5 — Connect Frontend and Backend 🚧 Partially Complete
Replace mock data with real API calls and data from MongoDB.

### Completed Tasks:
- ✅ **Subject management fully integrated:**
  - ✅ Created SubjectContext with React Context API
  - ✅ Connected Subjects page to subject API (full CRUD)
  - ✅ Dashboard displays real subject data from MongoDB
  - ✅ Context refetches subjects on user login/logout
  - ✅ Create, update, delete subjects working perfectly
  - ✅ Color conversion between Tailwind classes and hex
  - ✅ Loading states and error handling implemented
- ✅ **API Service Layer:**
  - ✅ Created `services/api.ts` with authentication
  - ✅ Automatic Firebase token injection in requests
  - ✅ Graceful degradation when backend unavailable (production)
  - ✅ Environment-aware API URL (dev vs production)
- ✅ **Authentication integration:**
  - ✅ SubjectContext listens to auth state changes
  - ✅ Subjects cleared on logout
  - ✅ Subjects refetched on login
  - ✅ Each user only sees their own subjects
- ✅ **Loading and error handling:**
  - ✅ Loading spinners for all subject API calls
  - ✅ User-friendly error messages
  - ✅ Action loading states (create/update/delete)
  - ✅ Empty states when no subjects exist

### Remaining Tasks:
- ⬜ Note upload integration:
  - ⬜ Connect Subject Detail page to upload API
  - ⬜ Show real note list from MongoDB
  - ⬜ Display upload progress and handle errors
  - ⬜ Enforce 10-note limit from backend
- ⬜ Flashcard integration:
  - ⬜ Fetch flashcard decks filtered by subject
  - ⬜ Display generated flashcards from Azure OpenAI
  - ⬜ Track study progress in MongoDB
- ⬜ Chat integration:
  - ⬜ Connect chat UI to subject-specific chat API
  - ⬜ Send/receive messages with RAG context
  - ⬜ Load chat history from MongoDB
  - ⬜ Handle streaming responses
- ⬜ Final polish:
  - ⬜ Implement retry logic for failed requests
  - ⬜ Add offline detection
  - ⬜ Update Dashboard to show real deck and chat counts

Outcome (when complete):
A fully functional, end-to-end application with real data and AI features.

**Current Status:** Subjects feature is 100% complete with full backend integration. Notes, Flashcards, and Chat still using mock data.

---

## Phase 6 — Stretch Features
Add advanced functionality after core MVP is stable.

Possible features:
- **AI Quiz Generation** - Generate multiple-choice quizzes from notes (per subject)
- **Daily Streaks** - Duolingo-style streak tracking for studying
- **Subject-Specific Resources**:
  - YouTube video recommendations related to subject topics
  - Relevant article discovery from trusted sources
  - Wikipedia summaries for key concepts
- **Mindmap Exports** - Generate visual mindmaps with ToDiagram
- **Gamification**:
  - XP points for studying and completing decks
  - Achievement badges (e.g., "Study 7 days in a row")
  - Subject mastery levels
- **Study Analytics Dashboard**:
  - Time spent per subject
  - Flashcard mastery percentage
  - Study session heatmap
  - Performance trends over time
- **Collaboration Features**:
  - Share subjects/decks with classmates
  - Study groups
  - Public subject templates
- **Background Workers** (DigitalOcean):
  - Video/article scraping workers
  - Periodic embeddings updates
  - Analytics aggregation

Outcome:
Enhanced product with unique features, gamification, and additional technical depth that differentiates from competitors.
