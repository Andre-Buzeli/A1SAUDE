import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const authService = new AuthService(prisma);
const authController = new AuthController(authService);
const authMiddleware = new AuthMiddleware(prisma, authService);

// Public routes (no authentication required)
router.post('/login',
  (req, res, next) => {
    console.log('[Auth Route] Raw body:', req.rawBody);
    console.log('[Auth Route] Parsed body:', req.body);
    console.log('[Auth Route] Content-Type:', req.get('Content-Type'));
    next();
  },
  authController.login
);

router.post('/refresh', authController.refreshToken);

router.post('/logout', authController.logout);

// Protected routes (authentication required)
router.get('/me', 
  authMiddleware.authenticate, 
  authController.me
);

router.post('/change-password', 
  authMiddleware.authenticate,
  authController.changePassword
);

router.get('/validate', 
  authMiddleware.authenticate,
  authController.validateToken
);

router.get('/permissions', 
  authMiddleware.authenticate,
  authController.getPermissions
);

// Health check for auth service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'auth',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
