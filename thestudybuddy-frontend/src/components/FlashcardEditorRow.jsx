import { useState, useRef, useEffect } from 'react';

export default function FlashcardEditorRow({
  index,
  card,
  onSave,
  onDelete,
  isNew = false,
  isSaving = false,
}) {
  const [front, setFront] = useState(card.front || '');
  const [back, setBack] = useState(card.back || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const frontRef = useRef(null);

  // Focus the front input when creating a new card
  useEffect(() => {
    if (isNew && frontRef.current) {
      frontRef.current.focus();
    }
  }, [isNew]);

  // Track changes
  useEffect(() => {
    const changed = front !== (card.front || '') || back !== (card.back || '');
    setHasChanges(changed);
  }, [front, back, card.front, card.back]);

  const handleSave = () => {
    if (front.trim() && back.trim()) {
      onSave(index, { front: front.trim(), back: back.trim() });
    }
  };

  const handleBlur = (e) => {
    // Only save if there are changes and the new focus is outside this row
    const row = e.currentTarget.closest('[data-card-row]');
    if (row && !row.contains(e.relatedTarget) && hasChanges && front.trim() && back.trim()) {
      handleSave();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(index);
  };

  return (
    <div
      data-card-row
      className="relative group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Card number badge */}
      <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
        {index + 1}
      </div>

      <div className="p-5 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Term (Front) */}
          <div>
            <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">
              Term
            </label>
            <textarea
              ref={frontRef}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Enter term..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all text-base"
            />
          </div>

          {/* Definition (Back) */}
          <div>
            <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">
              Definition
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Enter definition..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all text-base"
            />
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : hasChanges ? (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={!front.trim() || !back.trim() || isSaving}
                className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Delete card"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 rounded-xl flex items-center justify-center backdrop-blur-sm z-10">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Delete this card?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

