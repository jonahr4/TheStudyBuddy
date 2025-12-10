import { useState, useEffect } from 'react';
import { useSubjects } from '../contexts/SubjectContext';
import { flashcardApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { trackFlashcardSetCreated } from '../services/analytics';

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
    difficulty: 'medium',
    cardCount: '10-15',
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          const setsWithSubject = response.map(set => ({
            ...set,
            subjectName: subject.name,
            subjectColor: subject.color
          }));
          console.log('Subject:', subject.name, 'Color:', subject.color);
          allSets.push(...setsWithSubject);
        }
        console.log('All flashcard sets with colors:', allSets);
        setFlashcardSets(allSets);
      } else {
        const response = await flashcardApi.getBySubject(selectedSubject);
        const subject = subjects.find(s => s.id === selectedSubject);
        console.log('Selected subject:', subject?.name, 'Color:', subject?.color);
        const setsWithSubject = response.map(set => ({
          ...set,
          subjectName: subject?.name,
          subjectColor: subject?.color
        }));
        console.log('Flashcard sets with colors:', setsWithSubject);
        setFlashcardSets(setsWithSubject);
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
      const result = await flashcardApi.generate({
        subjectId: newSetData.subjectId,
        name: newSetData.name,
        description: newSetData.description,
        difficulty: newSetData.difficulty,
        cardCount: newSetData.cardCount,
      });

      // Track flashcard set creation
      const cardCountNumbers = newSetData.cardCount.split('-').map(Number);
      const estimatedCardCount = cardCountNumbers[1] || cardCountNumbers[0] || 10;
      trackFlashcardSetCreated(
        newSetData.subjectId,
        newSetData.name,
        estimatedCardCount,
        newSetData.difficulty
      );

      setNewSetData({ subjectId: '', name: '', description: '', difficulty: 'medium', cardCount: '10-15' });
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
      <div className="gradient-bg h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="gradient-bg h-full w-full overflow-hidden">
        <div className="gradient-blur">
          <div className="gradient-blur-shape" />
        </div>
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-center">
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
    <div className="gradient-bg h-full w-full overflow-hidden">
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="h-full w-full flex flex-col p-4 md:p-6">
        <div className="mb-4 flex-shrink-0">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Flashcards</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Study with AI-generated flashcards</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Set
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                selectedSubject === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
              }`}
            >
              All Subjects
            </button>
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all inline-flex items-center gap-2 ${
                  selectedSubject === subject.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${subject.color || 'bg-indigo-500'}`} />
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading flashcard sets...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-6">
            {flashcardSets.map(set => (
              <div key={set._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-2xl shadow-sm">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${set.subjectColor || 'bg-indigo-500'}`} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {set.subjectName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {set.name}
                    </h4>
                    {set.difficulty && (
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        set.difficulty === 'easy'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : set.difficulty === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {set.difficulty.charAt(0).toUpperCase() + set.difficulty.slice(1)}
                      </span>
                    )}
                  </div>
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
                <div className="text-5xl mb-4">🃏</div>
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSetData({ ...newSetData, difficulty: 'easy' })}
                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      newSetData.difficulty === 'easy'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Easy
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSetData({ ...newSetData, difficulty: 'medium' })}
                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      newSetData.difficulty === 'medium'
                        ? 'bg-yellow-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSetData({ ...newSetData, difficulty: 'hard' })}
                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      newSetData.difficulty === 'hard'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Hard
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Number of Cards
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSetData({ ...newSetData, cardCount: '5-10' })}
                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      newSetData.cardCount === '5-10'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    5-10
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSetData({ ...newSetData, cardCount: '10-15' })}
                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      newSetData.cardCount === '10-15'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    10-15
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSetData({ ...newSetData, cardCount: '15-20' })}
                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      newSetData.cardCount === '15-20'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    15-20
                  </button>
                </div>
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
                    setNewSetData({ subjectId: '', name: '', description: '', difficulty: 'medium', cardCount: '10-15' });
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
