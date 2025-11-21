export default function Dashboard() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="p-8">
        <h2 className="mb-8">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h4 className="mb-2">My Decks</h4>
            <p className="text-sm">5 active flashcard decks</p>
            <button className="btn-primary mt-4">View All</button>
          </div>
          <div className="card">
            <h4 className="mb-2">Recent Uploads</h4>
            <p className="text-sm">Last upload: 2 hours ago</p>
            <button className="btn-secondary mt-4">Upload Notes</button>
          </div>
          <div className="card">
            <h4 className="mb-2">Chat History</h4>
            <p className="text-sm">12 conversations</p>
            <button className="btn-secondary mt-4">View Chats</button>
          </div>
        </div>
      </div>
    </div>
  );
}
