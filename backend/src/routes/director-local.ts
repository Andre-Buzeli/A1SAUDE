import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { DirectorLocalService } from '../services/DirectorLocalService';
import { authenticateToken } from '../middleware/auth';
import { checkAnyPermission } from '../middleware/permissions';

const router = Router();
const prisma = new PrismaClient();
const directorLocalService = new DirectorLocalService(prisma);

// GET /api/v1/director-local/dashboard - Obter métricas do dashboard
router.get('/dashboard', 
  authenticateToken, 
  checkAnyPermission(['view_reports']),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const establishmentId = req.user!.establishmentId;

      const metrics = await directorLocalService.getDirectorLocalMetrics(userId, establishmentId);
      
      res.json({
        success: true,
        data: metrics,
        message: 'Métricas do dashboard do diretor local obtidas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao obter métricas do diretor local:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter métricas do dashboard',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
);

// GET /api/v1/director-local/establishments - Obter resumo dos estabelecimentos
router.get('/establishments',
  authenticateToken,
  checkAnyPermission(['view_reports']),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const establishments = await directorLocalService.getEstablishmentSummaries(userId);
      
      res.json({
        success: true,
        data: establishments,
        message: 'Resumo dos estabelecimentos obtido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao obter estabelecimentos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter estabelecimentos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
);

// GET /api/v1/director-local/performance - Obter dados de performance
router.get('/performance',
  authenticateToken,
  checkAnyPermission(['view_reports']),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const months = parseInt(req.query.months as string) || 6;
      
      const performanceData = await directorLocalService.getPerformanceData(userId, months);
      
      res.json({
        success: true,
        data: performanceData,
        message: 'Dados de performance obtidos com sucesso'
      });
    } catch (error) {
      console.error('Erro ao obter dados de performance:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter dados de performance',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
);

// GET /api/v1/director-local/alerts - Obter alertas recentes
router.get('/alerts',
  authenticateToken,
  checkAnyPermission(['view_reports']),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const alerts = await directorLocalService.getRecentAlerts(userId, limit);
      
      res.json({
        success: true,
        data: alerts,
        message: 'Alertas obtidos com sucesso'
      });
    } catch (error) {
      console.error('Erro ao obter alertas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter alertas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
);

// GET /api/v1/director-local/budget - Obter visão orçamentária
router.get('/budget',
  authenticateToken,
  checkAnyPermission(['view_reports']),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const budget = await directorLocalService.getBudgetOverview(userId);
      
      res.json({
        success: true,
        data: budget,
        message: 'Visão orçamentária obtida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao obter visão orçamentária:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter visão orçamentária',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
);

export default router;