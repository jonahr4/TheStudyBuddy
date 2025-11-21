export default function Landing() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="mb-10">
              The Study Buddy
          </h1>
          <p className="mb-5">
            Transform your homework notes into interactive flashcards and chat with an AI that understands your content. Study smarter, not harder.
          </p>
          <p className="mb-4">
            Created by Jonah Rothman & Sean Tomany :)
          </p>

          <div className="flex items-center justify-center gap-x-10">
            <a href="/login" className="btn-primary">
              Get Started & Login
            </a>
            <a href="/dashboard" className="link-arrow">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
