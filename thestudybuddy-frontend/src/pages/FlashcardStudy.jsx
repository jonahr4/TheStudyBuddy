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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (flashcardSet && currentIndex < flashcardSet.flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
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

  const currentCard = flashcardSet.flashcards[currentIndex];

  return (
    <div className="gradient-bg min-h-screen">
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {flashcardSet.name}
          </h2>
          {flashcardSet.description && (
            <p className="text-gray-600 dark:text-gray-400">{flashcardSet.description}</p>
          )}
        </div>

        {/* Card Counter */}
        <div className="text-center mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Card {currentIndex + 1} of {flashcardSet.flashcards.length}
          </span>
        </div>

        {/* Flashcard */}
        <div className="max-w-2xl mx-auto mb-8">
          <div
            onClick={handleFlip}
            className="card min-h-[400px] flex items-center justify-center cursor-pointer hover:shadow-2xl transition-all transform hover:scale-[1.02]"
          >
            <div className="text-center p-8">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {isFlipped ? 'Back' : 'Front'}
              </div>
              <p className="text-xl text-gray-900 dark:text-white whitespace-pre-wrap">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              <div className="text-sm text-gray-400 dark:text-gray-500 mt-6">
                Click to flip
              </div>
            </div>
          </div>
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
            disabled={currentIndex === flashcardSet.flashcards.length - 1}
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
