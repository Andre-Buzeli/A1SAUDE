import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export type Permission = 
  | 'view_dashboard'
  | 'manage_patients'
  | 'manage_attendances'
  | 'manage_prescriptions'
  | 'manage_exams'
  | 'manage_vital_signs'
  | 'manage_medications'
  | 'manage_stock'
  | 'manage_users'
  | 'manage_establishments'
  | 'view_reports'
  | 'manage_reports'
  | 'admin_system';

export type Profile = 
  | 'system_master'
  | 'gestor_total'
  | 'gestor_geral'
  | 'gestor_local'
  | 'director_geral'
  | 'director_local'
  | 'coordinator_geral'
  | 'coordinator_local'
  | 'supervisor'
  | 'doctor'
  | 'nurse'
  | 'nurse_technician'
  | 'pharmacist'
  | 'physiotherapist'
  | 'psychologist'
  | 'social_worker'
  | 'nutritionist'
  | 'speech_therapist'
  | 'receptionist'
  | 'secretary'
  | 'cleaning_staff'
  | 'security_guard';

const PROFILE_PERMISSIONS: Record<Profile, Permission[]> = {
  system_master: [
    'view_dashboard', 'manage_patients', 'manage_attendances', 'manage_prescriptions',
    'manage_exams', 'manage_vital_signs', 'manage_medications', 'manage_stock',
    'manage_users', 'manage_establishments', 'view_reports', 'manage_reports', 'admin_system'
  ],
  gestor_total: [
    'view_dashboard', 'manage_patients', 'manage_attendances', 'manage_prescriptions',
    'manage_exams', 'manage_vital_signs', 'manage_medications', 'manage_stock',
    'manage_users', 'manage_establishments', 'view_reports', 'manage_reports'
  ],
  gestor_geral: [
    'view_dashboard', 'manage_patients', 'manage_attendances', 'manage_prescriptions',
    'manage_exams', 'manage_vital_signs', 'manage_medications', 'manage_stock',
    'manage_users', 'view_reports', 'manage_reports'
  ],
  gestor_local: [
    'view_dashboard', 'manage_patients', 'manage_attendances', 'manage_prescriptions',
    'manage_exams', 'manage_vital_signs', 'manage_medications', 'manage_stock',
    'manage_users', 'view_reports'
  ],
  director_geral: [
    'view_dashboard', 'view_reports', 'manage_reports'
  ],
  director_local: [
    'view_dashboard', 'view_reports'
  ],
  coordinator_geral: [
    'view_dashboard', 'manage_attendances', 'manage_prescriptions',
    'manage_exams', 'manage_vital_signs', 'view_reports'
  ],
  coordinator_local: [
    'view_dashboard', 'manage_attendances', 'manage_prescriptions',
    'manage_exams', 'manage_vital_signs', 'view_reports'
  ],
  supervisor: [
    'view_dashboard', 'manage_attendances', 'view_reports'
  ],
  doctor: [
    'view_dashboard', 'manage_patients', 'manage_attendances', 'manage_prescriptions',
    'manage_exams', 'manage_vital_signs', 'view_reports'
  ],
  nurse: [
    'view_dashboard', 'manage_patients', 'manage_attendances', 'manage_prescriptions',
    'manage_exams', 'manage_vital_signs', 'manage_medications', 'view_reports'
  ],
  nurse_technician: [
    'view_dashboard', 'manage_vital_signs', 'manage_medications'
  ],
  pharmacist: [
    'view_dashboard', 'manage_medications', 'manage_stock', 'view_reports'
  ],
  physiotherapist: [
    'view_dashboard', 'manage_patients', 'manage_attendances', 'view_reports'
  ],
  psychologist: [
    'view_dashboard', 'manage_patients', 'manage_attendances', 'view_reports'
  ],
  social_worker: [
    'view_dashboard', 'manage_patients', 'view_reports'
  ],
  nutritionist: [
    'view_dashboard', 'manage_patients', 'view_reports'
  ],
  speech_therapist: [
    'view_dashboard', 'manage_patients', 'view_reports'
  ],
  receptionist: [
    'view_dashboard', 'manage_attendances'
  ],
  secretary: [
    'view_dashboard', 'manage_attendances'
  ],
  cleaning_staff: [
    'view_dashboard'
  ],
  security_guard: [
    'view_dashboard'
  ]
};

export const checkPermission = (permission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const userPermissions = PROFILE_PERMISSIONS[req.user.profile as Profile] || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Permissão insuficiente para acessar este recurso'
      });
    }

    next();
  };
};

export const checkAnyPermission = (permissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const userPermissions = PROFILE_PERMISSIONS[req.user.profile as Profile] || [];
    const hasAnyPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasAnyPermission) {
      return res.status(403).json({
        success: false,
        message: 'Permissão insuficiente para acessar este recurso'
      });
    }

    next();
  };
};

export const checkAllPermissions = (permissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const userPermissions = PROFILE_PERMISSIONS[req.user.profile as Profile] || [];
    const hasAllPermissions = permissions.every(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Permissão insuficiente para acessar este recurso'
      });
    }

    next();
  };
};

export const checkProfile = (profiles: Profile[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!profiles.includes(req.user.profile as Profile)) {
      return res.status(403).json({
        success: false,
        message: 'Perfil não autorizado para acessar este recurso'
      });
    }

    next();
  };
};