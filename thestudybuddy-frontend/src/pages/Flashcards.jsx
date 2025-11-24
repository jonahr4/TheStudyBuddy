import { useState, useEffect } from 'react';
import { useSubjects } from '../contexts/SubjectContext';
import { flashcardApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Flashcards() {
  const { subjects, loading: subjectsLoading } = useSubjects();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSetData, setNewSetData] = useState({
    subjectId: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    loadFlashcardSets();
  }, [selectedSubject, subjects]);

  const loadFlashcardSets = async () => {
    if (subjects.length === 0) return;
    
    setLoading(true);
    try {
      if (selectedSubject === 'all') {
        const allSets = [];
        for (const subject of subjects) {
          const response = await flashcardApi.getBySubject(subject.id);
          allSets.push(...response.map(set => ({ ...set, subjectName: subject.name, subjectColor: subject.color })));
        }
        setFlashcardSets(allSets);
      } else {
        const response = await flashcardApi.getBySubject(selectedSubject);
        const subject = subjects.find(s => s.id === selectedSubject);
        setFlashcardSets(response.map(set => ({ ...set, subjectName: subject?.name, subjectColor: subject?.color })));
      }
    } catch (error) {
      console.error('Failed to load flashcard sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = async (e) => {
    e.preventDefault();
    if (!newSetData.subjectId || !newSetData.name.trim()) return;

    setCreating(true);
    try {
      await flashcardApi.generate({
        subjectId: newSetData.subjectId,
        name: newSetData.name,
        description: newSetData.description,
      });

      setNewSetData({ subjectId: '', name: '', description: '' });
      setShowCreateModal(false);
      await loadFlashcardSets();
    } catch (error) {
      console.error('Failed to create flashcard set:', error);
      alert('Failed to create flashcard set: ' + (error.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSet = async (setId) => {
    if (!confirm('Delete this flashcard set?')) return;

    try {
      await flashcardApi.deleteSet(setId);
      await loadFlashcardSets();
    } catch (error) {
      console.error('Failed to delete flashcard set:', error);
      alert('Failed to delete flashcard set');
    }
  };

  if (subjectsLoading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="gradient-bg min-h-screen">
        <div className="gradient-blur">
          <div className="gradient-blur-shape" />
        </div>
        <div className="p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Subjects Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a subject and upload notes to generate flashcards!
            </p>
            <a href="/subjects" className="btn-primary inline-block">
              Go to Subjects
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen">
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2>Flashcards</h2>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              + Create Flashcard Set
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                selectedSubject === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              All Subjects
            </button>
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedSubject === subject.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: subject.color }}
                ></div>
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading flashcard sets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcardSets.map(set => (
              <div key={set._id} className="card hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: set.subjectColor }}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {set.subjectName}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {set.name}
                  </h4>
                  {set.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {set.description}
                    </p>
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{set.flashcards.length} cards</span>
                    <span>{new Date(set.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/flashcards/study/${set._id}`)}
                    className="btn-primary flex-1"
                  >
                    Study
                  </button>
                  <button 
                    onClick={() => handleDeleteSet(set._id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {flashcardSets.length === 0 && !loading && (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">🃏</div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No flashcard sets yet.
                </p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Your First Set
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create Flashcard Set
            </h3>
            
            <form onSubmit={handleCreateSet}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <select
                  value={newSetData.subjectId}
                  onChange={(e) => setNewSetData({ ...newSetData, subjectId: e.target.value })}
                  required
                  className="input"
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Set Name *
                </label>
                <input
                  type="text"
                  value={newSetData.name}
                  onChange={(e) => setNewSetData({ ...newSetData, name: e.target.value })}
                  placeholder="e.g., Chapter 5 Review"
                  required
                  className="input"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Focus (Optional)
                </label>
                <textarea
                  value={newSetData.description}
                  onChange={(e) => setNewSetData({ ...newSetData, description: e.target.value })}
                  placeholder="What topics should these flashcards focus on?"
                  rows={3}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to cover all topics from your notes
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSetData({ subjectId: '', name: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary disabled:opacity-50"
                  disabled={creating}
                >
                  {creating ? 'Generating...' : 'Generate Flashcards'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
