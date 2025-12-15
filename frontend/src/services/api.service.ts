/**
 * Serviço de API - Cliente HTTP
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError, AuthTokens } from '../types/auth';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Em produção (Docker), usa caminho relativo para o proxy nginx
    // Em desenvolvimento, usa a URL completa ou a variável de ambiente
    const isProduction = import.meta.env.PROD;
    this.baseURL = import.meta.env.VITE_API_URL || (isProduction ? '' : 'http://localhost:5001');
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  /**
   * Configurar interceptors para tokens e tratamento de erros
   */
  private setupInterceptors(): void {
    // Request interceptor - adicionar token de autorização
    this.api.interceptors.request.use(
      (config) => {
        const tokens = this.getStoredTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        
        // Log da requisição em desenvolvimento
        if (import.meta.env.DEV) {
          console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - tratar respostas e erros
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log da resposta em desenvolvimento
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Token expirado - tentar renovar
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshTokens();
            
            // Repetir requisição original com novo token
            const tokens = this.getStoredTokens();
            if (tokens?.accessToken) {
              originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Falha na renovação - redirecionar para login
            this.handleAuthenticationFailure();
            return Promise.reject(refreshError);
          }
        }

        // Outros erros de autenticação
        if (error.response?.status === 401) {
          this.handleAuthenticationFailure();
        }

        // Log do erro
        console.error('❌ API Error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url
        });

        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Obter tokens armazenados
   */
  private getStoredTokens(): AuthTokens | null {
    try {
      const tokens = localStorage.getItem('auth_tokens') || sessionStorage.getItem('auth_tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error('Erro ao obter tokens:', error);
      return null;
    }
  }

  /**
   * Armazenar tokens
   */
  private storeTokens(tokens: AuthTokens, rememberMe: boolean = false): void {
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('auth_tokens', JSON.stringify(tokens));
      
      // Remover do outro storage se existir
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('auth_tokens');
    } catch (error) {
      console.error('Erro ao armazenar tokens:', error);
    }
  }

  /**
   * Renovar tokens
   */
  private async refreshTokens(): Promise<void> {
    const tokens = this.getStoredTokens();
    if (!tokens?.refreshToken) {
      throw new Error('Refresh token não encontrado');
    }

    try {
      const response = await axios.post(`${this.baseURL}/api/v1/auth/refresh`, {
        refreshToken: tokens.refreshToken
      });

      const newTokens = response.data.data.tokens;
      const rememberMe = localStorage.getItem('auth_tokens') !== null;
      
      this.storeTokens(newTokens, rememberMe);
    } catch (error) {
      // Limpar tokens inválidos
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Limpar tokens
   */
  private clearTokens(): void {
    localStorage.removeItem('a1-saude-tokens');
    sessionStorage.removeItem('a1-saude-tokens');
    localStorage.removeItem('auth_tokens');
    sessionStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_user');
  }

  /**
   * Tratar falha de autenticação
   */
  private handleAuthenticationFailure(): void {
    this.clearTokens();
    
    // Redirecionar para login se não estiver já na página de login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * Formatar erro da API
   */
  private formatError(error: AxiosError): ApiError {
    const response = error.response;
    
    return {
      success: false,
      message: response?.data?.message || error.message || 'Erro desconhecido',
      errors: response?.data?.errors || [],
      code: response?.data?.code || 'UNKNOWN_ERROR',
      statusCode: response?.status || 500
    };
  }

  /**
   * Fazer requisição GET
   */
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fazer requisição POST
   */
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fazer requisição PUT
   */
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fazer requisição DELETE
   */
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fazer requisição PATCH
   */
  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar saúde da API
   */
  async healthCheck(): Promise<ApiResponse> {
    return this.get('/health');
  }

  /**
   * Obter instância do axios (para casos especiais)
   */
  getAxiosInstance(): AxiosInstance {
    return this.api;
  }

  /**
   * Configurar token manualmente
   */
  setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remover token manualmente
   */
  removeAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }

  /**
   * Obter URL base da API
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Instância singleton
export const apiService = new ApiService();
export default apiService;
