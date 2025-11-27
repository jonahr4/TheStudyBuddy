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
      }, 150);
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
      }, 150);
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
    <div className="gradient-bg min-h-screen">
      <style>{`
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
        
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes exitCard {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(0.8) rotate(8deg) translateY(-20px); opacity: 0; }
        }
        
        .flip-container {
          perspective: 1500px;
        }
        
        .flip-card-inner {
          position: relative;
          width: 100%;
          min-height: 400px;
          transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
          transform-style: preserve-3d;
        }
        
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          min-height: 400px;
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
          animation: slideOutLeft 0.3s ease-out forwards;
        }
        
        .slide-right {
          animation: slideOutRight 0.3s ease-out forwards;
        }
        
        .exit-animation {
          animation: exitCard 0.3s ease-out forwards;
        }
      `}</style>
      
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>

      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/flashcards')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Flashcards
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {flashcardSet.name}
              </h2>
              {flashcardSet.description && (
                <p className="text-gray-600 dark:text-gray-400">{flashcardSet.description}</p>
              )}
            </div>
            <button
              onClick={() => {
                setShowStudied(!showStudied);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                showStudied
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {showStudied ? '✓ Studied Cards' : 'Unstudied Cards'}
            </button>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="max-w-2xl mx-auto mb-4 flex justify-between text-sm">
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

        {/* Flashcard */}
        <div className="max-w-2xl mx-auto mb-6">
          <div 
            className={`flip-container ${slideDirection} ${isExiting ? 'exit-animation' : ''}`}
            onClick={handleFlip}
          >
            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
              {/* Front of card */}
              <div className="flip-card-front">
                <div className="card min-h-[400px] w-full flex items-center justify-center cursor-pointer hover:shadow-2xl transition-shadow">
                  <div className="text-center p-8">
                    <div className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-4">
                      FRONT
                    </div>
                    <p className="text-xl text-gray-900 dark:text-white whitespace-pre-wrap">
                      {currentCard.front}
                    </p>
                    <div className="text-sm text-gray-400 dark:text-gray-500 mt-6">
                      Click to flip
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Back of card */}
              <div className="flip-card-back">
                <div className="card min-h-[400px] w-full flex items-center justify-center cursor-pointer hover:shadow-2xl transition-shadow">
                  <div className="text-center p-8">
                    <div className="text-sm text-green-600 dark:text-green-400 font-semibold mb-4">
                      BACK
                    </div>
                    <p className="text-xl text-gray-900 dark:text-white whitespace-pre-wrap">
                      {currentCard.back}
                    </p>
                    <div className="text-sm text-gray-400 dark:text-gray-500 mt-6">
                      Click to flip
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Study Action Buttons */}
        <div className="max-w-2xl mx-auto mb-6 flex gap-3 justify-center">
          {!showStudied ? (
            <button
              onClick={() => handleMarkStudied(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2"
            >
              ✓ Mark as Studied
            </button>
          ) : (
            <button
              onClick={() => handleMarkStudied(false)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2"
            >
              ↺ Mark as Unstudied
            </button>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            ← Previous
          </button>

          <button
            onClick={handleFlip}
            className="btn-primary"
          >
            Flip Card
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === activeCards.length - 1}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next →
          </button>
        </div>

        {/* Keyboard Hints */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          Use arrow keys (← →) to navigate • Press Space or Enter to flip
        </div>
      </div>
    </div>
  );
}
