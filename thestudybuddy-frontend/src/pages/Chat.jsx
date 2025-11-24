import { useState, useEffect, useRef } from 'react';
import { useSubjects } from '../contexts/SubjectContext';
import { useAuth } from '../firebase/AuthContext';
import { chatApi } from '../services/api';

export default function Chat() {
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { currentUser } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Select first subject by default when subjects load
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0].id);
    }
  }, [subjects, selectedSubject]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history when subject changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!selectedSubject) return;
      
      try {
        const response = await chatApi.getHistory(selectedSubject);
        const loadedMessages = response.messages.map(msg => ({
          id: msg.timestamp,
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'ai',
          time: new Date(msg.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
        }));
        setMessages(loadedMessages);
      } catch (error) {
        console.error('Failed to load chat history:', error);
        // If loading fails, start with empty history
        setMessages([]);
      }
    };

    loadChatHistory();
  }, [selectedSubject]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedSubject || sending) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      // Chat history is now loaded from MongoDB by the backend
      const response = await chatApi.sendMessage({
        subjectId: selectedSubject,
        message: inputMessage,
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.reply,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.message || 'Failed to get AI response. Please try again.'}`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (subjectsLoading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="gradient-bg min-h-screen">
        <div className="gradient-blur">
          <div className="gradient-blur-shape" />
        </div>
        <div className="p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Subjects Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a subject and upload some notes to start chatting with AI!
            </p>
            <a href="/subjects" className="btn-primary inline-block">
              Go to Subjects
            </a>
          </div>
        </div>
      </div>
    );
  }

  const currentSubject = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="p-8">
        <div className="mb-6">
          <h2 className="mb-4">AI Chat</h2>
          
          {/* Subject Switcher */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Chat about:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                      selectedSubject === subject.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={async () => {
                  if (confirm('Clear all chat history for this subject?')) {
                    try {
                      await chatApi.clearHistory(selectedSubject);
                      setMessages([]);
                    } catch (error) {
                      console.error('Failed to clear chat history:', error);
                      alert('Failed to clear chat history');
                    }
                  }
                }}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors whitespace-nowrap"
              >
                Clear Chat
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ask questions about your {currentSubject?.name} notes
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Chat Messages */}
          <div className="card h-[calc(100vh-400px)] mb-4 overflow-y-auto">
            <div className="space-y-6">
              {messages.map(message => (
                <div 
                  key={message.id}
                  className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Label */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    {message.sender === 'user' ? (
                      <>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'You'}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                          {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                          SB
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Study Buddy
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div 
                    className={`max-w-[70%] rounded-lg px-4 py-3 shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <p className={`text-sm mb-2 whitespace-pre-wrap ${
                      message.sender === 'user' 
                        ? 'text-white' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {message.text}
                    </p>
                    <p className={`text-xs ${
                      message.sender === 'user' 
                        ? 'text-indigo-200' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
              
              {sending && (
                <div className="flex flex-col items-start">
                  {/* Sender Label */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                      SB
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Study Buddy
                    </span>
                  </div>
                  
                  {/* Typing Indicator */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {messages.length === 0 && !sending && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-xl mb-2">👋</p>
                  <p>Start a conversation about {currentSubject?.name}</p>
                  <p className="text-sm mt-2 text-gray-400">
                    I can answer questions based on your uploaded notes
                  </p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input Area */}
          <div className="flex gap-2">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              placeholder={`Ask a question about ${currentSubject?.name}...`}
              className="input"
            />
            <button 
              onClick={handleSendMessage}
              disabled={sending || !inputMessage.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
