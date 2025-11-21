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

- Upload notes (PDF or text)
- AI-generated flashcards (Azure OpenAI)
- AI chatbot that understands your notes
- Firebase Authentication
- User dashboard with flashcards, chats, and uploads
- Deployment on Azure Static Web Apps

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
- React (Vite)
- TailwindCSS
- Firebase Auth
- Azure Static Web Apps (hosting)

**Backend**
- Azure Functions
- Azure OpenAI GPT-4.1
- Azure Blob Storage
- Azure API Management (optional)

**Database**
- MongoDB Atlas ($50 credits)

**Optional Microservices**
- DigitalOcean Droplet or App Platform (YouTube/article workers)

**DevOps**
- GitHub Actions
- Sentry + Azure Monitor

---

# How It Works

1. User logs in (Firebase)  
2. Uploads notes → Azure Blob Storage  
3. Azure Functions extract text  
4. Azure OpenAI generates flashcards + embeddings  
5. MongoDB stores decks, chats, and metadata  
6. Chatbot uses RAG retrieval for accurate answers  
7. Optional DO worker fetches video/article recommendations  

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
│   │   ├── components/         # Reusable UI components (Navbar, Layout)
│   │   ├── firebase/           # Firebase config
│   │   ├── pages/              # Route pages (Landing, Login, Dashboard, etc.)
│   │   ├── App.jsx             # Main app with routes
│   │   ├── index.css           # Global styles and theming
│   │   └── main.jsx            # App entry point
│   ├── .env.local              # Environment variables (git-ignored)
│   └── package.json            # Dependencies
└── README.md                   # This file
```

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
Build the structure of the frontend without functionality.

Tasks:
- ✅ Create project with Vite + React + Tailwind
- ✅ Set up routing with React Router DOM
- ✅ Create placeholder pages:
  - ✅ Landing Page (with hero section and gradient background)
  - ✅ Login Page (complete form with email/password + Google sign-in button)
  - ✅ Dashboard (three-column card layout)
  - ✅ Upload Page (drag-and-drop UI placeholder)
  - ✅ Flashcards Page (flip card interface placeholder)
  - ✅ Chat Page (chat interface with input)
  - ✅ Not Found Page
- ✅ Create basic layout components:
  - ✅ Navbar (modern indigo branding with navigation links)
  - ✅ Layout wrapper (removed sidebar per design decision)
- ✅ Global theming system:
  - ✅ Reusable CSS classes (.btn-primary, .btn-secondary, .card, .input, etc.)
  - ✅ Gradient background system (pink-to-purple with custom shapes)
  - ✅ Dark mode support configured
  - ✅ Consistent indigo color scheme across all pages
- ✅ Set up Firebase Auth (UI ready, Firebase SDK not yet integrated)
- ✅ Initialize GitHub repo and commit

Outcome:
A fully styled, navigable app with modern UI design, ready for Firebase integration and backend logic.

---

## Phase 2 — Frontend UI Components
Build all UI elements using mock data.

Tasks:
- ⬜ Dashboard components (enhance cards with mock data, add deck lists, stats)
- ⬜ Upload page UI (implement drag-and-drop functionality, add file preview, progress bars)
- ⬜ Flashcard interface (add flip animation, deck navigation, card counter)
- ⬜ Chat interface (add message bubbles, timestamps, scroll behavior, typing indicator)
- ⬜ Add loading states and animations
- ⬜ Add error handling UI components
- ⬜ Create reusable modal/dialog components
- ⬜ Implement responsive design for mobile/tablet

Outcome:
Fully interactive frontend with mock data, polished animations, and edge case handling.

---

## Phase 3 — Deploy Frontend
Deploy the frontend before the backend exists.

Tasks:
- Create Azure Static Web App
- Connect GitHub repo
- Configure build settings
- Verify automatic deployments on push

Outcome:
Publicly accessible frontend site hosted on Azure.

---

## Phase 4 — Backend Development (Azure Functions)
Build the serverless backend to support core features.

Tasks:
- File upload API with Azure Blob Storage
- Notes parsing function
- Flashcard generation endpoint using Azure OpenAI
- Chat endpoint with retrieval logic
- MongoDB Atlas setup and integration
- Authentication middleware (Firebase token verification)

Outcome:
Backend supports all core functionality.

---

## Phase 5 — Connect Frontend and Backend
Replace mock data with real API results.

Tasks:
- Connect upload page to backend
- Connect flashcard viewer to generated flashcards
- Connect chat UI to chat API
- Handle loading states and error states
- Implement real user data storage

Outcome:
A functional, end-to-end application.

---

## Phase 6 — Stretch Features
Add advanced functionality after core MVP is stable.

Possible features:
- AI quiz generation
- Daily streaks system
- YouTube video recommendations
- Relevant article recommendations
- Mindmap exports
- Achievements and badge system
- Background workers using DigitalOcean

Outcome:
Enhanced product with unique features and additional technical depth.
