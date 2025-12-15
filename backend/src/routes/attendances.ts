import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AttendanceController } from '../controllers/AttendanceController';
import { AttendanceService } from '../services/AttendanceService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const attendanceService = new AttendanceService(prisma);
const attendanceController = new AttendanceController(attendanceService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// All routes require authentication
router.use(authMiddleware.authenticate);

// Attendance routes
router.post('/start',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  attendanceController.startAttendance
);

router.put('/:id/soap',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  attendanceController.updateAttendanceSOAP
);

router.put('/:id/complete',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  attendanceController.completeAttendanceWithSOAP
);

// Legacy routes
router.post('/',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  attendanceController.createAttendance
);

router.get('/search',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  attendanceController.searchAttendances
);

router.get('/active',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  attendanceController.getActiveAttendances
);

router.get('/stats',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read', 'gestor_geral:read']),
  attendanceController.getAttendanceStats
);

router.get('/:id',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  attendanceController.getAttendanceById
);

router.put('/:id',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  attendanceController.updateAttendance
);

export default router;

