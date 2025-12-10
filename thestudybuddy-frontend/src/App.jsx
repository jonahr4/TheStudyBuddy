import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import LearnMore from './pages/LearnMore';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Flashcards from './pages/Flashcards';
import FlashcardStudy from './pages/FlashcardStudy';
import Games from './pages/Games';
import MatchingGame from './pages/MatchingGame';
import MultipleChoiceGame from './pages/MultipleChoiceGame';
import EditFlashcards from './pages/EditFlashcards';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import TestBackend from './pages/TestBackend';
import NotFound from './pages/NotFound';
import { trackPageView, endSession } from './services/analytics';

function App() {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);

  // End session on window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LearnMore />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/test-backend" element={<TestBackend />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<Layout><PrivateRoute><Dashboard /></PrivateRoute></Layout>} />
      <Route path="/subjects" element={<Layout><PrivateRoute><Subjects /></PrivateRoute></Layout>} />
      <Route path="/subjects/:subjectId" element={<Layout><PrivateRoute><SubjectDetail /></PrivateRoute></Layout>} />
      <Route path="/flashcards" element={<Layout><PrivateRoute><Flashcards /></PrivateRoute></Layout>} />
      <Route path="/flashcards/study/:setId" element={<Layout><PrivateRoute><FlashcardStudy /></PrivateRoute></Layout>} />
      <Route path="/games" element={<Layout><PrivateRoute><Games /></PrivateRoute></Layout>} />
      <Route path="/games/matching/:setId" element={<Layout><PrivateRoute><MatchingGame /></PrivateRoute></Layout>} />
      <Route path="/games/quiz/:setId" element={<Layout><PrivateRoute><MultipleChoiceGame /></PrivateRoute></Layout>} />
      <Route path="/flashcards/edit/:setId" element={<Layout><PrivateRoute><EditFlashcards /></PrivateRoute></Layout>} />
      <Route path="/chat" element={<Layout><PrivateRoute><Chat /></PrivateRoute></Layout>} />
      <Route path="/settings" element={<Layout><PrivateRoute><Settings /></PrivateRoute></Layout>} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
