import { useState, useRef, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useSubjects } from '../contexts/SubjectContext';
import { useNotes } from '../contexts/NoteContext';
import { textExtractionApi, youtubeApi } from '../services/api';
import VideoRecommendations from '../components/VideoRecommendations';

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const { getSubject } = useSubjects();
  const { fetchNotesBySubject, uploadNote, deleteNote, getNotesForSubject, loading } = useNotes();
  const fileInputRef = useRef(null);
  
  // Get the actual subject from context
  const subject = getSubject(subjectId);
  
  // State management
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [extractingText, setExtractingText] = useState({});
  
  // Get notes from context
  const notes = getNotesForSubject(subjectId);
  
  // State for video search query
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [generatingSearchTerms, setGeneratingSearchTerms] = useState(false);
  
  // Fetch notes on mount
  useEffect(() => {
    if (subjectId) {
      fetchNotesBySubject(subjectId).catch(err => {
        console.error('Failed to fetch notes:', err);
      });
    }
  }, [subjectId]);
  
  // Generate AI-powered video search query from notes
  useEffect(() => {
    const generateSearchQuery = async () => {
      if (notes.length === 0) {
        setVideoSearchQuery('');
        return;
      }

      // Check if any notes have extracted text
      const hasExtractedText = notes.some(note => 
        note.textUrl && !note.textUrl.includes('placeholder')
      );

      if (!hasExtractedText) {
        // Fallback: Use note filenames if no text is extracted yet
        const noteKeywords = notes
          .map(note => note.fileName.replace('.pdf', '').replace(/_/g, ' '))
          .slice(0, 3)
          .join(' ');
        setVideoSearchQuery(`${subject.name} ${noteKeywords}`);
        return;
      }

      // Use AI to generate search terms from note content
      try {
        setGeneratingSearchTerms(true);
        console.log('Generating AI-powered search terms for:', subject.name);
        
        const response = await youtubeApi.generateSearchTerms(subjectId, subject.name);
        
        console.log('AI generated search terms:', response);
        
        if (response.combinedQuery) {
          setVideoSearchQuery(response.combinedQuery);
        } else {
          // Fallback to subject name
          setVideoSearchQuery(subject.name);
        }
      } catch (err) {
        console.error('Failed to generate AI search terms:', err);
        // Fallback: Use subject name
        setVideoSearchQuery(subject.name);
      } finally {
        setGeneratingSearchTerms(false);
      }
    };

    generateSearchQuery();
  }, [notes, subject.name, subjectId]);
  
  // Redirect to subjects page if subject not found
  if (!subject) {
    return <Navigate to="/subjects" replace />;
  }
  
  const maxNotes = 10;
  const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
  const remainingSlots = maxNotes - notes.length;

  // Validate file
  const validateFile = (file) => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: `${file.name} is not a PDF file` };
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      return { valid: false, error: `${file.name} exceeds 10MB limit` };
    }
    
    return { valid: true };
  };

  // Handle file selection
  const handleFiles = (files) => {
    setError('');
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (notes.length + selectedFiles.length + fileArray.length > maxNotes) {
      setError(`Cannot upload more than ${maxNotes} notes per subject`);
      return;
    }
    
    // Validate each file
    const validFiles = [];
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      validFiles.push(file);
    }
    
    // Add to selected files
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  // File input click handler
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  // Remove file from selected list
  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Upload files to MongoDB and Azure Blob Storage
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setError('');
    setSuccessMessage('');
    setUploadingFiles(true);
    
    try {
      // Upload each file with the actual file object
      const uploadPromises = selectedFiles.map(file => 
        uploadNote(file, subjectId)
      );
      
      await Promise.all(uploadPromises);
      
      // Clear selected files
      setSelectedFiles([]);
      
      // Show success message with MongoDB and Azure Blob status
      const fileCount = selectedFiles.length;
      setSuccessMessage(
        `✅ ${fileCount} ${fileCount === 1 ? 'file' : 'files'} successfully uploaded!\n` +
        `📊 MongoDB: Metadata saved\n` +
        `☁️ Azure Blob Storage: ✅ PDFs uploaded!`
      );
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(`Failed to upload: ${err.message}`);
    } finally {
      setUploadingFiles(false);
    }
  };
  
  // Delete a note
  const handleDelete = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }
    
    setError('');
    setSuccessMessage('');
    
    try {
      await deleteNote(noteId, subjectId);
      
      // Show success message with MongoDB and Azure Blob status
      setSuccessMessage(
        `✅ Note successfully deleted!\n` +
        `📊 MongoDB: Metadata removed\n` +
        `☁️ Azure Blob Storage: Pending cleanup (being implemented)`
      );
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
    }
  };

  // Extract text from PDF
  const handleExtractText = async (note) => {
    setError('');
    setSuccessMessage('');
    setExtractingText(prev => ({ ...prev, [note.id]: true }));

    try {
      const response = await textExtractionApi.processNote({
        noteId: note.id,
        blobUrl: note.blobUrl,
      });

      setSuccessMessage(
        `✅ Text extracted successfully from ${note.fileName}!\n` +
        `📝 Extracted ${response.textLength} characters\n` +
        `☁️ Text saved to Azure Blob Storage`
      );

      // Refresh notes to get updated textUrl
      await fetchNotesBySubject(subjectId);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(`Failed to extract text: ${err.message}`);
    } finally {
      setExtractingText(prev => ({ ...prev, [note.id]: false }));
    }
  };

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
            onClick={handleFileInputClick}
          >
            {notes.length >= maxNotes ? 'Maximum Notes Reached' : '+ Upload Note'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}
        
        {/* Success Message Display */}
        {successMessage && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 text-sm whitespace-pre-line font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="max-w-3xl mx-auto mb-8">
          <div 
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50'
            } ${notes.length >= maxNotes ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={notes.length < maxNotes ? handleFileInputClick : undefined}
          >
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
              {isDragging ? 'Drop PDF files here' : 'Drag and drop PDF files here'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              or click to browse • {remainingSlots} {remainingSlots === 1 ? 'slot' : 'slots'} remaining
            </p>
            <p className="text-xs text-gray-400">
              PDF files only • Max 10MB per file
            </p>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
              disabled={notes.length >= maxNotes}
            />
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Selected Files ({selectedFiles.length})</h3>
                <button 
                  onClick={handleUpload}
                  className="btn-primary"
                  disabled={uploadingFiles}
                >
                  {uploadingFiles ? 'Uploading...' : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'File' : 'Files'}`}
                </button>
              </div>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-red-500 text-xl">📄</div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSelectedFile(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="max-w-3xl mx-auto mb-12">
          <h3 className="text-lg font-semibold mb-4">Uploaded Notes</h3>
          
          {loading[subjectId] ? (
            <div className="text-center py-8 text-gray-500">
              Loading notes...
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map(note => (
                <div key={note.id} className="card flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="text-red-500 text-2xl">📄</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {note.fileName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(note.fileSize)} • Uploaded {new Date(note.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400">
                          {note.blobUrl.startsWith('placeholder') ? '☁️ Azure Blob: Pending upload' : '☁️ Azure Blob: Available'}
                        </p>
                        {note.textUrl && !note.textUrl.includes('placeholder') && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            • ✅ Text extracted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!note.textUrl || note.textUrl.includes('placeholder') ? (
                      <button 
                        onClick={() => handleExtractText(note)}
                        disabled={note.blobUrl.startsWith('placeholder') || extractingText[note.id]}
                        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title={note.blobUrl.startsWith('placeholder') ? 'Wait for file upload to complete' : 'Extract text from PDF for AI chat'}
                      >
                        {extractingText[note.id] ? 'Extracting...' : '📝 Extract Text'}
                      </button>
                    ) : (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium px-3 py-2">
                        ✓ Ready for Chat
                      </span>
                    )}
                    <button 
                      className="btn-secondary text-sm"
                      disabled={note.blobUrl.startsWith('placeholder')}
                      title={note.blobUrl.startsWith('placeholder') ? 'File not yet available in Azure Blob Storage' : 'View file'}
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1"
                    >
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

        {/* YouTube Video Recommendations - Only show if there are notes */}
        {notes.length > 0 && (
          <div className="max-w-6xl mx-auto mb-12">
            {generatingSearchTerms ? (
              <div className="card text-center py-8">
                <div className="animate-pulse">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    AI is analyzing your notes to find the best videos...
                  </p>
                </div>
              </div>
            ) : videoSearchQuery ? (
              <VideoRecommendations 
                searchQuery={videoSearchQuery}
                title={`Recommended Videos Based on Your Notes`}
                maxResults={3}
              />
            ) : (
              <div className="card text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Extract text from your notes to get AI-powered video recommendations
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
