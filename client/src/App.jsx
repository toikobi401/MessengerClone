import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import LoginSuccess from './pages/LoginSuccess';
import ProfileSettings from './components/ProfileSettings';
import Loading from './components/Common/Loading';
import NotFound from './components/Common/NotFound';
import useChatStore from './store/chatStore';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const storedUser = localStorage.getItem('messenger-user');
  
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect to chat if already logged in)
const PublicRoute = ({ children }) => {
  const storedUser = localStorage.getItem('messenger-user');
  
  if (storedUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading message="Loading application..." />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Google OAuth Success Route */}
          <Route path="/login-success" element={<LoginSuccess />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* Profile Settings Route */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
