import { useState, useEffect } from 'react';
import { subjectApi } from '../services/api';

export default function TestBackend() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSubject, setNewSubject] = useState({ name: '', color: '#3B82F6' });

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await subjectApi.getAll();
      setSubjects(data);
    } catch (err) {
      setError('Failed to fetch subjects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await subjectApi.create(newSubject);
      setNewSubject({ name: '', color: '#3B82F6' });
      fetchSubjects(); // Refresh list
    } catch (err) {
      setError('Failed to create subject: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await subjectApi.delete(id);
      fetchSubjects(); // Refresh list
    } catch (err) {
      setError('Failed to delete subject: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Backend Connection Test
        </h1>

        {/* Connection Status */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Backend: http://localhost:7071</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Create Subject Form */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Subject</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Subject Name</label>
              <input
                type="text"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className="input"
                placeholder="Biology 101"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Color</label>
              <input
                type="color"
                value={newSubject.color}
                onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                className="h-10 w-20 rounded cursor-pointer"
              />
            </div>
            <button type="submit" className="btn-primary">
              Create Subject
            </button>
          </form>
        </div>

        {/* Subjects List */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Subjects from MongoDB</h2>
            <button onClick={fetchSubjects} className="btn-secondary text-sm">
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : subjects.length === 0 ? (
            <p className="text-gray-500">No subjects yet. Create one above!</p>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <div>
                      <h3 className="font-semibold">{subject.name}</h3>
                      <p className="text-xs text-gray-500">
                        ID: {subject._id} | Created: {new Date(subject.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(subject._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
