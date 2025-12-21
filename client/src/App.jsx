import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
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

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
