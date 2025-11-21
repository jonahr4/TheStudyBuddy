# The Study Buddy

The Study Buddy is an AI-powered learning tool that helps students upload homework notes, turn them into flashcards, and chat with an AI that understands their content.

This Azure-first edition uses Azure Functions, Azure OpenAI, MongoDB Atlas, and DigitalOcean background workers.

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
# Development Phases for TheStudyBuddy

## Phase 1 — Frontend Skeleton
Build the structure of the frontend without functionality.

Tasks:
- Create project with Vite + React + Tailwind
- Set up routing
- Set up Firebase Auth (UI only)
- Create placeholder pages:
  - Landing Page
  - Login Page
  - Dashboard
  - Upload Page
  - Flashcards Page
  - Chat Page
  - Not Found Page
- Create basic layout components (navbar, sidebar)
- Initialize GitHub repo and commit

Outcome:
A visual, navigable app with no backend logic.

---

## Phase 2 — Frontend UI Components
Build all UI elements using mock data.

Tasks:
- Dashboard components (cards, lists, buttons)
- Upload page UI (drag-and-drop, upload button, loaders)
- Flashcard interface (flip cards, deck list)
- Chat interface (chat bubbles, input box, scroll container)
- Global styling, themes, reusable components
- Improve layout structure

Outcome:
Fully designed frontend with mock data, ready for backend integration.

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
