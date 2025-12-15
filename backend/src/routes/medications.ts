import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { MedicationController } from '../controllers/MedicationController';
import { MedicationService } from '../services/MedicationService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const medicationService = new MedicationService(prisma);
const medicationController = new MedicationController(medicationService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// All routes require authentication
router.use(authMiddleware.authenticate);

// Medication Administration routes
router.post('/administer',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  medicationController.createMedicationAdministration
);

router.get('/administer/search',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  medicationController.searchMedicationAdministrations
);

router.get('/administer/today',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  medicationController.getScheduledForToday
);

router.get('/administer/:id',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  medicationController.getMedicationAdministrationById
);

router.put('/administer/:id',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  medicationController.updateMedicationAdministration
);

router.post('/administer/:id/administer',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  medicationController.administerMedication
);

router.post('/administer/:id/missed',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  medicationController.markAsMissed
);

router.post('/administer/:id/refused',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  medicationController.markAsRefused
);

// Medication Schedule routes
router.post('/schedule',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  medicationController.createMedicationSchedule
);

router.get('/schedule/active',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  medicationController.getActiveSchedules
);

router.get('/schedule/:id',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  medicationController.getMedicationScheduleById
);

// Statistics and utilities
router.get('/stats',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read', 'gestor_geral:read']),
  medicationController.getMedicationStats
);

router.post('/schedule/generate-from-prescription',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  medicationController.generateScheduleFromPrescription
);

export default router;


