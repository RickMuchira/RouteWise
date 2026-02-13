import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000/api'; // Replace with your actual API URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token'); // Or however you're storing the token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

// API methods for route management
export const routeService = {
  // Start a new route
  startRoute: async (data) => {
    try {
      const response = await api.post('/mobile/start-route', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save location point
  saveLocation: async (data) => {
    try {
      const response = await api.post('/mobile/save-location', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark student pickup
  markPickup: async (data) => {
    try {
      const response = await api.post('/mobile/mark-pickup', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // End route
  endRoute: async (data) => {
    try {
      const response = await api.post('/mobile/end-route', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get students list
  getStudents: async () => {
    try {
      const response = await api.get('/mobile/students');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;