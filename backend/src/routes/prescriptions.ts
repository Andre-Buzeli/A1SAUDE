import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrescriptionController } from '../controllers/PrescriptionController';
import { PrescriptionService } from '../services/PrescriptionService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const prescriptionService = new PrescriptionService(prisma);
const prescriptionController = new PrescriptionController(prescriptionService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// All routes require authentication
router.use(authMiddleware.authenticate);

// Prescription CRUD routes
router.post('/', 
  authMiddleware.requireAnyPermission(['medico:write']),
  prescriptionController.createPrescription
);

router.get('/search', 
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read', 'farmaceutico:read']),
  prescriptionController.searchPrescriptions
);

router.get('/active', 
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read', 'farmaceutico:read']),
  prescriptionController.getActivePrescriptions
);

router.get('/stats', 
  authMiddleware.requireAnyPermission(['medico:read', 'gestor_geral:read']),
  prescriptionController.getPrescriptionStats
);

router.get('/:id', 
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read', 'farmaceutico:read']),
  prescriptionController.getPrescriptionById
);

router.put('/:id', 
  authMiddleware.requireAnyPermission(['medico:write']),
  prescriptionController.updatePrescription
);

router.post('/:id/cancel', 
  authMiddleware.requireAnyPermission(['medico:write']),
  prescriptionController.cancelPrescription
);

router.post('/:id/complete', 
  authMiddleware.requireAnyPermission(['medico:write']),
  prescriptionController.completePrescription
);

export default router;


