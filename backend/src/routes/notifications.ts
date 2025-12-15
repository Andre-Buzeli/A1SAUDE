import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotificationController } from '../controllers/NotificationController';
import { NotificationService } from '../services/NotificationService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const notificationService = new NotificationService(prisma);
const notificationController = new NotificationController(notificationService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// All routes require authentication
router.use(authMiddleware.authenticate);

// Get user notifications
router.get('/',
  notificationController.getNotifications
);

// Get unread count
router.get('/unread-count',
  notificationController.getUnreadCount
);

// Mark notification as read
router.put('/:id/read',
  notificationController.markAsRead
);

// Create notification (admin only)
router.post('/',
  authMiddleware.requireAnyPermission(['gestor_geral:write', 'system_master:write']),
  notificationController.createNotification
);

export default router;
