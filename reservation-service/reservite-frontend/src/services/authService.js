import axios from 'axios';

// Instance axios pour le User Service
const userAxios = axios.create({
  baseURL: 'http://localhost:8083',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour ajouter le token
userAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401
userAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await userAxios.post('/api/users/login', { email, password });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      if (response.data.user || response.data.email) {
        const user = {
          email: response.data.email || response.data.user?.email,
          username: response.data.username || response.data.user?.username,
          id: response.data.id || response.data.user?.id,
          firstName: response.data.firstName || response.data.user?.firstName,
          lastName: response.data.lastName || response.data.user?.lastName,
          phoneNumber: response.data.phoneNumber || response.data.user?.phoneNumber
        };
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.log('⚠️ authService.login error:', error.message);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await userAxios.post('/api/users/register', userData);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      if (response.data.user || response.data.email) {
        const user = {
          email: response.data.email || response.data.user?.email,
          username: response.data.username || response.data.user?.username,
          id: response.data.id || response.data.user?.id,
          firstName: response.data.firstName || response.data.user?.firstName,
          lastName: response.data.lastName || response.data.user?.lastName,
          phoneNumber: response.data.phoneNumber || response.data.user?.phoneNumber
        };
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.log('⚠️ authService.register error:', error.message);
      throw error;
    }
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.log('⚠️ Error parsing user from localStorage');
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};