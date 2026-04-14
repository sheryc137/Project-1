import api from './api';

export const register = (data) => api.post('/auth/register', data);
export const verifyEmail = (token) => api.post('/auth/verify-email', { token });
export const resendVerification = () => api.post('/auth/resend-verification');
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const refresh = () => api.post('/auth/refresh');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/auth/reset-password', data);
