import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AdminController } from '../controllers/AdminController';
import { AdminUserController } from '../controllers/AdminUserController';
import { AdminUserService } from '../services/AdminUserService';
import { AuthMiddleware } from '../middlewares/auth';
import { validateHierarchyPermissions, validateEstablishmentAccess } from '../middleware/hierarchyMiddleware';
import { establishmentFilter, requireEstablishmentContext, validateEstablishmentOwnership } from '../middleware/establishmentMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Initialize services and controllers
const adminUserService = new AdminUserService(prisma);
const adminController = new AdminController(prisma);
const adminUserController = new AdminUserController(adminUserService);
const authMiddleware = new AuthMiddleware(prisma, {} as any);

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware.authenticate);

// Dashboard executivo
router.get('/dashboard', adminController.getDashboard.bind(adminController));

// Gestão de usuários
router.get('/users', establishmentFilter(), adminUserController.getUsers);
router.get('/users/stats', establishmentFilter(), adminUserController.getUserStats);
router.get('/users/profiles', adminUserController.getAvailableProfiles);
router.get('/users/:id', validateEstablishmentOwnership('user'), adminUserController.getUserById);
router.post('/users', validateHierarchyPermissions('create'), requireEstablishmentContext(), adminUserController.createUser);
router.put('/users/:id', validateHierarchyPermissions('edit'), validateEstablishmentOwnership('user'), adminUserController.updateUser);
router.put('/users/:id/status', validateEstablishmentOwnership('user'), adminUserController.toggleUserStatus);
router.put('/users/:id/reset-password', validateEstablishmentOwnership('user'), adminUserController.resetUserPassword);

// Gestão de estabelecimentos
router.get('/establishments', adminController.getEstablishments.bind(adminController));

// Gestão de profissionais
router.get('/professionals', adminController.getProfessionals.bind(adminController));
router.post('/professionals', adminController.createProfessional.bind(adminController));
router.put('/professionals/:id', adminController.updateProfessional.bind(adminController));
router.delete('/professionals/:id', adminController.deleteProfessional.bind(adminController));

// Gestão financeira
router.get('/financial', adminController.getFinancialData.bind(adminController));
router.post('/financial/budget', adminController.createBudget.bind(adminController));
router.post('/financial/expense', adminController.createExpense.bind(adminController));
router.get('/financial/contracts', adminController.getContracts.bind(adminController));
router.post('/financial/contract', adminController.createContract.bind(adminController));

// Gestão de relatórios
router.get('/reports', adminController.getReports.bind(adminController));
router.post('/reports/export', adminController.exportReport.bind(adminController));

// Gestão epidemiológica
router.get('/epidemiology', adminController.getEpidemiologyNotifications.bind(adminController));
router.post('/epidemiology', adminController.createEpidemiologyNotification.bind(adminController));
router.put('/epidemiology/:id', adminController.updateEpidemiologyNotification.bind(adminController));
router.get('/epidemiology/dashboard', adminController.getEpidemiologyDashboard.bind(adminController));

export default router;