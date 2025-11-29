# 🧪 Complete Local Testing Guide

## Quick Start (5 Minutes)

### Terminal 1 - Backend:
```bash
cd thestudybuddy-backend
npm run start
```
Wait for: `✅ MongoDB connected successfully.`

### Terminal 2 - Frontend:
```bash
cd thestudybuddy-frontend
npm run dev
```
Wait for: `Local: http://localhost:5174/`

### Browser:
Open: **http://localhost:5174/test-backend**

---

## 🎯 Testing Checklist

### Step 1: Verify Backend is Running ✅

**Expected:** Backend running on `http://localhost:7071`

**Test:**
```bash
curl http://localhost:7071/api/subjects
```

**Should return:** `[]` (empty array) or existing subjects

**If fails:**
- Check MongoDB connection string in `.env.local`
- Verify MongoDB Atlas allows your IP
- Check console for errors

---

### Step 2: Verify Frontend is Running ✅

**Expected:** Frontend running on `http://localhost:5174`

**Test:** Open `http://localhost:5174` in browser

**Should see:** Your landing page

**If fails:**
- Port 5174 might be in use (Vite will try 5175)
- Check console for errors
- Try `npm install` in frontend folder

---

### Step 3: Test Backend Connection ✅

**Test Page:** `http://localhost:5174/test-backend`

You should see:
- ✅ Connection status showing "Backend: http://localhost:7071"
- ✅ Create subject form
- ✅ Empty subjects list (or existing subjects)

---

### Step 4: Test Create Subject ✅

On the test page:

1. Enter subject name: "Biology 101"
2. Pick a color
3. Click "Create Subject"

**Expected:**
- ✅ Subject appears in the list below
- ✅ Shows MongoDB `_id`
- ✅ Shows creation date
- ✅ Has colored dot

**If fails:**
- Check browser console (F12) for errors
- Check backend terminal for error logs
- Verify CORS is not blocking (should see request in backend logs)

---

### Step 5: Verify in MongoDB Atlas ✅

1. Go to MongoDB Atlas dashboard
2. Click "Database" → "Browse Collections"
3. Should see:
   - Database: `studybuddy`
   - Collection: `subjects`
   - Your created subject document

**Example document:**
```json
{
  "_id": ObjectId("674..."),
  "userId": "test-user",
  "name": "Biology 101",
  "color": "#3B82F6",
  "createdAt": ISODate("2025-11-22...")
}
```

---

### Step 6: Test Delete Subject ✅

On the test page:

1. Click "Delete" button on a subject

**Expected:**
- ✅ Subject disappears from list
- ✅ Removed from MongoDB

---

## 🔧 Common Issues & Fixes

### Issue: "Failed to fetch subjects"

**Cause:** Backend not running or wrong URL

**Fix:**
```bash
# Check backend is running:
curl http://localhost:7071/api/subjects

# Should return JSON, not error
```

---

### Issue: CORS Error in Browser Console

**Error:** `Access to fetch at 'http://localhost:7071/api/subjects' from origin 'http://localhost:5174' has been blocked by CORS`

**Fix:** Backend should already have CORS configured, but if not:

Create `local.settings.json` in backend root:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  },
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

Then restart backend.

---

### Issue: "MongoDB connection error"

**Cause:** Wrong credentials or network access

**Fix:**
1. Check `.env.local` has correct MongoDB URI
2. Go to MongoDB Atlas → Network Access
3. Add your IP address or use `0.0.0.0/0` (allow all) for testing
4. Verify username/password are URL-encoded

---

### Issue: Port 7071 already in use

**Cause:** Another Azure Functions instance running

**Fix:**
```bash
# Find and kill process on port 7071 (macOS):
lsof -ti:7071 | xargs kill -9

# Then restart backend
npm run start
```

---

### Issue: Backend shows "userId: undefined"

**Cause:** Firebase Auth not implemented yet

**This is expected!** The backend is configured to work with Firebase auth, but we haven't connected it yet. For now, the backend uses a placeholder user ID.

**Temporary fix:** Backend should still work for testing.

---

## 📊 What You're Testing

### Data Flow:

```
Browser (localhost:5174)
    ↓ HTTP POST
Azure Functions (localhost:7071)
    ↓ Mongoose
MongoDB Atlas (Cloud)
    ↓ Success
Azure Functions
    ↓ JSON Response
Browser (Updates UI)
```

### Files Involved:

**Frontend:**
- `src/services/api.ts` - API service layer
- `src/pages/TestBackend.jsx` - Test UI
- `src/App.jsx` - Route configuration

**Backend:**
- `src/functions/SubjectsHttp.ts` - Azure Function handlers
- `src/shared/repos/MongoSubjectRepository.ts` - MongoDB operations
- `src/models/Subject.ts` - Mongoose schema
- `src/db/connectMongo.ts` - Database connection

---

## 🎯 Success Criteria

You've successfully tested everything when:

- ✅ Backend starts without errors
- ✅ Frontend starts without errors
- ✅ Test page loads at `/test-backend`
- ✅ Can create a subject
- ✅ Subject appears in list
- ✅ Subject visible in MongoDB Atlas
- ✅ Can delete a subject
- ✅ No console errors

---

## 🚀 Next Steps After Testing

Once everything works:

1. **Connect real Firebase Auth** - Replace placeholder userId
2. **Add Notes API** - Create MongoDB model and repository for notes
3. **Add Flashcards API** - Create MongoDB model and repository for flashcards
4. **Integrate Azure Blob Storage** - For file uploads
5. **Add Azure OpenAI** - For flashcard generation
6. **Connect real UI pages** - Replace mock data in Dashboard, Subjects, etc.

---

## 📝 Testing Commands Reference

```bash
# Start backend (in thestudybuddy-backend/)
npm run start

# Start frontend (in thestudybuddy-frontend/)
npm run dev

# Build backend
npm run build

# Test backend API directly
curl http://localhost:7071/api/subjects

# Create subject via curl
curl -X POST http://localhost:7071/api/subjects \
  -H "Content-Type: application/json" \
  -d '{"name":"Biology 101","color":"#A3C1FF"}'
```

---

## 🎓 Understanding the Stack

### Frontend (React + Vite):
- **Port:** 5174
- **Purpose:** User interface
- **Tech:** React, TailwindCSS, React Router

### Backend (Azure Functions):
- **Port:** 7071
- **Purpose:** API endpoints, business logic
- **Tech:** TypeScript, Azure Functions, Mongoose

### Database (MongoDB Atlas):
- **Location:** Cloud
- **Purpose:** Persistent data storage
- **Tech:** MongoDB

All three must be running for full-stack testing! 🚀
