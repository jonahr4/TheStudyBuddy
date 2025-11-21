export default function Flashcards() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="p-8">
        <h2 className="mb-8">Flashcards</h2>
        <div className="max-w-4xl mx-auto">
          <div className="card p-12 text-center">
            <p className="text-xl mb-4">Flashcard placeholder</p>
            <p className="text-sm">Click to flip</p>
          </div>
        </div>
      </div>
    </div>
  );
}
