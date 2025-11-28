import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import homepageImage from '../assets/Homepage.png';
import seanHeadshot from '../assets/SeanLink.jpeg';
import jonahHeadshot from '../assets/JonahLink.jpeg';
import { versionUpdatesApi } from '../services/api.ts';

export default function LearnMore() {
  const [showUpdates, setShowUpdates] = useState(false);
  const [versionUpdates, setVersionUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [error, setError] = useState(null);

  // Fetch version updates when modal is opened
  useEffect(() => {
    const fetchUpdates = async () => {
      if (showUpdates && versionUpdates.length === 0) {
        setLoadingUpdates(true);
        setError(null);
        try {
          const updates = await versionUpdatesApi.getAll();
          console.log('Fetched version updates:', updates);
          setVersionUpdates(updates);
        } catch (error) {
          console.error('Failed to fetch version updates:', error);
          setError(error.message || 'Failed to load version updates');
        } finally {
          setLoadingUpdates(false);
        }
      }
    };

    fetchUpdates();
  }, [showUpdates, versionUpdates.length]);

  const features = [
    {
      title: "Subject Organization",
      description: "Create and manage subjects to keep your study materials organized and focused.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    {
      title: "PDF Note Upload",
      description: "Upload up to 10 PDF notes per subject. Files are securely stored and processed for AI understanding.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "AI-Generated Flashcards",
      description: "Azure OpenAI automatically creates flashcard decks from your notes for personalized study sessions.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Subject-Specific AI Chat",
      description: "Chat with an AI that understands your course materials using advanced RAG retrieval technology.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      title: "Secure Authentication",
      description: "Firebase Authentication keeps your account secure with email and Google sign-in support.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: "Personalized Dashboard",
      description: "Track your subjects, flashcard progress, and chat history all in one centralized location.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen gradient-bg relative overflow-x-hidden">
      {/* Simple Logo Nav */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/IMG_3002.png" alt="Logo" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                The Study Buddy
              </span>
            </Link>
            
            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-5 py-2 rounded-lg font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>

      {/* Landing Page Hero Section */}
      <div className="relative mx-auto max-w-7xl px-6 py-6 sm:py-8 lg:px-8 z-10" style={{maxHeight: '80vh'}}>
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-6 sm:gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-[65%_35%] lg:items-center" style={{maxHeight: '80vh'}}>
          {/* Left side - Text content */}
          <div className="lg:pr-8 text-center lg:text-left">
            <div className="w-full">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                The Study Buddy
              </h1>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Transform your homework notes into interactive flashcards and chat with an AI that understands your content. Study smarter, not harder.
              </p>

              {/* Key highlights */}
              <div className="space-y-3 mb-6 max-w-md mx-auto lg:mx-0">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Free to Join & Use</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completely free platform accessible to all students</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">AI-Powered Learning</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Generate flashcards and get instant answers from your materials</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-pink-600 dark:text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Simple 3-Step Process</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create a subject → Upload PDFs → Generate flashcards or chat</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Organized by Subject</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Keep all your study materials separated and easily accessible</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Secure & Private</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your notes are encrypted and stored safely in the cloud</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-x-6">
                <Link to="/login" className="btn-primary">
                  Get Started & Login
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">AI</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Powered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">10</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">PDFs per subject</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">24/7</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Study Access</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Screenshot (hidden on mobile) */}
          <div className="hidden lg:flex relative lg:-mr-8 items-start">
            <img
              alt="Study Buddy Dashboard Screenshot"
              src={homepageImage}
              className="w-full max-w-none rounded-2xl shadow-[0_40px_80px_-1px_rgba(0,0,0,0.5)] ring-1 ring-white/10 lg:w-[60rem] h-auto object-contain"
              style={{maxHeight: '60vh'}}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="border-t border-gray-300/50 dark:border-gray-700/50 mb-16"></div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-6xl mx-auto px-6 pb-16 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Study <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Smarter</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Transform your notes into intelligent flashcards and chat with AI that understands your content
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="mb-32">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              About Study Buddy
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p className="text-lg">
                Study Buddy is an AI-powered learning platform designed to help students maximize their study efficiency. 
                Upload your PDF notes, organize them by subject, and let advanced AI technology transform them into 
                interactive study materials.
              </p>
              <p className="text-lg">
                Built with cutting-edge cloud technologies including Azure OpenAI, Firebase, and MongoDB, Study Buddy 
                provides a scalable, intelligent study companion that adapts to your learning needs.
              </p>
            </div>
          </div>
        </div>

        {/* Creators Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Meet the Creators
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Jonah Rothman */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <img 
                  src={jonahHeadshot} 
                  alt="Jonah Rothman"
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Jonah Rothman</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium">Computer Science</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Boston University</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Senior pursuing BA/MS in Computer Science with a minor in Economics. Passionate about web development 
                and artificial intelligence with experience as a Full Stack Developer Intern.
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span>Junior Front End Developer at PanelClaw</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span>Built VibeScape - Spotify visualization platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span>Tech: TypeScript, Next.js, React Native, Git</span>
                </div>
              </div>
            </div>

            {/* Sean Tomany */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <img 
                  src={seanHeadshot} 
                  alt="Sean Tomany"
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-500/20"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Sean Tomany</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium">Data Science</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Boston University</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Data Science student (Class of 2026) specializing in AI/ML systems. Software Engineering Intern at Dynapt, 
                building intelligent voice agents and ML pipelines for enterprise solutions.
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Software Engineering Intern at Dynapt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>ML Heart Disease Prediction (90% F1 score)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Tech: Python, SQL, Rust, LangChain, Azure, Tableau</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Study Routine?
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Join students who are studying smarter with AI-powered tools
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Get Started Now
          </Link>
        </div>

        {/* What's New Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setShowUpdates(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            What's New
          </button>
        </div>
      </div>

      {/* Version Updates Modal */}
      {showUpdates && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUpdates(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                What's New
              </h2>
              <button
                onClick={() => setShowUpdates(false)}
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {loadingUpdates ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">{error}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Please make sure the backend server is running.</p>
                </div>
              ) : versionUpdates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No version updates available.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {versionUpdates.map((update, index) => (
                    <div
                      key={update._id || index}
                      className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
                    >
                      {/* Version Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-full">
                            v{update.version}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {update.title}
                          </h3>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(update.releaseDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {update.description}
                      </p>

                      {/* Features List */}
                      {update.features && update.features.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Features:
                          </h4>
                          <ul className="space-y-2">
                            {update.features.map((feature, featureIndex) => (
                              <li
                                key={featureIndex}
                                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                              >
                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
