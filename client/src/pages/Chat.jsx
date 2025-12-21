import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';
import useChatStore from '../store/chatStore';
import { authAPI } from '../services/api';
import { initializeSocket } from '../utils/socket';
import Contacts from '../components/Contacts';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';

const Chat = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    selectedChat,
    setContacts,
    setOnlineUsers,
    logout
  } = useChatStore();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('messenger-user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const initializeChat = async () => {
      try {
        const userData = JSON.parse(storedUser);

        // Fetch all users (contacts)
        const response = await authAPI.getAllUsers(userData.user.id);
        if (response.success) {
          setContacts(response.data);
        }

        // Initialize socket connection
        const socket = initializeSocket();
        socket.emit('add-user', userData.user.id);

        // Listen for online users updates
        socket.on('online-users', (users) => {
          setOnlineUsers(users);
        });
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [navigate, setContacts, setOnlineUsers]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-secondary overflow-hidden">
      {/* Header */}
      <header className="bg-tertiary border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {currentUser?.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-semibold text-white">{currentUser?.username}</h1>
            <p className="text-xs text-gray-400">Messenger Clone</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Main Chat Area */}
      <div className="h-[calc(100vh-73px)] grid grid-cols-12">
        {/* Contacts Sidebar */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-white/10 h-full">
          <Contacts />
        </div>

        {/* Chat Container */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 h-full">
          {selectedChat ? <ChatContainer /> : <Welcome />}
        </div>
      </div>
    </div>
  );
};

export default Chat;
