import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardApi } from '../services/api';
import FlashcardEditorRow from '../components/FlashcardEditorRow';

export default function EditFlashcards() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingCards, setSavingCards] = useState(new Set());
  const [newCardIndex, setNewCardIndex] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadFlashcardSet();
  }, [setId]);

  const loadFlashcardSet = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await flashcardApi.getSet(setId);
      setFlashcardSet(data);
    } catch (err) {
      console.error('Failed to load flashcard set:', err);
      setError('Failed to load flashcard set. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCard = async (index, cardData) => {
    setSavingCards(prev => new Set(prev).add(index));
    try {
      const isNewCard = index >= flashcardSet.flashcards.length;
      
      if (isNewCard) {
        // Add new card
        const updatedSet = await flashcardApi.addCard(setId, cardData);
        setFlashcardSet(updatedSet);
        setNewCardIndex(null);
      } else {
        // Update existing card
        const updatedSet = await flashcardApi.updateCard(setId, index, cardData);
        setFlashcardSet(updatedSet);
      }
    } catch (err) {
      console.error('Failed to save card:', err);
      setError('Failed to save card. Please try again.');
    } finally {
      setSavingCards(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleDeleteCard = async (index) => {
    // If it's the new unsaved card, just remove it locally
    if (newCardIndex !== null && index === flashcardSet.flashcards.length) {
      setNewCardIndex(null);
      return;
    }

    setSavingCards(prev => new Set(prev).add(index));
    try {
      const updatedSet = await flashcardApi.deleteCard(setId, index);
      setFlashcardSet(updatedSet);
    } catch (err) {
      console.error('Failed to delete card:', err);
      setError('Failed to delete card. Please try again.');
    } finally {
      setSavingCards(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleAddCard = () => {
    setNewCardIndex(flashcardSet.flashcards.length);
    // Scroll to bottom after state update
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBackToStudy = () => {
    navigate(`/flashcards/study/${setId}`);
  };

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error && !flashcardSet) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={loadFlashcardSet} className="btn-primary">
              Try Again
            </button>
            <button onClick={() => navigate('/flashcards')} className="btn-secondary">
              Back to Flashcards
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cards = flashcardSet?.flashcards || [];
  const hasCards = cards.length > 0 || newCardIndex !== null;

  return (
    <div className="gradient-bg min-h-screen">
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBackToStudy}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 flex items-center gap-2 text-sm group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Study
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Edit Flashcards
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {flashcardSet?.name}
                {flashcardSet?.description && (
                  <span className="text-gray-400 dark:text-gray-500"> — {flashcardSet.description}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {cards.length} {cards.length === 1 ? 'card' : 'cards'}
              </span>
              <button
                onClick={handleAddCard}
                disabled={newCardIndex !== null}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Card
              </button>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Cards list */}
        {hasCards ? (
          <div className="space-y-6">
            {cards.map((card, index) => (
              <FlashcardEditorRow
                key={`card-${index}`}
                index={index}
                card={card}
                onSave={handleSaveCard}
                onDelete={handleDeleteCard}
                isSaving={savingCards.has(index)}
              />
            ))}

            {/* New card being added */}
            {newCardIndex !== null && (
              <FlashcardEditorRow
                key="new-card"
                index={newCardIndex}
                card={{ front: '', back: '' }}
                onSave={handleSaveCard}
                onDelete={handleDeleteCard}
                isNew={true}
                isSaving={savingCards.has(newCardIndex)}
              />
            )}

            {/* Add card button at bottom */}
            <button
              onClick={handleAddCard}
              disabled={newCardIndex !== null}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add another card
            </button>

            <div ref={bottomRef} />
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No cards yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              This deck is empty. Add your first flashcard to get started!
            </p>
            <button
              onClick={handleAddCard}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Card
            </button>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        {hasCards && (
          <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
            <span className="inline-flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono">Enter</kbd>
              to save •
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono">Tab</kbd>
              to move between fields
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

