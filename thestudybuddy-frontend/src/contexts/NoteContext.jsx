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
   * Upload a new note
   */
  const uploadNote = async (fileName, fileSize, subjectId) => {
    setError(null);

    try {
      const newNote = await noteApi.upload({ fileName, fileSize, subjectId });
      
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
