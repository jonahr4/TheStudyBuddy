export default function Login() {
  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center">
      {/* Gradient background blur */}
      <div aria-hidden="true" className="gradient-blur">
        <div className="gradient-blur-shape" />
      </div>
      
      <div className="w-full max-w-sm bg-white p-6 border border-gray-200 rounded-lg shadow-xl">
        <form action="#">
          <h5 className="text-xl font-semibold text-gray-900 mb-6">Sign in to Study Buddy</h5>
          
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2.5 text-sm font-medium text-gray-900">
              Your email
            </label>
            <input
              type="email"
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-2.5 shadow-sm placeholder:text-gray-500"
              placeholder="example@company.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-2.5 text-sm font-medium text-gray-900">
              Your password
            </label>
            <input
              type="password"
              id="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-2.5 shadow-sm placeholder:text-gray-500"
              placeholder="•••••••••"
              required
            />
          </div>
          
          <div className="flex items-start my-6">
            <div className="flex items-center">
              <input
                id="checkbox-remember"
                type="checkbox"
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-indigo-500"
              />
              <label htmlFor="checkbox-remember" className="ms-2 text-sm font-medium text-gray-900">
                Remember me
              </label>
            </div>
            <a href="#" className="ms-auto text-sm font-medium text-indigo-600 hover:underline">
              Lost Password?
            </a>
          </div>
          
          <button
            type="submit"
            className="btn-primary w-full mb-3"
          >
            Login to your account
          </button>
          
          <div className="text-sm font-medium text-gray-600">
            Not registered?{' '}
            <a href="#" className="text-indigo-600 hover:underline">
              Create account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
