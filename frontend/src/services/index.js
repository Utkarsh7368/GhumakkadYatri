import api from './api';

// Auth endpoints
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password, role = 'user') => {
    const response = await api.post('/api/auth/register', { name, email, password, role });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgotPassword', { email });
    return response.data;
  },

  verifyResetToken: async (token) => {
    const response = await api.get(`/api/auth/verifyResetToken/${token}`);
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(`/api/auth/resetPassword/${token}`, { password });
    return response.data;
  },
};

// Package endpoints
export const packageService = {
  getAllPackages: async () => {
    const response = await api.post('/api/common/getPackages');
    return response.data;
  },

  getPackageById: async (packageId) => {
    const response = await api.post('/api/common/getPackageById', { packageId });
    return response.data;
  },

  getPackageDetails: async (packageId) => {
    const response = await api.post('/api/common/getPackageDetails', { packageId });
    return response.data;
  },

  createPackage: async (packageData) => {
    const response = await api.post('/api/admin/createPackage', packageData);
    return response.data;
  },

  updatePackage: async (packageId, packageData) => {
    const response = await api.post('/api/admin/updatePackage', {  packageId, ...packageData });
    return response.data;
  },

  deletePackage: async (packageId) => {
    const response = await api.post('/api/admin/deletePackage', { packageId });
    return response.data;
  },

  // Package Details endpoints
  addPackageDetails: async (packageDetailsData) => {
    const response = await api.post('/api/admin/addPackageDetails', packageDetailsData);
    return response.data;
  },

  updatePackageDetails: async (packageDetailsData) => {
    const response = await api.post('/api/admin/updatePackageDetails', packageDetailsData);
    return response.data;
  },

  deletePackageDetails: async (packageId) => {
    const response = await api.post('/api/admin/deletePackageDetails', { packageId });
    return response.data;
  },
};

// Booking service - re-export from dedicated module
// (Do NOT use the placeholder below; import from bookingService.js directly)
export { default as bookingService } from './bookingService';

// Payment service
export { default as paymentService } from './paymentService';

// Contact form
export const contactService = {
  sendMessage: async (messageData) => {
    const response = await api.post('/api/common/contact', messageData);
    return response.data;
  },
};