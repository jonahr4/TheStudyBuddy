export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">The Study Buddy</h1>
        <p className="text-gray-600 mb-8">AI-powered learning tool</p>
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Get Started
        </a>
      </div>
    </div>
  );
}
