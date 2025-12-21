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
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
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
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('messenger-user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Friend API calls
export const friendAPI = {
  searchUsers: async (query) => {
    try {
      const response = await api.get(`/friends/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendFriendRequest: async (receiverId) => {
    try {
      const response = await api.post('/friends/add', { receiverId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFriendRequests: async () => {
    try {
      const response = await api.get('/friends/requests');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      const response = await api.post('/friends/accept', { requestId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectFriendRequest: async (requestId) => {
    try {
      const response = await api.post('/friends/reject', { requestId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFriendsList: async () => {
    try {
      const response = await api.get('/friends/list');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default friendAPI;
