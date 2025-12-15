import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { VitalSignsController } from '../controllers/VitalSignsController';
import { VitalSignsService } from '../services/VitalSignsService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const vitalSignsService = new VitalSignsService(prisma);
const vitalSignsController = new VitalSignsController(vitalSignsService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// All routes require authentication
router.use(authMiddleware.authenticate);

// Vital signs CRUD routes
router.post('/',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  vitalSignsController.createVitalSigns
);

router.get('/search',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  vitalSignsController.searchVitalSigns
);

router.get('/alerts',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  vitalSignsController.getVitalSignsWithAlerts
);

router.get('/stats',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read', 'gestor_geral:read']),
  vitalSignsController.getVitalSignsStats
);

router.get('/trends/:patientId',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  vitalSignsController.getVitalSignsTrends
);

router.get('/latest/:patientId',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  vitalSignsController.getLatestVitalSigns
);

router.get('/:id',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  vitalSignsController.getVitalSignsById
);

router.put('/:id',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  vitalSignsController.updateVitalSigns
);

export default router;


