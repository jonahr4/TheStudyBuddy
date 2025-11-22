import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Flashcards from './pages/Flashcards';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/subjects" element={<Layout><Subjects /></Layout>} />
      <Route path="/subjects/:subjectId" element={<Layout><SubjectDetail /></Layout>} />
      <Route path="/flashcards" element={<Layout><Flashcards /></Layout>} />
      <Route path="/chat" element={<Layout><Chat /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
