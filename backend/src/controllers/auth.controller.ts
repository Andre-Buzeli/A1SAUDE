/**
 * Controlador de Autenticação
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { authService } from '../services/auth.service';
import {
  AuthenticatedRequest,
  LoginRequest,
  RefreshTokenRequest,
  ChangePasswordRequest
} from '../types/auth.types';

class AuthController {
  /**
   * Login do usuário
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Validar dados obrigatórios
      if (!loginData.emailOrCpf || !loginData.password) {
        res.status(400).json({
          success: false,
          message: 'Email/CPF e senha são obrigatórios',
          code: 'MISSING_CREDENTIALS'
        });
        return;
      }

      // Realizar login
      const result = await authService.login(loginData, ipAddress, userAgent);

      // Se requer 2FA, retornar status especial
      if (result.requiresTwoFactor) {
        res.status(200).json({
          success: false,
          requiresTwoFactor: true,
          message: result.message,
          data: {
            user: {
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
              twoFactorEnabled: result.user.twoFactorEnabled
            }
          }
        });
        return;
      }

      // Login bem-sucedido
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          tokens: result.tokens
        }
      });

    } catch (error) {
      logger.error('Erro no login:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Credenciais inválidas') {
          res.status(401).json({
            success: false,
            message: 'Email/CPF ou senha incorretos',
            code: 'INVALID_CREDENTIALS'
          });
          return;
        }
        
        if (error.message === 'Usuário inativo') {
          res.status(401).json({
            success: false,
            message: 'Usuário inativo. Entre em contato com o administrador.',
            code: 'USER_INACTIVE'
          });
          return;
        }
        
        if (error.message === 'Código de autenticação inválido') {
          res.status(401).json({
            success: false,
            message: 'Código de autenticação de dois fatores inválido',
            code: 'INVALID_2FA_CODE'
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Logout do usuário
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.session) {
        res.status(400).json({
          success: false,
          message: 'Sessão não encontrada',
          code: 'NO_SESSION'
        });
        return;
      }

      await authService.logout(req.session.id, req.user?.id);

      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });

    } catch (error) {
      logger.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no logout',
        code: 'LOGOUT_ERROR'
      });
    }
  }

  /**
   * Renovar tokens de acesso
   */
  async refreshTokens(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token é obrigatório',
          code: 'MISSING_REFRESH_TOKEN'
        });
        return;
      }

      const tokens = await authService.refreshTokens(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens renovados com sucesso',
        data: { tokens }
      });

    } catch (error) {
      logger.error('Erro ao renovar tokens:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('expirado') || error.message.includes('inválida')) {
          res.status(401).json({
            success: false,
            message: 'Refresh token inválido ou expirado',
            code: 'INVALID_REFRESH_TOKEN'
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno ao renovar tokens',
        code: 'REFRESH_ERROR'
      });
    }
  }

  /**
   * Obter dados do usuário atual
   */
  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
          session: {
            id: req.session?.id,
            expiresAt: req.session?.expiresAt,
            createdAt: req.session?.createdAt
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao obter dados do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno ao obter dados do usuário',
        code: 'USER_DATA_ERROR'
      });
    }
  }

  /**
   * Alterar senha do usuário
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const { currentPassword, newPassword, confirmPassword }: ChangePasswordRequest = req.body;

      // Validar dados obrigatórios
      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios',
          code: 'MISSING_FIELDS'
        });
        return;
      }

      // Validar confirmação de senha
      if (newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Nova senha e confirmação não coincidem',
          code: 'PASSWORD_MISMATCH'
        });
        return;
      }

      // Validar força da senha
      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'Nova senha deve ter pelo menos 8 caracteres',
          code: 'WEAK_PASSWORD'
        });
        return;
      }

      await authService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso. Faça login novamente.'
      });

    } catch (error) {
      logger.error('Erro ao alterar senha:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Senha atual incorreta') {
          res.status(400).json({
            success: false,
            message: 'Senha atual incorreta',
            code: 'INVALID_CURRENT_PASSWORD'
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno ao alterar senha',
        code: 'PASSWORD_CHANGE_ERROR'
      });
    }
  }

  /**
   * Verificar saúde da autenticação
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Serviço de autenticação funcionando',
        data: {
          timestamp: new Date().toISOString(),
          service: 'auth',
          version: '1.0.0'
        }
      });

    } catch (error) {
      logger.error('Erro no health check de autenticação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro no serviço de autenticação',
        code: 'AUTH_SERVICE_ERROR'
      });
    }
  }

  /**
   * Validar token (endpoint para verificação)
   */
  async validateToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Se chegou até aqui, o token é válido (passou pelo middleware)
      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          valid: true,
          user: {
            id: req.user?.id,
            name: req.user?.name,
            email: req.user?.email,
            profileType: req.user?.profileType,
            establishmentType: req.user?.establishmentType
          },
          session: {
            id: req.session?.id,
            expiresAt: req.session?.expiresAt
          }
        }
      });

    } catch (error) {
      logger.error('Erro na validação de token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno na validação de token',
        code: 'TOKEN_VALIDATION_ERROR'
      });
    }
  }

  /**
   * Listar sessões ativas do usuário
   */
  async getSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      // TODO: Implementar listagem de sessões ativas
      // Por enquanto, retornar apenas a sessão atual
      res.status(200).json({
        success: true,
        data: {
          sessions: [
            {
              id: req.session?.id,
              current: true,
              ipAddress: req.session?.ipAddress,
              userAgent: req.session?.userAgent,
              createdAt: req.session?.createdAt,
              expiresAt: req.session?.expiresAt
            }
          ]
        }
      });

    } catch (error) {
      logger.error('Erro ao listar sessões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno ao listar sessões',
        code: 'SESSIONS_LIST_ERROR'
      });
    }
  }

  /**
   * Revogar sessão específica
   */
  async revokeSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'ID da sessão é obrigatório',
          code: 'MISSING_SESSION_ID'
        });
        return;
      }

      await authService.logout(sessionId, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Sessão revogada com sucesso'
      });

    } catch (error) {
      logger.error('Erro ao revogar sessão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno ao revogar sessão',
        code: 'SESSION_REVOKE_ERROR'
      });
    }
  }
}

export const authController = new AuthController();
export default authController;