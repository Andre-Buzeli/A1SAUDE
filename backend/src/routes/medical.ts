import { Router } from 'express';
import { MedicalDashboardController } from '../controllers/MedicalDashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const medicalDashboardController = new MedicalDashboardController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas do dashboard médico
router.get('/dashboard/:establishmentType', medicalDashboardController.getDashboard.bind(medicalDashboardController));
router.get('/dashboard/:establishmentType/metrics', medicalDashboardController.getMetrics.bind(medicalDashboardController));
router.get('/recent-attendances', medicalDashboardController.getRecentAttendances.bind(medicalDashboardController));
router.get('/upcoming-appointments', medicalDashboardController.getUpcomingAppointments.bind(medicalDashboardController));

export default router;