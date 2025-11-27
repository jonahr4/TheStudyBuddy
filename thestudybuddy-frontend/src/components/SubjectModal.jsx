import { useState, useEffect } from 'react';
import { SUBJECT_COLORS } from '../contexts/SubjectContext';

export default function SubjectModal({ isOpen, onClose, onSave, subject = null }) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [error, setError] = useState('');

  // Populate form when editing existing subject
  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setSelectedColor(subject.color);
    } else {
      setName('');
      setSelectedColor('bg-blue-500');
    }
    setError('');
  }, [subject, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Subject name is required');
      return;
    }

    if (name.trim().length < 3) {
      setError('Subject name must be at least 3 characters');
      return;
    }

    onSave({
      name: name.trim(),
      color: selectedColor,
    });

    // Reset form
    setName('');
    setSelectedColor('bg-blue-500');
    setError('');
  };

  const handleClose = () => {
    setName('');
    setSelectedColor('bg-blue-500');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full relative animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {subject ? 'Edit Subject' : 'Create New Subject'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Subject Name */}
            <div className="mb-6">
              <label htmlFor="subject-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Subject Name
              </label>
              <input
                type="text"
                id="subject-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="e.g., Biology 101, Calculus II"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Color Picker */}
            <div className="mb-6">
              <label className="block mb-3 text-sm font-medium text-gray-900 dark:text-white">
                Choose a Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {SUBJECT_COLORS.map((color) => (
                  <button
                    key={color.class}
                    type="button"
                    onClick={() => setSelectedColor(color.class)}
                    className={`h-12 rounded-lg transition-all ${color.class} ${
                      selectedColor === color.class
                        ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-600 scale-110'
                        : 'hover:scale-105'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Selected: {SUBJECT_COLORS.find(c => c.class === selectedColor)?.name}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                {subject ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

