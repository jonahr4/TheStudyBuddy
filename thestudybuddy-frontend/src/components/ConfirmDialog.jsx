export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // 'danger' or 'warning'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full relative animate-in fade-in zoom-in duration-200">
          {/* Icon */}
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4 ${
            type === 'danger' 
              ? 'bg-red-100 dark:bg-red-900/30' 
              : 'bg-yellow-100 dark:bg-yellow-900/30'
          }`}>
            <svg 
              className={`h-6 w-6 ${
                type === 'danger' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-yellow-600 dark:text-yellow-400'
              }`} 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
              />
            </svg>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
                type === 'danger'
                  ? 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600'
                  : 'bg-yellow-600 hover:bg-yellow-500 focus-visible:outline-yellow-600'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

