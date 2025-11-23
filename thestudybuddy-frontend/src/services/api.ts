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
 * Example usage in a React component:
 * 
 * import { subjectApi, noteApi } from './services/api';
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
 * // Update a subject
 * await subjectApi.update(subjectId, { name: "Biology 102" });
 * 
 * // Delete a subject
 * await subjectApi.delete(subjectId);
 * 
 * // Get notes for a subject
 * const notes = await noteApi.getBySubject(subjectId);
 * 
 * // Upload note
 * const note = await noteApi.upload({
 *   fileName: "Chapter1.pdf",
 *   fileSize: 1024000,
 *   subjectId: subjectId
 * });
 * 
 * // Delete note
 * await noteApi.delete(noteId);
 */
