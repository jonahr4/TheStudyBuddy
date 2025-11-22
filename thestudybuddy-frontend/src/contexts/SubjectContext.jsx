import { createContext, useContext, useState, useEffect } from 'react';

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

export function SubjectProvider({ children }) {
  // Initialize subjects from localStorage or use default mock data
  const [subjects, setSubjects] = useState(() => {
    const stored = localStorage.getItem('studybuddy_subjects');
    if (stored) {
      return JSON.parse(stored);
    }
    // Default mock data
    return [
      { id: 1, name: 'Biology 101', color: 'bg-green-500', noteCount: 5, deckCount: 3, createdAt: new Date().toISOString() },
      { id: 2, name: 'Calculus II', color: 'bg-blue-500', noteCount: 8, deckCount: 5, createdAt: new Date().toISOString() },
      { id: 3, name: 'World History', color: 'bg-purple-500', noteCount: 3, deckCount: 2, createdAt: new Date().toISOString() },
      { id: 4, name: 'Chemistry', color: 'bg-red-500', noteCount: 0, deckCount: 0, createdAt: new Date().toISOString() },
    ];
  });

  // Persist to localStorage whenever subjects change
  useEffect(() => {
    localStorage.setItem('studybuddy_subjects', JSON.stringify(subjects));
  }, [subjects]);

  // Create a new subject
  const createSubject = (subjectData) => {
    const newSubject = {
      id: Date.now(), // Simple ID generation (will be replaced by backend)
      name: subjectData.name,
      color: subjectData.color || 'bg-blue-500',
      noteCount: 0,
      deckCount: 0,
      createdAt: new Date().toISOString(),
    };
    setSubjects(prev => [...prev, newSubject]);
    return newSubject;
  };

  // Update an existing subject
  const updateSubject = (id, updates) => {
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === id
          ? { ...subject, ...updates, updatedAt: new Date().toISOString() }
          : subject
      )
    );
  };

  // Delete a subject
  const deleteSubject = (id) => {
    setSubjects(prev => prev.filter(subject => subject.id !== id));
  };

  // Get a single subject by ID
  const getSubject = (id) => {
    return subjects.find(subject => subject.id === parseInt(id));
  };

  const value = {
    subjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubject,
  };

  return (
    <SubjectContext.Provider value={value}>
      {children}
    </SubjectContext.Provider>
  );
}

