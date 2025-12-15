import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PharmacyController } from '../controllers/PharmacyController';
import { AuthMiddleware } from '../middlewares/auth';
import { AuthService } from '../services/AuthService';

const router = Router();
const prisma = new PrismaClient();
const authService = new AuthService(prisma);
const authMiddleware = new AuthMiddleware(prisma, authService);
const pharmacyController = new PharmacyController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware.authenticate);

// Dashboard farmacêutico por tipo de estabelecimento
router.get('/dashboard/:establishmentType', pharmacyController.getDashboard.bind(pharmacyController));

// Prescrições pendentes
router.get('/prescriptions/pending', pharmacyController.getPendingPrescriptions.bind(pharmacyController));

// Alertas de estoque
router.get('/stock/alerts', pharmacyController.getStockAlerts.bind(pharmacyController));

// Processar prescrição
router.put('/prescriptions/:prescriptionId/process', pharmacyController.processPrescription.bind(pharmacyController));

// Solicitar reposição
router.post('/restock/request', pharmacyController.requestRestock.bind(pharmacyController));

export default router;