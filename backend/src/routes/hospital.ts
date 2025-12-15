import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { HospitalController } from '../controllers/HospitalController';
import { HospitalService } from '../services/HospitalService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const hospitalService = new HospitalService(prisma);
const hospitalController = new HospitalController(hospitalService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// All routes require authentication and hospital establishment
router.use(authMiddleware.authenticate);
router.use(authMiddleware.requireEstablishment('hospital'));

// Admissões/Internações
router.post('/admissions',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  hospitalController.createAdmission
);

router.get('/admissions',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  hospitalController.getAdmissions
);

router.put('/admissions/:id/discharge',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  hospitalController.dischargePatient
);

router.put('/admissions/:id/transfer',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  hospitalController.transferPatient
);

// Leitos
router.get('/beds',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  hospitalController.getBedMap
);

router.put('/beds/:id/status',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  hospitalController.updateBedStatus
);

// Centro Cirúrgico
router.post('/surgeries',
  authMiddleware.requireAnyPermission(['medico:write']),
  hospitalController.createSurgery
);

router.get('/surgeries',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  hospitalController.getSurgeries
);

router.put('/surgeries/:id/status',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  hospitalController.updateSurgeryStatus
);

// UTI
router.get('/icu/patients',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  hospitalController.getICUPatients
);

// Estatísticas
router.get('/stats',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read', 'gestor_geral:read']),
  hospitalController.getHospitalStats
);

export default router;
