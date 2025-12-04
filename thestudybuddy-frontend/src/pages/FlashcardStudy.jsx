import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardApi } from '../services/api';

export default function FlashcardStudy() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState('');
  const [showStudied, setShowStudied] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    loadFlashcardSet();
  }, [setId]);

  const loadFlashcardSet = async () => {
    setLoading(true);
    try {
      const data = await flashcardApi.getSet(setId);
      setFlashcardSet(data);
    } catch (error) {
      console.error('Failed to load flashcard set:', error);
      alert('Failed to load flashcard set');
      navigate('/flashcards');
    } finally {
      setLoading(false);
    }
  };

  const getActiveCards = () => {
    if (!flashcardSet) return [];
    return showStudied 
      ? flashcardSet.flashcards.filter(card => card.studied)
      : flashcardSet.flashcards.filter(card => !card.studied);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePrevious = () => {
    const activeCards = getActiveCards();
    if (currentIndex > 0) {
      setSlideDirection('slide-right');
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsFlipped(false);
        setSlideDirection('');
      }, 300);
    }
  };

  const handleNext = () => {
    const activeCards = getActiveCards();
    if (currentIndex < activeCards.length - 1) {
      setSlideDirection('slide-left');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        setSlideDirection('');
      }, 300);
    }
  };

  const handleMarkStudied = async (studied) => {
    if (!flashcardSet) return;
    
    const activeCards = getActiveCards();
    const actualIndex = flashcardSet.flashcards.indexOf(activeCards[currentIndex]);
    
    try {
      // Trigger exit animation
      setIsExiting(true);
      
      // Update on backend
      const updatedSet = await flashcardApi.updateStudied(setId, actualIndex, studied);
      
      // Wait for animation to complete
      setTimeout(() => {
        setFlashcardSet(updatedSet);
        setIsExiting(false);
        
        // Adjust current index if needed
        const newActiveCards = studied 
          ? updatedSet.flashcards.filter(card => !card.studied)
          : updatedSet.flashcards.filter(card => card.studied);
        
        if (newActiveCards.length === 0) {
          setCurrentIndex(0);
        } else if (currentIndex >= newActiveCards.length) {
          setCurrentIndex(newActiveCards.length - 1);
        }
        
        setIsFlipped(false);
      }, 300);
    } catch (error) {
      console.error('Failed to update studied status:', error);
      setIsExiting(false);
      alert('Failed to update card status');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, flashcardSet]);

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (!flashcardSet || flashcardSet.flashcards.length === 0) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🃏</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No flashcards found</p>
          <button onClick={() => navigate('/flashcards')} className="btn-primary">
            Back to Flashcards
          </button>
        </div>
      </div>
    );
  }

  const activeCards = getActiveCards();
  
  if (activeCards.length === 0) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {showStudied ? 'No studied cards yet' : 'All cards studied!'}
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => setShowStudied(!showStudied)} 
              className="btn-secondary"
            >
              {showStudied ? 'View Unstudied Cards' : 'View Studied Cards'}
            </button>
            <button onClick={() => navigate('/flashcards')} className="btn-primary">
              Back to Flashcards
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = activeCards[currentIndex];

  return (
    <div className="gradient-bg h-full w-full overflow-hidden flex flex-col">
      <style>{`
        @keyframes slideOutLeft {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(-120%) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(120%) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes exitCard {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(0.7) rotate(12deg) translateY(-30px);
            opacity: 0;
          }
        }

        .flip-container {
          perspective: 2000px;
          aspect-ratio: 5 / 3;
          width: 100%;
          max-width: 700px;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }

        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        .slide-left {
          animation: slideOutLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .slide-right {
          animation: slideOutRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .exit-animation {
          animation: exitCard 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>

      <div className="flex-1 flex flex-col p-3 md:p-4 min-h-0">
        {/* Header - flex-shrink-0 */}
        <div className="flex-shrink-0 mb-2">
          <button
            onClick={() => navigate('/flashcards')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2 flex items-center gap-2 text-sm"
          >
            ← Back to Flashcards
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">
                {flashcardSet.name}
              </h2>
              {flashcardSet.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{flashcardSet.description}</p>
              )}
            </div>
            <button
              onClick={() => {
                setShowStudied(!showStudied);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all flex-shrink-0 ${
                showStudied
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {showStudied ? '✓ Studied' : 'Unstudied'}
            </button>
          </div>
        </div>

        {/* Progress Stats - flex-shrink-0 */}
        <div className="max-w-2xl mx-auto w-full mb-2 flex justify-between text-xs flex-shrink-0">
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold">
              {flashcardSet.flashcards.filter(c => c.studied).length}
            </span>
            {' '}studied •
            <span className="font-semibold">
              {' '}{flashcardSet.flashcards.filter(c => !c.studied).length}
            </span>
            {' '}remaining
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Card {currentIndex + 1} of {activeCards.length}
          </div>
        </div>

        {/* Flashcard - flex-1 to take available space */}
        <div className="max-w-2xl mx-auto w-full mb-2 flex-1 min-h-0 flex items-center justify-center">
          <div
            className={`flip-container ${slideDirection} ${isExiting ? 'exit-animation' : ''}`}
            onClick={handleFlip}
          >
            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
              {/* Front of card */}
              <div className="flip-card-front">
                <div className="card w-full h-full flex items-center justify-center cursor-pointer hover:shadow-2xl transition-shadow">
                  <div className="text-center p-6 md:p-8">
                    <div className="text-xs md:text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                      FRONT
                    </div>
                    <p className="text-lg md:text-xl lg:text-2xl text-gray-900 dark:text-white whitespace-pre-wrap">
                      {currentCard.front}
                    </p>
                    <div className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-4">
                      Click to flip
                    </div>
                  </div>
                </div>
              </div>

              {/* Back of card */}
              <div className="flip-card-back">
                <div className="card w-full h-full flex items-center justify-center cursor-pointer hover:shadow-2xl transition-shadow">
                  <div className="text-center p-6 md:p-8">
                    <div className="text-xs md:text-sm text-green-600 dark:text-green-400 font-semibold mb-3">
                      BACK
                    </div>
                    <p className="text-lg md:text-xl lg:text-2xl text-gray-900 dark:text-white whitespace-pre-wrap">
                      {currentCard.back}
                    </p>
                    <div className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-4">
                      Click to flip
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Study Action Buttons - flex-shrink-0 */}
        <div className="max-w-2xl mx-auto w-full mb-2 flex gap-2 justify-center flex-shrink-0">
          {!showStudied ? (
            <button
              onClick={() => handleMarkStudied(true)}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2 text-xs"
            >
              ✓ Mark as Studied
            </button>
          ) : (
            <button
              onClick={() => handleMarkStudied(false)}
              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2 text-xs"
            >
              ↺ Mark as Unstudied
            </button>
          )}
        </div>

        {/* Navigation Buttons - flex-shrink-0 */}
        <div className="max-w-2xl mx-auto w-full flex justify-between items-center gap-2 flex-shrink-0 mb-1">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 text-xs px-3 py-1.5"
          >
            ← Previous
          </button>

          <button
            onClick={handleFlip}
            className="btn-primary text-xs px-4 py-1.5"
          >
            Flip Card
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === activeCards.length - 1}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 text-xs px-3 py-1.5"
          >
            Next →
          </button>
        </div>

        {/* Keyboard Hints - flex-shrink-0 */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          Arrow keys to navigate • Space/Enter to flip
        </div>
      </div>
    </div>
  );
}
