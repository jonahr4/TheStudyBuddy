export default function Upload() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="p-8">
        <h2 className="mb-8">Upload Notes</h2>
        <div className="max-w-2xl mx-auto">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white/50">
            <p className="text-gray-600">Drag and drop placeholder</p>
            <button className="btn-primary mt-4">
              Select File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
