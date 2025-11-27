import { createContext, useContext, useState, useEffect } from 'react';
import { subjectApi } from '../services/api';
import { useAuth } from '../firebase/AuthContext';

const SubjectContext = createContext({});

export const useSubjects = () => {
  const context = useContext(SubjectContext);
  if (!context) {
    throw new Error('useSubjects must be used within a SubjectProvider');
  }
  return context;
};

// Predefined color options for subjects
export const SUBJECT_COLORS = [
  { name: 'Green', class: 'bg-green-500', hex: '#10b981' },
  { name: 'Blue', class: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'Purple', class: 'bg-purple-500', hex: '#a855f7' },
  { name: 'Red', class: 'bg-red-500', hex: '#ef4444' },
  { name: 'Yellow', class: 'bg-yellow-500', hex: '#eab308' },
  { name: 'Pink', class: 'bg-pink-500', hex: '#ec4899' },
  { name: 'Indigo', class: 'bg-indigo-500', hex: '#6366f1' },
  { name: 'Orange', class: 'bg-orange-500', hex: '#f97316' },
];

// Helper to convert hex color to Tailwind class
const hexToTailwindClass = (hex) => {
  const colorMap = {
    '#10b981': 'bg-green-500',
    '#3b82f6': 'bg-blue-500',
    '#a855f7': 'bg-purple-500',
    '#ef4444': 'bg-red-500',
    '#eab308': 'bg-yellow-500',
    '#ec4899': 'bg-pink-500',
    '#6366f1': 'bg-indigo-500',
    '#f97316': 'bg-orange-500',
  };
  return colorMap[hex.toLowerCase()] || 'bg-blue-500';
};

// Helper to convert Tailwind class to hex
const tailwindClassToHex = (className) => {
  const color = SUBJECT_COLORS.find(c => c.class === className);
  return color ? color.hex : '#3b82f6';
};

export function SubjectProvider({ children }) {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subjects when user changes (login/logout)
  useEffect(() => {
    if (currentUser) {
      fetchSubjects();
    } else {
      // Clear subjects when logged out
      setSubjects([]);
      setLoading(false);
    }
  }, [currentUser]); // Re-run when currentUser changes

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subjectApi.getAll();
      
      // Transform API data to include Tailwind classes and counts
      const transformedSubjects = data.map(subject => ({
        ...subject,
        color: hexToTailwindClass(subject.color),
        noteCount: subject.noteCount || 0,
        deckCount: subject.flashcardCount || 0,
      }));
      
      setSubjects(transformedSubjects);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new subject
  const createSubject = async (subjectData) => {
    try {
      const hex = tailwindClassToHex(subjectData.color);
      const newSubject = await subjectApi.create({
        name: subjectData.name,
        color: hex,
      });
      
      // Transform and add to state
      const transformedSubject = {
        ...newSubject,
        color: hexToTailwindClass(newSubject.color),
        noteCount: 0,
        deckCount: 0,
      };
      
      setSubjects(prev => [...prev, transformedSubject]);
      return transformedSubject;
    } catch (err) {
      console.error('Failed to create subject:', err);
      throw err;
    }
  };

  // Update an existing subject
  const updateSubject = async (id, updates) => {
    try {
      const hex = updates.color ? tailwindClassToHex(updates.color) : undefined;
      const updateData = {
        ...updates,
        color: hex,
      };
      
      const updatedSubject = await subjectApi.update(id, updateData);
      
      // Transform and update state
      const transformedSubject = {
        ...updatedSubject,
        color: hexToTailwindClass(updatedSubject.color),
      };
      
      setSubjects(prev =>
        prev.map(subject =>
          subject.id === id ? { ...subject, ...transformedSubject } : subject
        )
      );
      
      return transformedSubject;
    } catch (err) {
      console.error('Failed to update subject:', err);
      throw err;
    }
  };

  // Delete a subject
  const deleteSubject = async (id) => {
    try {
      await subjectApi.delete(id);
      setSubjects(prev => prev.filter(subject => subject.id !== id));
    } catch (err) {
      console.error('Failed to delete subject:', err);
      throw err;
    }
  };

  // Get a single subject by ID
  const getSubject = (id) => {
    return subjects.find(subject => subject.id === id);
  };

  const value = {
    subjects,
    loading,
    error,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubject,
    refetch: fetchSubjects,
  };

  return (
    <SubjectContext.Provider value={value}>
      {children}
    </SubjectContext.Provider>
  );
}

