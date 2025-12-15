import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthController } from '../controllers/authController';
import { authService } from '../services/auth.service';
import { validate, authSchemas } from '../middlewares/validation';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { 
  generalRateLimit, 
  loginRateLimit, 
  forgotPasswordRateLimit, 
  twoFactorRateLimit,
  refreshTokenRateLimit 
} from '../middlewares/rateLimit';

const router = Router();
const prisma = new PrismaClient();
// const authService = new AuthService(prisma); // Using singleton instance
const authController = new AuthController();

/**
 * @route POST /auth/login
 * @desc Login do usuário
 * @access Public
 */
router.post('/login', 
  loginRateLimit,
  validate(authSchemas.login),
  authController.login
);

/**
 * @route POST /auth/2fa/verify
 * @desc Verificação do código 2FA
 * @access Public
 */
router.post('/2fa/verify',
  twoFactorRateLimit,
  validate(authSchemas.twoFactor),
  authController.verifyTwoFactor
);

/**
 * @route POST /auth/refresh
 * @desc Renovação do token de acesso
 * @access Public
 */
router.post('/refresh',
  refreshTokenRateLimit,
  validate(authSchemas.refreshToken),
  authController.refreshToken
);

/**
 * @route POST /auth/logout
 * @desc Logout do usuário
 * @access Private
 */
router.post('/logout',
  generalRateLimit,
  authenticateToken,
  authController.logout
);

/**
 * @route POST /auth/forgot-password
 * @desc Solicitação de recuperação de senha
 * @access Public
 */
router.post('/forgot-password',
  forgotPasswordRateLimit,
  validate(authSchemas.forgotPassword),
  authController.forgotPassword
);

/**
 * @route POST /auth/reset-password
 * @desc Redefinição de senha com token
 * @access Public
 */
router.post('/reset-password',
  generalRateLimit,
  validate(authSchemas.resetPassword),
  authController.resetPassword
);

/**
 * @route POST /auth/change-password
 * @desc Alteração de senha do usuário logado
 * @access Private
 */
router.post('/change-password',
  generalRateLimit,
  authenticateToken,
  validate(authSchemas.changePassword),
  authController.changePassword
);

/**
 * @route GET /auth/me
 * @desc Informações do usuário logado
 * @access Private
 */
router.get('/me',
  generalRateLimit,
  authenticateToken,
  authController.getProfile
);

/**
 * @route GET /auth/sessions
 * @desc Lista sessões ativas do usuário
 * @access Private
 */
router.get('/sessions',
  generalRateLimit,
  authenticateToken,
  authController.getSessions
);

/**
 * @route DELETE /auth/sessions/:sessionId
 * @desc Remove uma sessão específica
 * @access Private
 */
router.delete('/sessions/:sessionId',
  generalRateLimit,
  authenticateToken,
  authController.revokeSession
);

export default router;
export { router as authRoutes };