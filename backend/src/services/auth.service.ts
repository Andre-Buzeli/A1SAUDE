/**
 * Serviço de Autenticação
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { jwtService } from './jwt.service';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  CreateUserRequest, 
  AuthTokens, 
  SessionData,
  CreateSessionRequest
} from '../types/auth.types';
import { logger } from '../config/logger';

class AuthService {
  private saltRounds = 12;
  private sessionTimeoutMinutes = 60;
  private maxConcurrentSessions = 5;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async login(loginData: LoginRequest, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    try {
      // Find user by email or CPF
      const user = await this.findUserByEmailOrCpf(loginData.emailOrCpf);
      
      if (!user) {
        throw new Error('Credenciais inválidas');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
      }

      // Create session
      const session = await this.createSession({
        userId: user.id,
        ipAddress,
        userAgent,
        rememberMe: loginData.rememberMe
      });

      // Get user with permissions
      const userWithPermissions = this.getUserWithPermissions(user);

      // Generate tokens
      const tokens = jwtService.generateTokens(userWithPermissions, session.id);

      logger.info('Login realizado com sucesso', { userId: user.id, sessionId: session.id });

      return {
        success: true,
        user: userWithPermissions,
        tokens,
        message: 'Login realizado com sucesso'
      };
    } catch (error) {
      logger.error('Erro no login:', error);
      throw error;
    }
  }

  async logout(sessionId: string, userId?: string): Promise<void> {
    try {
      await this.prisma.session.deleteMany({
        where: { id: sessionId }
      });

      logger.info('Logout realizado com sucesso', { sessionId, userId });
    } catch (error) {
      logger.error('Erro no logout:', error);
      throw error;
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      
      // Verify session exists
      const session = await this.verifySession(decoded.sessionId);
      if (!session) {
        throw new Error('Sessão inválida');
      }

      // Get user
      const user = await this.getUserById(decoded.userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Generate new tokens
      const userWithPermissions = this.getUserWithPermissions(user);
      const tokens = jwtService.generateTokens(userWithPermissions, session.id);

      logger.info('Tokens atualizados com sucesso', { userId: user.id, sessionId: session.id });

      return tokens;
    } catch (error) {
      logger.error('Erro ao atualizar tokens:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, this.saltRounds);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          cpf: userData.cpf,
          phone: userData.phone,
          passwordHash,
          profile: userData.profileType,
          establishmentId: userData.establishmentId,
          isActive: true,
          emailVerified: false,
          twoFactorEnabled: false
        }
      });

      logger.info('Usuário criado com sucesso', { userId: user.id });

      return this.getUserWithPermissions(user);
    } catch (error) {
      logger.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      return user ? this.getUserWithPermissions(user) : null;
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  async verifySession(sessionId: string): Promise<SessionData | null> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { 
          id: sessionId,
          isActive: true
        }
      });

      if (!session) {
        return null;
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.prisma.session.delete({ where: { id: sessionId } });
        return null;
      }

      return session;
    } catch (error) {
      logger.error('Erro ao verificar sessão:', error);
      return null;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new Error('Senha atual incorreta');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash }
      });

      // Invalidate all sessions
      await this.prisma.session.deleteMany({
        where: { userId }
      });

      logger.info('Senha alterada com sucesso', { userId });
    } catch (error) {
      logger.error('Erro ao alterar senha:', error);
      throw error;
    }
  }

  private async findUserByEmailOrCpf(emailOrCpf: string): Promise<any> {
    // Check if it's an email or CPF
    const isEmail = emailOrCpf.includes('@');
    
    return await this.prisma.user.findUnique({
      where: isEmail ? { email: emailOrCpf } : { cpf: emailOrCpf }
    });
  }

  private async createSession(sessionData: CreateSessionRequest): Promise<SessionData> {
    // Clean up old sessions if exceeding limit
    await this.cleanupOldSessions(sessionData.userId);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.sessionTimeoutMinutes);

    const session = await this.prisma.session.create({
      data: {
        userId: sessionData.userId,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        isActive: true,
        expiresAt
      }
    });

    return session;
  }

  private async cleanupOldSessions(userId: string): Promise<void> {
    try {
      const sessions = await this.prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      if (sessions.length >= this.maxConcurrentSessions) {
        const sessionsToDelete = sessions.slice(this.maxConcurrentSessions - 1);
        
        await this.prisma.session.deleteMany({
          where: {
            id: { in: sessionsToDelete.map(s => s.id) }
          }
        });
      }
    } catch (error) {
      logger.error('Erro ao limpar sessões antigas:', error);
    }
  }

  private getUserWithPermissions(user: any): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone,
      profileType: user.profile,
      establishmentId: user.establishmentId,
      establishmentName: user.establishment?.name,
      establishmentType: user.establishment?.type,
      permissions: this.getUserPermissions(user.profile),
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private getUserPermissions(profile: string): any[] {
    // This should be implemented based on your permission system
    // For now, returning basic permissions
    const permissions: Record<string, string[]> = {
      'gestor_geral': ['view_dashboard', 'manage_users', 'manage_establishments'],
      'medico': ['view_dashboard', 'manage_patients', 'manage_attendances'],
      'enfermeiro': ['view_dashboard', 'manage_patients', 'manage_attendances', 'manage_vital_signs'],
      'recepcionista': ['view_dashboard', 'manage_attendances'],
      'secretario': ['view_dashboard', 'manage_attendances']
    };

    return permissions[profile] || ['view_dashboard'];
  }
}

export const authService = new AuthService();
export default authService;
