import { useState } from 'react';

export default function Flashcards() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  // Mock data - will be replaced with real data later
  const subjects = [
    { id: 'all', name: 'All Subjects' },
    { id: 1, name: 'Biology 101' },
    { id: 2, name: 'Calculus II' },
    { id: 3, name: 'World History' },
  ];

  const decks = [
    { id: 1, name: 'Cell Structure', subject: 'Biology 101', subjectId: 1, cardCount: 25, progress: 80 },
    { id: 2, name: 'Photosynthesis', subject: 'Biology 101', subjectId: 1, cardCount: 20, progress: 60 },
    { id: 3, name: 'Derivatives', subject: 'Calculus II', subjectId: 2, cardCount: 30, progress: 40 },
    { id: 4, name: 'Integrals', subject: 'Calculus II', subjectId: 2, cardCount: 28, progress: 20 },
    { id: 5, name: 'World War II', subject: 'World History', subjectId: 3, cardCount: 18, progress: 90 },
  ];

  const filteredDecks = selectedSubject === 'all' 
    ? decks 
    : decks.filter(deck => deck.subjectId === selectedSubject);

  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="p-8">
        <div className="mb-8">
          <h2 className="mb-4">Flashcards</h2>
          
          {/* Subject Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  selectedSubject === subject.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        {/* Decks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map(deck => (
            <div key={deck.id} className="card hover:shadow-xl transition-shadow">
              <div className="mb-4">
                <span className="badge text-xs mb-2 inline-block">
                  {deck.subject}
                </span>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {deck.name}
                </h4>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>{deck.cardCount} cards</span>
                  <span>{deck.progress}% mastered</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${deck.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <button className="btn-primary w-full">
                Study Now
              </button>
            </div>
          ))}

          {filteredDecks.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No flashcard decks found for this subject.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
