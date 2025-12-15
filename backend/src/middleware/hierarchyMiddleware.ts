import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { checkPermission, Permission } from './permissions';

export const validateHierarchyPermissions = (action: 'create' | 'edit' | 'delete' | 'view') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Mapeamento básico de ações para permissões
    const permissionMap: Record<string, Permission> = {
      create: 'manage_users',
      edit: 'manage_users',
      delete: 'manage_users',
      view: 'view_dashboard'
    };

    const permission = permissionMap[action];
    if (permission) {
      return checkPermission(permission)(req, res, next);
    }

    next();
  };
};

export const validateEstablishmentAccess = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Por enquanto, apenas passa adiante
    // Pode ser implementado posteriormente com lógica específica de estabelecimento
    next();
  };
};