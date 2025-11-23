# ✅ Azure Functions Backend - Setup Complete

## 🎉 What's Been Done

### 1. **Installed Azure Functions Core Tools**
```bash
brew tap azure/functions
brew install azure-functions-core-tools
```
- Version: 2.7.3188
- Function Runtime: 2.0.14786.0

### 2. **Created Backend Directory**
```
TheStudyBuddy/
├── thestudybuddy-frontend/    # React app (already exists)
└── thestudybuddy-backend/     # NEW! Azure Functions app
    ├── HelloWorld/            # Sample HTTP trigger function
    │   ├── index.ts          # Function implementation
    │   └── function.json     # Function configuration
    ├── dist/                  # Compiled JavaScript output
    ├── node_modules/          # Dependencies
    ├── .vscode/              # VS Code settings
    ├── host.json             # Functions host configuration
    ├── local.settings.json   # Local environment variables
    ├── package.json          # Node dependencies
    ├── tsconfig.json         # TypeScript configuration
    ├── .funcignore           # Files to ignore during deployment
    └── .gitignore            # Git ignore rules
```

### 3. **Initialized Azure Functions App**
- **Runtime:** Node.js
- **Language:** TypeScript
- **Template:** HTTP Trigger

### 4. **Created HelloWorld Function**
- **Type:** HTTP Trigger
- **Methods:** GET, POST
- **URL:** `http://localhost:7071/api/HelloWorld`
- **Auth Level:** Function (requires key for security)

### 5. **Installed Dependencies**
```json
{
  "@azure/functions": "^1.0.1-beta1",
  "npm-run-all": "^4.1.5",
  "typescript": "^3.3.3"
}
```

### 6. **Backend Server Running**
✅ Server started successfully at `http://localhost:7071`
```
Functions:
    HelloWorld: [GET,POST] http://localhost:7071/api/HelloWorld
```

---

## 📁 Key Files Explained

### `host.json` - Functions Host Configuration
```json
{
  "version": "2.0",
  "logging": {...},
  "extensionBundle": {...}
}
```
- Configures the Azure Functions runtime
- Sets up logging and extension bundles

### `HelloWorld/index.ts` - Function Implementation
```typescript
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully.";

    context.res = {
        body: responseMessage
    };
};

export default httpTrigger;
```

### `HelloWorld/function.json` - Function Bindings
```json
{
  "bindings": [
    {
      "authLevel": "function",      // Requires function key
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get", "post"]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ],
  "scriptFile": "../dist/HelloWorld/index.js"
}
```

### `package.json` - NPM Scripts
```json
{
  "scripts": {
    "build": "tsc",                                          // Compile TypeScript
    "watch": "tsc --w",                                      // Watch mode
    "prestart": "npm run build && func extensions install",  // Pre-start build
    "start:host": "func start",                              // Start Functions host
    "start": "npm-run-all --parallel start:host watch",      // Run both in parallel
    "build:production": "npm run prestart && npm prune --production"
  }
}
```

### `tsconfig.json` - TypeScript Configuration
- **Target:** ES2016
- **Module:** CommonJS
- **Output:** `./dist` directory
- **Strict Mode:** Enabled
- **Source Maps:** Enabled for debugging

---

## 🚀 How to Use

### Start the Backend Server
```bash
cd thestudybuddy-backend
npm start
```

Output:
```
Azure Functions Core Tools
Function Runtime Version: 2.0.14786.0

Functions:
    HelloWorld: [GET,POST] http://localhost:7071/api/HelloWorld
```

### Test the Function
```bash
# GET request with query parameter
curl "http://localhost:7071/api/HelloWorld?name=StudyBuddy"

# POST request with JSON body
curl -X POST http://localhost:7071/api/HelloWorld \
  -H "Content-Type: application/json" \
  -d '{"name":"StudyBuddy"}'
```

Expected Response:
```
Hello, StudyBuddy. This HTTP triggered function executed successfully.
```

### Stop the Server
- Press `Ctrl + C` in the terminal running the server

---

## 🔧 Development Workflow

### 1. **Hot Reload Enabled**
TypeScript compiler runs in watch mode:
```
6:22:58 PM - Starting compilation in watch mode...
6:22:59 PM - Found 0 errors. Watching for file changes.
```

When you edit `.ts` files:
1. TypeScript automatically recompiles to `.js`
2. Functions runtime detects changes
3. Functions reload automatically

### 2. **Create New Functions**
```bash
# From backend directory
func new --template "HTTP trigger" --name YourFunctionName
```

Available templates:
- HTTP trigger
- Timer trigger
- Queue trigger
- Blob trigger
- CosmosDB trigger
- Event Hub trigger
- Service Bus trigger

### 3. **Project Structure for New Functions**
```
thestudybuddy-backend/
├── HelloWorld/
│   ├── index.ts
│   └── function.json
├── NewFunction/           # Create more functions like this
│   ├── index.ts
│   └── function.json
└── dist/
    ├── HelloWorld/
    │   └── index.js      # Compiled output
    └── NewFunction/
        └── index.js
```

---

## 🎯 Next Steps for Phase 4

### Backend APIs to Build:

#### 1. **Subject Management**
- `POST /api/subjects` - Create subject
- `GET /api/subjects` - List subjects
- `GET /api/subjects/:id` - Get subject details
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

#### 2. **Note Upload & Processing**
- `POST /api/subjects/:id/notes` - Upload PDF
- `GET /api/notes/:id` - Get note details
- `DELETE /api/notes/:id` - Delete note
- Azure Blob Storage integration for file storage
- PDF text extraction

#### 3. **Flashcard Generation**
- `POST /api/subjects/:id/generate-flashcards` - Generate from notes
- `GET /api/flashcards` - List flashcard decks
- `GET /api/flashcards/:id` - Get deck details
- Azure OpenAI integration

#### 4. **AI Chat**
- `POST /api/chat` - Send message, get AI response
- `GET /api/chat-history/:subjectId` - Get chat history
- RAG (Retrieval Augmented Generation) with embeddings
- Azure OpenAI integration

#### 5. **Authentication Middleware**
- Verify Firebase tokens
- Extract user ID from token
- Attach to context for all requests

---

## 🔐 Security Considerations

### Current Setup:
- **Auth Level:** `function` (requires function key)
- **Local Development:** Keys stored in `local.settings.json`

### For Production:
1. **Enable CORS** in `host.json`
```json
{
  "extensions": {
    "http": {
      "cors": {
        "allowedOrigins": ["https://your-frontend-domain.com"]
      }
    }
  }
}
```

2. **Implement Firebase Auth Middleware**
```typescript
// Verify Firebase token in each request
const token = req.headers.authorization?.split('Bearer ')[1];
const decodedToken = await admin.auth().verifyIdToken(token);
const userId = decodedToken.uid;
```

3. **Environment Variables**
Store secrets in Azure Key Vault:
- MongoDB connection string
- Azure OpenAI API key
- Azure Blob Storage connection string
- Firebase service account credentials

---

## 📦 Dependencies to Add

For the full MVP, you'll need:

```json
{
  "dependencies": {
    "@azure/functions": "^1.0.1-beta1",
    "@azure/storage-blob": "^12.x",           // File uploads
    "@azure/openai": "^1.x",                  // AI generation
    "firebase-admin": "^12.x",                // Auth verification
    "mongodb": "^6.x",                        // Database
    "pdf-parse": "^1.x",                      // PDF text extraction
    "dotenv": "^16.x",                        // Environment variables
    "axios": "^1.x"                           // HTTP requests
  },
  "devDependencies": {
    "@azure/functions": "^1.0.1-beta1",
    "npm-run-all": "^4.1.5",
    "typescript": "^3.3.3",
    "@types/node": "^20.x"
  }
}
```

---

## 🧪 Testing Strategy

### 1. **Local Testing**
```bash
# Start backend
cd thestudybuddy-backend
npm start

# In another terminal, test with curl
curl http://localhost:7071/api/HelloWorld?name=Test
```

### 2. **Unit Tests**
```bash
npm test
```

### 3. **Integration Tests**
- Test with frontend running on `localhost:5173`
- Ensure CORS is configured
- Test authentication flow

---

## 🌐 CORS Configuration

To allow frontend (localhost:5173) to call backend (localhost:7071):

**Update `host.json`:**
```json
{
  "version": "2.0",
  "extensions": {
    "http": {
      "routePrefix": "api",
      "cors": {
        "allowedOrigins": [
          "http://localhost:5173",
          "http://localhost:3000"
        ],
        "allowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allowedHeaders": ["Content-Type", "Authorization"]
      }
    }
  },
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[1.*, 2.0.0)"
  }
}
```

---

## 📊 Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                              │
│              React App (localhost:5173)                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Subjects    │  │  Flashcards  │  │     Chat     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Requests
                         │ (with Firebase Token)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│           Azure Functions (localhost:7071)                  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Subjects   │  │  Flashcards  │  │     Chat     │    │
│  │     API      │  │     API      │  │     API      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└───────┬──────────────────┬────────────────────┬────────────┘
        │                  │                    │
        ▼                  ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MongoDB    │  │ Azure Blob   │  │Azure OpenAI  │
│    Atlas     │  │   Storage    │  │   GPT-4.1    │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## ✨ Summary

✅ **Backend folder created:** `thestudybuddy-backend/`  
✅ **Azure Functions initialized** with TypeScript  
✅ **Sample function created:** `HelloWorld`  
✅ **Dependencies installed:** @azure/functions, typescript, npm-run-all  
✅ **Server running:** `http://localhost:7071`  
✅ **Hot reload enabled:** TypeScript watch mode active  

**You now have a working Azure Functions backend that's ready for Phase 4 development!** 🚀

---

## 🔮 What's Next

**Phase 4 Tasks:**
1. Set up MongoDB Atlas database
2. Create database schemas and models
3. Implement Subject Management APIs
4. Add Firebase Auth middleware
5. Integrate Azure Blob Storage for PDF uploads
6. Implement PDF text extraction
7. Integrate Azure OpenAI for flashcard generation
8. Build RAG system for AI chat
9. Create embeddings for vector search

**Phase 5 Tasks:**
1. Connect frontend to backend APIs
2. Replace localStorage with real database calls
3. Test end-to-end functionality
4. Deploy to Azure

---

**Setup Date:** November 22, 2025  
**Status:** ✅ Complete  
**Server:** Running at http://localhost:7071  
**Next Step:** MongoDB Atlas Setup & Database Schema Design

