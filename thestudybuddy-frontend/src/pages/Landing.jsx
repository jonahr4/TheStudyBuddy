import homepageImage from '../assets/Homepage.png';

export default function Landing() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-[65%_35%] lg:items-center">
          {/* Left side - Text content */}
          <div className="lg:pr-8">
            <div className="w-full">
              <h1 className="mb-6">
                The Study Buddy
              </h1>
              <p className="mb-6">
                Transform your homework notes into interactive flashcards and chat with an AI that understands your content. Study smarter, not harder.
              </p>
              <div className="flex items-center gap-x-6">
                <a href="/login" className="btn-primary">
                  Get Started & Login
                </a>
                <a href="/learn-more" className="link-arrow">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right side - Screenshot */}
          <div className="relative lg:-mr-8">
            <img
              alt="Study Buddy Dashboard Screenshot"
              src={homepageImage}
              className="w-full max-w-none rounded-2xl shadow-[0_40px_80px_-1px_rgba(0,0,0,0.5)] ring-1 ring-white/10 lg:w-[60rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
