import { Request, Response, NextFunction } from 'express';
import { UserProfile } from '../types/auth';
import { canAccessEstablishment, PERMISSION_RULES } from './hierarchyMiddleware';

/**
 * Middleware to automatically filter data by establishment based on user permissions
 */
export const establishmentFilter = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          error: { message: 'Usuário não autenticado', code: 'UNAUTHENTICATED' }
        });
      }

      const currentProfile = currentUser.profile as UserProfile;
      const rules = PERMISSION_RULES[currentProfile];

      // If user can view all establishments, don't add filters
      if (rules.canViewAllEstablishments) {
        return next();
      }

      // For users restricted to their own establishment, add establishment filter
      if (rules.canManageOwnEstablishment) {
        // Add establishment filter to query parameters
        req.query.establishmentId = currentUser.establishmentId;
        req.body.establishmentId = req.body.establishmentId || currentUser.establishmentId;
        req.establishmentId = currentUser.establishmentId;
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de filtro de estabelecimento:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' }
      });
    }
  };
};

/**
 * Middleware to validate establishment ownership for specific resources
 */
export const validateEstablishmentOwnership = (resourceType: 'user' | 'patient' | 'attendance' | 'establishment') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          error: { message: 'Usuário não autenticado', code: 'UNAUTHENTICATED' }
        });
      }

      const currentProfile = currentUser.profile as UserProfile;
      const rules = PERMISSION_RULES[currentProfile];

      // If user can view all establishments, allow access
      if (rules.canViewAllEstablishments) {
        return next();
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          error: { message: 'ID do recurso não fornecido', code: 'MISSING_RESOURCE_ID' }
        });
      }

      // Import prisma for checking resource ownership
      const { prisma } = await import('../server');

      let resourceEstablishmentId: string | null = null;

      switch (resourceType) {
        case 'user':
          const user = await prisma.user.findUnique({
            where: { id: resourceId },
            select: { establishmentId: true }
          });
          resourceEstablishmentId = user?.establishmentId || null;
          break;

        case 'patient':
          const patient = await prisma.patient.findUnique({
            where: { id: resourceId },
            select: {
              attendances: {
                select: { establishmentId: true },
                take: 1
              }
            }
          });
          resourceEstablishmentId = patient?.attendances[0]?.establishmentId || null;
          break;

        case 'attendance':
          const attendance = await prisma.attendance.findUnique({
            where: { id: resourceId },
            select: { establishmentId: true }
          });
          resourceEstablishmentId = attendance?.establishmentId || null;
          break;

        case 'establishment':
          // For establishments, check if user can access this specific establishment
          if (!canAccessEstablishment(currentProfile, currentUser.establishmentId, resourceId)) {
            return res.status(403).json({
              success: false,
              error: {
                message: 'Você não tem permissão para acessar este estabelecimento',
                code: 'ESTABLISHMENT_ACCESS_DENIED'
              }
            });
          }
          return next();

        default:
          return res.status(400).json({
            success: false,
            error: { message: 'Tipo de recurso inválido', code: 'INVALID_RESOURCE_TYPE' }
          });
      }

      // Check if resource belongs to user's establishment
      if (resourceEstablishmentId && resourceEstablishmentId !== currentUser.establishmentId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Você só pode acessar recursos do seu próprio estabelecimento',
            code: 'RESOURCE_ACCESS_DENIED'
          }
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de propriedade de estabelecimento:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' }
      });
    }
  };
};

/**
 * Middleware to validate establishment context for operations
 */
export const requireEstablishmentContext = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          error: { message: 'Usuário não autenticado', code: 'UNAUTHENTICATED' }
        });
      }

      const currentProfile = currentUser.profile as UserProfile;
      const rules = PERMISSION_RULES[currentProfile];

      // If user can view all establishments, they can specify any establishment
      if (rules.canViewAllEstablishments) {
        return next();
      }

      // For restricted users, ensure establishment context is set
      const establishmentId = req.body.establishmentId || req.query.establishmentId || req.params.establishmentId;

      if (!establishmentId) {
        // Auto-set to user's establishment
        req.body.establishmentId = currentUser.establishmentId;
        req.query.establishmentId = currentUser.establishmentId;
        req.establishmentId = currentUser.establishmentId;
      } else if (establishmentId !== currentUser.establishmentId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Você só pode operar no seu próprio estabelecimento',
            code: 'ESTABLISHMENT_CONTEXT_DENIED'
          }
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de contexto de estabelecimento:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' }
      });
    }
  };
};









