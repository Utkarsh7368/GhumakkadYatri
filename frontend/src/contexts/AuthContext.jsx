import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services';
import { setAuthHandler,setNavigateHandler } from '../utils/authHandler';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleTokenExpiration = () => {
    console.log('🔑 AuthContext handleTokenExpiration called');
    
    // Don't show session expired message if:
    // 1. User is not logged in (no user state)
    // 2. We're already on login/register pages
    // 3. No token exists (user was never logged in)
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;
    const isOnAuthPage = ['/login', '/register'].includes(currentPath);
    
    if (!user || !token || isOnAuthPage) {
      console.log('🔕 Skipping session expired message - not needed');
      // Just clear data silently
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Only navigate if not already on auth page
      if (!isOnAuthPage) {
        setTimeout(() => {
          console.log('🧭 Navigating to login page (silent)');
          navigate('/login', { replace: true });
        }, 100);
      }
      return;
    }
    
    // Clear auth data first
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Show toast for actual logged-in users
    toast.error('Your session has expired. Please login again.', {
      duration: 4000,
      position: 'top-center',
    });
    
    // Navigate to login after a short delay to allow toast to show
    setTimeout(() => {
      console.log('🧭 Navigating to login page');
      navigate('/login', { replace: true });
    }, 1000);
  };

  // Register auth handler for API interceptors
  useEffect(() => {
    console.log('🔧 Registering auth handlers');
    const authHandlerObject = {
      handleTokenExpiration: handleTokenExpiration
    };
    
    setAuthHandler(authHandlerObject);
    setNavigateHandler(navigate);
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up auth handlers');
      setAuthHandler(null);
      setNavigateHandler(null);
    };
  }, [navigate]);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    //console.log('Storing user data:', userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    toast.success('Logged in successfully!');
  };

  const logout = async (showToast = true) => {
    try {
      // Call backend logout API
      await authService.logout();
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      if (showToast) {
        toast.success('Logged out successfully!');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      if (showToast) {
        toast.success('Logged out successfully!');
      }
    }
  };

  const register = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    toast.success('Account created successfully!');
  };

  const value = {
    user,
    login,
    logout,
    register,
    handleTokenExpiration,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;