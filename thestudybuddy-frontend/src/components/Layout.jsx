import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="h-screen flex flex-col w-full max-w-full">
      <div className="relative z-50">
        <Navbar />
      </div>
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        {children}
      </main>
    </div>
  );
}
