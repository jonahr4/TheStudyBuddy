import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children, showSidebar = true }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
