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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch flashcard sets
  useEffect(() => {
    const fetchFlashcards = async () => {
      if (subjects.length === 0) {
        setRecentDecks([]);
        setLoadingDecks(false);
        return;
      }

      try {
        setLoadingDecks(true);
        // Fetch flashcards for each subject, just like Flashcards page does
        const allSets = [];
        for (const subject of subjects) {
          const response = await flashcardApi.getBySubject(subject.id);
          allSets.push(...response.map(set => ({
            ...set,
            subjectId: { name: subject.name, color: subject.color }
          })));
        }
        // Get the 5 most recent sets
        setRecentDecks(allSets.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch flashcard sets:', error);
        setRecentDecks([]);
      } finally {
        setLoadingDecks(false);
      }
    };

    fetchFlashcards();
  }, [subjects]);

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
    <div className="gradient-bg h-full w-full overflow-hidden">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="h-full w-full flex flex-col p-4 md:p-6">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Here's your study overview
          </p>
        </div>

        {/* MOBILE LAYOUT - Shows below lg breakpoint */}
        <div className="lg:hidden flex-1 overflow-y-auto space-y-4 pb-safe" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {/* Quick Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{subjects.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Subjects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{recentDecks.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Flashcards</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{chatStats?.totalConversations || 0}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Chats</div>
              </div>
            </div>
          </div>

          {/* Subjects Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">My Subjects</h3>
              </div>
              <Link to="/subjects" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400"></div>
              </div>
            ) : subjects.length === 0 ? (
              <div className="py-6 text-center">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No subjects yet</p>
                <Link to="/subjects" className="btn-primary text-sm inline-block">
                  Create Subject
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {subjects.slice(0, 3).map(subject => (
                  <Link
                    key={subject.id}
                    to={`/subjects/${subject.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-transparent transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                      <span className="font-medium text-gray-900 dark:text-white">{subject.name}</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
                {subjects.length > 3 && (
                  <Link to="/subjects" className="block text-center py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                    +{subjects.length - 3} more
                  </Link>
                )}
              </div>
            )}

            <Link to="/subjects" className="btn-primary w-full mt-3 text-sm text-center block">
              + New Subject
            </Link>
          </div>

          {/* Flashcards Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Flashcards</h3>
              </div>
              <Link to="/flashcards" className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                View All →
              </Link>
            </div>

            {loadingDecks ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400"></div>
              </div>
            ) : recentDecks.length === 0 ? (
              <div className="py-6 text-center">
                <div className="text-4xl mb-2">🃏</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No flashcard decks yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDecks.slice(0, 3).map(deck => (
                  <Link
                    key={deck._id}
                    to={`/flashcards/study/${deck._id}`}
                    className="block p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-sm text-gray-900 dark:text-white">{deck.name}</h5>
                      <span className="text-xs px-2 py-0.5 bg-white dark:bg-gray-800 rounded-full text-purple-600 dark:text-purple-400">
                        {deck.flashcards.length} cards
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">Study Now →</span>
                      {deck.subjectId?.name && (
                        <span className="text-gray-600 dark:text-gray-400">{deck.subjectId.name}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link to="/flashcards" className="btn-primary w-full mt-3 text-sm text-center block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              View All Decks
            </Link>
          </div>

          {/* AI Chat Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Chat</h3>
            </div>

            {loadingChat ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-600 dark:border-t-cyan-400"></div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-3">
                  <div className="text-3xl">💬</div>
                </div>
                {chatStats?.totalConversations > 0 ? (
                  <>
                    <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text mb-1">
                      {chatStats.totalConversations}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {chatStats.totalConversations === 1 ? 'Conversation' : 'Conversations'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {chatStats.totalMessages} total messages
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    No conversations yet
                  </p>
                )}
              </div>
            )}

            <Link to="/chat" className="btn-primary w-full text-sm text-center block bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
              {chatStats?.totalConversations > 0 ? 'Continue Chatting' : 'Start Chatting'}
            </Link>
          </div>
        </div>

        {/* DESKTOP LAYOUT - Shows at lg breakpoint and above */}
        <div className="hidden lg:grid grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Left: Subjects List */}
          <div className="flex flex-col min-h-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 flex flex-col lg:h-full min-h-0 shadow-sm hover:shadow-lg">
              <div className="flex justify-between items-center mb-3 lg:mb-4 flex-shrink-0">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Subjects</h4>
                </div>
                <Link to="/subjects" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs font-semibold">
                  View All →
                </Link>
              </div>
              
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400"></div>
                </div>
              ) : subjects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-gray-500 dark:text-gray-400 mb-3">
                    No subjects yet
                  </p>
                  <Link to="/subjects" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-sm font-semibold">
                    Create your first subject →
                  </Link>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-0">
                  {subjects.map(subject => (
                    <Link
                      key={subject.id}
                      to={`/subjects/${subject.id}`}
                      className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-gray-100 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-transparent hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 group"
                    >
                      <div className={`w-4 h-4 rounded-full ${subject.color} group-hover:scale-110 transition-transform`}></div>
                      <span className="font-medium text-gray-900 dark:text-white">{subject.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              
              <Link to="/subjects" className="btn-primary w-full mt-4 text-center flex items-center justify-center gap-2 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Subject
              </Link>
            </div>
          </div>

          {/* Center: My Decks */}
          <div className="flex flex-col min-h-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 flex flex-col lg:h-full min-h-0 shadow-sm hover:shadow-lg">
              <div className="flex justify-between items-center mb-3 lg:mb-4 flex-shrink-0">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h4 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">My Flashcards</h4>
                </div>
                <Link to="/flashcards" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-xs font-semibold">
                  View All →
                </Link>
              </div>
              
              {loadingDecks ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400"></div>
                </div>
              ) : recentDecks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="text-5xl mb-4">🃏</div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No flashcard decks yet
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Upload notes to generate flashcards
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-2 lg:space-y-3 min-h-0">
                    {recentDecks.map(deck => (
                      <Link
                        key={deck._id}
                        to={`/flashcards/study/${deck._id}`}
                        className="block p-3 md:p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200 group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {deck.name}
                          </h5>
                          <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded-full text-xs font-semibold text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700">
                            {deck.flashcards.length} cards
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold">
                            Study Now
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                          {deck.subjectId?.name && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {deck.subjectId.name}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <Link to="/flashcards" className="btn-primary w-full mt-4 text-center flex items-center justify-center gap-2 flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    View All Decks
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right: Chat History */}
          <div className="flex flex-col min-h-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-300 flex flex-col lg:h-full min-h-0 shadow-sm hover:shadow-lg">
              <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4 flex-shrink-0">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">AI Chat</h4>
              </div>
              
              {loadingChat ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-600 dark:border-t-cyan-400"></div>
                </div>
              ) : (
                <>
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4">
                      <div className="text-4xl">💬</div>
                    </div>
                    {chatStats?.totalConversations > 0 ? (
                      <>
                        <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text mb-2">
                          {chatStats.totalConversations}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {chatStats.totalConversations === 1 ? 'Conversation' : 'Conversations'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                          {chatStats.totalMessages} total messages
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        No conversations yet
                      </p>
                    )}
                  </div>
                  
                  <Link 
                    to="/chat" 
                    className="btn-primary w-full text-center flex items-center justify-center gap-2 flex-shrink-0 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
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
