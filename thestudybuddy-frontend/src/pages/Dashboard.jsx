import { Link } from 'react-router-dom';

export default function Dashboard() {
  // Mock data - will be replaced with real data later
  const subjects = [
    { id: 1, name: 'Biology 101', color: 'bg-green-500' },
    { id: 2, name: 'Calculus II', color: 'bg-blue-500' },
    { id: 3, name: 'World History', color: 'bg-purple-500' },
    { id: 4, name: 'Chemistry', color: 'bg-red-500' },
  ];

  const recentDecks = [
    { id: 1, name: 'Cell Structure', subject: 'Biology 101', cardCount: 25 },
    { id: 2, name: 'Derivatives', subject: 'Calculus II', cardCount: 30 },
    { id: 3, name: 'World War II', subject: 'World History', cardCount: 18 },
  ];

  const chatCount = 12;

  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="p-8">
        <h2 className="mb-8">Dashboard</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Subjects List */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h4>Subjects</h4>
                <Link to="/subjects" className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
                  View All
                </Link>
              </div>
              
              <div className="space-y-2">
                {subjects.map(subject => (
                  <Link 
                    key={subject.id}
                    to={`/subjects/${subject.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                    <span className="text-sm font-medium">{subject.name}</span>
                  </Link>
                ))}
              </div>
              
              <Link to="/subjects" className="btn-primary w-full mt-4 text-center block">
                + New Subject
              </Link>
            </div>
          </div>

          {/* Center: My Decks */}
          <div className="lg:col-span-5">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h4>My Decks</h4>
                <Link to="/flashcards" className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
                  View All
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentDecks.map(deck => (
                  <div key={deck.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {deck.name}
                      </h5>
                      <span className="badge">{deck.cardCount} cards</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {deck.subject}
                    </p>
                    <button className="btn-secondary text-sm w-full">
                      Study Now
                    </button>
                  </div>
                ))}
              </div>
              
              <Link to="/flashcards" className="btn-primary w-full mt-4 text-center block">
                View All Decks
              </Link>
            </div>
          </div>

          {/* Right: Chat History */}
          <div className="lg:col-span-4">
            <div className="card">
              <h4 className="mb-4">Chat History</h4>
              
              <div className="text-center py-6">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {chatCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Total conversations
                </p>
              </div>
              
              <Link to="/chat" className="btn-primary w-full text-center block">
                Go to Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
