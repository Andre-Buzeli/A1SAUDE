/**
 * Tipos TypeScript para Sistema de Autenticação
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import { Request } from 'express';
import { UserProfile as PrismaUserProfile, EstablishmentType as PrismaEstablishmentType } from '@prisma/client';

// ===== TIPOS DE PERFIL E ESTABELECIMENTO =====
export type UserProfile = PrismaUserProfile;
export type EstablishmentTypeEnum = PrismaEstablishmentType;

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
  establishmentType?: EstablishmentTypeEnum;
  permissions: Permission[];
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  password: string;
  profileType: UserProfile;
  establishmentId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  profileType?: UserProfile;
  establishmentId?: string;
  isActive?: boolean;
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

// ===== INTERFACES DE SESSÃO =====
export interface SessionData {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreateSessionRequest {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  rememberMe?: boolean;
}

// ===== INTERFACES DE 2FA =====
export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyRequest {
  userId: string;
  token: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message: string;
}

// ===== INTERFACES DE RESET DE SENHA =====
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ===== INTERFACES DE PERMISSÃO =====
export interface PermissionCheck {
  requiredPermissions?: Permission[];
  allowedProfiles?: UserProfile[];
  allowedEstablishments?: EstablishmentTypeEnum[];
}

export interface AccessOptions {
  requiredPermissions?: Permission[];
  allowedProfiles?: UserProfile[];
  allowedEstablishments?: EstablishmentTypeEnum[];
}

// ===== INTERFACES DE AUDITORIA =====
export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface CreateAuditLogRequest {
  userId?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// ===== INTERFACES DE ESTABELECIMENTO =====
export interface Establishment {
  id: string;
  name: string;
  type: EstablishmentTypeEnum;
  cnes?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEstablishmentRequest {
  name: string;
  type: EstablishmentTypeEnum;
  cnes?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
}

// ===== TIPOS DE RESPOSTA DA API =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  message?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  code?: string;
  statusCode?: number;
}

// ===== TIPOS DE MIDDLEWARE =====
export interface AuthenticatedRequest extends Request {
  user?: User;
  session?: SessionData;
}

export interface JWTPayload {
  userId: string;
  sessionId: string;
  profileType: UserProfile;
  establishmentId?: string;
  permissions: Permission[];
  iat: number;
  exp: number;
}

// ===== TIPOS DE VALIDAÇÃO =====
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ===== TIPOS DE CONFIGURAÇÃO =====
export interface AuthConfig {
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  bcryptSaltRounds: number;
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
  twoFactorServiceName: string;
  twoFactorIssuer: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  loginMaxAttempts: number;
  forgotPasswordMaxAttempts: number;
}

// ===== TIPOS DE FILTRO E BUSCA =====
export interface UserFilters {
  profileType?: UserProfile;
  establishmentId?: string;
  establishmentType?: EstablishmentTypeEnum;
  isActive?: boolean;
  emailVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EstablishmentFilters {
  type?: EstablishmentTypeEnum;
  city?: string;
  state?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}