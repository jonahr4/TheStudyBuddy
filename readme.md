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
