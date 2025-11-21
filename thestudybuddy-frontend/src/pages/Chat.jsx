export default function Chat() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="p-8">
        <h2 className="mb-8">AI Chat</h2>
        <div className="max-w-4xl mx-auto">
          <div className="card h-96 mb-4">
            <p className="text-sm">Chat messages placeholder</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              className="input"
            />
            <button className="btn-primary">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
