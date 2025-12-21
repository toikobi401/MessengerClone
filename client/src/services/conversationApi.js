import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('messenger-user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const token = userData.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('messenger-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Conversation API calls
export const conversationAPI = {
  // Initialize or get existing conversation
  initConversation: async (receiverId) => {
    try {
      const response = await api.post('/conversations/init', { receiverId });
      return response;
    } catch (error) {
      console.error('Init conversation error:', error);
      throw error;
    }
  },

  // Get all user conversations
  getUserConversations: async () => {
    try {
      const response = await api.get('/conversations');
      return response;
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  },

  // Get conversation by ID
  getConversationById: async (conversationId) => {
    try {
      const response = await api.get(`/conversations/${conversationId}`);
      return response;
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  },

  // Get messages by conversation ID
  getMessages: async (conversationId) => {
    try {
      const response = await api.get(`/messages/${conversationId}`);
      return response;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  },

  // Send message (text or media)
  sendMessage: async (messageData, isFormData = false) => {
    try {
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } : {};
      
      const response = await api.post('/messages/addmsg', messageData, config);
      return response;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }
};

export default conversationAPI;
