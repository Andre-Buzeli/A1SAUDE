import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import env from '../config/env';
import { JWTPayload } from '../types/auth';

export class CryptoUtils {
  /**
   * Hash de senha usando bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  }

  /**
   * Verifica senha com hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Gera token JWT de acesso
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      issuer: 'a1-saude-api',
      audience: 'a1-saude-app'
    } as jwt.SignOptions);
  }

  /**
   * Gera token JWT de refresh
   */
  static generateRefreshToken(payload: { userId: string; sessionId: string }): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      issuer: 'a1-saude-api',
      audience: 'a1-saude-app'
    } as jwt.SignOptions);
  }

  /**
   * Verifica e decodifica token JWT de acesso
   */
  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'a1-saude-api',
      audience: 'a1-saude-app'
    }) as JWTPayload;
  }

  /**
   * Verifica e decodifica token JWT de refresh
   */
  static verifyRefreshToken(token: string): { userId: string; sessionId: string } {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'a1-saude-api',
      audience: 'a1-saude-app'
    }) as { userId: string; sessionId: string };
  }

  /**
   * Gera token aleatório seguro
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Gera token numérico para reset de senha
   */
  static generateNumericToken(length: number = 6): string {
    const digits = '0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += digits[crypto.randomInt(0, digits.length)];
    }
    return token;
  }

  /**
   * Gera secret para 2FA
   */
  static generateTwoFactorSecret(userEmail: string): {
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
  } {
    const secret = speakeasy.generateSecret({
      name: userEmail,
      issuer: env.TWO_FACTOR_ISSUER,
      length: 32
    });

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url!,
      manualEntryKey: secret.base32
    };
  }

  /**
   * Gera QR Code para 2FA
   */
  static async generateTwoFactorQRCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }

  /**
   * Verifica código 2FA
   */
  static verifyTwoFactorCode(token: string, secret: string, window: number = 2): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window
    });
  }

  /**
   * Gera código 2FA (para testes)
   */
  static generateTwoFactorCode(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32'
    });
  }

  /**
   * Hash de dados sensíveis (CPF, etc.)
   */
  static hashSensitiveData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Criptografia simétrica para dados reversíveis
   */
  static encrypt(text: string, key: string = env.JWT_ACCESS_SECRET): string {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key).slice(0, 32), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Descriptografia simétrica
   */
  static decrypt(encryptedText: string, key: string = env.JWT_ACCESS_SECRET): string {
    const algorithm = 'aes-256-cbc';
    const [ivHex, encrypted] = encryptedText.split(':');
    
    if (!ivHex || !encrypted) {
      throw new Error('Formato de texto criptografado inválido');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key).slice(0, 32), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Valida força da senha
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Comprimento mínimo
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Senha deve ter pelo menos 8 caracteres');
    }

    // Letras minúsculas
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Senha deve conter pelo menos uma letra minúscula');
    }

    // Letras maiúsculas
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    // Números
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Senha deve conter pelo menos um número');
    }

    // Caracteres especiais
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Senha deve conter pelo menos um caractere especial');
    }

    // Comprimento ideal
    if (password.length >= 12) {
      score += 1;
    }

    return {
      isValid: score >= 4,
      score,
      feedback
    };
  }

  /**
   * Gera senha aleatória segura
   */
  static generateSecurePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Garante pelo menos um caractere de cada tipo
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += symbols[crypto.randomInt(0, symbols.length)];
    
    // Preenche o resto aleatoriamente
    for (let i = 4; i < length; i++) {
      password += allChars[crypto.randomInt(0, allChars.length)];
    }
    
    // Embaralha a senha
    return password.split('').sort(() => crypto.randomInt(0, 2) - 0.5).join('');
  }
}