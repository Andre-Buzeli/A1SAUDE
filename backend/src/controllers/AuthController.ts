import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/AuthService';
import { LoginRequest, RefreshTokenRequest } from '../types/auth';

// Validation schemas
const loginSchema = z.object({
  emailOrCpf: z.string().min(1, 'Email ou CPF é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional()
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório')
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres')
});

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  login = async (req: Request, res: Response) => {
    try {
      console.log('[AuthController] login handler');

      // Validate request body
      const validatedData = loginSchema.parse(req.body);
      
      // Get client info
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Perform login
      const result = await this.authService.login(
        validatedData as LoginRequest,
        ipAddress,
        userAgent
      );

      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'LOGIN_FAILED'
        }
      });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = refreshTokenSchema.parse(req.body);

      // Refresh token
      const tokens = await this.authService.refreshTokens(validatedData.refreshToken);

      res.status(200).json(tokens);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(401).json({
        success: false,
        error: {
          message,
          code: 'REFRESH_FAILED'
        }
      });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = refreshTokenSchema.parse(req.body);

      // Perform logout
      await this.authService.logout(validatedData.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      // Don't return error for logout, just success
      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      // User is already attached by auth middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Usuário não autenticado',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: req.user,
        message: 'Dados do usuário obtidos com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      return res.status(500).json({
        success: false,
        error: {
          message,
          code: 'INTERNAL_ERROR'
        }
      });
    }
  };

  changePassword = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Usuário não autenticado',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      // Validate request body
      const validatedData = changePasswordSchema.parse(req.body);

      // Change password
      await this.authService.changePassword(
        req.user.id,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      return res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso. Faça login novamente.'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      return res.status(400).json({
        success: false,
        error: {
          message,
          code: 'PASSWORD_CHANGE_FAILED'
        }
      });
    }
  };

  validateToken = async (req: Request, res: Response) => {
    try {
      // If we reach here, token is valid (middleware already validated it)
      res.status(200).json({
        success: true,
        data: {
          valid: true,
          user: req.user
        },
        message: 'Token válido'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token inválido',
          code: 'INVALID_TOKEN'
        }
      });
    }
  };

  getPermissions = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Usuário não autenticado',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          permissions: req.user.permissions,
          profile: req.user.profile,
          establishmentType: req.user.establishmentType
        },
        message: 'Permissões obtidas com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      return res.status(500).json({
        success: false,
        error: {
          message,
          code: 'INTERNAL_ERROR'
        }
      });
    }
  };

  // Additional methods for authRoutes compatibility
  verifyTwoFactor = async (req: Request, res: Response) => {
    return res.status(501).json({
      success: false,
      error: {
        message: '2FA não implementado',
        code: 'NOT_IMPLEMENTED'
      }
    });
  };

  forgotPassword = async (req: Request, res: Response) => {
    return res.status(501).json({
      success: false,
      error: {
        message: 'Recuperação de senha não implementada',
        code: 'NOT_IMPLEMENTED'
      }
    });
  };

  resetPassword = async (req: Request, res: Response) => {
    return res.status(501).json({
      success: false,
      error: {
        message: 'Reset de senha não implementado',
        code: 'NOT_IMPLEMENTED'
      }
    });
  };

  getProfile = async (req: Request, res: Response) => {
    return this.me(req, res);
  };

  getSessions = async (req: Request, res: Response) => {
    return res.status(501).json({
      success: false,
      error: {
        message: 'Listagem de sessões não implementada',
        code: 'NOT_IMPLEMENTED'
      }
    });
  };

  revokeSession = async (req: Request, res: Response) => {
    return res.status(501).json({
      success: false,
      error: {
        message: 'Revogação de sessão não implementada',
        code: 'NOT_IMPLEMENTED'
      }
    });
  };
}
