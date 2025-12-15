import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { NursingController } from '../controllers/NursingController';
import { AuthMiddleware } from '../middlewares/auth';
import { AuthService } from '../services/AuthService';

const router = Router();
const prisma = new PrismaClient();
const authService = new AuthService(prisma);
const authMiddleware = new AuthMiddleware(prisma, authService);
const nursingController = new NursingController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware.authenticate);

// Dashboard de enfermagem por tipo de estabelecimento
router.get('/dashboard/:establishmentType', nursingController.getDashboard.bind(nursingController));

// Atividades recentes de enfermagem
router.get('/activities/recent', nursingController.getRecentActivities.bind(nursingController));

// Triagens pendentes
router.get('/triages/pending', nursingController.getPendingTriages.bind(nursingController));

// Pacientes críticos
router.get('/patients/critical', nursingController.getCriticalPatients.bind(nursingController));

export default router;
