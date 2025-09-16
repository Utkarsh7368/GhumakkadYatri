import axios from 'axios';
import { handleTokenExpiration } from '../utils/authHandler';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    // Check for token expiration
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage === 'Token Expired' || 
          errorMessage === 'Access Denied, Token Missing' || 
          errorMessage === 'Invalid Token' ||
          errorMessage === 'Authorization Header Missing') {
        console.log('Token expired or invalid, handling expiration');
        handleTokenExpiration();
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;