import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Landing from './pages/Landing';
import LearnMore from './pages/LearnMore';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Flashcards from './pages/Flashcards';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/learn-more" element={<LearnMore />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<Layout><PrivateRoute><Dashboard /></PrivateRoute></Layout>} />
      <Route path="/subjects" element={<Layout><PrivateRoute><Subjects /></PrivateRoute></Layout>} />
      <Route path="/subjects/:subjectId" element={<Layout><PrivateRoute><SubjectDetail /></PrivateRoute></Layout>} />
      <Route path="/flashcards" element={<Layout><PrivateRoute><Flashcards /></PrivateRoute></Layout>} />
      <Route path="/chat" element={<Layout><PrivateRoute><Chat /></PrivateRoute></Layout>} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
