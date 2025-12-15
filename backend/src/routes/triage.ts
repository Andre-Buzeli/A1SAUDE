import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { TriageController } from '../controllers/TriageController';
import { TriageService } from '../services/TriageService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const triageService = new TriageService(prisma);
const triageController = new TriageController(triageService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// All routes require authentication
router.use(authMiddleware.authenticate);

// Triage CRUD routes
router.post('/',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  triageController.createTriage
);

router.get('/search',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  triageController.searchTriages
);

router.get('/queue',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  triageController.getWaitingQueue
);

router.get('/stats',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read', 'gestor_geral:read']),
  triageController.getTriageStats
);

router.post('/calculate-priority',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  triageController.calculatePriority
);

router.get('/:id',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  triageController.getTriageById
);

router.put('/:id',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  triageController.updateTriage
);

router.patch('/:id/status',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  triageController.updateTriageStatus
);

export default router;


