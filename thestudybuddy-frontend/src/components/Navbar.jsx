import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              Study Buddy
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-sm font-semibold">
              Dashboard
            </Link>
            <Link to="/upload" className="text-sm font-semibold">
              Upload
            </Link>
            <Link to="/flashcards" className="text-sm font-semibold">
              Flashcards
            </Link>
            <Link to="/chat" className="text-sm font-semibold">
              Chat
            </Link>
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
