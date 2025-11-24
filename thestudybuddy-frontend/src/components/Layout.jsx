import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden w-full max-w-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        {children}
      </main>
    </div>
  );
}
