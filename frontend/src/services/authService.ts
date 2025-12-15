import axios from 'axios';
import { LoginRequest, LoginResponse, AuthTokens } from '@/types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('auth_tokens');
    if (tokens) {
      const { accessToken } = JSON.parse(tokens);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = localStorage.getItem('auth_tokens');
        if (tokens) {
          const { refreshToken } = JSON.parse(tokens);
          const newTokens = await authService.refreshToken(refreshToken);
          
          localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('auth_tokens');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw new Error('Network error');
    }
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout, just log it
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Token refresh failed');
      }
      throw new Error('Network error');
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to send reset email');
      }
      throw new Error('Network error');
    }
  },

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { token, password });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Password reset failed');
      }
      throw new Error('Network error');
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Password change failed');
      }
      throw new Error('Network error');
    }
  },

  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post('/auth/verify-email', { token });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Email verification failed');
      }
      throw new Error('Network error');
    }
  }
};

export default api;