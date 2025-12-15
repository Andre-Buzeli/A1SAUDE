import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { CoordinatorService } from '../services/CoordinatorService';
import { authenticateToken } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = Router();
const prisma = new PrismaClient();
const coordinatorService = new CoordinatorService(prisma);

// GET /api/v1/coordinator/dashboard - Obter métricas do dashboard
router.get('/dashboard', 
  authenticateToken, 
  checkPermission('view_dashboard'),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const establishmentId = req.user!.establishmentId!;

      const metrics = await coordinatorService.getCoordinatorMetrics(userId, establishmentId);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Erro ao obter métricas do coordenador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter métricas do coordenador'
      });
    }
  }
);

// GET /api/v1/coordinator/team-members - Obter membros da equipe
router.get('/team-members', 
  authenticateToken, 
  checkPermission('view_dashboard'),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const establishmentId = req.user!.establishmentId!;

      const teamMembers = await coordinatorService.getTeamMembers(userId, establishmentId);

      res.json({
        success: true,
        data: teamMembers
      });
    } catch (error) {
      console.error('Erro ao obter membros da equipe:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter membros da equipe'
      });
    }
  }
);

// GET /api/v1/coordinator/team-performance - Obter performance da equipe
router.get('/team-performance', 
  authenticateToken, 
  checkPermission('view_dashboard'),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const establishmentId = req.user!.establishmentId!;
      const period = (req.query.period as 'week' | 'month') || 'month';

      const performance = await coordinatorService.getTeamPerformance(userId, establishmentId, period);

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      console.error('Erro ao obter performance da equipe:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter performance da equipe'
      });
    }
  }
);

// GET /api/v1/coordinator/alerts - Obter alertas do coordenador
router.get('/alerts', 
  authenticateToken, 
  checkPermission('view_dashboard'),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const establishmentId = req.user!.establishmentId!;

      const alerts = await coordinatorService.getCoordinatorAlerts(userId, establishmentId);

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Erro ao obter alertas do coordenador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter alertas do coordenador'
      });
    }
  }
);

// GET /api/v1/coordinator/reports - Obter relatórios do coordenador
router.get('/reports', 
  authenticateToken, 
  checkPermission('view_reports'),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const establishmentId = req.user!.establishmentId!;

      const reports = await coordinatorService.getCoordinatorReports(userId, establishmentId);

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Erro ao obter relatórios do coordenador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter relatórios do coordenador'
      });
    }
  }
);

// GET /api/v1/coordinator/tasks - Obter tarefas do coordenador
router.get('/tasks', 
  authenticateToken, 
  checkPermission('view_dashboard'),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const establishmentId = req.user!.establishmentId!;

      const tasks = await coordinatorService.getCoordinatorTasks(userId, establishmentId);

      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Erro ao obter tarefas do coordenador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter tarefas do coordenador'
      });
    }
  }
);

export default router;