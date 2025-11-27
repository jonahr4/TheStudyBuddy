import { useState, useEffect } from 'react';
import { reportApi } from '../services/api';

export default function ReportModal({ isOpen, onClose }) {
  const [type, setType] = useState('bug');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setType('bug');
      setDescription('');
      setSubmitting(false);
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const reportTypes = [
    { value: 'bug', label: '🐛 Bug Report', description: 'Something isn\'t working' },
    { value: 'feature', label: '✨ Feature Request', description: 'Suggest a new feature' },
    { value: 'improvement', label: '📈 Improvement', description: 'Suggest an enhancement' },
    { value: 'other', label: '💬 Other', description: 'General feedback' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (description.trim().length < 10) {
      setError('Please provide at least 10 characters of detail');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await reportApi.submit({ type, description: description.trim() });
      setSuccess(true);
      
      // Reset form after 2 seconds and close
      setTimeout(() => {
        setDescription('');
        setType('bug');
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Report & Feedback
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Thank You!
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Your feedback has been submitted successfully
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Report Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    What would you like to report?
                  </label>
                  <div className="space-y-2">
                    {reportTypes.map((reportType) => (
                      <button
                        key={reportType.value}
                        type="button"
                        onClick={() => setType(reportType.value)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          type === reportType.value
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {reportType.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {reportType.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide details..."
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Minimum 10 characters
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting || description.trim().length < 10}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
