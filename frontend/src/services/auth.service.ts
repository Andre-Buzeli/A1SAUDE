/**
 * Serviço de Autenticação - Frontend
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import { apiService } from './api.service';
import {
  User,
  LoginRequest,
  LoginResponse,
  AuthTokens,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ApiResponse
} from '../types/auth';

class AuthService {
  /**
   * Fazer login
   */
  async login(emailOrCpf: string, password: string, rememberMe: boolean = false, twoFactorCode?: string): Promise<LoginResponse> {
    try {
      const loginData: LoginRequest = {
        emailOrCpf,
        password,
        rememberMe,
        twoFactorCode
      };

      const response = await apiService.post<{
        user: User;
        tokens: AuthTokens;
      }>('/api/auth/login', loginData);

      // Se requer 2FA, retornar resposta especial
      if (response.requiresTwoFactor) {
        return {
          success: false,
          requiresTwoFactor: true,
          message: response.message || 'Código de autenticação necessário',
          user: response.data?.user as User,
          tokens: {} as AuthTokens
        };
      }

      // Login bem-sucedido
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        // Armazenar dados do usuário e tokens
        this.storeUserData(user, tokens, rememberMe);

        return {
          success: true,
          user,
          tokens,
          message: response.message || 'Login realizado com sucesso'
        };
      }

      throw new Error(response.message || 'Erro no login');

    } catch (error: any) {
      console.error('Erro no login:', error);
      
      return {
        success: false,
        message: error.message || 'Erro interno no login',
        user: {} as User,
        tokens: {} as AuthTokens
      };
    }
  }

  /**
   * Fazer logout
   */
  async logout(): Promise<void> {
    try {
      // Tentar fazer logout no servidor
      await apiService.post('/api/auth/logout');
    } catch (error) {
      console.warn('Erro no logout do servidor:', error);
    } finally {
      // Sempre limpar dados locais
      this.clearUserData();
    }
  }

  /**
   * Renovar tokens
   */
  async refreshTokens(): Promise<AuthTokens> {
    try {
      const tokens = this.getStoredTokens();
      if (!tokens?.refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const refreshData: RefreshTokenRequest = {
        refreshToken: tokens.refreshToken
      };

      const response = await apiService.post<{ tokens: AuthTokens }>('/api/auth/refresh', refreshData);

      if (response.success && response.data) {
        const newTokens = response.data.tokens;
        const rememberMe = localStorage.getItem('a1-saude-tokens') !== null;
        
        // Atualizar tokens armazenados
        this.storeTokens(newTokens, rememberMe);
        
        return newTokens;
      }

      throw new Error(response.message || 'Erro ao renovar tokens');

    } catch (error: any) {
      console.error('Erro ao renovar tokens:', error);
      this.clearUserData();
      throw error;
    }
  }

  /**
   * Obter dados do usuário atual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiService.get<{
        user: User;
        session: any;
      }>('/api/auth/me');

      if (response.success && response.data) {
        const user = response.data.user;
        
        // Atualizar dados do usuário armazenados
        const tokens = this.getStoredTokens();
        const rememberMe = localStorage.getItem('a1-saude-user') !== null;
        
        if (tokens) {
          this.storeUserData(user, tokens, rememberMe);
        }
        
        return user;
      }

      return null;

    } catch (error: any) {
      console.error('Erro ao obter usuário atual:', error);
      
      // Se erro de autenticação, limpar dados
      if (error.statusCode === 401) {
        this.clearUserData();
      }
      
      return null;
    }
  }

  /**
   * Validar token atual
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await apiService.get('/api/auth/validate');
      return response.success;
    } catch (error) {
      console.warn('Token inválido:', error);
      return false;
    }
  }

  /**
   * Alterar senha
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<ApiResponse> {
    try {
      return await apiService.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  }

  /**
   * Obter sessões ativas
   */
  async getSessions(): Promise<ApiResponse> {
    try {
      return await apiService.get('/api/auth/sessions');
    } catch (error: any) {
      console.error('Erro ao obter sessões:', error);
      throw error;
    }
  }

  /**
   * Revogar sessão
   */
  async revokeSession(sessionId: string): Promise<ApiResponse> {
    try {
      return await apiService.delete(`/api/auth/sessions/${sessionId}`);
    } catch (error: any) {
      console.error('Erro ao revogar sessão:', error);
      throw error;
    }
  }

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const user = this.getStoredUser();
    const tokens = this.getStoredTokens();
    
    return !!(user && tokens?.accessToken);
  }

  /**
   * Obter usuário armazenado
   */
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('a1-saude-user') || sessionStorage.getItem('a1-saude-user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter usuário armazenado:', error);
      return null;
    }
  }

  /**
   * Obter tokens armazenados
   */
  getStoredTokens(): AuthTokens | null {
    try {
      const tokens = localStorage.getItem('a1-saude-tokens') || sessionStorage.getItem('a1-saude-tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error('Erro ao obter tokens armazenados:', error);
      return null;
    }
  }

  /**
   * Armazenar dados do usuário e tokens
   */
  private storeUserData(user: User, tokens: AuthTokens, rememberMe: boolean = false): void {
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Armazenar usuário
      storage.setItem('a1-saude-user', JSON.stringify(user));
      
      // Armazenar tokens
      this.storeTokens(tokens, rememberMe);
      
      // Remover do outro storage se existir
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('a1-saude-user');
      otherStorage.removeItem('a1-saude-tokens');
      
    } catch (error) {
      console.error('Erro ao armazenar dados do usuário:', error);
    }
  }

  /**
   * Armazenar tokens
   */
  private storeTokens(tokens: AuthTokens, rememberMe: boolean = false): void {
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('a1-saude-tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Erro ao armazenar tokens:', error);
    }
  }

  /**
   * Limpar dados do usuário
   */
  private clearUserData(): void {
    try {
      // Limpar localStorage
      localStorage.removeItem('a1-saude-user');
      localStorage.removeItem('a1-saude-tokens');
      
      // Limpar sessionStorage
      sessionStorage.removeItem('a1-saude-user');
      sessionStorage.removeItem('a1-saude-tokens');
      
    } catch (error) {
      console.error('Erro ao limpar dados do usuário:', error);
    }
  }

  /**
   * Verificar se token está próximo do vencimento
   */
  isTokenExpiringSoon(): boolean {
    const tokens = this.getStoredTokens();
    if (!tokens) return true;

    try {
      // Decodificar token JWT (sem verificar assinatura)
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Converter para milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Considerar "expirando em breve" se restam menos de 5 minutos
      return timeUntilExpiration < 5 * 60 * 1000;
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
      return true;
    }
  }
}

// Instância singleton
export const authService = new AuthService();
export default authService;