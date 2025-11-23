# MongoDB Integration Setup - Testing Guide

## ✅ What We Just Built

### Files Created:
1. **`src/db/connectMongo.ts`** - MongoDB connection handler
2. **`src/models/Subject.ts`** - Subject schema/model (TypeScript)
3. **`src/routes/subjects.ts`** - REST API endpoints for subjects
4. **`server.ts`** - Express server with MongoDB integration

### What Each File Does:

#### 1. `connectMongo.ts`
- Connects to MongoDB Atlas using Mongoose
- Uses connection string from `.env.local`
- Creates/uses database named "studybuddy"
- Exits if connection fails

#### 2. `Subject.ts` (Model)
- Defines structure of a Subject document
- Fields: `userId`, `name`, `color`, `createdAt`
- Mongoose converts this to a MongoDB collection called "subjects"
- Provides methods: `.create()`, `.find()`, `.findById()`, etc.

#### 3. `subjects.ts` (Routes)
- **POST /api/subjects** - Create new subject
- **GET /api/subjects?userId=xxx** - Get all subjects for a user
- **GET /api/subjects/:id** - Get single subject by ID
- Handles validation and error responses

#### 4. `server.ts` (Main Server)
- Sets up Express web server
- Connects middleware (CORS, JSON parser, logger)
- Registers routes
- Connects to MongoDB then starts listening on port 3000

---

## 🚀 How to Test

### Step 1: Configure MongoDB Connection

Edit `.env.local` and replace placeholders with your actual MongoDB Atlas credentials:

```bash
MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.fn2juzm.mongodb.net/?appName=Cluster0"
```

**Where to get credentials:**
1. Go to MongoDB Atlas dashboard
2. Click "Database Access" → find your username
3. Reset password if needed
4. Copy connection string and replace `<username>` and `<password>`

### Step 2: Start the Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully.
🚀 Server running on http://localhost:3000
📝 API docs: http://localhost:3000/
🎯 Test endpoint: POST http://localhost:3000/api/subjects
```

### Step 3: Test with Postman/Thunder Client/curl

#### Test 1: Health Check
```bash
GET http://localhost:3000/
```

Expected response:
```json
{
  "message": "Study Buddy API is running",
  "timestamp": "2025-11-22T...",
  "mongodb": "connected"
}
```

#### Test 2: Create a Subject
```bash
POST http://localhost:3000/api/subjects
Content-Type: application/json

{
  "userId": "demo-user-123",
  "name": "Biology 101",
  "color": "#A3C1FF"
}
```

Expected response (201 Created):
```json
{
  "_id": "674123abc456def789...",
  "userId": "demo-user-123",
  "name": "Biology 101",
  "color": "#A3C1FF",
  "createdAt": "2025-11-22T19:30:00.000Z",
  "__v": 0
}
```

#### Test 3: Get All Subjects for a User
```bash
GET http://localhost:3000/api/subjects?userId=demo-user-123
```

Expected response (200 OK):
```json
[
  {
    "_id": "674123abc456def789...",
    "userId": "demo-user-123",
    "name": "Biology 101",
    "color": "#A3C1FF",
    "createdAt": "2025-11-22T19:30:00.000Z",
    "__v": 0
  }
]
```

#### Test 4: Get Single Subject
```bash
GET http://localhost:3000/api/subjects/674123abc456def789
```

---

## 🎯 Verify in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Database" → "Browse Collections"
3. You should see:
   - Database: `studybuddy`
   - Collection: `subjects`
   - Documents: Your created subjects

---

## 🔍 What's Happening Under the Hood

### Request Flow Example:

**User Action:** POST to create a subject

```
Client (Postman)
    ↓
Express Server (port 3000)
    ↓
CORS Middleware (checks origin)
    ↓
JSON Parser (converts body to object)
    ↓
Logger (prints "POST /api/subjects")
    ↓
Router (matches /api/subjects)
    ↓
subjects.ts POST handler
    ↓
Subject.create() - Mongoose method
    ↓
MongoDB Driver
    ↓
MongoDB Atlas (studybuddy database)
    ↓
Document inserted with _id
    ↓
Response sent back to client
```

### MongoDB Document Structure:

When you create a subject, MongoDB stores:
```javascript
{
  _id: ObjectId("674123..."),  // Auto-generated unique ID
  userId: "demo-user-123",      // From request body
  name: "Biology 101",          // From request body
  color: "#A3C1FF",             // From request body or default
  createdAt: ISODate("2025..."), // Auto-generated timestamp
  __v: 0                        // Mongoose version key
}
```

---

## 🐛 Troubleshooting

### Error: "Mongo connection error"
- Check `.env.local` has correct MongoDB URI
- Verify username/password are correct
- Check MongoDB Atlas network access (allow your IP)

### Error: "Port 3000 already in use"
- Another process is using port 3000
- Change PORT in .env.local or stop other process

### Error: "Cannot find module"
- Run `npm install` to install dependencies
- Check file paths are correct

### TypeScript errors
- Run `npm run build` to compile TypeScript
- Check tsconfig.json is configured correctly

---

## 📚 Next Steps

Once basic MongoDB integration works:

1. ✅ **Add User Model** - Store Firebase user info
2. ✅ **Add Notes Model** - Store note metadata (fileName, blobUrl, etc.)
3. ✅ **Add Flashcards Model** - Store AI-generated flashcards
4. ✅ **Add Note Upload Route** - Connect to Azure Blob Storage
5. ✅ **Add Firebase Auth Middleware** - Verify user tokens
6. ✅ **Add Flashcard Generation** - Integrate Azure OpenAI

---

## 🎓 Key Concepts Explained

### Mongoose vs MongoDB Driver
- **MongoDB Driver**: Low-level, more code, flexible
- **Mongoose**: High-level, schemas, validation, cleaner code
- We use Mongoose for easier development

### Schema vs Model
- **Schema**: Blueprint (defines structure)
- **Model**: Factory (creates/queries documents)
- `SubjectSchema` → `Subject` model → `subjects` collection

### REST API Conventions
- **POST** - Create new resource
- **GET** - Read/retrieve resources
- **PUT/PATCH** - Update existing resource
- **DELETE** - Remove resource

### Status Codes
- **200 OK** - Success (GET requests)
- **201 Created** - Success (POST create)
- **400 Bad Request** - Invalid input
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server problem

---

## ✅ Success Checklist

- [ ] `.env.local` configured with MongoDB URI
- [ ] Server starts without errors
- [ ] Can create a subject via POST request
- [ ] Can retrieve subjects via GET request
- [ ] Subject appears in MongoDB Atlas dashboard
- [ ] Server logs requests in console

Once all checked, **MongoDB integration is working!** 🎉

---

## 📞 Need Help?

Common issues:
1. MongoDB connection string format
2. Firewall/network access in Atlas
3. Environment variable not loaded
4. TypeScript compilation errors

Check server console logs for detailed error messages.
