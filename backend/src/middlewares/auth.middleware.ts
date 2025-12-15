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

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          error: {
            message: 'Usuário desativado',
            code: 'USER_DISABLED'
          }
        });
      }

      // Attach user and session to request
      req.user = user;
      req.sessionId = decoded.sessionId;
      
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({
        error: {
          message: 'Token inválido ou expirado',
          code: 'INVALID_TOKEN'
        }
      });
    }
  };

  // Middleware to require specific establishment type
  requireEstablishment = (allowedTypes: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'UNAUTHORIZED'
          }
        });
      }

      const userEstablishmentType = req.user.establishmentType;
      
      if (!allowedTypes.includes(userEstablishmentType)) {
        return res.status(403).json({
          error: {
            message: 'Acesso negado: tipo de estabelecimento não permitido',
            code: 'INVALID_ESTABLISHMENT_TYPE'
          }
        });
      }

      next();
    };
  };

  // Middleware to require specific permissions
  requirePermission = (permission: Permission) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'UNAUTHORIZED'
          }
        });
      }

      const userPermissions = req.user.permissions || [];
      
      if (!hasPermission(userPermissions, permission)) {
        return res.status(403).json({
          error: {
            message: 'Acesso negado: permissão insuficiente',
            code: 'INSUFFICIENT_PERMISSION'
          }
        });
      }

      next();
    };
  };

  // Middleware to require any of the specified permissions
  requireAnyPermission = (permissions: Permission[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'UNAUTHORIZED'
          }
        });
      }

      const userPermissions = req.user.permissions || [];
      
      if (!hasAnyPermission(userPermissions, permissions)) {
        return res.status(403).json({
          error: {
            message: 'Acesso negado: permissão insuficiente',
            code: 'INSUFFICIENT_PERMISSION'
          }
        });
      }

      next();
    };
  };

  // Middleware to require all specified permissions
  requireAllPermissions = (permissions: Permission[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'UNAUTHORIZED'
          }
        });
      }

      const userPermissions = req.user.permissions || [];
      
      if (!hasAllPermissions(userPermissions, permissions)) {
        return res.status(403).json({
          error: {
            message: 'Acesso negado: permissão insuficiente',
            code: 'INSUFFICIENT_PERMISSION'
          }
        });
      }

      next();
    };
  };
}

// Middleware functions for backward compatibility
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
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

    const decoded = JWTUtils.verifyAccessToken(token);
    
    // Mock user validation - in production, validate session
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      profile: decoded.profile,
      permissions: decoded.permissions || [],
      establishmentType: decoded.establishmentType,
      establishmentId: decoded.establishmentId
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        message: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      }
    });
  }
};

export const requireEstablishmentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Usuário não autenticado',
          code: 'UNAUTHORIZED'
        }
      });
    }

    const userEstablishmentType = req.user.establishmentType;
    
    if (!allowedTypes.includes(userEstablishmentType)) {
      return res.status(403).json({
        error: {
          message: 'Acesso negado: tipo de estabelecimento não permitido',
          code: 'INVALID_ESTABLISHMENT_TYPE'
        }
      });
    }

    next();
  };
};

export const requireAnyPermission = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Usuário não autenticado',
          code: 'UNAUTHORIZED'
        }
      });
    }

    const userPermissions = req.user.permissions || [];
    
    if (!hasAnyPermission(userPermissions, permissions)) {
      return res.status(403).json({
        error: {
          message: 'Acesso negado: permissão insuficiente',
          code: 'INSUFFICIENT_PERMISSION'
        }
      });
    }

    next();
  };
};

/**
 * Middleware para verificar se é profissional clínico
 */
export const requireClinical = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const clinicalProfiles: UserProfile[] = [
    'medico',
    'enfermeiro',
    'tecnico_enfermagem',
    'farmaceutico',
    'psicologo',
    'fisioterapeuta'
  ];
  requireProfiles(clinicalProfiles)(req, res, next);
};

/**
 * Middleware opcional de autenticação (não falha se não autenticado)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = JWTUtils.verifyAccessToken(token);
      
      // Mock user validation - in production, validate session
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        profile: decoded.profile,
        permissions: decoded.permissions || [],
        establishmentType: decoded.establishmentType,
        establishmentId: decoded.establishmentId
      };
    }
    
    next();
  } catch (error) {
    // Don't fail if token is invalid, just continue without user
    next();
  }
};

// Helper function to require specific profiles
const requireProfiles = (profiles: UserProfile[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Usuário não autenticado',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    const userProfile = req.user.profile;
    
    if (!profiles.includes(userProfile)) {
      res.status(403).json({
        error: {
          message: 'Acesso negado: perfil não autorizado',
          code: 'INVALID_PROFILE'
        }
      });
      return;
    }

    next();
  };
};