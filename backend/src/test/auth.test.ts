import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthService } from '../services/AuthService';

const prisma = new PrismaClient();

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    authService = new AuthService(prisma);

    // Create test user
    await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'test@example.com',
        cpf: '12345678901',
        passwordHash: await bcrypt.hash('password123', 12),
        profile: 'medico',
        establishmentType: 'hospital',
        establishmentId: 'test-establishment',
        establishmentName: 'Test Hospital'
      }
    });
  });

  afterEach(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' }
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const result = await authService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should reject invalid credentials', async () => {
      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Credenciais inválidas');
    });

    it('should reject non-existent user', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('validateSession', () => {
    it('should validate active session', async () => {
      const loginResult = await authService.login('test@example.com', 'password123');
      const user = await authService.validateSession(loginResult.tokens.refreshToken);

      expect(user).toBeTruthy();
      expect(user?.email).toBe('test@example.com');
    });

    it('should reject invalid session', async () => {
      const user = await authService.validateSession('invalid-token');
      expect(user).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should refresh valid token', async () => {
      const loginResult = await authService.login('test@example.com', 'password123');
      const newTokens = await authService.refreshToken(loginResult.tokens.refreshToken);

      expect(newTokens).toHaveProperty('accessToken');
      expect(newTokens).toHaveProperty('refreshToken');
      expect(newTokens.accessToken).not.toBe(loginResult.tokens.accessToken);
    });

    it('should reject invalid refresh token', async () => {
      await expect(
        authService.refreshToken('invalid-token')
      ).rejects.toThrow();
    });
  });
});
