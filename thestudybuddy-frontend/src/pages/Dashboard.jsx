import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSubjects } from '../contexts/SubjectContext';
import { flashcardApi, chatApi } from '../services/api.ts';

export default function Dashboard() {
  const { subjects, loading } = useSubjects();
  const [recentDecks, setRecentDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [chatStats, setChatStats] = useState(null);
  const [loadingChat, setLoadingChat] = useState(true);

  // Fetch flashcard sets
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoadingDecks(true);
        const sets = await flashcardApi.getAll();
        // Get the 5 most recent sets
        setRecentDecks(sets.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch flashcard sets:', error);
        setRecentDecks([]);
      } finally {
        setLoadingDecks(false);
      }
    };

    fetchFlashcards();
  }, []);

  // Fetch chat statistics
  useEffect(() => {
    const fetchChatStats = async () => {
      try {
        setLoadingChat(true);
        const stats = await chatApi.getStats();
        setChatStats(stats);
      } catch (error) {
        console.error('Failed to fetch chat stats:', error);
        setChatStats({ totalConversations: 0, totalMessages: 0, recentChats: [] });
      } finally {
        setLoadingChat(false);
      }
    };

    fetchChatStats();
  }, []);

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
              
              {loading ? (
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    No subjects yet
                  </p>
                  <Link to="/subjects" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Create your first subject →
                  </Link>
                </div>
              ) : (
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
              )}
              
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
              
              {loadingDecks ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : recentDecks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🃏</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    No flashcard decks yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Upload notes to generate flashcards
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {recentDecks.map(deck => (
                      <Link
                        key={deck._id}
                        to={`/flashcards/study/${deck._id}`}
                        className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            {deck.name}
                          </h5>
                          <span className="badge">{deck.flashcards.length} cards</span>
                        </div>
                        {deck.subjectId?.name && (
                          <p className="text-xs text-gray-500 mb-3">
                            {deck.subjectId.name}
                          </p>
                        )}
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                          Study Now →
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <Link to="/flashcards" className="btn-primary w-full mt-4 text-center block">
                    View All Decks
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right: Chat History */}
          <div className="lg:col-span-4">
            <div className="card">
              <h4 className="mb-4">Chat History</h4>
              
              {loadingChat ? (
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">💬</div>
                    {chatStats?.totalConversations > 0 ? (
                      <>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {chatStats.totalConversations}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {chatStats.totalConversations === 1 ? 'Conversation' : 'Conversations'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                          {chatStats.totalMessages} total messages
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        No conversations yet
                      </p>
                    )}
                  </div>
                  
                  <Link to="/chat" className="btn-primary w-full text-center block">
                    {chatStats?.totalConversations > 0 ? 'Continue Chatting' : 'Start Chatting'}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
