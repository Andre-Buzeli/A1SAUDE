import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PatientController } from '../controllers/PatientController';
import { PatientService } from '../services/PatientService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const patientService = new PatientService(prisma);
const patientController = new PatientController(patientService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// All routes require authentication
router.use(authMiddleware.authenticate);

// Patient CRUD routes
router.post('/', 
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  patientController.createPatient
);

router.get('/search', 
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  patientController.searchPatients
);

router.get('/stats', 
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read', 'gestor_geral:read']),
  patientController.getPatientStats
);

router.get('/cpf/:cpf', 
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  patientController.getPatientByCpf
);

router.get('/:id', 
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  patientController.getPatientById
);

router.put('/:id', 
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  patientController.updatePatient
);

router.delete('/:id', 
  authMiddleware.requireAnyPermission(['medico:write', 'gestor_geral:write']),
  patientController.deactivatePatient
);

router.get('/:id/history', 
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  patientController.getPatientHistory
);

export default router;