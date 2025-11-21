import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Menu</h2>
      </div>
      <nav className="space-y-2">
        <Link 
          to="/dashboard" 
          className="block px-4 py-2 rounded hover:bg-gray-700"
        >
          Dashboard
        </Link>
        <Link 
          to="/upload" 
          className="block px-4 py-2 rounded hover:bg-gray-700"
        >
          Upload Notes
        </Link>
        <Link 
          to="/flashcards" 
          className="block px-4 py-2 rounded hover:bg-gray-700"
        >
          Flashcards
        </Link>
        <Link 
          to="/chat" 
          className="block px-4 py-2 rounded hover:bg-gray-700"
        >
          AI Chat
        </Link>
      </nav>
    </aside>
  );
}
