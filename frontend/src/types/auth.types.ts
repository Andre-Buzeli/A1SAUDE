/**
 * Tipos TypeScript para Autenticação - Frontend
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

// ===== TIPOS DE PERFIL E ESTABELECIMENTO =====
export type UserProfile = 
  | 'SUPER_ADMIN'
  | 'ADMIN_MUNICIPAL'
  | 'ADMIN_ESTADUAL'
  | 'ADMIN_FEDERAL'
  | 'GESTOR_UBS'
  | 'GESTOR_HOSPITAL'
  | 'MEDICO'
  | 'ENFERMEIRO'
  | 'TECNICO_ENFERMAGEM'
  | 'FARMACEUTICO'
  | 'NUTRICIONISTA'
  | 'PSICOLOGO'
  | 'FISIOTERAPEUTA'
  | 'ASSISTENTE_SOCIAL'
  | 'AGENTE_COMUNITARIO';

export type EstablishmentType = 
  | 'UBS'
  | 'HOSPITAL'
  | 'CLINICA'
  | 'LABORATORIO'
  | 'FARMACIA'
  | 'CAPS'
  | 'UPA'
  | 'SAMU'
  | 'SECRETARIA_SAUDE';

// ===== TIPOS DE PERMISSÃO =====
export type Permission = 
  // === PERMISSÕES ADMINISTRATIVAS ===
  | 'gestor_geral:read'
  | 'gestor_geral:write'
  | 'gestor_geral:delete'
  | 'gestor_geral:admin'
  | 'gestor_geral:estrutura_administrativa'
  | 'gestor_geral:contratos'
  | 'gestor_geral:recursos_humanos'
  | 'gestor_geral:financeiro'
  | 'gestor_geral:epidemiologia'
  | 'gestor_geral:auditoria'
  | 'gestor_geral:configuracoes'
  
  // === PERMISSÕES CLÍNICAS ===
  | 'medico:read'
  | 'medico:write'
  | 'medico:prescricao'
  | 'medico:exame'
  | 'medico:procedimento'
  | 'medico:internacao'
  | 'medico:alta'
  | 'enfermeiro:read'
  | 'enfermeiro:write'
  | 'enfermeiro:triage'
  | 'enfermeiro:medicacao'
  | 'enfermeiro:vital_signs'
  
  // === PERMISSÕES DE ESTABELECIMENTO ===
  | 'upa:access'
  | 'ubs:access'
  | 'hospital:access'
  | 'clinica:access'
  | 'laboratorio:access'
  
  // === PERMISSÕES ESPECIAIS ===
  | 'admin:full_access'
  | 'reports:read'
  | 'reports:write'
  | 'audit:read'
  | 'audit:write'
  | 'patient:read'
  | 'patient:write'
  | 'attendance:read'
  | 'attendance:write';

// ===== INTERFACES DE USUÁRIO =====
export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  profileType: UserProfile;
  establishmentId?: string;
  establishmentName?: string;
  establishmentType?: EstablishmentType;
  permissions: Permission[];
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===== INTERFACES DE AUTENTICAÇÃO =====
export interface LoginRequest {
  emailOrCpf: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  tokens: AuthTokens;
  requiresTwoFactor?: boolean;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  tokens: AuthTokens;
}

// ===== INTERFACES DE RESPOSTA DA API =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  code?: string;
  requiresTwoFactor?: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  code?: string;
  statusCode?: number;
}

// ===== CONTEXTO DE AUTENTICAÇÃO =====
export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrCpf: string, password: string, rememberMe?: boolean, twoFactorCode?: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  getDefaultRoute: () => string;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  canAccessRoute: (route: string) => boolean;
}

// ===== MAPEAMENTO DE ROTAS POR PERFIL =====
export const DEFAULT_ROUTES: Record<UserProfile, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN_MUNICIPAL: '/admin/dashboard',
  ADMIN_ESTADUAL: '/admin/dashboard',
  ADMIN_FEDERAL: '/admin/dashboard',
  GESTOR_UBS: '/ubs/dashboard',
  GESTOR_HOSPITAL: '/hospital/dashboard',
  MEDICO: '/hospital/dashboard',
  ENFERMEIRO: '/upa/dashboard',
  TECNICO_ENFERMAGEM: '/upa/dashboard',
  FARMACEUTICO: '/clinica/dashboard',
  NUTRICIONISTA: '/ubs/dashboard',
  PSICOLOGO: '/ubs/dashboard',
  FISIOTERAPEUTA: '/ubs/dashboard',
  ASSISTENTE_SOCIAL: '/ubs/dashboard',
  AGENTE_COMUNITARIO: '/ubs/dashboard'
};

// ===== MAPEAMENTO DE ROTAS POR ESTABELECIMENTO =====
export const ESTABLISHMENT_ROUTES: Record<EstablishmentType, string> = {
  UBS: '/ubs/dashboard',
  HOSPITAL: '/hospital/dashboard',
  UPA: '/upa/dashboard',
  CLINICA: '/clinica/dashboard',
  LABORATORIO: '/laboratorio/dashboard',
  FARMACIA: '/farmacia/dashboard',
  CAPS: '/caps/dashboard',
  SAMU: '/samu/dashboard',
  SECRETARIA_SAUDE: '/admin/dashboard'
};

// ===== LABELS PARA EXIBIÇÃO =====
export const PROFILE_LABELS: Record<UserProfile, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN_MUNICIPAL: 'Administrador Municipal',
  ADMIN_ESTADUAL: 'Administrador Estadual',
  ADMIN_FEDERAL: 'Administrador Federal',
  GESTOR_UBS: 'Gestor UBS',
  GESTOR_HOSPITAL: 'Gestor Hospital',
  MEDICO: 'Médico',
  ENFERMEIRO: 'Enfermeiro',
  TECNICO_ENFERMAGEM: 'Técnico de Enfermagem',
  FARMACEUTICO: 'Farmacêutico',
  NUTRICIONISTA: 'Nutricionista',
  PSICOLOGO: 'Psicólogo',
  FISIOTERAPEUTA: 'Fisioterapeuta',
  ASSISTENTE_SOCIAL: 'Assistente Social',
  AGENTE_COMUNITARIO: 'Agente Comunitário'
};

export const ESTABLISHMENT_LABELS: Record<EstablishmentType, string> = {
  UBS: 'Unidade Básica de Saúde',
  HOSPITAL: 'Hospital',
  UPA: 'Unidade de Pronto Atendimento',
  CLINICA: 'Clínica',
  LABORATORIO: 'Laboratório',
  FARMACIA: 'Farmácia',
  CAPS: 'Centro de Atenção Psicossocial',
  SAMU: 'Serviço de Atendimento Móvel de Urgência',
  SECRETARIA_SAUDE: 'Secretaria de Saúde'
};