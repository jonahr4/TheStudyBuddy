import homepageImage from '../assets/Homepage.png';

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden selection:bg-indigo-500/30">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 flex flex-col items-center text-center">
        
        {/* Hero Section */}
        <div className="max-w-4xl animate-in fade-in zoom-in duration-700">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent mb-8">
            The Study Buddy
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Transform your homework notes into interactive flashcards and chat with an AI that understands your content. Study smarter, not harder.
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/login" 
              className="group relative rounded-full bg-white text-black px-8 py-3.5 text-base font-semibold hover:bg-zinc-200 transition-all duration-200 w-full sm:w-auto shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
            >
              Get Started & Login
            </a>
            <a 
              href="/learn-more" 
              className="group rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-300 px-8 py-3.5 text-base font-medium hover:bg-zinc-800 hover:text-white transition-all duration-200 w-full sm:w-auto flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              Learn more <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-24 relative w-full max-w-6xl animate-in fade-in duration-1000 delay-200">
          {/* Glow effect behind image */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 opacity-50 blur-2xl rounded-[2.5rem]" />
          
          <div className="relative rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl p-2 shadow-2xl">
            <img
              alt="Study Buddy Dashboard Screenshot"
              src={homepageImage}
              className="w-full rounded-xl shadow-inner border border-zinc-700/50"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
