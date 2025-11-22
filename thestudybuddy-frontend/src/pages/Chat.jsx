import { useState } from 'react';

export default function Chat() {
  const [selectedSubject, setSelectedSubject] = useState(1);
  
  // Mock data - will be replaced with real data later
  const subjects = [
    { id: 1, name: 'Biology 101', color: 'bg-green-500' },
    { id: 2, name: 'Calculus II', color: 'bg-blue-500' },
    { id: 3, name: 'World History', color: 'bg-purple-500' },
  ];

  const mockMessages = [
    { id: 1, text: 'What is photosynthesis?', sender: 'user', time: '10:30 AM' },
    { id: 2, text: 'Photosynthesis is the process by which plants convert light energy into chemical energy...', sender: 'ai', time: '10:30 AM' },
    { id: 3, text: 'Can you explain it in simpler terms?', sender: 'user', time: '10:31 AM' },
  ];

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
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  <div className={`w-2 h-2 rounded-full ${subject.color}`}></div>
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ask questions about your {subjects.find(s => s.id === selectedSubject)?.name} notes
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Chat Messages */}
          <div className="card h-96 mb-4 overflow-y-auto">
            <div className="space-y-4">
              {mockMessages.map(message => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm mb-1">{message.text}</p>
                    <p className={`text-xs ${
                      message.sender === 'user' 
                        ? 'text-indigo-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
              
              {mockMessages.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-xl mb-2">👋</p>
                  <p>Start a conversation about {subjects.find(s => s.id === selectedSubject)?.name}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Input Area */}
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder={`Ask a question about ${subjects.find(s => s.id === selectedSubject)?.name}...`}
              className="input"
            />
            <button className="btn-primary">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
