export default function Upload() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Notes</h1>
      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-600">Drag and drop placeholder</p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Select File
          </button>
        </div>
      </div>
    </div>
  );
}
