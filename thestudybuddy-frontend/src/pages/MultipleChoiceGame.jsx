import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardApi, gameApi } from '../services/api';

export default function MultipleChoiceGame() {
  const { setId } = useParams();
  const navigate = useNavigate();
  
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  
  // Game state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(15);
  const [totalTime, setTotalTime] = useState(0);
  const [difficulty, setDifficulty] = useState(null);
  const [showingResult, setShowingResult] = useState(false);
  
  // Stats
  const [previousStats, setPreviousStats] = useState(null);
  const [savingResult, setSavingResult] = useState(false);
  const resultSavedRef = useRef(false);
  
  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);

  useEffect(() => {
    loadFlashcardSet();
    loadPreviousStats();
  }, [setId]);

  // Question timer
  useEffect(() => {
    if (gameStarted && !gameComplete && !showingResult && questionTimer > 0) {
      timerRef.current = setTimeout(() => {
        setQuestionTimer(prev => prev - 1);
      }, 1000);
    } else if (questionTimer === 0 && !showingResult) {
      // Time's up - mark as wrong
      handleAnswer(null);
    }
    return () => clearTimeout(timerRef.current);
  }, [gameStarted, gameComplete, questionTimer, showingResult]);

  // Total game timer
  useEffect(() => {
    if (gameStarted && !gameComplete) {
      totalTimerRef.current = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(totalTimerRef.current);
  }, [gameStarted, gameComplete]);

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

  const loadPreviousStats = async () => {
    try {
      const stats = await gameApi.getStats(setId, 'multiplechoice');
      setPreviousStats(stats);
    } catch (error) {
      console.error('Failed to load previous stats:', error);
    }
  };

  const generateQuestions = useCallback((numQuestions) => {
    if (!flashcardSet || flashcardSet.flashcards.length < 4) return [];

    const allCards = [...flashcardSet.flashcards];
    const shuffledCards = allCards.sort(() => Math.random() - 0.5);
    const selectedCards = shuffledCards.slice(0, Math.min(numQuestions, allCards.length));

    return selectedCards.map(card => {
      // Get 3 wrong answers from other cards
      const wrongAnswers = allCards
        .filter(c => c.front !== card.front)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.back);

      // Combine and shuffle all options
      const options = [card.back, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        question: card.front,
        correctAnswer: card.back,
        options,
      };
    });
  }, [flashcardSet]);

  const initializeGame = (diff) => {
    let numQuestions;
    let timePerQuestion;
    
    switch (diff) {
      case 'easy':
        numQuestions = 5;
        timePerQuestion = 20;
        break;
      case 'medium':
        numQuestions = 10;
        timePerQuestion = 15;
        break;
      case 'hard':
        numQuestions = 15;
        timePerQuestion = 10;
        break;
      default:
        numQuestions = 10;
        timePerQuestion = 15;
    }

    numQuestions = Math.min(numQuestions, flashcardSet.flashcards.length);
    const generatedQuestions = generateQuestions(numQuestions);

    setDifficulty(diff);
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectAnswers(0);
    setQuestionTimer(timePerQuestion);
    setTotalTime(0);
    setShowingResult(false);
    setGameComplete(false);
    setGameStarted(true);
    resultSavedRef.current = false;
  };

  const handleAnswer = (answer) => {
    if (showingResult) return;
    
    setSelectedAnswer(answer);
    setShowingResult(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      // Calculate score with time and streak bonuses
      const timeBonus = Math.floor(questionTimer * 10);
      const streakBonus = streak * 25;
      const basePoints = 100;
      const pointsEarned = basePoints + timeBonus + streakBonus;
      
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
      setMaxStreak(prev => Math.max(prev, streak + 1));
      setCorrectAnswers(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex + 1 >= questions.length) {
        // Game complete
        setGameComplete(true);
        saveGameResult(correct);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowingResult(false);
        // Reset timer based on difficulty
        const timePerQuestion = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 15 : 20;
        setQuestionTimer(timePerQuestion);
      }
    }, 1500);
  };

  const saveGameResult = async (lastAnswerCorrect) => {
    if (resultSavedRef.current) return;
    resultSavedRef.current = true;
    setSavingResult(true);

    const finalCorrect = correctAnswers + (lastAnswerCorrect ? 1 : 0);
    const accuracy = Math.round((finalCorrect / questions.length) * 100);
    const finalScore = score + (lastAnswerCorrect ? 100 + Math.floor(questionTimer * 10) + streak * 25 : 0);
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

    try {
      await gameApi.saveResult({
        flashcardSetId: setId,
        gameType: 'multiplechoice',
        score: finalScore,
        time: totalTime,
        moves: questions.length,
        difficulty,
        stars,
      });
      await loadPreviousStats();
    } catch (error) {
      console.error('Failed to save game result:', error);
    } finally {
      setSavingResult(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracy = () => {
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const getStars = () => {
    const accuracy = getAccuracy();
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    return 1;
  };

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
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
          <div className="gradient-blur-shape" style={{ background: 'linear-gradient(to top right, #8b5cf6, #a855f7)' }} />
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/games')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 flex items-center gap-2"
          >
            ← Back to Games
          </button>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">❓</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Time
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Playing with: <span className="font-semibold text-violet-600 dark:text-violet-400">{flashcardSet.name}</span>
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
                    <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{previousStats.bestScore}</span>
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
                    <p className="text-xs text-gray-500">Quizzes Taken</p>
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
              { id: 'easy', name: 'Easy', questions: 5, time: 20, color: 'from-green-400 to-emerald-500', desc: '5 questions • 20s each' },
              { id: 'medium', name: 'Medium', questions: 10, time: 15, color: 'from-yellow-400 to-orange-500', desc: '10 questions • 15s each' },
              { id: 'hard', name: 'Hard', questions: 15, time: 10, color: 'from-red-400 to-pink-500', desc: '15 questions • 10s each' },
            ].map(level => (
              <button
                key={level.id}
                onClick={() => initializeGame(level.id)}
                disabled={flashcardSet.flashcards.length < 4}
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
    const accuracy = getAccuracy();
    const stars = getStars();
    const isNewBestScore = previousStats && score > previousStats.bestScore;

    return (
      <div className="gradient-bg min-h-screen">
        <div aria-hidden="true" className="gradient-blur">
          <div className="gradient-blur-shape" style={{ background: 'linear-gradient(to top right, #8b5cf6, #a855f7)' }} />
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">
              {accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🎉' : '💪'}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {accuracy >= 90 ? 'Amazing!' : accuracy >= 70 ? 'Great Job!' : 'Keep Practicing!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You got {correctAnswers} out of {questions.length} correct
            </p>

            {/* New Record Badge */}
            {isNewBestScore && (
              <div className="mb-4 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                🏆 NEW HIGH SCORE!
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`rounded-xl p-4 ${isNewBestScore ? 'bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-400' : 'bg-violet-50 dark:bg-violet-900/20'}`}>
                <p className={`text-2xl font-bold ${isNewBestScore ? 'text-yellow-600' : 'text-violet-600 dark:text-violet-400'}`}>
                  {score}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Score {isNewBestScore && '🔥'}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {accuracy}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {maxStreak}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Best Streak</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatTime(totalTime)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
              </div>
            </div>

            {/* Previous Stats */}
            {previousStats && previousStats.totalGamesPlayed > 0 && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-semibold">Your Stats</p>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Quizzes Taken:</span>
                    <span className="ml-1 font-bold text-gray-900 dark:text-white">{previousStats.totalGamesPlayed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Best Score:</span>
                    <span className="ml-1 font-bold text-violet-600 dark:text-violet-400">{previousStats.bestScore}</span>
                  </div>
                </div>
              </div>
            )}

            {savingResult && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="animate-pulse">Saving your score...</span>
              </p>
            )}

            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => initializeGame(difficulty)}
                className="btn-primary bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  setGameStarted(false);
                  setGameComplete(false);
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

  // Quiz gameplay
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  const timerColor = questionTimer <= 5 ? 'text-red-500' : questionTimer <= 10 ? 'text-yellow-500' : 'text-emerald-500';
  const timerBg = questionTimer <= 5 ? 'bg-red-500' : questionTimer <= 10 ? 'bg-yellow-500' : 'bg-emerald-500';

  return (
    <div className="gradient-bg min-h-screen">
      <style>{`
        @keyframes correctPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          50% { box-shadow: 0 0 20px 10px rgba(16, 185, 129, 0.3); }
        }
        @keyframes wrongShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .correct-answer {
          animation: correctPulse 0.5s ease-out;
        }
        .wrong-answer {
          animation: wrongShake 0.5s ease-out;
        }
      `}</style>

      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" style={{ background: 'linear-gradient(to top right, #8b5cf6, #a855f7)' }} />
      </div>

      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/games')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
          >
            ← Exit
          </button>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold text-violet-600 dark:text-violet-400">
                {score}
              </p>
              <p className="text-xs text-gray-500">Score</p>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold text-orange-500">
                🔥 {streak}
              </p>
              <p className="text-xs text-gray-500">Streak</p>
            </div>
            {previousStats && previousStats.bestScore > 0 && (
              <div className="hidden sm:block text-center border-l border-gray-300 dark:border-gray-600 pl-4">
                <p className="text-lg font-bold text-yellow-500">
                  🏆 {previousStats.bestScore}
                </p>
                <p className="text-xs text-gray-500">High Score</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className={`font-mono font-bold ${timerColor}`}>{questionTimer}s</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-violet-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Timer bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full ${timerBg} transition-all duration-1000`}
              style={{ width: `${(questionTimer / (difficulty === 'hard' ? 10 : difficulty === 'medium' ? 15 : 20)) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl mb-6">
          <div className="text-center">
            <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold uppercase tracking-wide mb-2">
              What is the definition of...
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {currentQuestion.question}
            </h3>
          </div>
        </div>

        {/* Answer Options */}
        <div className="grid gap-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option === currentQuestion.correctAnswer;
            const showCorrect = showingResult && isCorrectAnswer;
            const showWrong = showingResult && isSelected && !isCorrectAnswer;

            return (
              <button
                key={index}
                onClick={() => !showingResult && handleAnswer(option)}
                disabled={showingResult}
                className={`
                  w-full p-4 md:p-5 rounded-xl text-left transition-all transform
                  ${showCorrect
                    ? 'bg-emerald-500 text-white correct-answer scale-[1.02]'
                    : showWrong
                      ? 'bg-red-500 text-white wrong-answer'
                      : isSelected
                        ? 'bg-violet-100 dark:bg-violet-900/50 border-2 border-violet-500'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-lg hover:scale-[1.01]'
                  }
                  ${!showingResult && 'active:scale-[0.99]'}
                `}
              >
                <div className="flex items-start gap-3">
                  <span className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${showCorrect || showWrong
                      ? 'bg-white/20 text-white'
                      : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                    }
                  `}>
                    {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + index)}
                  </span>
                  <p className={`
                    text-sm md:text-base flex-1
                    ${showCorrect || showWrong ? 'text-white' : 'text-gray-900 dark:text-white'}
                  `}>
                    {option}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showingResult && (
          <div className={`mt-4 p-4 rounded-xl text-center ${
            isCorrect 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            <p className="font-bold text-lg">
              {isCorrect ? '🎉 Correct!' : '😔 Not quite...'}
            </p>
            {isCorrect && streak > 1 && (
              <p className="text-sm mt-1">🔥 {streak} in a row!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

