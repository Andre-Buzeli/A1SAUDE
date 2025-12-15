import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { JWTUtils } from '../utils/jwt';
import { AuthService } from '../services/AuthService';
import { Permission } from '../types/auth';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../config/permissions';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      sessionId?: string;
    }
  }
}

export class AuthMiddleware {
  constructor(
    private prisma: PrismaClient,
    private authService: AuthService
  ) {}

  // Middleware to authenticate JWT token
  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        return res.status(401).json({
          error: {
            message: 'Token de acesso requerido',
            code: 'MISSING_TOKEN'
          }
        });
      }

      // Verify token
      const decoded = JWTUtils.verifyAccessToken(token);
      
      // Validate session
      const user = await this.authService.validateSession(decoded.sessionId);
      
      if (!user) {
        return res.status(401).json({
          error: {
            message: 'Sessão inválida ou expirada',
            code: 'INVALID_SESSION'
          }
        });
      }

      // Attach user and session to request
      req.user = user;
      req.sessionId = decoded.sessionId;
      
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token inválido';
      
      return res.status(401).json({
        error: {
          message,
          code: 'INVALID_TOKEN'
        }
      });
    }
  };

  // Middleware to check if user has specific permission
  requirePermission = (permission: Permission) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      if (!hasPermission(req.user.permissions, permission)) {
        return res.status(403).json({
          error: {
            message: 'Permissão insuficiente',
            code: 'INSUFFICIENT_PERMISSION',
            required: permission
          }
        });
      }

      next();
    };
  };

  // Middleware to check if user has any of the specified permissions
  requireAnyPermission = (permissions: Permission[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      if (!hasAnyPermission(req.user.permissions, permissions)) {
        return res.status(403).json({
          error: {
            message: 'Permissão insuficiente',
            code: 'INSUFFICIENT_PERMISSION',
            required: permissions
          }
        });
      }

      next();
    };
  };

  // Middleware to check if user has all specified permissions
  requireAllPermissions = (permissions: Permission[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      if (!hasAllPermissions(req.user.permissions, permissions)) {
        return res.status(403).json({
          error: {
            message: 'Permissões insuficientes',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: permissions
          }
        });
      }

      next();
    };
  };

  // Middleware to check if user belongs to specific establishment type
  requireEstablishmentType = (establishmentType: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      if (req.user.establishmentType !== establishmentType) {
        return res.status(403).json({
          error: {
            message: 'Acesso restrito ao tipo de estabelecimento',
            code: 'WRONG_ESTABLISHMENT_TYPE',
            required: establishmentType,
            current: req.user.establishmentType
          }
        });
      }

      next();
    };
  };

  // Middleware to check if user has specific profile
  requireProfile = (profile: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      if (req.user.profile !== profile) {
        return res.status(403).json({
          error: {
            message: 'Perfil de usuário insuficiente',
            code: 'INSUFFICIENT_PROFILE',
            required: profile,
            current: req.user.profile
          }
        });
      }

      next();
    };
  };

  // Middleware to check if user belongs to specific establishment type
  requireEstablishment = (establishmentType: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'NOT_AUTHENTICATED'
          }
        });
      }

      if (req.user.establishmentType !== establishmentType) {
        return res.status(403).json({
          error: {
            message: 'Acesso restrito ao tipo de estabelecimento',
            code: 'WRONG_ESTABLISHMENT_TYPE',
            required: establishmentType,
            current: req.user.establishmentType
          }
        });
      }

      next();
    };
  };

  // Optional authentication - doesn't fail if no token
  optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
      
      if (token) {
        const decoded = JWTUtils.verifyAccessToken(token);
        const user = await this.authService.validateSession(decoded.sessionId);
        
        if (user) {
          req.user = user;
          req.sessionId = decoded.sessionId;
        }
      }
      
      next();
    } catch (error) {
      // Continue without authentication for optional auth
      next();
    }
  };

  // Rate limiting for authentication endpoints
  authRateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
    const attempts = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || 'unknown';
      const now = Date.now();
      
      const userAttempts = attempts.get(key);
      
      if (!userAttempts || now > userAttempts.resetTime) {
        attempts.set(key, { count: 1, resetTime: now + windowMs });
        return next();
      }
      
      if (userAttempts.count >= maxAttempts) {
        return res.status(429).json({
          error: {
            message: 'Muitas tentativas de login. Tente novamente mais tarde.',
            code: 'TOO_MANY_ATTEMPTS',
            retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
          }
        });
      }
      
      userAttempts.count++;
      next();
    };
  };
}

// Export types and instances
export interface AuthRequest extends Request {
  user?: any;
  sessionId?: string;
}

export const authenticateToken = new AuthMiddleware(
  new PrismaClient(),
  new AuthService(new PrismaClient())
).authenticate;

export const optionalAuth = new AuthMiddleware(
  new PrismaClient(),
  new AuthService(new PrismaClient())
).authenticate;