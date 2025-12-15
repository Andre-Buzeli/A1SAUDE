/**
 * Rotas de Autenticação
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateLogin, validateChangePassword, validateRefreshToken } from '../validators/auth.validators';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Login do usuário
 * @access Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route POST /api/auth/logout
 * @desc Logout do usuário
 * @access Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route POST /api/auth/refresh
 * @desc Renovar tokens de acesso
 * @access Public
 */
router.post('/refresh', validateRefreshToken, authController.refreshTokens);

/**
 * @route GET /api/auth/me
 * @desc Obter dados do usuário atual
 * @access Private
 */
router.get('/me', authenticateToken, authController.me);

/**
 * @route POST /api/auth/change-password
 * @desc Alterar senha do usuário
 * @access Private
 */
router.post('/change-password', authenticateToken, validateChangePassword, authController.changePassword);

/**
 * @route GET /api/auth/validate
 * @desc Validar token de acesso
 * @access Private
 */
router.get('/validate', authenticateToken, authController.validateToken);

/**
 * @route GET /api/auth/sessions
 * @desc Listar sessões ativas do usuário
 * @access Private
 */
router.get('/sessions', authenticateToken, authController.getSessions);

/**
 * @route DELETE /api/auth/sessions/:sessionId
 * @desc Revogar sessão específica
 * @access Private
 */
router.delete('/sessions/:sessionId', authenticateToken, authController.revokeSession);

/**
 * @route GET /api/auth/health
 * @desc Health check do serviço de autenticação
 * @access Public
 */
router.get('/health', authController.healthCheck);

export default router;