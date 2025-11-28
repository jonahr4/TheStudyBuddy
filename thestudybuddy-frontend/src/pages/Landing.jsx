import homepageImage from '../assets/Homepage.png';

export default function Landing() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:py-32 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-12 lg:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-[65%_35%] lg:items-center">
          {/* Left side - Text content */}
          <div className="lg:pr-8 text-center lg:text-left">
            <div className="w-full">
              <h1 className="mb-4 lg:mb-6 text-4xl sm:text-5xl lg:text-6xl">
                The Study Buddy
              </h1>
              <p className="mb-6 text-base sm:text-lg">
                Transform your homework notes into interactive flashcards and chat with an AI that understands your content. Study smarter, not harder.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-x-6">
                <a href="/login" className="btn-primary w-full sm:w-auto">
                  Get Started & Login
                </a>
                <a href="/learn-more" className="link-arrow">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right side - Screenshot (hidden on mobile) */}
          <div className="hidden lg:block relative lg:-mr-8">
            <img
              alt="Study Buddy Dashboard Screenshot"
              src={homepageImage}
              className="w-full rounded-2xl shadow-[0_40px_80px_-1px_rgba(0,0,0,0.5)] ring-1 ring-white/10 lg:w-[60rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
