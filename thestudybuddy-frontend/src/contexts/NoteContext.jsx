import { createContext, useContext, useState, useEffect } from 'react';
import { noteApi } from '../services/api';

const NoteContext = createContext();

export function NoteProvider({ children }) {
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  /**
   * Fetch notes for a specific subject
   */
  const fetchNotesBySubject = async (subjectId) => {
    setLoading((prev) => ({ ...prev, [subjectId]: true }));
    setError(null);

    try {
      const fetchedNotes = await noteApi.getBySubject(subjectId);
      setNotes((prev) => ({ ...prev, [subjectId]: fetchedNotes }));
      return fetchedNotes;
    } catch (err) {
      setError(err.message || 'Failed to fetch notes');
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, [subjectId]: false }));
    }
  };

  /**
   * Upload a new note with actual PDF file
   */
  const uploadNote = async (file, subjectId) => {
    setError(null);

    try {
      // Create FormData with the actual file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subjectId', subjectId);

      // Get auth token
      const { auth } = await import('../firebase/config');
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';

      // Get API base URL from environment or use production default
      // @ts-ignore - Vite env variables
      const API_BASE_URL = import.meta.env?.VITE_API_URL || 'https://api.thestudybuddy.app';

      // Send multipart/form-data request
      const response = await fetch(`${API_BASE_URL}/notes/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData, // Don't set Content-Type, browser will set it with boundary
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const newNote = await response.json();
      
      // Add the new note to the state
      setNotes((prev) => ({
        ...prev,
        [subjectId]: [newNote, ...(prev[subjectId] || [])],
      }));

      return newNote;
    } catch (err) {
      setError(err.message || 'Failed to upload note');
      throw err;
    }
  };

  /**
   * Delete a note
   */
  const deleteNote = async (noteId, subjectId) => {
    setError(null);

    try {
      await noteApi.delete(noteId);

      // Remove the note from state
      setNotes((prev) => ({
        ...prev,
        [subjectId]: (prev[subjectId] || []).filter((note) => note.id !== noteId),
      }));

      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete note');
      throw err;
    }
  };

  /**
   * Get notes for a specific subject from state
   */
  const getNotesForSubject = (subjectId) => {
    return notes[subjectId] || [];
  };

  const value = {
    notes,
    loading,
    error,
    fetchNotesBySubject,
    uploadNote,
    deleteNote,
    getNotesForSubject,
  };

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
}
