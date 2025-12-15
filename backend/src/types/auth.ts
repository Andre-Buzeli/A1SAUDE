// Authentication types for Sistema A1 Saúde Backend

export type UserProfile = 
  // Administrativos
  | 'gestor_geral' | 'diretor_local' | 'gestor_local' | 'coordenador_geral' 
  | 'coordenador_local' | 'supervisor' | 'secretario' | 'recepcionista'
  
  // Clínicos
  | 'medico' | 'enfermeiro' | 'tecnico_enfermagem' | 'farmaceutico' 
  | 'psicologo' | 'fisioterapeuta'
  
  // Especiais
  | 'system_master';

export type EstablishmentType = 'upa' | 'ubs' | 'hospital';

export type Permission = 
  // Administrativas
  | 'gestor_geral:read' | 'gestor_geral:write' | 'gestor_geral:delete' | 'gestor_geral:admin'
  | 'gestor_geral:estrutura_administrativa' | 'gestor_geral:contratos' | 'gestor_geral:recursos_humanos'
  | 'gestor_geral:financeiro' | 'gestor_geral:epidemiologia' | 'gestor_geral:auditoria'
  | 'diretor_local:read' | 'diretor_local:write' | 'diretor_local:delete'
  | 'gestor_local:read' | 'gestor_local:write'
  
  // Clínicas
  | 'medico:read' | 'medico:write' | 'medico:prescricao' | 'medico:exame' | 'medico:procedimento'
  | 'medico:internacao' | 'medico:alta' | 'medico:cirurgia'
  | 'enfermeiro:read' | 'enfermeiro:write' | 'enfermeiro:triage' | 'enfermeiro:medicacao'
  | 'enfermeiro:vital_signs' | 'enfermeiro:cuidados'
  | 'farmaceutico:read' | 'farmaceutico:write' | 'farmaceutico:dispensacao'
  | 'psicologo:read' | 'psicologo:write' | 'psicologo:avaliacao'
  | 'fisioterapeuta:read' | 'fisioterapeuta:write' | 'fisioterapeuta:tratamento'
  
  // Por estabelecimento
  | 'upa:access' | 'upa:triage' | 'upa:emergency_care' | 'upa:procedures'
  | 'ubs:access' | 'ubs:appointments' | 'ubs:consultations' | 'ubs:preventive_care'
  | 'hospital:access' | 'hospital:admissions' | 'hospital:surgery' | 'hospital:icu'
  
  // Especiais
  | 'admin:full_access' | 'reports:read' | 'reports:write' | 'audit:read' | 'audit:write';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  profile: UserProfile;
  establishmentType: EstablishmentType;
  establishmentId: string;
  establishmentName: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  emailOrCpf: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface JWTPayload {
  userId: string;
  email: string;
  profile: UserProfile;
  establishmentType: EstablishmentType;
  establishmentId: string;
  permissions: Permission[];
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  sessionId?: string;
}