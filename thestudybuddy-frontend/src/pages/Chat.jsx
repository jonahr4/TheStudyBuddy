export default function Chat() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Chat</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow h-96 p-4 mb-4">
          <p className="text-gray-500">Chat messages placeholder</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Ask a question..." 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
