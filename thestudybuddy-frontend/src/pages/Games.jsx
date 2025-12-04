import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../contexts/SubjectContext';
import { flashcardApi } from '../services/api';

export default function Games() {
  const navigate = useNavigate();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);

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
          allSets.push(...response.map(set => ({ 
            ...set, 
            subjectName: subject.name, 
            subjectColor: subject.color 
          })));
        }
        setFlashcardSets(allSets);
      } else {
        const response = await flashcardApi.getBySubject(selectedSubject);
        const subject = subjects.find(s => s.id === selectedSubject);
        setFlashcardSets(response.map(set => ({ 
          ...set, 
          subjectName: subject?.name, 
          subjectColor: subject?.color 
        })));
      }
    } catch (error) {
      console.error('Failed to load flashcard sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const games = [
    {
      id: 'matching',
      name: 'Match Up',
      description: 'Match terms with their definitions against the clock',
      icon: '🎯',
      gradient: 'from-emerald-500 to-teal-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-teal-700',
    },
    {
      id: 'quiz',
      name: 'Quiz Time',
      description: 'Multiple choice questions to test your knowledge',
      icon: '❓',
      gradient: 'from-violet-500 to-purple-600',
      hoverGradient: 'hover:from-violet-600 hover:to-purple-700',
    },
  ];

  const handlePlayGame = (gameId) => {
    if (!selectedSet) {
      alert('Please select a flashcard set first!');
      return;
    }
    navigate(`/games/${gameId}/${selectedSet._id}`);
  };

  if (subjectsLoading) {
    return (
      <div className="gradient-bg h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 mx-auto mb-4"></div>
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
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Subjects Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create subjects and flashcards to start playing games!
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
        <div className="gradient-blur-shape" style={{ background: 'linear-gradient(to top right, #10b981, #8b5cf6)' }} />
      </div>

      <div className="h-full w-full flex flex-col p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Study Games
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Test your knowledge with fun, interactive games
            </p>
          </div>

          {/* Subject Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedSet(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                selectedSubject === 'all'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
              }`}
            >
              All Subjects
            </button>
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => {
                  setSelectedSubject(subject.id);
                  setSelectedSet(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all inline-flex items-center gap-2 ${
                  selectedSubject === subject.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject.color }}
                />
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            {/* Flashcard Set Selection */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📚</span>
                Select Flashcard Set
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading sets...</p>
                </div>
              ) : flashcardSets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🃏</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                    No flashcard sets available
                  </p>
                  <a href="/flashcards" className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline">
                    Create flashcards →
                  </a>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {flashcardSets.map(set => (
                    <button
                      key={set._id}
                      onClick={() => setSelectedSet(set)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        selectedSet?._id === set._id
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 shadow-md'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: set.subjectColor }}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {set.subjectName}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {set.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {set.flashcards.length} cards
                          </p>
                        </div>
                        {selectedSet?._id === set._id && (
                          <div className="text-emerald-600 dark:text-emerald-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Game Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-xl">🎮</span>
                Choose a Game
              </h3>

              {games.map(game => (
                <button
                  key={game.id}
                  onClick={() => handlePlayGame(game.id)}
                  disabled={!selectedSet}
                  className={`w-full text-left p-6 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-br ${game.gradient} ${game.hoverGradient} shadow-lg hover:shadow-xl`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{game.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-1">
                        {game.name}
                      </h4>
                      <p className="text-white/80 text-sm">
                        {game.description}
                      </p>
                    </div>
                    <div className="text-white/60">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}

              {!selectedSet && (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
                  👆 Select a flashcard set to start playing
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

