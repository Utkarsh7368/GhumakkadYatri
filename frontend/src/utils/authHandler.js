// Global auth handler for API interceptors
let authHandler = null;
let navigate = null;
let isHandlingExpiration = false; // Prevent multiple simultaneous calls


export const setAuthHandler = (handler) => {
  console.log('Setting auth handler:', handler);
  authHandler = handler;
};

export const setNavigateHandler = (navigateFunc) => {
  console.log('Setting navigate handler:', navigateFunc);
  navigate = navigateFunc;
};

export const getAuthHandler = () => {
  return authHandler;
};

export const handleTokenExpiration = () => {
  // Prevent multiple simultaneous calls
  if (isHandlingExpiration) {
    console.log('🛑 Token expiration already being handled, skipping...');
    return;
  }
  
  isHandlingExpiration = true;
  console.log('🔥 handleTokenExpiration called, authHandler exists:', !!authHandler);
  
  if (authHandler && authHandler.handleTokenExpiration) {
    console.log('✅ Calling authHandler.handleTokenExpiration (should show toast)');
    authHandler.handleTokenExpiration();
  } else {
    console.log('⚠️ Using fallback token expiration handling (no toast)');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Use React Router navigation if available, otherwise fallback to window.location
    if (navigate) {
      console.log('🧭 Using navigate to redirect to login');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 500);
    } else {
      console.log('🔄 Using window.location fallback');
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    }
  }
  
  // Reset the flag after a delay to allow future calls if needed
  setTimeout(() => {
    isHandlingExpiration = false;
  }, 2000);
};