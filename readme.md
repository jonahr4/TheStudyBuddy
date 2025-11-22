# The Study Buddy

The Study Buddy is an AI-powered learning tool that helps students upload homework notes, turn them into flashcards, and chat with an AI that understands their content.

This Azure-first edition uses Azure Functions, Azure OpenAI, MongoDB Atlas, and DigitalOcean background workers.

---

## Table of Contents
- [MVP Features](#mvp-features)
- [Stretch Features](#stretch-features)
- [Tech Stack](#tech-stack-azure-centric)
- [How It Works](#how-it-works)
- [Local Development Setup](#local-development-setup)
- [Development Phases](#development-phases-for-thestudybuddy)
  - [Phase 1 — Frontend Skeleton](#phase-1--frontend-skeleton-)
  - [Phase 2 — Frontend UI Components](#phase-2--frontend-ui-components)
  - [Phase 3 — Deploy Frontend](#phase-3--deploy-frontend)
  - [Phase 4 — Backend Development](#phase-4--backend-development-azure-functions)
  - [Phase 5 — Connect Frontend and Backend](#phase-5--connect-frontend-and-backend)
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

### 6. Start the Development Server
```bash
npm run dev
```

You should see output like:
```
VITE v7.2.4  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**The app is now running at** `http://localhost:5173` 🎉

### 7. Verify Installation
Open your browser to `http://localhost:5173` and you should see:
- ✅ Landing page with gradient background
- ✅ Navbar with "Study Buddy" branding
- ✅ Buttons and navigation working
- ✅ Login page accessible at `/login`

## Quick Command Reference

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter to check code quality
npm run lint

# Install a new package (example)
npm install <package-name>

# Update dependencies
npm update
```

## Project Structure
```
TheStudyBuddy/
├── thestudybuddy-frontend/     # React + Vite frontend
│   ├── src/
│   │   ├── assets/             # Images and static files
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Navigation bar with links
│   │   │   └── Layout.jsx      # Page wrapper with navbar
│   │   ├── firebase/           # Firebase configuration
│   │   │   └── config.js       # Firebase initialization and auth setup
│   │   ├── pages/              # Route pages
│   │   │   ├── Landing.jsx     # Homepage with hero section
│   │   │   ├── Login.jsx       # Authentication page
│   │   │   ├── Dashboard.jsx   # Overview of subjects, decks, and chats
│   │   │   ├── Subjects.jsx    # List all subjects, create new ones
│   │   │   ├── SubjectDetail.jsx # Manage notes for a specific subject
│   │   │   ├── Flashcards.jsx  # Study flashcards (filter by subject)
│   │   │   ├── Chat.jsx        # AI chat (switch between subjects)
│   │   │   └── NotFound.jsx    # 404 page
│   │   ├── App.jsx             # Main app with routes
│   │   ├── index.css           # Global styles and theming
│   │   └── main.jsx            # App entry point
│   ├── .env.local              # Environment variables (git-ignored)
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
- **Port already in use?** Change the port in `vite.config.js` or kill the process using port 5173
- **Firebase errors?** Double-check your `.env.local` file has all required variables
- **Module not found?** Run `npm install` again to ensure all dependencies are installed

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

## Phase 2 — Frontend UI Components & Firebase Auth Integration
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
- ⬜ Subject management:
  - ⬜ Create new subject modal/form
  - ⬜ Edit subject functionality
  - ⬜ Delete subject with confirmation
- ⬜ Note upload UI:
  - ⬜ Implement drag-and-drop functionality
  - ⬜ Add file preview with thumbnails
  - ⬜ Progress bars for uploads
  - ⬜ File size/type validation
  - ⬜ Enforce 10-note limit per subject
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
- ⬜ UI polish:
  - ⬜ Add loading states and skeletons
  - ⬜ Error handling UI (toasts/alerts)
  - ⬜ Confirmation modals for destructive actions
  - ⬜ Responsive design for mobile/tablet
  - ⬜ Empty states for all pages

Outcome:
Fully interactive frontend with Firebase Auth working, mock data for subjects/notes/decks/chats, polished animations, and responsive design.

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

## Phase 4 — Backend Development (Azure + MongoDB)
Build the backend API and serverless functions to support core features with subject-based organization.

### MongoDB Models & Setup
- ⬜ Set up MongoDB Atlas cluster and database
- ⬜ Create `users` collection schema (email, name, createdAt)
- ⬜ Create `subjects` collection schema (name, color, userId, createdAt)
- ⬜ Create `notes` collection schema (fileName, blobUrl, textUrl, subjectId, userId, uploadedAt)
- ⬜ Create `flashcards` collection schema (question, answer, subjectId, noteId, createdAt)
- ⬜ Create indexes on `userId`, `subjectId` for efficient querying
- ⬜ Write MongoDB connection utility (with retry logic)
- ⬜ Test database connections and CRUD operations

### API Routes (Express.js or Azure Functions HTTP Triggers)
- ⬜ Set up Express.js server or Azure Functions HTTP project
- ⬜ Implement Firebase Auth token verification middleware
- ⬜ Create `POST /api/subjects` - Create new subject
- ⬜ Create `GET /api/subjects` - List all subjects for authenticated user
- ⬜ Create `GET /api/subjects/:id` - Get single subject details
- ⬜ Create `PUT /api/subjects/:id` - Update subject (name, color)
- ⬜ Create `DELETE /api/subjects/:id` - Delete subject (with cascade delete of notes/flashcards)
- ⬜ Create `GET /api/notes/:subjectId` - Get all notes for a subject
- ⬜ Create `DELETE /api/notes/:id` - Delete a note (remove from Blob + MongoDB)
- ⬜ Create `GET /api/flashcards/:subjectId` - Get all flashcards for a subject
- ⬜ Add error handling middleware (catch all errors, return proper status codes)
- ⬜ Add request logging middleware

### Azure Blob Storage Integration
- ⬜ Set up Azure Storage Account and create containers (`notes-raw`, `notes-text`)
- ⬜ Install Azure Blob Storage SDK (`@azure/storage-blob`)
- ⬜ Create Blob service client with connection string
- ⬜ Implement `POST /api/notes/upload` endpoint:
  - ⬜ Accept file from multipart/form-data
  - ⬜ Validate file type (PDF only) and size (max 10MB)
  - ⬜ Check note limit per subject (max 10 notes)
  - ⬜ Generate unique blob name (userId/subjectId/timestamp-filename.pdf)
  - ⬜ Upload file to `notes-raw` container
  - ⬜ Save note metadata to MongoDB (fileName, blobUrl, subjectId, userId)
  - ⬜ Return note metadata to client
- ⬜ Implement blob deletion when note is deleted
- ⬜ Add SAS token generation for secure file access (optional)

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
- ⬜ Write unit tests for API routes
- ⬜ Write integration tests for Azure Functions
- ⬜ Test end-to-end: upload → extract → generate flashcards → chat
- ⬜ Deploy Azure Functions to Azure
- ⬜ Deploy Express API to Azure App Service or Container
- ⬜ Set up environment variables in Azure
- ⬜ Configure CORS for frontend domain
- ⬜ Test deployed endpoints from frontend

Outcome:
Backend supports all core functionality with subject-based organization, AI-powered flashcards, and RAG chat.

---

## Phase 5 — Connect Frontend and Backend
Replace mock data with real API calls and data from MongoDB.

Tasks:
- Subject management:
  - Connect Subjects page to subject API (CRUD operations)
  - Fetch and display real subject data on Dashboard
- Note upload integration:
  - Connect Subject Detail page to upload API
  - Show real note list from MongoDB
  - Display upload progress and handle errors
  - Enforce 10-note limit from backend
- Flashcard integration:
  - Fetch flashcard decks filtered by subject
  - Display generated flashcards from Azure OpenAI
  - Track study progress in MongoDB
- Chat integration:
  - Connect chat UI to subject-specific chat API
  - Send/receive messages with RAG context
  - Load chat history from MongoDB
  - Handle streaming responses
- Global state management:
  - Implement state management (Context API or Zustand)
  - Cache subject and deck data
  - Handle authentication state
- Loading and error handling:
  - Add loading spinners for all API calls
  - Display user-friendly error messages
  - Implement retry logic for failed requests
  - Add offline detection

Outcome:
A fully functional, end-to-end application with real data and AI features.

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
