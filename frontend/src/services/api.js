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
      const token = localStorage.getItem('token');
      const currentPath = window.location.pathname;
      const isOnAuthPage = ['/login', '/register'].includes(currentPath);
      const isPublicEndpoint = error.config?.url?.includes('/api/common/');
      
      // Only handle token expiration if:
      // 1. There's actually a token (user was logged in)
      // 2. We're not on auth pages already
      // 3. The error indicates token issues
      // 4. It's not a public endpoint
      if (token && !isOnAuthPage && !isPublicEndpoint && (
          errorMessage === 'Token Expired' || 
          errorMessage === 'Access Denied, Token Missing' || 
          errorMessage === 'Invalid Token' ||
          errorMessage === 'Authorization Header Missing'
        )) {
        console.log('Token expired or invalid, handling expiration');
        handleTokenExpiration();
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Helper function for making API requests
export const apiRequest = async (method, url, data = null, config = {}) => {
  try {
    const response = await api({
      method,
      url,
      data,
      ...config
    });
    return response.data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};