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
    const user = localStorage.getItem('messenger-user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
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
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      if (error.response.status === 401) {
        // Unauthorized - clear storage and redirect to login
        localStorage.removeItem('messenger-user');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        success: false,
        message: 'No response from server. Please check your connection.'
      });
    } else {
      // Something else happened
      return Promise.reject({
        success: false,
        message: error.message || 'An error occurred'
      });
    }
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllUsers: async (userId) => {
    try {
      const response = await api.get(`/auth/allusers/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  setAvatar: async (userId, avatarData) => {
    try {
      const response = await api.post(`/auth/setavatar/${userId}`, avatarData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Message API calls
export const messageAPI = {
  addMessage: async (messageData) => {
    try {
      const response = await api.post('/messages/addmsg', messageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMessages: async (fromUserId, toUserId) => {
    try {
      const response = await api.post('/messages/getmsg', {
        from: fromUserId,
        to: toUserId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  editMessage: async (messageId, newContent) => {
    try {
      const response = await api.put('/messages/edit', {
        messageId,
        newContent
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  generateSignature: async () => {
    try {
      const response = await api.get('/messages/generate-signature');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
