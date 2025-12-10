/**
 * ================================
 *  FIXED API SERVICE (FINAL VERSION)
 * ================================
 *
 * Key changes:
 * - Correct Azure API URL
 * - No /api prefix duplication
 * - Handles Firebase auth delays
 * - Works for production + local dev
 */

// IMPORTANT: production must define VITE_API_URL in .env.production
// Example:
// VITE_API_URL=https://thestudybuddy-api-b0ahd5hcfzerh6h4.eastus-01.azurewebsites.net

const API_BASE_URL =
  (import.meta.env?.VITE_API_URL || "https://thestudybuddy-api-b0ahd5hcfzerh6h4.eastus-01.azurewebsites.net")
    .replace(/\/+$/, ""); // remove trailing slash

/**
 * Try to fetch Firebase Auth token.
 * Includes a tiny retry because React often renders before Firebase loads.
 */
async function getAuthToken() {
  try {
    const { auth } = await import("../firebase/config");

    // retry for 500ms total if auth.currentUser is null on initial load
    for (let i = 0; i < 5; i++) {
      if (auth.currentUser) break;
      await new Promise(res => setTimeout(res, 100));
    }

    const user = auth.currentUser;
    if (!user) return null;

    return await user.getIdToken();
  } catch (err) {
    console.error("Failed to retrieve auth token:", err);
    return null;
  }
}

/**
 * Make authenticated API request.
 */
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(errorJson.message || `HTTP ${res.status}`);
    }

    if (res.status === 204) return null;
    return res.json();

  } catch (err) {
    console.error(`API request failed: ${url}`, err);
    throw err;
  }
}

/* -------------------------------
   SUBJECT API
   ------------------------------- */
export const subjectApi = {
  getAll: () => apiRequest("/subjects"),
  getById: (id: string) => apiRequest(`/subjects/${id}`),
  create: (data: { name: string; color: string }) =>
    apiRequest("/subjects", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiRequest(`/subjects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiRequest(`/subjects/${id}`, { method: "DELETE" }),
};

/* -------------------------------
   NOTES API
   ------------------------------- */
export const noteApi = {
  getBySubject: (subjectId: string) => apiRequest(`/notes/${subjectId}`),
  upload: (data: any) =>
    apiRequest("/notes/upload", { method: "POST", body: JSON.stringify(data) }),
  delete: (noteId: string) =>
    apiRequest(`/notes/delete/${noteId}`, { method: "DELETE" }),
};

/* -------------------------------
   CHAT API
   ------------------------------- */
export const chatApi = {
  getStats: () => apiRequest(`/chat/stats`),
  sendMessage: (data: any) =>
    apiRequest(`/ai/chat`, { method: "POST", body: JSON.stringify(data) }),
  getHistory: (subjectId: string, limit?: number) =>
    apiRequest(`/chat/history/${subjectId}${limit ? `?limit=${limit}` : ""}`),
  clearHistory: (subjectId: string) =>
    apiRequest(`/chat/history/${subjectId}`, { method: "DELETE" }),
};

/* -------------------------------
   TEXT EXTRACTION
   ------------------------------- */
export const textExtractionApi = {
  processNote: (data: any) =>
    apiRequest(`/process-text`, { method: "POST", body: JSON.stringify(data) }),
};

/* -------------------------------
   FLASHCARDS
   ------------------------------- */
export const flashcardApi = {
  getAll: () => apiRequest(`/flashcards`),
  getBySubject: (subjectId: string) => apiRequest(`/flashcards/${subjectId}`),
  getSet: (setId: string) => apiRequest(`/flashcards/set/${setId}`),
  generate: (data: any) =>
    apiRequest(`/flashcards/generate`, { method: "POST", body: JSON.stringify(data) }),
  deleteSet: (setId: string) =>
    apiRequest(`/flashcards/set/${setId}`, { method: "DELETE" }),
  updateStudied: (setId: string, cardIndex: number, studied: boolean) =>
    apiRequest(`/flashcards/set/${setId}/card/${cardIndex}/studied`, {
      method: "PATCH",
      body: JSON.stringify({ studied }),
    }),
  // Edit flashcards methods
  updateSet: (setId: string, data: { name?: string; description?: string; flashcards?: any[] }) =>
    apiRequest(`/flashcards/set/${setId}`, { method: "PUT", body: JSON.stringify(data) }),
  addCard: (setId: string, card: { front: string; back: string }) =>
    apiRequest(`/flashcards/set/${setId}/card`, { method: "POST", body: JSON.stringify(card) }),
  updateCard: (setId: string, cardIndex: number, card: { front?: string; back?: string }) =>
    apiRequest(`/flashcards/set/${setId}/card/${cardIndex}`, { method: "PUT", body: JSON.stringify(card) }),
  deleteCard: (setId: string, cardIndex: number) =>
    apiRequest(`/flashcards/set/${setId}/card/${cardIndex}`, { method: "DELETE" }),
};

/* -------------------------------
   USER
   ------------------------------- */
export const userApi = {
  syncUser: (userData: any) =>
    apiRequest(`/users/sync`, { method: "POST", body: JSON.stringify(userData) }),
  getCurrentUser: () => apiRequest(`/users/me`),
  updateUser: (data: any) =>
    apiRequest(`/users/me`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteUser: () => apiRequest(`/users/me`, { method: "DELETE" }),
};

/* -------------------------------
   YOUTUBE
   ------------------------------- */
export const youtubeApi = {
  getRecommendations: (query: string, maxResults = 6) =>
    apiRequest(`/youtube/recommendations?query=${encodeURIComponent(query)}&maxResults=${maxResults}`),

  generateSearchTerms: (subjectId: string, subjectName: string) =>
    apiRequest(`/youtube/generate-search-terms`, {
      method: "POST",
      body: JSON.stringify({ subjectId, subjectName }),
    }),
};

/* -------------------------------
   REPORTS
   ------------------------------- */
export const reportApi = {
  submit: (data: any) =>
    apiRequest(`/reports`, { method: "POST", body: JSON.stringify(data) }),
  getAll: () => apiRequest(`/reports`),
};

/* -------------------------------
   VERSION UPDATES
   ------------------------------- */
export const versionUpdatesApi = {
  getAll: () => apiRequest(`/version-updates`),
  getLatest: () => apiRequest(`/version-updates/latest`),
};

/* -------------------------------
   GAMES
   ------------------------------- */
export const gameApi = {
  saveResult: (data: {
    flashcardSetId: string;
    gameType: string;
    score: number;
    time: number;
    moves: number;
    difficulty: string;
    stars: number;
  }) => apiRequest(`/games/results`, { method: "POST", body: JSON.stringify(data) }),
  
  getStats: (flashcardSetId: string, gameType = 'matching') =>
    apiRequest(`/games/stats/${flashcardSetId}?gameType=${gameType}`),
  
  getAllStats: () => apiRequest(`/games/stats`),
  
  getRecentResults: (limit = 10) => apiRequest(`/games/recent?limit=${limit}`),
};
