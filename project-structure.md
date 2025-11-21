# StudyGuide AI — Getting Started

This document outlines how to build the MVP version of **StudyGuide AI** using **Azure as the primary cloud**, **MongoDB Atlas** as the database, and **DigitalOcean** for optional background services.

---

# MVP Features

- User authentication (Firebase Auth)
- Upload homework notes (PDF/text)
- AI-generated flashcards (Azure OpenAI)
- Chatbot that understands your notes
- User dashboard with decks, notes, and chats
- Deployment on Azure

---

# Architecture Overview

### Primary: **Azure**
- Azure Static Web Apps (frontend)
- Azure Functions (backend)
- Azure Blob Storage (file uploads)
- Azure OpenAI (GPT-4.1)
- Azure Monitor (logging)

### Secondary: **DigitalOcean**
- $200 credit for:
  - Background workers
  - Scheduled jobs
  - Optional sidecar microservices (YouTube/API scraping)

### Database: **MongoDB Atlas**
- $50 credits
- Collections:
  - users
  - notes
  - decks
  - flashcards
  - chats
  - streaks
  - quizzes

### Auth: **Firebase Auth**
- Easiest for new developers
- No backend needed
- Works seamlessly with React + Azure hosting

---

# Project Structure
studyguide-ai/
│
├── frontend/ # React + Tailwind (Azure Static Web Apps)
├── backend/ # Azure Functions
├── worker/ (optional) # DigitalOcean microservice
├── docs/ # Prompts, architecture, design
└── README.md


---

# Step-by-Step Implementation

## Step 1 — Frontend Setup
1. Create a Vite + React project  
2. Add TailwindCSS  
3. Add Firebase Auth  
4. Build pages:
   - Login
   - Upload
   - Flashcards
   - Chat
   - Dashboard

## Step 2 — Azure Functions Backend
Endpoints:
- `/parse-notes`
- `/generate-flashcards`
- `/chat`
- `/generate-quiz`

Tools:
- Azure Functions Core Tools
- Azure API Management (optional)

## Step 3 — MongoDB Atlas Setup
Collections for:
- notes
- decks
- flashcards
- chats
- users
- quizzes
- streak tracking

## Step 4 — Azure OpenAI Integration
- Generate flashcards  
- Provide chat responses  
- Build quiz questions  

## Step 5 — File Uploads
- Upload PDF to Azure Blob Storage  
- Process text in Azure Functions  

## Step 6 — RAG Chatbot
- Extract text chunks  
- Store in MongoDB  
- Retrieve relevant chunks  
- Send to GPT-4.1 with user question  

## Step 7 — Deployment
**Frontend**: Azure Static Web Apps  
**Backend**: Azure Functions  
**DB**: MongoDB Atlas  
**DNS**: Namecheap or .TECH domain  

---

# Stretch Goals (Azure + DigitalOcean)

### 1. YouTube Video Recommendations
- DO worker calls YouTube API  
- Store suggestions in MongoDB  

### 2. Related Articles
- DO worker scrapes Wikipedia or Web API  

### 3. Mindmap Generator
- Use ToDiagram API  

### 4. Daily Streaks
- DO cron worker updates streak count  

### 5. AI Quiz Builder
- Generate MCQs from flashcards  

---

# You're Ready to Build!
This updated plan uses Azure as primary cloud + MongoDB Atlas + DigitalOcean for advanced stretch features.
