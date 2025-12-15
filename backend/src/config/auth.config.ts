/**
 * Configuração de Autenticação - A1 Saúde
 * JWT, permissões e configurações de segurança
 */

import env from './env';

// Configurações JWT
export const JWT_CONFIG = {
  ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
} as const;

// Configurações de Sessão
export const SESSION_CONFIG = {
  TIMEOUT_MINUTES: env.SESSION_TIMEOUT_MINUTES,
  MAX_CONCURRENT_SESSIONS: env.MAX_CONCURRENT_SESSIONS,
} as const;

// Configurações de Segurança
export const SECURITY_CONFIG = {
  BCRYPT_SALT_ROUNDS: env.BCRYPT_SALT_ROUNDS,
  RATE_LIMIT_WINDOW_MS: env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: env.RATE_LIMIT_MAX_REQUESTS,
  LOGIN_RATE_LIMIT_MAX: env.LOGIN_RATE_LIMIT_MAX,
  FORGOT_PASSWORD_RATE_LIMIT_MAX: env.FORGOT_PASSWORD_RATE_LIMIT_MAX,
} as const;

// Configurações de 2FA
export const TWO_FACTOR_CONFIG = {
  SERVICE_NAME: env.TWO_FACTOR_SERVICE_NAME,
  ISSUER: env.TWO_FACTOR_ISSUER,
} as const;

// Permissões por Perfil de Usuário
export const PERMISSIONS_BY_PROFILE = {
  gestor_geral: [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'establishments:read', 'establishments:create', 'establishments:update', 'establishments:delete',
    'reports:read', 'reports:create', 'reports:update', 'reports:delete',
    'admin:read', 'admin:create', 'admin:update', 'admin:delete',
    'financial:read', 'financial:create', 'financial:update', 'financial:delete',
    'contracts:read', 'contracts:create', 'contracts:update', 'contracts:delete',
    'notifications:read', 'notifications:create', 'notifications:update', 'notifications:delete',
    'patients:read', 'patients:create', 'patients:update', 'patients:delete',
    'attendances:read', 'attendances:create', 'attendances:update', 'attendances:delete',
    'prescriptions:read', 'prescriptions:create', 'prescriptions:update', 'prescriptions:delete',
    'exams:read', 'exams:create', 'exams:update', 'exams:delete',
    'medications:read', 'medications:create', 'medications:update', 'medications:delete',
    'vital-signs:read', 'vital-signs:create', 'vital-signs:update', 'vital-signs:delete',
    'triage:read', 'triage:create', 'triage:update', 'triage:delete',
    'nursing:read', 'nursing:create', 'nursing:update', 'nursing:delete',
    'pharmacy:read', 'pharmacy:create', 'pharmacy:update', 'pharmacy:delete',
    'psychology:read', 'psychology:create', 'psychology:update', 'psychology:delete',
    'physiotherapist:read', 'physiotherapist:create', 'physiotherapist:update', 'physiotherapist:delete',
  ],
  
  diretor_local: [
    'users:read', 'users:create', 'users:update',
    'establishments:read',
    'reports:read', 'reports:create',
    'patients:read', 'patients:create', 'patients:update',
    'attendances:read', 'attendances:create', 'attendances:update',
    'prescriptions:read', 'prescriptions:create', 'prescriptions:update',
    'exams:read', 'exams:create', 'exams:update',
    'medications:read', 'medications:create', 'medications:update',
    'vital-signs:read', 'vital-signs:create', 'vital-signs:update',
    'triage:read', 'triage:create', 'triage:update',
    'nursing:read', 'nursing:create', 'nursing:update',
    'pharmacy:read', 'pharmacy:create', 'pharmacy:update',
    'psychology:read', 'psychology:create', 'psychology:update',
    'physiotherapist:read', 'physiotherapist:create', 'physiotherapist:update',
  ],
  
  gestor_local: [
    'users:read', 'users:create', 'users:update',
    'establishments:read',
    'reports:read', 'reports:create',
    'patients:read', 'patients:create', 'patients:update',
    'attendances:read', 'attendances:create', 'attendances:update',
    'prescriptions:read', 'prescriptions:create', 'prescriptions:update',
    'exams:read', 'exams:create', 'exams:update',
    'medications:read', 'medications:create', 'medications:update',
    'vital-signs:read', 'vital-signs:create', 'vital-signs:update',
    'triage:read', 'triage:create', 'triage:update',
    'nursing:read', 'nursing:create', 'nursing:update',
    'pharmacy:read', 'pharmacy:create', 'pharmacy:update',
    'psychology:read', 'psychology:create', 'psychology:update',
    'physiotherapist:read', 'physiotherapist:create', 'physiotherapist:update',
  ],
  
  medico: [
    'patients:read', 'patients:create', 'patients:update',
    'attendances:read', 'attendances:create', 'attendances:update',
    'prescriptions:read', 'prescriptions:create', 'prescriptions:update',
    'exams:read', 'exams:create', 'exams:update',
    'medications:read', 'medications:create', 'medications:update',
    'vital-signs:read', 'vital-signs:create', 'vital-signs:update',
    'triage:read', 'triage:create', 'triage:update',
  ],
  
  enfermeiro: [
    'patients:read', 'patients:create', 'patients:update',
    'attendances:read', 'attendances:create', 'attendances:update',
    'prescriptions:read',
    'exams:read', 'exams:create',
    'medications:read', 'medications:create', 'medications:update',
    'vital-signs:read', 'vital-signs:create', 'vital-signs:update',
    'triage:read', 'triage:create', 'triage:update',
    'nursing:read', 'nursing:create', 'nursing:update',
  ],
  
  farmaceutico: [
    'patients:read',
    'prescriptions:read',
    'medications:read', 'medications:create', 'medications:update',
    'pharmacy:read', 'pharmacy:create', 'pharmacy:update',
  ],
  
  psicologo: [
    'patients:read', 'patients:create', 'patients:update',
    'attendances:read', 'attendances:create', 'attendances:update',
    'prescriptions:read', 'prescriptions:create', 'prescriptions:update',
    'exams:read', 'exams:create',
    'psychology:read', 'psychology:create', 'psychology:update',
  ],
  
  fisioterapeuta: [
    'patients:read', 'patients:create', 'patients:update',
    'attendances:read', 'attendances:create', 'attendances:update',
    'prescriptions:read',
    'exams:read', 'exams:create',
    'physiotherapist:read', 'physiotherapist:create', 'physiotherapist:update',
  ],
  
  recepcionista: [
    'patients:read', 'patients:create', 'patients:update',
    'attendances:read', 'attendances:create',
    'triage:read', 'triage:create', 'triage:update',
  ],
  
  secretario: [
    'users:read',
    'establishments:read',
    'reports:read',
    'patients:read', 'patients:create', 'patients:update',
    'attendances:read',
    'prescriptions:read',
    'exams:read',
    'medications:read',
    'vital-signs:read',
  ],
  
  supervisor: [
    'users:read',
    'establishments:read',
    'reports:read', 'reports:create',
    'patients:read',
    'attendances:read',
    'prescriptions:read',
    'exams:read',
    'medications:read',
    'vital-signs:read',
    'triage:read',
  ],
  
  coordenador_geral: [
    'users:read', 'users:create', 'users:update',
    'establishments:read',
    'reports:read', 'reports:create',
    'patients:read', 'patients:create', 'patients:update',
    'attendances:read', 'attendances:create', 'attendances:update',
    'prescriptions:read', 'prescriptions:create', 'prescriptions:update',
    'exams:read', 'exams:create', 'exams:update',
    'medications:read', 'medications:create', 'medications:update',
    'vital-signs:read', 'vital-signs:create', 'vital-signs:update',
    'triage:read', 'triage:create', 'triage:update',
  ],
  
  coordenador_local: [
    'users:read', 'users:create', 'users:update',
    'establishments:read',
    'reports:read', 'reports:create',
    'patients:read', 'patients:create', 'patients:update',
    'attendances:read', 'attendances:create', 'attendances:update',
    'prescriptions:read', 'prescriptions:create', 'prescriptions:update',
    'exams:read', 'exams:create', 'exams:update',
    'medications:read', 'medications:create', 'medications:update',
    'vital-signs:read', 'vital-signs:create', 'vital-signs:update',
    'triage:read', 'triage:create', 'triage:update',
  ],
  
  system_master: [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'establishments:read', 'establishments:create', 'establishments:update', 'establishments:delete',
    'reports:read', 'reports:create', 'reports:update', 'reports:delete',
    'admin:read', 'admin:create', 'admin:update', 'admin:delete',
    'financial:read', 'financial:create', 'financial:update', 'financial:delete',
    'contracts:read', 'contracts:create', 'contracts:update', 'contracts:delete',
    'notifications:read', 'notifications:create', 'notifications:update', 'notifications:delete',
    'patients:read', 'patients:create', 'patients:update', 'patients:delete',
    'attendances:read', 'attendances:create', 'attendances:update', 'attendances:delete',
    'prescriptions:read', 'prescriptions:create', 'prescriptions:update', 'prescriptions:delete',
    'exams:read', 'exams:create', 'exams:update', 'exams:delete',
    'medications:read', 'medications:create', 'medications:update', 'medications:delete',
    'vital-signs:read', 'vital-signs:create', 'vital-signs:update', 'vital-signs:delete',
    'triage:read', 'triage:create', 'triage:update', 'triage:delete',
    'nursing:read', 'nursing:create', 'nursing:update', 'nursing:delete',
    'pharmacy:read', 'pharmacy:create', 'pharmacy:update', 'pharmacy:delete',
    'psychology:read', 'psychology:create', 'psychology:update', 'psychology:delete',
    'physiotherapist:read', 'physiotherapist:create', 'physiotherapist:update', 'physiotherapist:delete',
  ],
} as const;

// Tipos de permissões
export type Permission = typeof PERMISSIONS_BY_PROFILE[keyof typeof PERMISSIONS_BY_PROFILE][number];
export type UserProfile = keyof typeof PERMISSIONS_BY_PROFILE;

// Funções utilitárias
export const hasPermission = (profile: UserProfile, permission: Permission): boolean => {
  return PERMISSIONS_BY_PROFILE[profile]?.includes(permission) || false;
};

export const getPermissionsByProfile = (profile: UserProfile): Permission[] => {
  return PERMISSIONS_BY_PROFILE[profile] || [];
};

export const getAllProfiles = (): UserProfile[] => {
  return Object.keys(PERMISSIONS_BY_PROFILE) as UserProfile[];
};

// Rotas protegidas por permissões
export const PROTECTED_ROUTES = {
  // Admin
  '/api/v1/admin': ['admin:read'],
  '/api/v1/admin/users': ['users:read'],
  '/api/v1/admin/establishments': ['establishments:read'],
  
  // Patients
  '/api/v1/patients': ['patients:read'],
  '/api/v1/patients/create': ['patients:create'],
  '/api/v1/patients/update': ['patients:update'],
  '/api/v1/patients/delete': ['patients:delete'],
  
  // Attendances
  '/api/v1/attendances': ['attendances:read'],
  '/api/v1/attendances/create': ['attendances:create'],
  '/api/v1/attendances/update': ['attendances:update'],
  
  // Prescriptions
  '/api/v1/prescriptions': ['prescriptions:read'],
  '/api/v1/prescriptions/create': ['prescriptions:create'],
  '/api/v1/prescriptions/update': ['prescriptions:update'],
  
  // Exams
  '/api/v1/exams': ['exams:read'],
  '/api/v1/exams/create': ['exams:create'],
  '/api/v1/exams/update': ['exams:update'],
  
  // Medications
  '/api/v1/medications': ['medications:read'],
  '/api/v1/medications/create': ['medications:create'],
  '/api/v1/medications/update': ['medications:update'],
  
  // Vital Signs
  '/api/v1/vital-signs': ['vital-signs:read'],
  '/api/v1/vital-signs/create': ['vital-signs:create'],
  '/api/v1/vital-signs/update': ['vital-signs:update'],
  
  // Triage
  '/api/v1/triage': ['triage:read'],
  '/api/v1/triage/create': ['triage:create'],
  '/api/v1/triage/update': ['triage:update'],
  
  // Nursing
  '/api/v1/nursing': ['nursing:read'],
  '/api/v1/nursing/create': ['nursing:create'],
  '/api/v1/nursing/update': ['nursing:update'],
  
  // Pharmacy
  '/api/v1/pharmacy': ['pharmacy:read'],
  '/api/v1/pharmacy/create': ['pharmacy:create'],
  '/api/v1/pharmacy/update': ['pharmacy:update'],
  
  // Psychology
  '/api/v1/psychology': ['psychology:read'],
  '/api/v1/psychology/create': ['psychology:create'],
  '/api/v1/psychology/update': ['psychology:update'],
  
  // Physiotherapist
  '/api/v1/physiotherapist': ['physiotherapist:read'],
  '/api/v1/physiotherapist/create': ['physiotherapist:create'],
  '/api/v1/physiotherapist/update': ['physiotherapist:update'],
  
  // Reports
  '/api/v1/reports': ['reports:read'],
  '/api/v1/reports/create': ['reports:create'],
  
  // Financial
  '/api/v1/financial': ['financial:read'],
  '/api/v1/financial/create': ['financial:create'],
  '/api/v1/financial/update': ['financial:update'],
  
  // Contracts
  '/api/v1/contracts': ['contracts:read'],
  '/api/v1/contracts/create': ['contracts:create'],
  '/api/v1/contracts/update': ['contracts:update'],
  
  // Notifications
  '/api/v1/notifications': ['notifications:read'],
  '/api/v1/notifications/create': ['notifications:create'],
  '/api/v1/notifications/update': ['notifications:update'],
} as const;

export default {
  JWT_CONFIG,
  SESSION_CONFIG,
  SECURITY_CONFIG,
  TWO_FACTOR_CONFIG,
  PERMISSIONS_BY_PROFILE,
  PROTECTED_ROUTES,
};