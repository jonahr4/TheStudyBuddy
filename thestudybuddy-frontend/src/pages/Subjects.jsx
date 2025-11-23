import { useState } from 'react';
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
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h2>My Subjects</h2>
          <button onClick={handleCreateClick} className="btn-primary">
            + Create New Subject
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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading subjects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject.id} className="card hover:shadow-xl transition-shadow">
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
                <p className="text-gray-500 mb-4">No subjects yet. Create your first subject to get started!</p>
                <button onClick={handleCreateClick} className="btn-primary">
                  + Create New Subject
                </button>
              </div>
            )}
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
