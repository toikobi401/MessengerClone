import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';
import useChatStore from '../store/chatStore';
import useFriendStore from '../store/friendStore';
import { friendAPI } from '../services/friendApi';
import { initializeSocket, getSocket } from '../utils/socket';
import Sidebar from '../components/Sidebar';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';
import FriendRequestList from '../components/FriendRequestList';

const Chat = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    selectedChat,
    setOnlineUsers,
    logout
  } = useChatStore();
  
  const {
    setFriendsList,
    setFriendRequests,
    addFriendRequest,
    addFriend,
    unreadRequestsCount
  } = useFriendStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  useEffect(() => {
    // Initialize dark mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }

    // Check if user is logged in
    const storedUser = localStorage.getItem('messenger-user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const initializeChat = async () => {
      try {
        const userData = JSON.parse(storedUser);

        // Fetch friends list
        const friendsResponse = await friendAPI.getFriendsList();
        if (friendsResponse.success) {
          setFriendsList(friendsResponse.data);
        }

        // Fetch friend requests
        const requestsResponse = await friendAPI.getFriendRequests();
        if (requestsResponse.success) {
          setFriendRequests(requestsResponse.data);
        }

        // Initialize socket connection
        const socket = initializeSocket();
        socket.emit('add-user', userData.user.id);

        // Listen for online users updates
        socket.on('online-users', (users) => {
          setOnlineUsers(users);
        });

        // Listen for new friend requests
        socket.on('new-friend-request', (data) => {
          console.log('New friend request received:', data);
          addFriendRequest({
            id: Date.now().toString(),
            senderId: data.sender.id,
            sender: data.sender,
            createdAt: new Date().toISOString()
          });
          
          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Friend Request', {
              body: `${data.sender.username} sent you a friend request`,
              icon: data.sender.avatarImage || '/icon.png'
            });
          }
        });

        // Listen for request accepted
        socket.on('request-accepted', (data) => {
          console.log('Friend request accepted:', data);
          addFriend(data.friend);
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Friend Request Accepted', {
              body: `${data.friend.username} accepted your friend request`,
              icon: data.friend.avatarImage || '/icon.png'
            });
          }
        });

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [navigate, setFriendsList, setFriendRequests, setOnlineUsers, addFriendRequest, addFriend]);

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
    <div className="h-screen bg-gray-100 dark:bg-secondary overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-tertiary border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">
              {currentUser?.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">{currentUser?.username}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Messenger Clone</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Main Chat Area */}
      <div className="h-[calc(100vh-73px)] flex">
        {/* Sidebar - Fixed Height with Scroll */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-white/10 h-full overflow-hidden">
          <Sidebar onRequestsClick={() => setShowRequestsModal(true)} />
        </div>

        {/* Chat Container - Fixed Height with Scroll */}
        <div className="flex-1 h-full overflow-hidden bg-white dark:bg-secondary">
          {selectedChat ? (
            <ChatContainer />
          ) : (
            <Welcome />
          )}
        </div>
      </div>

      {/* Friend Requests Modal */}
      <FriendRequestList 
        isOpen={showRequestsModal} 
        onClose={() => setShowRequestsModal(false)} 
      />
    </div>
  );
};

export default Chat;
