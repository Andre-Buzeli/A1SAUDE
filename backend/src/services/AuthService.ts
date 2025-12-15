import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { CryptoUtils } from '../utils/crypto';
import { generateUserPermissions } from '../config/permissions';
import {
  AuthUser,
  AuthTokens,
  LoginRequest,
  LoginResponse,
  UserProfile,
  EstablishmentType
} from '../types/auth';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async login(credentials: LoginRequest, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    const { emailOrCpf, password, rememberMe = false } = credentials;

    // Find user by email or CPF
    const user = await this.findUserByEmailOrCpf(emailOrCpf);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Usuário inativo');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Generate user permissions
    const permissions = generateUserPermissions(user.profile, user.establishmentType);

    // Create session
    const sessionId = uuidv4();
    const tokens = {
      accessToken: CryptoUtils.generateAccessToken({
        userId: user.id,
        email: user.email,
        profile: user.profile,
        establishmentType: user.establishmentType,
        establishmentId: user.establishmentId,
        permissions,
        sessionId
      }),
      refreshToken: CryptoUtils.generateRefreshToken({
        userId: user.id,
        sessionId
      }),
      expiresIn: Date.now() + (15 * 60 * 1000) // 15 minutes
    };

    // Store session in database
    const expiresAt = new Date(tokens.expiresIn);
    if (rememberMe) {
      // Extend expiration for "remember me"
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    }

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        ipAddress,
        userAgent,
        expiresAt
      }
    });

    // Update user's last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Log audit event
    await this.logAuditEvent('login', user.id, {
      success: true,
      ipAddress,
      userAgent,
      rememberMe
    });

    // Prepare user response
    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone || undefined,
      profile: user.profile,
      establishmentType: user.establishmentType,
      establishmentId: user.establishmentId,
      establishmentName: user.establishmentName,
      permissions,
      isActive: user.isActive,
      lastLogin: new Date(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return {
      user: authUser,
      tokens
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = CryptoUtils.verifyRefreshToken(refreshToken);

      // Find session
      const session = await this.prisma.session.findFirst({
        where: {
          id: decoded.sessionId,
          refreshToken,
          isActive: true,
          expiresAt: { gt: new Date() }
        },
        include: {
          user: {
            include: {
              establishment: true
            }
          }
        }
      });

      if (!session || !session.user) {
        throw new Error('Sessão inválida');
      }

      // Check if user is still active
      if (!session.user.isActive) {
        throw new Error('Usuário inativo');
      }

      // Generate new tokens
      const permissions = generateUserPermissions(
        session.user.profile,
        session.user.establishmentType
      );

      const newTokens = {
        accessToken: CryptoUtils.generateAccessToken({
          userId: session.user.id,
          email: session.user.email,
          profile: session.user.profile,
          establishmentType: session.user.establishmentType,
          establishmentId: session.user.establishmentId,
          permissions,
          sessionId: session.id
        }),
        refreshToken: CryptoUtils.generateRefreshToken({
          userId: session.user.id,
          sessionId: session.id
        }),
        expiresIn: Date.now() + (15 * 60 * 1000) // 15 minutes
      };

      // Update session with new tokens
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          token: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresAt: new Date(newTokens.expiresIn)
        }
      });

      return newTokens;
    } catch (error) {
      throw new Error('Falha ao renovar token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = CryptoUtils.verifyRefreshToken(refreshToken);

      // Deactivate session
      await this.prisma.session.updateMany({
        where: {
          id: decoded.sessionId,
          refreshToken
        },
        data: {
          isActive: false
        }
      });

      // Log audit event
      await this.logAuditEvent('logout', decoded.userId, {
        success: true,
        sessionId: decoded.sessionId
      });
    } catch (error) {
      // Don't throw error for logout, just log it
      console.error('Logout error:', error);
    }
  }

  async validateSession(sessionId: string): Promise<AuthUser | null> {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          include: {
            establishment: true
          }
        }
      }
    });

    if (!session || !session.user || !session.user.isActive) {
      return null;
    }

    const permissions = generateUserPermissions(
      session.user.profile,
      session.user.establishmentType
    );

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      cpf: session.user.cpf,
      phone: session.user.phone || undefined,
      profile: session.user.profile,
      establishmentType: session.user.establishmentType,
      establishmentId: session.user.establishmentId,
      establishmentName: session.user.establishmentName,
      permissions,
      isActive: session.user.isActive,
      lastLogin: session.user.lastLogin || undefined,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
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
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedNewPassword }
    });

    // Invalidate all sessions for this user
    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false }
    });

    // Log audit event
    await this.logAuditEvent('password_change', userId, {
      success: true
    });
  }

  private async findUserByEmailOrCpf(emailOrCpf: string) {
    // Check if it's an email (contains @) or CPF
    const isEmail = emailOrCpf.includes('@');

    return await this.prisma.user.findFirst({
      where: isEmail
        ? { email: emailOrCpf }
        : { cpf: emailOrCpf.replace(/\D/g, '') }, // Remove non-digits from CPF
      include: {
        establishment: true
      }
    });
  }

  private async logAuditEvent(action: string, userId: string, details: any) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource: 'auth',
          details,
          ipAddress: details.ipAddress,
          userAgent: details.userAgent
        }
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }
}
