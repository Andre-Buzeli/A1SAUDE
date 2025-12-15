import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { UPAController } from '../controllers/UPAController';
import { TriageService } from '../services/TriageService';
import { AttendanceService } from '../services/AttendanceService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const triageService = new TriageService(prisma);
const attendanceService = new AttendanceService(prisma);
const upaController = new UPAController(triageService, attendanceService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// All routes require authentication and UPA establishment
router.use(authMiddleware.authenticate);
router.use(authMiddleware.requireEstablishment('upa'));

// Triagem Manchester
router.post('/triage',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  upaController.createTriage
);

router.put('/triage/:id/re-evaluate',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  upaController.reEvaluateTriage
);

// Fila de atendimento
router.get('/queue',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  upaController.getWaitingQueue
);

// Observação
router.get('/observation',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read']),
  upaController.getObservationPatients
);

router.put('/observation/:id',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  upaController.updateObservationStatus
);

// Estatísticas da UPA
router.get('/stats',
  authMiddleware.requireAnyPermission(['enfermeiro:read', 'medico:read', 'gestor_geral:read']),
  upaController.getUPAStats
);

// Transferências
router.post('/transfer/:id',
  authMiddleware.requireAnyPermission(['enfermeiro:write', 'medico:write']),
  upaController.transferToHospital
);

export default router;
