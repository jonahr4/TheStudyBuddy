import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSubjects } from '../contexts/SubjectContext';
import SubjectModal from '../components/SubjectModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Subjects() {
  const { subjects, loading, error, createSubject, updateSubject, deleteSubject } = useSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCreateClick = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
    setActionError(null);
  };

  const handleEditClick = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
    setActionError(null);
  };

  const handleDeleteClick = (subject) => {
    setDeletingSubject(subject);
    setActionError(null);
  };

  const handleSave = async (subjectData) => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      if (editingSubject) {
        // Update existing subject
        await updateSubject(editingSubject.id, subjectData);
      } else {
        // Create new subject
        await createSubject(subjectData);
      }
      
      setIsModalOpen(false);
      setEditingSubject(null);
    } catch (err) {
      setActionError(err.message || 'Failed to save subject');
      console.error('Error saving subject:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingSubject) {
      try {
        setActionLoading(true);
        setActionError(null);
        await deleteSubject(deletingSubject.id);
        setDeletingSubject(null);
      } catch (err) {
        setActionError(err.message || 'Failed to delete subject');
        console.error('Error deleting subject:', err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="gradient-bg h-full w-full overflow-hidden">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="h-full w-full flex flex-col p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">My Subjects</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Organize your study materials by subject</p>
          </div>
          <button onClick={handleCreateClick} className="btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Subject
          </button>
        </div>

        {/* Error Alert */}
        {(error || actionError) && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">
              {actionError || error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading subjects...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-6">
          {subjects.map(subject => (
            <div key={subject.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${subject.color}`}></div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {subject.name}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditClick(subject)}
                    className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 transition-colors"
                    title="Edit subject"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(subject)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                    title="Delete subject"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📄 {subject.noteCount} notes uploaded
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🃏 {subject.deckCount} flashcard decks
                </p>
              </div>

              <div className="flex gap-3">
                <Link 
                  to={`/subjects/${subject.id}`} 
                  className="btn-primary flex-1 text-center"
                >
                  Manage Notes
                </Link>
                <Link 
                  to={`/flashcards?subject=${subject.id}`}
                  className="btn-secondary flex-1 text-center"
                >
                  Study
                </Link>
              </div>
            </div>
          ))}

            {/* Empty state if no subjects */}
            {subjects.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-5xl mb-4">📚</div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">No subjects yet. Create your first subject to get started!</p>
                <button onClick={handleCreateClick} className="btn-primary">
                  + Create New Subject
                </button>
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSave}
        subject={editingSubject}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingSubject}
        onClose={() => !actionLoading && setDeletingSubject(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deletingSubject?.name}"? This will also delete all associated notes and flashcards. This action cannot be undone.`}
        confirmText={actionLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
        disabled={actionLoading}
      />
    </div>
  );
}
