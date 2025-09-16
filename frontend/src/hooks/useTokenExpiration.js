import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useTokenExpiration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged out, redirect to login
    if (!user && localStorage.getItem('token')) {
      console.log('Token was cleared but user state not updated yet');
      
      navigate('/login');
    }
  }, [user, navigate]);
};

export default useTokenExpiration;