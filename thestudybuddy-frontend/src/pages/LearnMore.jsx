import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import homepageImage from '../assets/Homepage3.png';
import seanHeadshot from '../assets/SeanLink.jpeg';
import jonahHeadshot from '../assets/JonahLink.jpeg';
import changelogData from '../data/changelog.json';

// Demo Flashcards Component
function DemoFlashcards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const demoCards = [
    {
      front: "What type of bond forms between metals and non-metals?",
      back: "Ionic bonds - formed through electron transfer where metals lose electrons and non-metals gain electrons"
    },
    {
      front: "How are covalent bonds formed?",
      back: "Sharing of electron pairs between atoms, typically between non-metals with similar electronegativity"
    },
    {
      front: "What creates the 'sea of electrons' in metallic bonding?",
      back: "Delocalized valence electrons that flow freely across the metal lattice"
    },
    {
      front: "What is electronegativity and how does it affect bonding?",
      back: "A measure of an atom's ability to attract electrons. Higher differences create ionic bonds, lower differences create covalent bonds"
    }
  ];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < demoCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const currentCard = demoCards[currentIndex];

  return (
    <div className="flex flex-col">
      {/* Flashcard */}
      <div className="demo-flip-container" onClick={handleFlip}>
        <div className={`demo-flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front of card */}
          <div className="demo-flip-card-front">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-lg min-h-[322px] w-full flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow">
              <div className="text-center p-7">
                <div className="text-sm text-indigo-600 font-semibold mb-4">
                  FRONT
                </div>
                <p className="text-base text-zinc-900">
                  {currentCard.front}
                </p>
                <div className="text-sm text-zinc-400 mt-5">
                  Click to flip
                </div>
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div className="demo-flip-card-back">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-lg min-h-[322px] w-full flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow">
              <div className="text-center p-7">
                <div className="text-sm text-green-600 font-semibold mb-4">
                  BACK
                </div>
                <p className="text-base text-zinc-900">
                  {currentCard.back}
                </p>
                <div className="text-sm text-zinc-400 mt-5">
                  Click to flip
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation and Counter */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-xs text-zinc-500">
          {currentIndex + 1} / {demoCards.length}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === demoCards.length - 1}
          className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function LearnMore() {
  const [showUpdates, setShowUpdates] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [uploadScrollProgress, setUploadScrollProgress] = useState(0);
  const [flashcardScrollProgress, setFlashcardScrollProgress] = useState(0);
  const uploadSectionRef = useRef(null);
  const flashcardSectionRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const handleScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        // Upload section animation
        if (uploadSectionRef.current) {
          const section = uploadSectionRef.current;
          const rect = section.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          const sectionTop = rect.top;
          const sectionHeight = rect.height;
          const viewportMiddle = windowHeight / 2;

          const sectionCenter = sectionTop + (sectionHeight / 2) - 100;
          const animationStart = sectionCenter - viewportMiddle;
          const animationEnd = animationStart - (sectionHeight * 0.5);

          let progress = 0;

          if (animationStart > 0) {
            progress = 0;
          } else if (animationStart <= 0 && sectionTop > animationEnd) {
            progress = Math.abs(animationStart) / (sectionHeight * 0.5);
          } else {
            progress = 1;
          }

          progress = Math.max(0, Math.min(1, progress));
          setUploadScrollProgress(progress);
        }

        // Flashcard section animation
        if (flashcardSectionRef.current) {
          const section = flashcardSectionRef.current;
          const rect = section.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          const sectionTop = rect.top;
          const sectionHeight = rect.height;
          const viewportMiddle = windowHeight / 2;

          const sectionCenter = sectionTop + (sectionHeight / 2) - 600;
          const animationStart = sectionCenter - viewportMiddle;
          const animationEnd = animationStart - (sectionHeight * 0.75);

          let progress = 0;

          if (animationStart > 0) {
            progress = 0;
          } else if (animationStart <= 0 && sectionTop > animationEnd) {
            progress = Math.abs(animationStart) / (sectionHeight * 0.75);
          } else {
            progress = 1;
          }

          progress = Math.max(0, Math.min(1, progress));
          setFlashcardScrollProgress(progress);
        }
      });
    };

    // Try multiple scroll targets
    const scrollTargets = [window, document, document.body, document.documentElement];

    scrollTargets.forEach(target => {
      target.addEventListener('scroll', handleScroll, { passive: true });
    });

    handleScroll(); // Initial check

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      scrollTargets.forEach(target => {
        target.removeEventListener('scroll', handleScroll);
      });
    };
  }, []);

  const testimonials = [
    {
      quote: "Study Buddy completely transformed my exam prep. I went from C's to A's in one semester.",
      author: "Ayoub",
      role: "Media Science Major",
      image: "/ayoub-pfp.png"
    },
    {
      quote: "The AI chat actually understands my notes. It's like having a tutor who read everything I did.",
      author: "Ali",
      role: "Media Science & Journalism Major",
      image: "/ali-pfp.jpeg"
    },
    {
      quote: "I used to spend 4 hours making flashcards. Now it takes 4 minutes. Game changer.",
      author: "Omar",
      role: "Computer Science & Economics Major",
      image: "/omar-pfp.jpeg"
    },
    {
      quote: "Finally, a study tool that doesn't feel like another chore. Actually makes studying enjoyable.",
      author: "Abidul",
      role: "Computer Science Major",
      image: "/abidul-pfp.avif"
    },
    {
      quote: "The flashcard generation is incredible. It picks out exactly what I need to study for exams.",
      author: "Magda",
      role: "Biology Major",
      image: "/magda-pfp.jpeg"
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
      q: "How many subjects can I create?",
      a: "As many as you need. Each subject can hold up to 10 documents, and you can create unlimited subjects."
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
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="demo" className="hidden md:block px-6 relative pb-16 z-0">
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Steps to Better Grades */}
      <section className="py-16 px-6 border-b border-zinc-100 relative -mt-64 z-10 overflow-visible">
        {/* Background with gradient opacity */}
        <div
          className="absolute inset-x-0 bottom-0 -top-32"
          style={{
            background: 'linear-gradient(to top, rgb(250, 250, 250) 0%, rgb(250, 250, 250) 60%, rgba(250, 250, 250, 0) 100%)'
          }}
        />
        <div className="text-center pt-32 relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
            Three steps to better grades.
          </h2>
          <p className="text-xl text-zinc-600">Upload. Learn. Ask.</p>
        </div>
      </section>

      {/* 1. Upload Notes Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white via-indigo-50/30 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/40 to-violet-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Section Title */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <p className="text-indigo-600 font-bold text-xl">STEP ONE</p>
              </div>
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 rounded-lg blur-xl opacity-30"></div>
                <h2 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  Drop Your Notes
                </h2>
              </div>
              <p className="text-zinc-600 mt-3 text-sm">Upload any file format in seconds</p>
            </div>
          </div>

          <div ref={uploadSectionRef} className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center relative">
            {/* Left: Drag to Upload Box */}
            <div className="bg-white rounded-xl border-2 border-dashed border-zinc-300 shadow-lg h-[430px] flex flex-col items-center justify-center p-8 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all relative overflow-hidden">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center text-indigo-600 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Drop your files here</h3>
              <p className="text-zinc-500 text-center mb-4">or click to browse</p>
              <p className="text-sm text-zinc-400 text-center">Supports PDF, DOCX, PPTX</p>
              <div className="mt-6">
                <button className="bg-zinc-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-zinc-700 transition-all">
                  Choose Files
                </button>
              </div>
            </div>

            {/* Center: Left Arrow */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

            {/* Right: Sample Notes Tabs */}
            <div
              className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden h-[430px] flex flex-col"
              style={{
                transform: `translateX(${uploadScrollProgress * -124.5}%) scale(${1 - uploadScrollProgress * 0.35})`,
                transition: 'transform 0.3s ease-out',
                transformOrigin: 'center'
              }}
            >
              {/* Document Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                </div>
                <span className="text-white text-xs font-medium ml-2">Chemistry Lecture 4.pdf</span>
              </div>

              {/* File Content Preview */}
              <div className="p-5 bg-gradient-to-b from-zinc-50 to-white flex-1 overflow-hidden">
                <h3 className="text-base font-bold text-zinc-900 mb-2.5">Topics Covered</h3>
                <div className="space-y-0.5 text-zinc-600 leading-[1.2] notes-content">
                  <style>{`
                    .notes-content p {
                      font-size: 14px !important;
                    }
                  `}</style>
                  <p className="font-semibold text-zinc-800">Molecular Geometry</p>
                  <p>• VSEPR theory predicts molecular shapes</p>
                  <p>• Electron pairs repel to minimize energy</p>
                  <p>• Common shapes: linear, trigonal, tetrahedral</p>

                  <p className="font-semibold text-zinc-800 mt-2">Polarity</p>
                  <p>• Unequal sharing of electrons creates dipoles</p>
                  <p>• Affects solubility and intermolecular forces</p>
                  <p>• Water is a polar molecule (H₂O)</p>

                  <p className="font-semibold text-zinc-800 mt-2">Intermolecular Forces</p>
                  <p>• London dispersion forces (weakest)</p>
                  <p>• Dipole-dipole interactions</p>
                  <p>• Hydrogen bonding (strongest)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Flashcards Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white via-violet-50/30 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-bl from-violet-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-100/40 to-indigo-100/40 rounded-full blur-3xl"></div>

        <style>{`
          .demo-flip-container {
            perspective: 1500px;
          }

          .demo-flip-card-inner {
            position: relative;
            width: 100%;
            min-height: 322px;
            transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
            transform-style: preserve-3d;
          }

          .demo-flip-card-inner.flipped {
            transform: rotateY(180deg);
          }

          .demo-flip-card-front,
          .demo-flip-card-back {
            position: absolute;
            width: 100%;
            min-height: 322px;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .demo-flip-card-back {
            transform: rotateY(180deg);
          }
        `}</style>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Section Title */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <p className="text-violet-600 font-bold text-xl">STEP TWO</p>
              </div>
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 rounded-lg blur-xl opacity-30"></div>
                <h2 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  AI Generates Flashcards
                </h2>
              </div>
              <p className="text-zinc-600 mt-3 text-sm">Smart cards created automatically from your notes</p>
            </div>
          </div>

          <div ref={flashcardSectionRef} className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center relative">
            {/* Left: Document Preview */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden h-[430px] flex flex-col relative z-10">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                </div>
                <span className="text-white text-xs font-medium ml-2">Chemistry 101 Notes.pdf</span>
              </div>
              <div className="p-5 bg-gradient-to-b from-zinc-50 to-white flex-1 overflow-y-auto">
                <h3 className="text-base font-bold text-zinc-900 mb-2.5">Chemical Bonding - Lecture 3</h3>
                <div className="space-y-0.5 text-zinc-600 leading-[1.2] notes-content">
                  <style>{`
                    .notes-content p {
                      font-size: 14px !important;
                    }
                  `}</style>
                  <p className="font-semibold text-zinc-800">1. Ionic Bonds</p>
                  <p>• Form between metals and non-metals through electron transfer</p>
                  <p>• Metal atoms lose electrons to become cations (+ charge)</p>
                  <p>• Non-metal atoms gain electrons to become anions (- charge)</p>
                  <p>• Electrostatic attraction holds oppositely charged ions together</p>
                  <p>• Result in crystalline structures with high melting points</p>
                  <p>• Examples: NaCl (table salt), MgO (magnesium oxide)</p>

                  <p className="font-semibold text-zinc-800 mt-2">2. Covalent Bonds</p>
                  <p>• Sharing of electron pairs between atoms</p>
                  <p>• Occurs between non-metal atoms with similar electronegativity</p>
                  <p>• Can be single (2e⁻), double (4e⁻), or triple bonds (6e⁻)</p>
                  <p>• Common in organic molecules and molecular compounds</p>
                  <p>• Form discrete molecules rather than crystal lattices</p>
                  <p>• Examples: H₂O (water), CO₂ (carbon dioxide), CH₄ (methane)</p>

                  <p className="font-semibold text-zinc-800 mt-2">3. Metallic Bonds</p>
                  <p>• Form between metal atoms in solid metals</p>
                  <p>• Valence electrons are delocalized across metal lattice</p>
                  <p>• Creates "sea of electrons" that flows freely</p>
                  <p>• Explains electrical conductivity and malleability of metals</p>
                  <p>• Examples: copper (Cu), iron (Fe), gold (Au)</p>

                  <p className="font-semibold text-zinc-800 mt-2">Key Concept: Electronegativity</p>
                  <p>• Measure of atom's ability to attract electrons in a bond</p>
                  <p>• Higher difference in electronegativity → more ionic character</p>
                  <p>• Lower difference → more covalent character</p>
                </div>
              </div>
            </div>

            {/* Center: Arrow */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

            {/* Right: Interactive Flashcards */}
            <div
              style={{
                transform: `translateX(${(1 - flashcardScrollProgress) * -124.5}%) scale(${0.5 + flashcardScrollProgress * 0.5})`,
                transition: 'transform 0.3s ease-out',
                transformOrigin: 'center left',
                zIndex: flashcardScrollProgress < 0.5 ? 0 : 10
              }}
            >
              <DemoFlashcards />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Chat with Study Buddy */}
      <section className="py-20 px-6 bg-gradient-to-b from-white via-indigo-50/30 to-white relative overflow-hidden border-b border-zinc-100">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/40 to-violet-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Section Title */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <p className="text-indigo-600 font-bold text-xl">STEP THREE</p>
              </div>
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 rounded-lg blur-xl opacity-30"></div>
                <h2 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  Ask Questions, Get Answers
                </h2>
              </div>
              <p className="text-zinc-600 mt-3 text-sm">Chat with AI that knows your material inside-out</p>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
            {/* Left: Physics Notes */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden h-[430px] flex flex-col">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                </div>
                <span className="text-white text-xs font-medium ml-2">Physics 201 Notes.pdf</span>
              </div>
              <div className="p-5 bg-gradient-to-b from-zinc-50 to-white flex-1 overflow-y-auto">
                <h3 className="text-base font-bold text-zinc-900 mb-2.5">Newton's Laws of Motion</h3>
                <div className="space-y-0.5 text-zinc-600 leading-[1.2] notes-content">
                  <style>{`
                    .notes-content p {
                      font-size: 14px !important;
                    }
                  `}</style>
                  <p className="font-semibold text-zinc-800">Newton's First Law (Law of Inertia)</p>
                  <p>• An object at rest stays at rest, an object in motion stays in motion</p>
                  <p>• This continues unless acted upon by an external force</p>
                  <p>• Inertia is the tendency of objects to resist changes in motion</p>
                  <p>• Mass is a measure of inertia - more mass = more inertia</p>
                  <p>• Example: A book on a table won't move until you push it</p>

                  <p className="font-semibold text-zinc-800 mt-2">Newton's Second Law (F = ma)</p>
                  <p>• Force equals mass times acceleration (F = ma)</p>
                  <p>• Acceleration is directly proportional to net force</p>
                  <p>• Acceleration is inversely proportional to mass</p>
                  <p>• Units: Force in Newtons (N), mass in kg, acceleration in m/s²</p>
                  <p>• Example: Pushing a shopping cart - more force or less mass = more acceleration</p>

                  <p className="font-semibold text-zinc-800 mt-2">Newton's Third Law (Action-Reaction)</p>
                  <p>• For every action, there is an equal and opposite reaction</p>
                  <p>• Forces always come in pairs - action and reaction forces</p>
                  <p>• These forces act on different objects</p>
                  <p>• Forces are equal in magnitude and opposite in direction</p>
                  <p>• Example: When you push against a wall, the wall pushes back with equal force</p>
                </div>
              </div>
            </div>

            {/* Center: Arrow */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

            {/* Right: AI Chat */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden flex flex-col h-[430px]">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
                  SB
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Study Buddy AI</div>
                  <div className="text-white/80 text-xs">Physics 201</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-zinc-50 to-white">
                {/* User Message 1 */}
                <div className="flex flex-col items-end">
                  <div className="bg-indigo-600 text-white rounded-lg px-4 py-2 max-w-[80%] shadow-sm">
                    <p className="text-sm text-white">Can you explain Newton's Second Law?</p>
                  </div>
                </div>

                {/* AI Response 1 */}
                <div className="flex flex-col items-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[85%] shadow-sm">
                    <p className="text-sm text-zinc-900">Based on your notes, Newton's Second Law states that Force equals mass times acceleration (F = ma). This means that acceleration is directly proportional to the net force applied and inversely proportional to the object's mass. For example, if you push a shopping cart with more force or reduce its mass, it will accelerate more.</p>
                  </div>
                </div>

                {/* User Message 2 */}
                <div className="flex flex-col items-end">
                  <div className="bg-indigo-600 text-white rounded-lg px-4 py-2 max-w-[80%] shadow-sm">
                    <p className="text-sm text-white">What's an example of the Third Law?</p>
                  </div>
                </div>

                {/* AI Response 2 */}
                <div className="flex flex-col items-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[85%] shadow-sm">
                    <p className="text-sm text-zinc-900">According to your notes, when you push against a wall, the wall pushes back with equal force. This demonstrates that forces always come in pairs - the action force (you pushing the wall) and the reaction force (wall pushing you back).</p>
                  </div>
                </div>
              </div>

              {/* Chat Input (disabled/demo) */}
              <div className="border-t border-zinc-200 p-3 bg-white">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    disabled
                    className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-400"
                  />
                  <button disabled className="p-2 bg-indigo-600 text-white rounded-lg opacity-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Infinite Scrolling Marquee */}
      <section id="testimonials" className="py-16 bg-zinc-50 border-b border-zinc-100 overflow-hidden">
        <div className="text-center mb-10 px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
            Students love Study Buddy.
          </h2>
          <p className="text-zinc-500">Join a growing number of students studying smarter.</p>
        </div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-50 to-transparent z-10 pointer-events-none" />

          {/* Scrolling track - wrapper */}
          <div className="overflow-hidden">
            <div className="flex gap-6 animate-scroll whitespace-nowrap">
              {/* Create 3 sets for seamless infinite scroll */}
              {Array(3).fill(testimonials).flat().map((t, i) => (
                <div
                  key={i}
                  className="inline-block w-[400px] bg-white rounded-2xl p-6 border border-zinc-100"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-zinc-700 text-sm leading-relaxed mb-4 whitespace-normal">"{t.quote}"</p>

                  <div className="flex items-center gap-3">
                    {t.image ? (
                      <img
                        src={t.image}
                        alt={t.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white font-bold text-xs">
                        {t.author[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-zinc-900 text-sm">{t.author}</div>
                      <div className="text-xs text-zinc-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CSS for infinite scroll animation */}
        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-406px * 5));
            }
          }

          .animate-scroll {
            animation: scroll 35s linear infinite;
            display: inline-flex;
          }
        `}</style>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-white border-y border-zinc-100">
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
      <section id="team" className="py-24 px-6 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
              Built by students, for students.
            </h2>
            <p className="text-xl text-zinc-500">Meet the team behind Study Buddy.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Jonah */}
            <div className="bg-white rounded-2xl p-8 border border-zinc-100 hover:shadow-xl transition-all duration-300 group">
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
            <div className="bg-white rounded-2xl p-8 border border-zinc-100 hover:shadow-xl transition-all duration-300 group">
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
      <section className="py-16 px-6 bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Ready to study smarter?
          </h2>
          <p className="text-base md:text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
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
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <button onClick={() => setShowUpdates(true)} className="hover:text-white transition-colors">Changelog</button>
            <a href="mailto:support@studybuddy.com" className="hover:text-white transition-colors">Contact</a>
            <a
              href="https://www.instagram.com/thestudybud/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
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
              <div className="space-y-8">
                {changelogData.map((update, index) => (
                  <div key={index} className="relative pl-8 border-l-2 border-zinc-200">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
