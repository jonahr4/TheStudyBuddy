export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 mb-2">My Decks</h3>
          <p className="text-gray-500">Placeholder</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 mb-2">Recent Uploads</h3>
          <p className="text-gray-500">Placeholder</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 mb-2">Chat History</h3>
          <p className="text-gray-500">Placeholder</p>
        </div>
      </div>
    </div>
  );
}
