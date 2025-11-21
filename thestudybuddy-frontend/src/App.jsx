import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Flashcards from './pages/Flashcards';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/upload" element={<Layout><Upload /></Layout>} />
      <Route path="/flashcards" element={<Layout><Flashcards /></Layout>} />
      <Route path="/chat" element={<Layout><Chat /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
