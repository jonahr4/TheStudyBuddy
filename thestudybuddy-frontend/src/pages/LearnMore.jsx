import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import homepageImage from '../assets/Homepage3.png';
import seanHeadshot from '../assets/SeanLink.jpeg';
import jonahHeadshot from '../assets/JonahLink.jpeg';
import { versionUpdatesApi } from '../services/api.ts';

export default function LearnMore() {
  const [showUpdates, setShowUpdates] = useState(false);
  const [versionUpdates, setVersionUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      if (showUpdates && versionUpdates.length === 0) {
        setLoadingUpdates(true);
        setError(null);
        try {
          const updates = await versionUpdatesApi.getAll();
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

  const testimonials = [
    {
      quote: "Study Buddy completely transformed my exam prep. I went from C's to A's in one semester.",
      author: "Ayoub",
      role: "Pre-Med Student, UCLA"
    },
    {
      quote: "The AI chat actually understands my notes. It's like having a tutor who read everything I did.",
      author: "Ali",
      role: "Engineering Major, MIT"
    },
    {
      quote: "I used to spend 4 hours making flashcards. Now it takes 4 minutes. Game changer.",
      author: "Omar",
      role: "Law Student, NYU"
    },
    {
      quote: "Finally, a study tool that doesn't feel like another chore. Actually makes studying enjoyable.",
      author: "Abidul",
      role: "Business Major, Stanford"
    },
    {
      quote: "The flashcard generation is incredible. It picks out exactly what I need to study for exams.",
      author: "Magda",
      role: "Biology Major, Boston University"
    }
  ];

  const features = [
    {
      title: "Upload Any Document",
      description: "PDFs, Word docs, PowerPoints—drop them in and we'll do the rest. Your notes become instantly searchable and AI-ready.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      title: "AI Flashcard Generation",
      description: "Our AI reads your materials and creates perfect flashcards automatically. Study the concepts that matter, skip the busywork.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Chat With Your Notes",
      description: "Ask questions, get explanations, dive deeper. The AI knows your exact course materials—no generic answers.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      title: "Subject Organization",
      description: "Keep everything sorted by class. Biology notes don't mix with History. Clean, simple, effective.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    {
      title: "Progress Tracking",
      description: "See what you've mastered and what needs work. Smart repetition means you remember more with less effort.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Secure & Private",
      description: "Your notes are encrypted and never shared. Firebase Authentication keeps your account locked down tight.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  const faqs = [
    {
      q: "What file types can I upload?",
      a: "Currently we support PDFs, Word documents (.docx), and PowerPoint presentations (.pptx). More formats coming soon."
    },
    {
      q: "How does the AI understand my specific notes?",
      a: "We use advanced RAG (Retrieval-Augmented Generation) technology. When you ask a question, the AI searches through YOUR uploaded materials first, then crafts an answer based on that context. It's like having a tutor who actually read your textbook."
    },
    {
      q: "Is my data safe?",
      a: "Absolutely. We use Firebase Authentication for secure login, Azure for encrypted storage, and never share or sell your data. Your notes stay yours."
    },
    {
      q: "How many subjects can I create?",
      a: "As many as you need. Each subject can hold up to 10 documents, and you can create unlimited subjects."
    },
    {
      q: "Can I use this for group study?",
      a: "Right now Study Buddy is designed for individual use. Collaboration features are on our roadmap for a future release."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/IMG_3002.png" alt="Logo" className="h-8 w-8 object-contain" />
            <span className="text-lg font-semibold tracking-tight">The Study Buddy</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Features</button>
            <button onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Testimonials</button>
            <button onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">FAQ</button>
            <button onClick={() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Team</button>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-4 py-2 transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="text-sm font-medium bg-zinc-900 text-white px-5 py-2.5 rounded-full hover:bg-zinc-700 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-8 md:pt-40 md:pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Now supporting PDF, Word & PowerPoint
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-zinc-900 mb-6 leading-[0.95]">
            Your Study Hours,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Cut in Half.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Upload your notes. Get AI-generated flashcards. Chat with a tutor that actually read your materials. Study smarter, not longer.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link 
              to="/signup" 
              className="group bg-zinc-900 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-zinc-700 transition-all flex items-center gap-2 shadow-lg shadow-zinc-900/20"
            >
              Start Studying Free
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <button 
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-zinc-600 px-8 py-4 rounded-full text-base font-medium hover:text-zinc-900 transition-colors flex items-center gap-2"
            >
              See how it works
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-zinc-400">
            Trusted by students at <span className="text-zinc-600 font-medium">Boston University</span>, <span className="text-zinc-600 font-medium">MIT</span>, <span className="text-zinc-600 font-medium">Stanford</span>, and more
          </p>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="demo" className="px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100 via-violet-100 to-purple-100 rounded-3xl blur-3xl opacity-60" />
            
            {/* Image Container */}
            <div className="relative bg-white rounded-t-2xl p-2 pb-0 shadow-2xl shadow-zinc-900/10 ring-1 ring-zinc-900/5 ring-b-0">
              <div className="relative rounded-t-xl overflow-hidden">
                <img
                  alt="Study Buddy Dashboard"
                  src={homepageImage}
                  className="w-full"
                />
                {/* Blur gradient fade at bottom */}
                <div 
                  className="absolute inset-x-0 bottom-0 h-1/2 backdrop-blur-[2px]"
                  style={{ 
                    background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0) 100%)',
                    maskImage: 'linear-gradient(to top, black 0%, black 50%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to top, black 0%, black 50%, transparent 100%)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Overlapping the image */}
      <section className="pt-8 pb-24 px-6 bg-white relative z-10 -mt-32 md:-mt-48">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
              Three steps to better grades.
            </h2>
            <p className="text-xl text-zinc-500">No setup wizards. No learning curve. Just results.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload Your Notes", desc: "Drop in your PDFs, Word docs, or PowerPoints. We process them in under a minute." },
              { step: "02", title: "Get Smart Flashcards", desc: "Our AI extracts key concepts and creates flashcards automatically. Review what matters." },
              { step: "03", title: "Chat & Learn", desc: "Ask questions about your materials. Get explanations, examples, and clarity on demand." }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="text-7xl font-bold text-zinc-100 group-hover:text-indigo-100 transition-colors absolute -top-4 -left-2">{item.step}</div>
                <div className="relative pt-12 pl-2">
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">{item.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
              Everything you need to ace your classes.
            </h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
              Built for students who want to work smarter, not harder.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="bg-white rounded-2xl p-8 border border-zinc-100 hover:border-zinc-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Infinite Scrolling Marquee */}
      <section id="testimonials" className="py-16 bg-white border-b border-zinc-100 overflow-hidden">
        <div className="text-center mb-10 px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
            Students love Study Buddy.
          </h2>
          <p className="text-zinc-500">Join thousands of students studying smarter.</p>
        </div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling track */}
          <div className="flex animate-marquee">
            {/* First set */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <div 
                key={i}
                className="flex-shrink-0 w-[400px] mx-3 bg-zinc-50 rounded-2xl p-6 border border-zinc-100"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-zinc-700 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white font-bold text-xs">
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 text-sm">{t.author}</div>
                    <div className="text-xs text-zinc-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CSS for infinite scroll animation */}
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
              Got questions?
            </h2>
            <p className="text-xl text-zinc-500">We've got answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="bg-white rounded-xl border border-zinc-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
                >
                  <span className="font-semibold text-zinc-900 pr-4">{faq.q}</span>
                  <svg 
                    className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-zinc-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
              Built by students, for students.
            </h2>
            <p className="text-xl text-zinc-500">Meet the team behind Study Buddy.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Jonah */}
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-start gap-5 mb-6">
                <img 
                  src={jonahHeadshot} 
                  alt="Jonah Rothman" 
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                />
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Jonah Rothman</h3>
                  <p className="text-indigo-600 font-medium">Computer Science</p>
                  <p className="text-sm text-zinc-400">Boston University</p>
                </div>
              </div>
              <p className="text-zinc-600 leading-relaxed text-sm mb-4">
                Senior pursuing BA/MS in Computer Science with a minor in Economics. Full-stack developer with a passion for building tools that make learning more accessible.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">React</span>
                <span className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">Node.js</span>
                <span className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">Azure</span>
              </div>
            </div>

            {/* Sean */}
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-start gap-5 mb-6">
                <img 
                  src={seanHeadshot} 
                  alt="Sean Tomany" 
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                />
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Sean Tomany</h3>
                  <p className="text-violet-600 font-medium">Data Science</p>
                  <p className="text-sm text-zinc-400">Boston University</p>
                </div>
              </div>
              <p className="text-zinc-600 leading-relaxed text-sm mb-4">
                Data Science student (Class of 2026) specializing in AI/ML systems. Software Engineering Intern at Dynapt, building intelligent voice agents and ML pipelines.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">Python</span>
                <span className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">ML/AI</span>
                <span className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">Azure OpenAI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Ready to study smarter?
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join students who've already transformed how they learn. Free to start, powerful from day one.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/signup" 
              className="bg-white text-zinc-900 px-8 py-4 rounded-full text-base font-semibold hover:bg-zinc-100 transition-all shadow-xl"
            >
              Get Started Free
            </Link>
            <button
              onClick={() => setShowUpdates(true)}
              className="text-zinc-400 hover:text-white px-8 py-4 rounded-full text-base font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              What's New
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <img src="/IMG_3002.png" alt="Logo" className="h-5 w-5 object-contain opacity-60" />
            <span>© 2025 The Study Buddy. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <button onClick={() => setShowUpdates(true)} className="hover:text-white transition-colors">Changelog</button>
            <a href="mailto:support@studybuddy.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Version Updates Modal */}
      {showUpdates && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUpdates(false)}>
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">What's New</h2>
              <button onClick={() => setShowUpdates(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              {loadingUpdates ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
              ) : versionUpdates.length === 0 ? (
                <div className="text-center text-zinc-500 py-8">No updates available.</div>
              ) : (
                <div className="space-y-8">
                  {versionUpdates.map((update, index) => (
                    <div key={update._id || index} className="relative pl-8 border-l-2 border-zinc-200">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white"></div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-bold rounded">
                          v{update.version}
                        </span>
                        <span className="text-sm text-zinc-400">
                          {new Date(update.releaseDate).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 mb-2">{update.title}</h3>
                      <p className="text-zinc-600 text-sm mb-3">{update.description}</p>
                      {update.features?.length > 0 && (
                        <ul className="space-y-1">
                          {update.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-zinc-500">
                              <span className="text-indigo-600 mt-0.5">•</span> {f}
                            </li>
                          ))}
                        </ul>
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
