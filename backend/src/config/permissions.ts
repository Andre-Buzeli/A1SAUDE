import { UserProfile, Permission, EstablishmentType } from '../types/auth';

// Mapeamento de permissões por perfil
export const PERMISSIONS_BY_PROFILE: Record<UserProfile, Permission[]> = {
  gestor_geral: [
    'gestor_geral:read', 'gestor_geral:write', 'gestor_geral:delete', 'gestor_geral:admin',
    'gestor_geral:estrutura_administrativa', 'gestor_geral:contratos', 'gestor_geral:recursos_humanos',
    'gestor_geral:financeiro', 'gestor_geral:epidemiologia', 'gestor_geral:auditoria',
    'upa:access', 'ubs:access', 'hospital:access',
    'reports:read', 'reports:write', 'admin:full_access'
  ],
  
  diretor_local: [
    'diretor_local:read', 'diretor_local:write', 'diretor_local:delete',
    'gestor_geral:estrutura_administrativa', 'gestor_geral:contratos', 'gestor_geral:recursos_humanos',
    'gestor_geral:financeiro', 'gestor_geral:epidemiologia', 'gestor_geral:auditoria',
    'reports:read', 'reports:write'
  ],
  
  gestor_local: [
    'gestor_local:read', 'gestor_local:write',
    'gestor_geral:estrutura_administrativa', 'gestor_geral:recursos_humanos',
    'gestor_geral:financeiro', 'gestor_geral:epidemiologia',
    'reports:read'
  ],
  
  coordenador_geral: [
    'gestor_local:read', 'gestor_local:write',
    'gestor_geral:estrutura_administrativa', 'gestor_geral:recursos_humanos',
    'gestor_geral:epidemiologia',
    'reports:read', 'reports:write'
  ],
  
  coordenador_local: [
    'gestor_local:read', 'gestor_local:write',
    'gestor_geral:recursos_humanos', 'gestor_geral:epidemiologia',
    'reports:read'
  ],
  
  supervisor: [
    'gestor_local:read',
    'gestor_geral:recursos_humanos',
    'reports:read'
  ],
  
  secretario: [
    'gestor_local:read',
    'reports:read'
  ],
  
  recepcionista: [
    'ubs:access', 'upa:access', 'hospital:access'
  ],
  
  medico: [
    'medico:read', 'medico:write', 'medico:prescricao', 'medico:exame', 'medico:procedimento',
    'medico:internacao', 'medico:alta', 'medico:cirurgia',
    'upa:access', 'ubs:access', 'hospital:access'
  ],
  
  enfermeiro: [
    'enfermeiro:read', 'enfermeiro:write', 'enfermeiro:triage', 'enfermeiro:medicacao',
    'enfermeiro:vital_signs', 'enfermeiro:cuidados',
    'upa:access', 'ubs:access', 'hospital:access'
  ],
  
  tecnico_enfermagem: [
    'enfermeiro:read', 'enfermeiro:vital_signs',
    'upa:access', 'ubs:access', 'hospital:access'
  ],
  
  farmaceutico: [
    'farmaceutico:read', 'farmaceutico:write', 'farmaceutico:dispensacao',
    'upa:access', 'ubs:access', 'hospital:access'
  ],
  
  psicologo: [
    'psicologo:read', 'psicologo:write', 'psicologo:avaliacao',
    'ubs:access', 'hospital:access'
  ],
  
  fisioterapeuta: [
    'fisioterapeuta:read', 'fisioterapeuta:write', 'fisioterapeuta:tratamento',
    'ubs:access', 'hospital:access'
  ],
  
  system_master: ['admin:full_access']
};

// Permissões adicionais por estabelecimento
export const PERMISSIONS_BY_ESTABLISHMENT: Record<EstablishmentType, Permission[]> = {
  upa: ['upa:triage', 'upa:emergency_care', 'upa:procedures'],
  ubs: ['ubs:appointments', 'ubs:consultations', 'ubs:preventive_care'],
  hospital: ['hospital:admissions', 'hospital:surgery', 'hospital:icu']
};

// Função para gerar permissões do usuário
export function generateUserPermissions(
  profile: UserProfile, 
  establishmentType: EstablishmentType
): Permission[] {
  const basePermissions = PERMISSIONS_BY_PROFILE[profile] || [];
  const establishmentPermissions = PERMISSIONS_BY_ESTABLISHMENT[establishmentType] || [];
  
  return [...new Set([...basePermissions, ...establishmentPermissions])];
}

// Função para verificar se o usuário tem uma permissão específica
export function hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
  // System master tem acesso total
  if (userPermissions.includes('admin:full_access')) {
    return true;
  }
  
  return userPermissions.includes(requiredPermission);
}

// Função para verificar se o usuário tem qualquer uma das permissões
export function hasAnyPermission(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  // System master tem acesso total
  if (userPermissions.includes('admin:full_access')) {
    return true;
  }
  
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

// Função para verificar se o usuário tem todas as permissões
export function hasAllPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  // System master tem acesso total
  if (userPermissions.includes('admin:full_access')) {
    return true;
  }
  
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}