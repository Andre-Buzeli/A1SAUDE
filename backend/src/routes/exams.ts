import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ExamController } from '../controllers/ExamController';
import { ExamService } from '../services/ExamService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const examService = new ExamService(prisma);
const examController = new ExamController(examService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// All routes require authentication
router.use(authMiddleware.authenticate);

// Exam request CRUD routes
router.post('/',
  authMiddleware.requireAnyPermission(['medico:write', 'medico:exame']),
  examController.createExamRequest
);

router.get('/search',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  examController.searchExamRequests
);

router.get('/pending',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  examController.getPendingExams
);

router.get('/types',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  examController.getExamTypes
);

router.get('/stats',
  authMiddleware.requireAnyPermission(['medico:read', 'gestor_geral:read']),
  examController.getExamStats
);

router.get('/critical',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  examController.getCriticalResults
);

router.get('/:id',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read']),
  examController.getExamRequestById
);

router.put('/:id',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  examController.updateExamRequest
);

router.post('/:id/schedule',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  examController.scheduleExam
);

router.post('/:id/start',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  examController.startExam
);

router.post('/:id/complete',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  examController.completeExam
);

router.post('/:id/cancel',
  authMiddleware.requireAnyPermission(['medico:write', 'enfermeiro:write']),
  examController.cancelExam
);

export default router;


