export default function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  fileName = 'Document'
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20">
        <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-2xl max-w-6xl w-full h-[85vh] relative animate-in fade-in zoom-in duration-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {fileName}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm"
                title="Open in new tab"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 transition-colors"
                title="Close viewer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={fileName}
            />
          </div>
        </div>
      </div>
    </>
  );
}
