import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useChatStore from '../store/chatStore';
import { Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';

const LoginSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        // Get token from URL
        const token = searchParams.get('token');

        if (!token) {
          console.error('No token found in URL');
          navigate('/login?error=no_token');
          return;
        }

        // Fetch user data with the token
        // We need to temporarily set the token to make authenticated request
        const tempUser = { token };
        localStorage.setItem('messenger-user', JSON.stringify(tempUser));

        // Get current user info
        const response = await authAPI.getAllUsers('me'); // Or create a /me endpoint
        
        if (response.success && response.data) {
          // Get the first user (current user) from the response
          const currentUser = response.data[0];
          
          // Store complete user data with token
          const userData = {
            user: currentUser,
            token
          };
          
          localStorage.setItem('messenger-user', JSON.stringify(userData));
          setCurrentUser(currentUser);

          // Navigate to chat
          navigate('/');
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Google auth error:', error);
        localStorage.removeItem('messenger-user');
        navigate('/login?error=auth_failed');
      }
    };

    handleGoogleAuth();
  }, [searchParams, navigate, setCurrentUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-dark to-secondary">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
};

export default LoginSuccess;
