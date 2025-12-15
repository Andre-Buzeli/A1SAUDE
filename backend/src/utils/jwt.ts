import jwt, { Secret } from 'jsonwebtoken';
import { JWTPayload, AuthTokens } from '../types/auth';

const ACCESS_TOKEN_SECRET: Secret = process.env.JWT_ACCESS_SECRET || 'fallback-access-secret';
const REFRESH_TOKEN_SECRET: Secret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export class JWTUtils {
  static generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens {
    const accessToken = jwt.sign(payload as object, ACCESS_TOKEN_SECRET as Secret, {
      expiresIn: JWTUtils.parseTimeToSeconds(ACCESS_TOKEN_EXPIRES_IN)
    });

    const refreshToken = jwt.sign(
      { userId: payload.userId, sessionId: payload.sessionId } as object,
      REFRESH_TOKEN_SECRET as Secret,
      {
        expiresIn: JWTUtils.parseTimeToSeconds(REFRESH_TOKEN_EXPIRES_IN)
      }
    );

    // Calculate expiration time in milliseconds
    const expiresIn = Date.now() + this.parseTimeToMs(ACCESS_TOKEN_EXPIRES_IN);

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      } else {
        throw new Error('Erro ao verificar token');
      }
    }
  }

  static verifyRefreshToken(token: string): { userId: string; sessionId: string } {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string; sessionId: string };

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expirado');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Refresh token inválido');
      } else {
        throw new Error('Erro ao verificar refresh token');
      }
    }
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1] || null;
  }

  private static parseTimeToMs(timeString: string): number {
    const unit = timeString.slice(-1);
    const value = parseInt(timeString.slice(0, -1));

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return value * 1000; // Default to seconds
    }
  }

  private static parseTimeToSeconds(timeString: string): number {
    const unit = timeString.slice(-1);
    const value = parseInt(timeString.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return value; // Default assume seconds numeric
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  static getTokenExpirationTime(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return null;
      }

      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }
}
