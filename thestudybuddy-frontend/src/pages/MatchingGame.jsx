import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardApi, gameApi } from '../services/api';

export default function MatchingGame() {
  const { setId } = useParams();
  const navigate = useNavigate();
  
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameCards, setGameCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [incorrectPairs, setIncorrectPairs] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [difficulty, setDifficulty] = useState(null); // 'easy', 'medium', 'hard'
  const [gameStarted, setGameStarted] = useState(false);
  const [previousStats, setPreviousStats] = useState(null);
  const [savingResult, setSavingResult] = useState(false);
  const resultSavedRef = useRef(false);

  useEffect(() => {
    loadFlashcardSet();
    loadPreviousStats();
  }, [setId]);

  const loadPreviousStats = async () => {
    try {
      const stats = await gameApi.getStats(setId, 'matching');
      setPreviousStats(stats);
    } catch (error) {
      console.error('Failed to load previous stats:', error);
    }
  };

  const saveGameResult = async (score, stars) => {
    if (resultSavedRef.current) return; // Prevent duplicate saves
    resultSavedRef.current = true;
    setSavingResult(true);
    
    try {
      await gameApi.saveResult({
        flashcardSetId: setId,
        gameType: 'matching',
        score,
        time: timer,
        moves,
        difficulty,
        stars,
      });
      // Reload stats to show updated records
      await loadPreviousStats();
    } catch (error) {
      console.error('Failed to save game result:', error);
    } finally {
      setSavingResult(false);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && !gameComplete) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameComplete]);

  const loadFlashcardSet = async () => {
    try {
      const data = await flashcardApi.getSet(setId);
      setFlashcardSet(data);
    } catch (error) {
      console.error('Failed to load flashcard set:', error);
      navigate('/games');
    } finally {
      setLoading(false);
    }
  };

  const initializeGame = useCallback((diff) => {
    if (!flashcardSet) return;

    setDifficulty(diff);
    setGameStarted(true);
    setGameComplete(false);
    setMatchedPairs([]);
    setIncorrectPairs([]);
    setSelectedCards([]);
    setMoves(0);
    setTimer(0);
    resultSavedRef.current = false; // Reset for new game

    // Determine number of pairs based on difficulty
    let numPairs;
    switch (diff) {
      case 'easy': numPairs = 4; break;
      case 'medium': numPairs = 6; break;
      case 'hard': numPairs = 8; break;
      default: numPairs = 6;
    }

    // Limit pairs to available flashcards
    numPairs = Math.min(numPairs, flashcardSet.flashcards.length);

    // Shuffle and select flashcards
    const shuffledCards = [...flashcardSet.flashcards]
      .sort(() => Math.random() - 0.5)
      .slice(0, numPairs);

    // Create term and definition cards
    const cards = [];
    shuffledCards.forEach((card, index) => {
      cards.push({
        id: `term-${index}`,
        pairId: index,
        content: card.front,
        type: 'term',
      });
      cards.push({
        id: `def-${index}`,
        pairId: index,
        content: card.back,
        type: 'definition',
      });
    });

    // Shuffle all cards
    setGameCards(cards.sort(() => Math.random() - 0.5));
    setIsRunning(true);
  }, [flashcardSet]);

  const handleCardClick = (card) => {
    if (gameComplete) return;
    if (selectedCards.length >= 2) return;
    if (matchedPairs.includes(card.pairId)) return;
    
    // If card is already selected, deselect it
    if (selectedCards.find(c => c.id === card.id)) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
      return;
    }

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves(prev => prev + 1);

      const [first, second] = newSelected;
      
      // Must match term with definition (not same type)
      if (first.pairId === second.pairId && first.type !== second.type) {
        // Match found!
        setMatchedPairs(prev => [...prev, first.pairId]);
        setSelectedCards([]);

        // Check if game complete
        const totalPairs = gameCards.length / 2;
        if (matchedPairs.length + 1 === totalPairs) {
          setGameComplete(true);
          setIsRunning(false);
          
          // Calculate and save the game result
          const finalTimer = timer;
          const finalMoves = moves + 1; // Current move count
          const baseScore = 1000;
          const timePenalty = finalTimer * 2;
          const movePenalty = finalMoves * 10;
          const difficultyBonus = difficulty === 'hard' ? 500 : difficulty === 'medium' ? 250 : 0;
          const finalScore = Math.max(0, baseScore - timePenalty - movePenalty + difficultyBonus);
          const finalStars = finalScore >= 800 ? 3 : finalScore >= 500 ? 2 : 1;
          
          saveGameResult(finalScore, finalStars);
        }
      } else {
        // No match - show incorrect briefly
        setIncorrectPairs([first.id, second.id]);
        setShowIncorrect(true);
        setTimeout(() => {
          setSelectedCards([]);
          setIncorrectPairs([]);
          setShowIncorrect(false);
        }, 800);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScore = () => {
    const baseScore = 1000;
    const timePenalty = timer * 2;
    const movePenalty = moves * 10;
    const difficultyBonus = difficulty === 'hard' ? 500 : difficulty === 'medium' ? 250 : 0;
    return Math.max(0, baseScore - timePenalty - movePenalty + difficultyBonus);
  };

  const getStars = () => {
    const score = getScore();
    if (score >= 800) return 3;
    if (score >= 500) return 2;
    return 1;
  };

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!flashcardSet) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Flashcard set not found</p>
          <button onClick={() => navigate('/games')} className="btn-primary">
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  // Difficulty selection screen
  if (!gameStarted) {
    return (
      <div className="gradient-bg min-h-screen">
        <div aria-hidden="true" className="gradient-blur">
          <div className="gradient-blur-shape" style={{ background: 'linear-gradient(to top right, #10b981, #14b8a6)' }} />
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/games')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 flex items-center gap-2"
          >
            ← Back to Games
          </button>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Match Up
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Playing with: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{flashcardSet.name}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {flashcardSet.flashcards.length} cards available
            </p>
            
            {/* Previous Stats */}
            {previousStats && previousStats.totalGamesPlayed > 0 && (
              <div className="mt-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-semibold">Your Best</p>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{previousStats.bestScore}</span>
                    <p className="text-xs text-gray-500">Best Score</p>
                  </div>
                  {previousStats.bestTime && (
                    <div>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatTime(previousStats.bestTime)}</span>
                      <p className="text-xs text-gray-500">Best Time</p>
                    </div>
                  )}
                  <div>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{previousStats.totalGamesPlayed}</span>
                    <p className="text-xs text-gray-500">Games Played</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4">
              Select Difficulty
            </h3>

            {[
              { id: 'easy', name: 'Easy', pairs: 4, color: 'from-green-400 to-emerald-500', desc: '4 pairs • Great for warming up' },
              { id: 'medium', name: 'Medium', pairs: 6, color: 'from-yellow-400 to-orange-500', desc: '6 pairs • The classic challenge' },
              { id: 'hard', name: 'Hard', pairs: 8, color: 'from-red-400 to-pink-500', desc: '8 pairs • For memory masters' },
            ].map(level => (
              <button
                key={level.id}
                onClick={() => initializeGame(level.id)}
                disabled={flashcardSet.flashcards.length < level.pairs}
                className={`w-full p-6 rounded-2xl bg-gradient-to-r ${level.color} text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="text-xl font-bold">{level.name}</h4>
                    <p className="text-white/80 text-sm">{level.desc}</p>
                  </div>
                  <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}

            {flashcardSet.flashcards.length < 4 && (
              <p className="text-center text-amber-600 dark:text-amber-400 text-sm mt-4">
                ⚠️ You need at least 4 flashcards to play. Current set has {flashcardSet.flashcards.length}.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game complete screen
  if (gameComplete) {
    const stars = getStars();
    const score = getScore();
    const isNewBestScore = previousStats && score > previousStats.bestScore;
    const isNewBestTime = previousStats && previousStats.bestTime && timer < previousStats.bestTime;

    return (
      <div className="gradient-bg min-h-screen">
        <div aria-hidden="true" className="gradient-blur">
          <div className="gradient-blur-shape" style={{ background: 'linear-gradient(to top right, #10b981, #14b8a6)' }} />
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Congratulations!
            </h2>

            {/* New Record Badge */}
            {(isNewBestScore || isNewBestTime) && (
              <div className="mb-4 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                🏆 NEW PERSONAL BEST!
              </div>
            )}

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              <style>{`
                @keyframes starBounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-15px); }
                }
                .star-bounce-1 { animation: starBounce 1s ease-in-out infinite; animation-delay: 0s; }
                .star-bounce-2 { animation: starBounce 1s ease-in-out infinite; animation-delay: 0.15s; }
                .star-bounce-3 { animation: starBounce 1s ease-in-out infinite; animation-delay: 0.3s; }
              `}</style>
              {[1, 2, 3].map(star => (
                <span
                  key={star}
                  className={`text-5xl transition-all ${
                    star <= stars 
                      ? `text-yellow-400 star-bounce-${star}` 
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                >
                  ⭐
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`rounded-xl p-4 ${isNewBestTime ? 'bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-400' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                <p className={`text-3xl font-bold ${isNewBestTime ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatTime(timer)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Time {isNewBestTime && '🔥'}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {moves}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Moves</p>
              </div>
              <div className={`rounded-xl p-4 ${isNewBestScore ? 'bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-400' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
                <p className={`text-3xl font-bold ${isNewBestScore ? 'text-yellow-600 dark:text-yellow-400' : 'text-purple-600 dark:text-purple-400'}`}>
                  {score}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Score {isNewBestScore && '🔥'}
                </p>
              </div>
            </div>

            {/* Previous Stats */}
            {previousStats && previousStats.totalGamesPlayed > 0 && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-semibold">Your Stats</p>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Games Played:</span>
                    <span className="ml-1 font-bold text-gray-900 dark:text-white">{previousStats.totalGamesPlayed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Best Score:</span>
                    <span className="ml-1 font-bold text-purple-600 dark:text-purple-400">{previousStats.bestScore}</span>
                  </div>
                  {previousStats.bestTime && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Best Time:</span>
                      <span className="ml-1 font-bold text-emerald-600 dark:text-emerald-400">{formatTime(previousStats.bestTime)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Status */}
            {savingResult && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="animate-pulse">Saving your score...</span>
              </p>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => initializeGame(difficulty)}
                className="btn-primary bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  setGameStarted(false);
                  setDifficulty(null);
                }}
                className="btn-secondary"
              >
                Change Difficulty
              </button>
              <button
                onClick={() => navigate('/games')}
                className="btn-secondary"
              >
                Back to Games
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game board
  const gridCols = difficulty === 'hard' ? 'grid-cols-4' : difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-4';

  return (
    <div className="gradient-bg min-h-screen">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10% { transform: translateX(-8px) rotate(-2deg); }
          20% { transform: translateX(8px) rotate(2deg); }
          30% { transform: translateX(-8px) rotate(-2deg); }
          40% { transform: translateX(8px) rotate(2deg); }
          50% { transform: translateX(-6px) rotate(-1deg); }
          60% { transform: translateX(6px) rotate(1deg); }
          70% { transform: translateX(-4px) rotate(0deg); }
          80% { transform: translateX(4px) rotate(0deg); }
          90% { transform: translateX(-2px) rotate(0deg); }
        }
        
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes wrongPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { box-shadow: 0 0 20px 10px rgba(239, 68, 68, 0.4); }
        }
        
        .shake {
          animation: shake 0.6s ease-in-out, wrongPulse 0.6s ease-in-out;
        }
        
        .pop {
          animation: pop 0.3s ease-out;
        }
        
        .card-matched {
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%) !important;
          border-color: transparent !important;
        }
        
        .card-wrong {
          background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%) !important;
          border-color: #ef4444 !important;
        }
        
        .dark .card-wrong {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.4) 100%) !important;
        }
      `}</style>

      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" style={{ background: 'linear-gradient(to top right, #10b981, #14b8a6)' }} />
      </div>

      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/games')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
          >
            ← Exit
          </button>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white font-mono">
                {formatTime(timer)}
              </p>
              <p className="text-xs text-gray-500">Time</p>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {moves}
              </p>
              <p className="text-xs text-gray-500">Moves</p>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {matchedPairs.length}/{gameCards.length / 2}
              </p>
              <p className="text-xs text-gray-500">Matched</p>
            </div>
            {previousStats && previousStats.bestScore > 0 && (
              <div className="hidden sm:flex items-center gap-3 border-l border-gray-300 dark:border-gray-600 pl-4 md:pl-6">
                <div className="text-center">
                  <p className="text-lg md:text-xl font-bold text-yellow-500">
                    🏆 {previousStats.bestScore}
                  </p>
                  <p className="text-xs text-gray-500">High Score</p>
                </div>
                {previousStats.bestTime && (
                  <div className="text-center">
                    <p className="text-lg md:text-xl font-bold text-yellow-500">
                      ⏱️ {formatTime(previousStats.bestTime)}
                    </p>
                    <p className="text-xs text-gray-500">Best Time</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => initializeGame(difficulty)}
            className="btn-secondary text-sm"
          >
            Restart
          </button>
        </div>

        {/* Game Board */}
        <div className="max-w-4xl mx-auto">
          <div className={`grid ${gridCols} gap-3 md:gap-4`}>
            {gameCards.map(card => {
              const isSelected = selectedCards.find(c => c.id === card.id);
              const isMatched = matchedPairs.includes(card.pairId);
              const isIncorrect = incorrectPairs.includes(card.id);

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  disabled={isMatched || showIncorrect}
                  className={`
                    relative p-4 md:p-6 rounded-xl text-center transition-all transform
                    ${isMatched 
                      ? 'card-matched text-white scale-95 opacity-80' 
                      : isIncorrect
                        ? 'card-wrong border-2 border-red-500 shake scale-105'
                        : isSelected 
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-500 shadow-lg scale-105 pop'
                          : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                    }
                    min-h-[100px] md:min-h-[120px]
                  `}
                >
                  {/* Card type indicator */}
                  <div className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isMatched 
                      ? 'bg-white/20 text-white' 
                      : isIncorrect
                        ? 'bg-red-600 text-white'
                        : card.type === 'term'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>
                    {isIncorrect ? '✗' : card.type === 'term' ? 'Term' : 'Def'}
                  </div>

                  <p className={`text-sm md:text-base font-medium mt-4 line-clamp-4 ${
                    isMatched ? 'text-white' : isIncorrect ? 'text-red-800 dark:text-red-200' : 'text-gray-900 dark:text-white'
                  }`}>
                    {card.content}
                  </p>

                  {isMatched && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          Match each term with its definition
        </p>
      </div>
    </div>
  );
}

