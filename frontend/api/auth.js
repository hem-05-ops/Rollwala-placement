import { api } from './index';

export const signup = async (userData) => {
  const res = await api.post('/api/auth/register', userData);
  return res.data;
};

export const signin = async (credentials) => {
  const res = await api.post('/api/auth/login', credentials);
  // Store token and user info based on role
  if (res.data.token && res.data.user) {
    if (res.data.user.role === 'admin' || res.data.user.role === 'super_admin') {
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.user));
    } else {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
  }
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post('/api/auth/forgot-password', { email });
  return res.data;
};

export const verifyOtp = async ({ email, otp }) => {
  const res = await api.post('/api/auth/verify-otp', { email, otp });
  return res.data;
};

export const resetPassword = async ({ token, newPassword, confirmPassword }) => {
  const res = await api.post('/api/auth/reset-password', {
    token,
    newPassword,
    confirmPassword
  });
  return res.data;
};

