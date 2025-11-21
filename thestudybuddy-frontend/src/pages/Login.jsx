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
            className="btn-primary w-full mb-4"
          >
            Login to your account
          </button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-900 text-sm font-medium rounded-lg px-5 py-2.5 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all mb-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
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
