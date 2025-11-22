import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/subjects', label: 'Subjects' },
    { path: '/flashcards', label: 'Flashcards' },
    { path: '/chat', label: 'Chat' },
  ];

  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;

      const activeIndex = navItems.findIndex(item => 
        location.pathname === item.path || 
        (item.path === '/subjects' && location.pathname.startsWith('/subjects/'))
      );

      if (activeIndex === -1) {
        setIndicatorStyle({ opacity: 0 });
        return;
      }

      const links = navRef.current.querySelectorAll('a[data-nav-item]');
      const activeLink = links[activeIndex];

      if (activeLink) {
        const { offsetLeft, offsetWidth } = activeLink;
        setIndicatorStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
          opacity: 1,
        });
      }
    };

    updateIndicator();
    // Update on window resize
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [location.pathname]);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              The Study Buddy
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-2 relative" ref={navRef}>
            {/* Animated indicator - purple matching gradient background */}
            <div
              className="absolute rounded-md shadow-sm transition-all duration-300 ease-out"
              style={{
                ...indicatorStyle,
                height: '40px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#9089fc',
              }}
            />
            
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                              (item.path === '/subjects' && location.pathname.startsWith('/subjects/'));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-nav-item
                  className={`px-3.5 py-2.5 text-sm font-semibold relative z-10 rounded-md transition-colors ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            
            <Link to="/login" className="btn-primary ml-4">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
