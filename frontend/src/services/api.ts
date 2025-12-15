/**
 * API Service - Re-exporta o apiService com axios configurado
 * Sistema A1 Saúde
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Configuração do axios
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');

const api: AxiosInstance = axios.create({
  baseURL: `${baseURL}/api/v1`,  // IMPORTANTE: Inclui /api/v1 no baseURL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - adicionar token de autorização
api.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('auth_tokens') || sessionStorage.getItem('auth_tokens');
    if (tokens) {
      try {
        const parsed = JSON.parse(tokens);
        if (parsed?.accessToken) {
          config.headers.Authorization = `Bearer ${parsed.accessToken}`;
        }
      } catch (e) {
        console.error('Erro ao parsear tokens:', e);
      }
    }
    
    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`🔄 API: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - tratamento de erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Token expirado - tentar renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = localStorage.getItem('auth_tokens') || sessionStorage.getItem('auth_tokens');
        if (tokens) {
          const parsed = JSON.parse(tokens);
          if (parsed?.refreshToken) {
            const response = await axios.post(`${baseURL}/api/v1/auth/refresh`, {
              refreshToken: parsed.refreshToken
            });

            const newTokens = response.data.data?.tokens || response.data.tokens;
            if (newTokens) {
              const storage = localStorage.getItem('auth_tokens') ? localStorage : sessionStorage;
              storage.setItem('auth_tokens', JSON.stringify(newTokens));
              
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return api(originalRequest);
            }
          }
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        // Limpar tokens e redirecionar para login
        localStorage.removeItem('auth_tokens');
        sessionStorage.removeItem('auth_tokens');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Log do erro
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });

    return Promise.reject(error);
  }
);

// Export default e named export
export { api };
export default api;





