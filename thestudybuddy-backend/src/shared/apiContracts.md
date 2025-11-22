# API Contracts for The Study Buddy Backend

This document defines the HTTP API contracts for all endpoints.

## Authentication

All endpoints accept an optional `Authorization` header:
```
Authorization: Bearer <firebase-id-token>
```

**Current behavior:** Stubbed to return `dev-user-id` for local development.  
**Future:** Will verify Firebase ID tokens using firebase-admin SDK.

---

## Subjects API

### GET /api/subjects
**Description:** List all subjects for the current user

**Request:**
- Method: GET
- Headers: Authorization (optional for now)

**Response:**
- Status: 200 OK
- Body: `Subject[]`

**Example:**
```json
[
  {
    "_id": "uuid-123",
    "name": "Biology 101",
    "color": "#4f46e5",
    "userId": "dev-user-id",
    "createdAt": "2025-11-22T20:00:00.000Z"
  }
]
```

---

### POST /api/subjects
**Description:** Create a new subject

**Request:**
- Method: POST
- Headers: Authorization (optional for now), Content-Type: application/json
- Body:
```json
{
  "name": "string",
  "color": "string"
}
```

**Response:**
- Status: 201 Created
- Body: `Subject`

**Errors:**
- 400 Bad Request if `name` or `color` is missing

---

### GET /api/subjects/{id}
**Description:** Get a single subject by ID

**Request:**
- Method: GET
- Path parameter: `id` (subject ID)
- Headers: Authorization (optional for now)

**Response:**
- Status: 200 OK
- Body: `Subject`

**Errors:**
- 404 Not Found if subject doesn't exist or doesn't belong to user

---

### PUT /api/subjects/{id}
**Description:** Update a subject

**Request:**
- Method: PUT
- Path parameter: `id` (subject ID)
- Headers: Authorization (optional for now), Content-Type: application/json
- Body:
```json
{
  "name": "string (optional)",
  "color": "string (optional)"
}
```

**Response:**
- Status: 200 OK
- Body: Updated `Subject`

**Errors:**
- 404 Not Found if subject doesn't exist or doesn't belong to user

---

### DELETE /api/subjects/{id}
**Description:** Delete a subject

**Request:**
- Method: DELETE
- Path parameter: `id` (subject ID)
- Headers: Authorization (optional for now)

**Response:**
- Status: 204 No Content

**Note:** Currently doesn't cascade delete notes/flashcards (TODO)

---

## Notes API

### GET /api/notes/{subjectId}
**Description:** List all notes for a subject

**Request:**
- Method: GET
- Path parameter: `subjectId`
- Headers: Authorization (optional for now)

**Response:**
- Status: 200 OK
- Body: `Note[]`

**Example:**
```json
[
  {
    "_id": "uuid-456",
    "fileName": "chapter1.pdf",
    "blobUrl": "https://example.com/dev/dev-user-id/subject-id/chapter1.pdf",
    "textUrl": null,
    "subjectId": "uuid-123",
    "userId": "dev-user-id",
    "uploadedAt": "2025-11-22T20:05:00.000Z"
  }
]
```

---

### POST /api/notes/upload
**Description:** Upload a PDF note

**Request:**
- Method: POST
- Headers: Authorization (optional for now), Content-Type: multipart/form-data
- Form fields:
  - `subjectId`: string
  - `file`: PDF file

**Response:**
- Status: 201 Created
- Body: `Note`

**Errors:**
- 400 Bad Request if `subjectId` or `file` is missing
- 400 Bad Request if file is not a PDF

**Note:** Currently uses placeholder blob URLs. Will be replaced with real Azure Blob Storage upload.

---

### DELETE /api/notes/delete/{id}
**Description:** Delete a note

**Request:**
- Method: DELETE
- Path parameter: `id` (note ID)
- Headers: Authorization (optional for now)

**Response:**
- Status: 204 No Content

**Note:** Currently doesn't delete blob storage or flashcards (TODO)

---

## Flashcards API

### GET /api/flashcards/{subjectId}
**Description:** Get all flashcards for a subject

**Request:**
- Method: GET
- Path parameter: `subjectId`
- Headers: Authorization (optional for now)

**Response:**
- Status: 200 OK
- Body: `Flashcard[]`

**Example:**
```json
[
  {
    "_id": "uuid-789",
    "question": "What is photosynthesis?",
    "answer": "The process by which plants convert light into energy...",
    "subjectId": "uuid-123",
    "noteId": "uuid-456",
    "userId": "dev-user-id",
    "createdAt": "2025-11-22T20:10:00.000Z"
  }
]
```

---

### POST /api/flashcards/generate
**Description:** Generate flashcards from a note using AI

**Request:**
- Method: POST
- Headers: Authorization (optional for now), Content-Type: application/json
- Body:
```json
{
  "noteId": "string",
  "subjectId": "string"
}
```

**Response:**
- Status: 201 Created
- Body: `Flashcard[]`

**Errors:**
- 400 Bad Request if `noteId` or `subjectId` is missing
- 404 Not Found if note doesn't exist
- 400 Bad Request if note doesn't belong to subject

**Note:** Currently generates dummy flashcards. Will be replaced with Azure OpenAI integration.

---

## AI Chat API

### POST /api/ai/chat
**Description:** Chat with AI about a subject's notes

**Request:**
- Method: POST
- Headers: Authorization (optional for now), Content-Type: application/json
- Body:
```json
{
  "subjectId": "string",
  "message": "string",
  "chatHistory": [
    {
      "role": "user | assistant",
      "content": "string"
    }
  ]
}
```

**Response:**
- Status: 200 OK
- Body:
```json
{
  "reply": "string"
}
```

**Errors:**
- 400 Bad Request if `subjectId` or `message` is missing

**Note:** Currently returns stubbed responses. Will be replaced with RAG (Retrieval Augmented Generation) using Azure OpenAI.

---

## Error Responses

All errors return a JSON object with a `message` field:

```json
{
  "message": "Human-readable error description"
}
```

### Status Codes:
- **200 OK** - Successful read/update
- **201 Created** - Successful creation
- **204 No Content** - Successful deletion
- **400 Bad Request** - Invalid/missing fields
- **401 Unauthorized** - Invalid or missing auth token (future)
- **403 Forbidden** - Resource doesn't belong to user (future)
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## Data Types

### Subject
```typescript
{
  _id: string;        // UUID
  name: string;
  color: string;      // e.g. "#4f46e5" or "bg-blue-500"
  userId: string;     // Firebase UID
  createdAt: string;  // ISO 8601 timestamp
}
```

### Note
```typescript
{
  _id: string;
  fileName: string;
  blobUrl: string;
  textUrl?: string | null;
  subjectId: string;
  userId: string;
  uploadedAt: string;  // ISO 8601 timestamp
}
```

### Flashcard
```typescript
{
  _id: string;
  question: string;
  answer: string;
  subjectId: string;
  noteId: string;
  userId: string;
  createdAt: string;  // ISO 8601 timestamp
}
```

### ChatMessage
```typescript
{
  role: "user" | "assistant";
  content: string;
}
```

---

## Future Enhancements

### Planned Integrations:
1. **Firebase Auth** - Real token verification
2. **Azure Blob Storage** - Real file uploads for PDFs and extracted text
3. **Azure Document Intelligence** - PDF text extraction
4. **Azure OpenAI** - Flashcard generation and RAG chat
5. **MongoDB Atlas** - Replace in-memory repositories

### Additional Endpoints (Potential):
- `PUT /api/flashcards/{id}` - Update a flashcard
- `DELETE /api/flashcards/{id}` - Delete a flashcard
- `GET /api/subjects/{id}/stats` - Get subject statistics
- `POST /api/notes/{id}/extract-text` - Trigger text extraction

