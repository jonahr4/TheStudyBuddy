import { useParams, Link } from 'react-router-dom';

export default function SubjectDetail() {
  const { subjectId } = useParams();
  
  // Mock data - will be replaced with real data later
  const subject = { id: subjectId, name: 'Biology 101' };
  const notes = [
    { id: 1, name: 'Chapter 1 - Cell Structure.pdf', uploadDate: '2025-11-15', size: '2.3 MB' },
    { id: 2, name: 'Chapter 2 - DNA and RNA.pdf', uploadDate: '2025-11-16', size: '1.8 MB' },
    { id: 3, name: 'Lab Notes - Microscopy.pdf', uploadDate: '2025-11-18', size: '3.1 MB' },
  ];
  
  const maxNotes = 10;
  const remainingSlots = maxNotes - notes.length;

  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="p-8">
        <div className="mb-6">
          <Link to="/subjects" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            ← Back to Subjects
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="mb-2">{subject.name}</h2>
            <p className="text-gray-600">
              {notes.length} of {maxNotes} notes uploaded
            </p>
          </div>
          <button 
            className="btn-primary"
            disabled={notes.length >= maxNotes}
          >
            {notes.length >= maxNotes ? 'Maximum Notes Reached' : '+ Upload Note'}
          </button>
        </div>

        {/* Upload Area */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center bg-white/50 dark:bg-gray-800/50">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop PDF files here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              or click to browse ({remainingSlots} {remainingSlots === 1 ? 'slot' : 'slots'} remaining)
            </p>
            <button 
              className="btn-primary"
              disabled={notes.length >= maxNotes}
            >
              Select Files
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Uploaded Notes</h3>
          
          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map(note => (
                <div key={note.id} className="card flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="text-red-500 text-2xl">📄</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {note.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {note.size} • Uploaded {note.uploadDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm">
                      View
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No notes uploaded yet. Upload your first PDF to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
