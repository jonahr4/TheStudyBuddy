import { Link } from 'react-router-dom';

export default function Subjects() {
  // Mock data - will be replaced with real data later
  const subjects = [
    { id: 1, name: 'Biology 101', noteCount: 5, deckCount: 3 },
    { id: 2, name: 'Calculus II', noteCount: 8, deckCount: 5 },
    { id: 3, name: 'World History', noteCount: 3, deckCount: 2 },
  ];

  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h2>My Subjects</h2>
          <button className="btn-primary">
            + Create New Subject
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject.id} className="card hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {subject.name}
              </h3>
              
              <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📄 {subject.noteCount} notes uploaded
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🃏 {subject.deckCount} flashcard decks
                </p>
              </div>

              <div className="flex gap-3">
                <Link 
                  to={`/subjects/${subject.id}`} 
                  className="btn-primary flex-1 text-center"
                >
                  Manage Notes
                </Link>
                <Link 
                  to={`/flashcards?subject=${subject.id}`}
                  className="btn-secondary flex-1 text-center"
                >
                  Study
                </Link>
              </div>
            </div>
          ))}

          {/* Empty state if no subjects */}
          {subjects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">No subjects yet. Create your first subject to get started!</p>
              <button className="btn-primary">
                + Create New Subject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
