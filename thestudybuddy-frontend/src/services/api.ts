/**
 * API Service for calling backend Azure Functions
 * Base URL points to local Azure Functions during development
 */

// @ts-ignore - Vite env variables
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:7071/api';

/**
 * Get Firebase Auth token from current user
 */
async function getAuthToken() {
  // Import Firebase auth
  const { auth } = await import('../firebase/config');
  const user = auth.currentUser;
  
  if (user) {
    // Get fresh token from Firebase
    return await user.getIdToken();
  }
  
  return '';
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * Subject API calls
 */
export const subjectApi = {
  // Get all subjects for current user
  getAll: async () => {
    return apiRequest('/subjects');
  },

  // Get single subject by ID
  getById: async (id: string) => {
    return apiRequest(`/subjects/${id}`);
  },

  // Create new subject
  create: async (data: { name: string; color: string }) => {
    return apiRequest('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update subject
  update: async (id: string, data: { name?: string; color?: string }) => {
    return apiRequest(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete subject
  delete: async (id: string) => {
    return apiRequest(`/subjects/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Note API calls
 */
export const noteApi = {
  // Get all notes for a subject
  getBySubject: async (subjectId: string) => {
    return apiRequest(`/notes/${subjectId}`);
  },

  // Upload note metadata (file will be uploaded to Azure Blob Storage separately)
  upload: async (data: { fileName: string; fileSize: number; subjectId: string }) => {
    return apiRequest('/notes/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete note
  delete: async (noteId: string) => {
    return apiRequest(`/notes/delete/${noteId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Chat API calls
 */
export const chatApi = {
  // Send chat message to AI
  sendMessage: async (data: { 
    subjectId: string; 
    message: string; 
    chatHistory?: Array<{ role: string; content: string }> 
  }) => {
    return apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get chat history for a subject
  getHistory: async (subjectId: string, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest(`/chat/history/${subjectId}${params}`);
  },

  // Clear chat history for a subject
  clearHistory: async (subjectId: string) => {
    return apiRequest(`/chat/history/${subjectId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Text Extraction API calls
 */
export const textExtractionApi = {
  // Trigger text extraction for a note
  processNote: async (data: { noteId: string; blobUrl: string }) => {
    return apiRequest('/process-text', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Flashcard API calls
 */
export const flashcardApi = {
  // Get all flashcard sets for a subject
  getBySubject: async (subjectId: string) => {
    return apiRequest(`/flashcards/${subjectId}`);
  },

  // Get a specific flashcard set
  getSet: async (setId: string) => {
    return apiRequest(`/flashcards/set/${setId}`);
  },

  // Generate flashcards using AI
  generate: async (data: { 
    subjectId: string; 
    name: string; 
    description?: string 
  }) => {
    return apiRequest('/flashcards/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete a flashcard set
  deleteSet: async (setId: string) => {
    return apiRequest(`/flashcards/set/${setId}`, {
      method: 'DELETE',
    });
  },

  // Update studied status of a flashcard
  updateStudied: async (setId: string, cardIndex: number, studied: boolean) => {
    return apiRequest(`/flashcards/set/${setId}/card/${cardIndex}/studied`, {
      method: 'PATCH',
      body: JSON.stringify({ studied }),
    });
  },
};

/**
 * Example usage in a React component:
 * 
 * import { subjectApi, noteApi, chatApi } from './services/api';
 * 
 * // Get all subjects
 * const subjects = await subjectApi.getAll();
 * 
 * // Create a subject
 * const newSubject = await subjectApi.create({
 *   name: "Biology 101",
 *   color: "#A3C1FF"
 * });
 * 
 * // Send chat message
 * const response = await chatApi.sendMessage({
 *   subjectId: "123",
 *   message: "What is photosynthesis?",
 *   chatHistory: []
 * });
 */
