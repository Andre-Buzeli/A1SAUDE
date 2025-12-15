import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ReportsController } from '../controllers/ReportsController';
import { ReportsService } from '../services/ReportsService';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const reportsService = new ReportsService(prisma);
const reportsController = new ReportsController(reportsService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// All routes require authentication
router.use(authMiddleware.authenticate);

// Relatórios de atendimentos
router.get('/attendances',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read', 'gestor_geral:read']),
  reportsController.getAttendanceReport
);

// Relatórios de pacientes
router.get('/patients',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read', 'gestor_geral:read']),
  reportsController.getPatientReport
);

// Relatórios financeiros
router.get('/financial',
  authMiddleware.requireAnyPermission(['gestor_geral:read', 'gestor_local:read']),
  reportsController.getFinancialReport
);

// Relatórios epidemiológicos
router.get('/epidemiology',
  authMiddleware.requireAnyPermission(['medico:read', 'gestor_geral:read']),
  reportsController.getEpidemiologyReport
);

// Métricas do dashboard
router.get('/dashboard-metrics',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read', 'gestor_geral:read']),
  reportsController.getDashboardMetrics
);

// Lista de relatórios disponíveis
router.get('/available',
  authMiddleware.requireAnyPermission(['medico:read', 'enfermeiro:read', 'gestor_geral:read']),
  reportsController.getAvailableReports
);

export default router;
