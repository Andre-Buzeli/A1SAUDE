/**
 * Serviço JWT - Geração e Validação de Tokens
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';
import { JWTPayload, AuthTokens, User } from '../types/auth.types';

class JWTService {
  private accessSecret: string;
  private refreshSecret: string;
  private accessExpiresIn: string;
  private refreshExpiresIn: string;

  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET!;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET!;
    this.accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    if (!this.accessSecret || !this.refreshSecret) {
      throw new Error('JWT secrets não configurados nas variáveis de ambiente');
    }
  }

  /**
   * Gerar tokens de acesso e refresh
   */
  generateTokens(user: User, sessionId: string): AuthTokens {
    try {
      const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: user.id,
        sessionId,
        profileType: user.profileType,
        establishmentId: user.establishmentId,
        permissions: user.permissions
      };

      // Gerar access token
      const accessToken = jwt.sign(payload, this.accessSecret, {
        expiresIn: this.getExpirationTime(this.accessExpiresIn),
        issuer: 'a1-saude-api',
        audience: 'a1-saude-frontend'
      });

      // Gerar refresh token
      const refreshToken = jwt.sign(
        { userId: user.id, sessionId },
        this.refreshSecret,
        {
          expiresIn: this.getExpirationTime(this.refreshExpiresIn),
          issuer: 'a1-saude-api',
          audience: 'a1-saude-frontend'
        }
      );

      // Calcular tempo de expiração em segundos
      const expiresIn = this.getExpirationTime(this.accessExpiresIn);

      logger.debug('Tokens JWT gerados com sucesso', {
        userId: user.id,
        sessionId,
        expiresIn
      });

      return {
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer'
      };
    } catch (error) {
      logger.error('Erro ao gerar tokens JWT:', error);
      throw new Error('Erro interno ao gerar tokens de autenticação');
    }
  }

  /**
   * Verificar e decodificar access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.accessSecret, {
        issuer: 'a1-saude-api',
        audience: 'a1-saude-frontend'
      }) as JWTPayload;

      logger.debug('Access token verificado com sucesso', {
        userId: decoded.userId,
        sessionId: decoded.sessionId
      });

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Access token expirado');
        throw new Error('Token de acesso expirado');
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Access token inválido');
        throw new Error('Token de acesso inválido');
      }

      logger.error('Erro ao verificar access token:', error);
      throw new Error('Erro ao verificar token de acesso');
    }
  }

  /**
   * Verificar e decodificar refresh token
   */
  verifyRefreshToken(token: string): { userId: string; sessionId: string } {
    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        issuer: 'a1-saude-api',
        audience: 'a1-saude-frontend'
      }) as any;

      logger.debug('Refresh token verificado com sucesso', {
        userId: decoded.userId,
        sessionId: decoded.sessionId
      });

      return {
        userId: decoded.userId,
        sessionId: decoded.sessionId
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Refresh token expirado');
        throw new Error('Token de atualização expirado');
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Refresh token inválido');
        throw new Error('Token de atualização inválido');
      }

      logger.error('Erro ao verificar refresh token:', error);
      throw new Error('Erro ao verificar token de atualização');
    }
  }

  /**
   * Decodificar token sem verificar (para debug)
   */
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  /**
   * Verificar se token está expirado
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Obter tempo de expiração em segundos
   */
  private getExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // 15 minutos padrão

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900;
    }
  }

  /**
   * Extrair token do header Authorization
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1];
  }

  /**
   * Gerar token para reset de senha
   */
  generatePasswordResetToken(userId: string): string {
    try {
      return jwt.sign(
        { userId, type: 'password-reset' },
        this.accessSecret,
        {
          expiresIn: this.getExpirationTime('1h'),
          issuer: 'a1-saude-api',
          audience: 'a1-saude-frontend'
        }
      );
    } catch (error) {
      logger.error('Erro ao gerar token de reset de senha:', error);
      throw new Error('Erro interno ao gerar token de reset');
    }
  }

  /**
   * Verificar token de reset de senha
   */
  verifyPasswordResetToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.accessSecret, {
        issuer: 'a1-saude-api',
        audience: 'a1-saude-frontend'
      }) as any;

      if (decoded.type !== 'password-reset') {
        throw new Error('Tipo de token inválido');
      }

      return { userId: decoded.userId };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token de reset expirado');
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token de reset inválido');
      }

      logger.error('Erro ao verificar token de reset:', error);
      throw new Error('Erro ao verificar token de reset');
    }
  }

  /**
   * Gerar token para verificação de email
   */
  generateEmailVerificationToken(userId: string): string {
    try {
      return jwt.sign(
        { userId, type: 'email-verification' },
        this.accessSecret,
        {
          expiresIn: this.getExpirationTime('24h'),
          issuer: 'a1-saude-api',
          audience: 'a1-saude-frontend'
        }
      );
    } catch (error) {
      logger.error('Erro ao gerar token de verificação de email:', error);
      throw new Error('Erro interno ao gerar token de verificação');
    }
  }

  /**
   * Verificar token de verificação de email
   */
  verifyEmailVerificationToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.accessSecret, {
        issuer: 'a1-saude-api',
        audience: 'a1-saude-frontend'
      }) as any;

      if (decoded.type !== 'email-verification') {
        throw new Error('Tipo de token inválido');
      }

      return { userId: decoded.userId };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token de verificação expirado');
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token de verificação inválido');
      }

      logger.error('Erro ao verificar token de verificação:', error);
      throw new Error('Erro ao verificar token de verificação');
    }
  }
}

export const jwtService = new JWTService();
export default jwtService;
