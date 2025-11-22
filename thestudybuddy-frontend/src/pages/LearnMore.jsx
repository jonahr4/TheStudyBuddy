import { Link } from 'react-router-dom';

export default function LearnMore() {
  return (
    <div className="min-h-screen gradient-bg relative">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>

      {/* Back Button - Top Left */}
      <div className="pt-8 pl-8 relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white hover:text-white transition-colors bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Landing
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 space-y-12">
          
          {/* What is Study Buddy */}
          <section className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              📚 What is Study Buddy?
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Study Buddy is an AI-powered learning tool that helps students upload homework notes, 
              turn them into flashcards, and chat with an AI that understands their content.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Organize your learning by subjects, upload up to 10 PDF notes per subject, and let 
              Azure OpenAI generate personalized flashcards and provide intelligent chat responses 
              based on your actual course materials.
            </p>
          </section>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Features */}
          <section className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              ✨ Features of Study Buddy
            </h2>
            
            <div className="grid gap-6 md:gap-8 text-left">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  📂 Subject-Based Organization
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Create and manage subjects like "Biology 101" or "Calculus II" to keep your 
                  study materials organized and focused.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  📄 PDF Note Upload
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Upload up to 10 PDF notes per subject. Your files are securely stored in 
                  Azure Blob Storage and processed for AI understanding.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  🃏 AI-Generated Flashcards
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Azure OpenAI automatically creates flashcard decks from your notes, helping 
                  you study smarter with personalized content.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  💬 Subject-Specific AI Chat
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Chat with an AI that understands your course materials. Ask questions and 
                  get answers based on your uploaded notes using advanced RAG retrieval.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  🔐 Secure Authentication
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Firebase Authentication keeps your account secure with email/password login 
                  and Google sign-in support.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  📊 Personalized Dashboard
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Track your subjects, flashcard progress, and chat history all in one place.
                </p>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Why We Made Study Buddy */}
          <section className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              💡 Why We Made Study Buddy
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Study Buddy was created by <span className="font-semibold text-indigo-600 dark:text-indigo-400">Jonah</span> and <span className="font-semibold text-indigo-600 dark:text-indigo-400">Sean</span>, 
              two students who wanted to gain hands-on experience using tools available to us as students 
              while working with technologies common in the industry.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              We wanted to create a study platform that could genuinely help us and our classmates 
              learn more effectively. By combining our coursework with real-world development practices, 
              we're building something that serves both as a learning experience and a practical tool 
              for students everywhere.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Our goal is to leverage modern cloud technologies like Azure, Firebase, and MongoDB 
              to create a scalable, intelligent study companion that makes learning more personalized 
              and efficient. 🚀
            </p>
          </section>

          {/* CTA Button */}
          <div className="text-center pt-8">
            <Link to="/signup" className="btn-primary text-lg px-8 py-3">
              Get Started Today 🎓
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
