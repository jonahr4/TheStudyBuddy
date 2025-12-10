import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import app from '../firebase/config';
import { analyticsApi } from './api';

// Initialize Firebase Analytics
let analytics = null;
try {
  analytics = getAnalytics(app);
  console.log('Firebase Analytics initialized');
} catch (error) {
  console.warn('Firebase Analytics not available:', error);
}

// Track session start time
let sessionStartTime = Date.now();
let pagesVisited = [];
let actionsPerformed = 0;

// Internal API for backend tracking
const trackToBackend = async (eventType, metadata = {}) => {
  try {
    await analyticsApi.track({
      eventType,
      metadata,
    });
  } catch (error) {
    console.error('Failed to track to backend:', error);
  }
};

// Firebase Analytics tracking
const trackToFirebase = (eventName, params = {}) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (error) {
      console.error('Firebase Analytics error:', error);
    }
  }
};

// Combined tracking function
export const trackEvent = (eventName, params = {}) => {
  // Track to Firebase
  trackToFirebase(eventName, params);

  // Track to backend
  trackToBackend(eventName, params);

  actionsPerformed++;
};

// Initialize user tracking
export const initializeUserTracking = (userId, userEmail) => {
  if (analytics) {
    try {
      setUserId(analytics, userId);
      setUserProperties(analytics, {
        user_id: userId,
        email: userEmail,
      });
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }
};

// Session tracking
export const startSession = () => {
  sessionStartTime = Date.now();
  pagesVisited = [];
  actionsPerformed = 0;

  trackEvent('session_start');
  trackToFirebase('session_start', {
    timestamp: new Date().toISOString(),
  });
};

export const endSession = () => {
  const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);

  trackToBackend('session_end', {
    duration: sessionDuration,
    pagesVisited,
    actionsPerformed,
  });

  trackToFirebase('session_end', {
    duration: sessionDuration,
    pages_visited: pagesVisited.length,
    actions_performed: actionsPerformed,
  });
};

// Page view tracking
export const trackPageView = (pageName, pageTitle) => {
  pagesVisited.push(pageName);

  trackToBackend('page_visit', {
    page: pageName,
    title: pageTitle,
  });

  trackToFirebase('page_view', {
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pageName,
  });
};

// Feature-specific tracking
export const trackLogin = () => {
  trackEvent('login');
  trackToFirebase('login', {
    method: 'firebase_auth',
  });
};

export const trackChatMessage = (subjectId) => {
  trackEvent('chat_message', { subjectId });
  trackToFirebase('chat_message_sent', { subject_id: subjectId });
};

export const trackNoteUpload = (subjectId, fileName, fileType) => {
  trackEvent('note_uploaded', { subjectId, fileName, fileType });
  trackToFirebase('note_uploaded', {
    subject_id: subjectId,
    file_name: fileName,
    file_type: fileType,
  });
};

export const trackFlashcardSetCreated = (subjectId, setName, cardCount, difficulty) => {
  trackEvent('flashcard_set_created', {
    subjectId,
    setName,
    cardCount,
    difficulty,
  });
  trackToFirebase('flashcard_set_created', {
    subject_id: subjectId,
    card_count: cardCount,
    difficulty,
  });
};

export const trackFlashcardStudied = (setId, cardIndex) => {
  trackEvent('flashcard_studied', { setId, cardIndex });
  trackToFirebase('flashcard_studied', {
    set_id: setId,
  });
};

export const trackGamePlayed = (gameType, setId, score, duration) => {
  trackEvent('game_played', { gameType, setId, score, duration });
  trackToFirebase('game_completed', {
    game_type: gameType,
    set_id: setId,
    score,
    duration,
  });
};

export const trackSubjectCreated = (subjectName, color) => {
  trackEvent('subject_created', { subjectName, color });
  trackToFirebase('subject_created', {
    subject_name: subjectName,
  });
};

// Button/Action tracking
export const trackButtonClick = (buttonName, location) => {
  trackToFirebase('button_click', {
    button_name: buttonName,
    location,
  });
  actionsPerformed++;
};

// Error tracking
export const trackError = (errorType, errorMessage, context) => {
  trackToFirebase('error', {
    error_type: errorType,
    error_message: errorMessage,
    context,
  });
};

// Get user analytics from backend
export const getUserAnalytics = async () => {
  try {
    const response = await analyticsApi.getMe();
    return response;
  } catch (error) {
    console.error('Failed to get user analytics:', error);
    return null;
  }
};

// Sync current counts
export const syncAnalyticsCounts = async () => {
  try {
    await analyticsApi.syncCounts();
  } catch (error) {
    console.error('Failed to sync analytics counts:', error);
  }
};

export default {
  trackEvent,
  initializeUserTracking,
  startSession,
  endSession,
  trackPageView,
  trackLogin,
  trackChatMessage,
  trackNoteUpload,
  trackFlashcardSetCreated,
  trackFlashcardStudied,
  trackGamePlayed,
  trackSubjectCreated,
  trackButtonClick,
  trackError,
  getUserAnalytics,
  syncAnalyticsCounts,
};
