import { Request, Response } from 'express';
import { NursingDashboardService } from '../services/NursingDashboardService';
import { EstablishmentType } from '../types/auth';

const nursingDashboardService = new NursingDashboardService();

export class NursingController {
  
  async getDashboard(req: Request, res: Response) {
    try {
      const { establishmentType } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se o usuário tem permissão de enfermagem
      if (!['enfermeiro', 'tecnico_enfermagem'].includes(user.profile)) {
        return res.status(403).json({ error: 'Acesso negado. Apenas enfermeiros e técnicos de enfermagem podem acessar este dashboard.' });
      }

      // Validar tipo de estabelecimento
      if (!['hospital', 'upa', 'ubs'].includes(establishmentType)) {
        return res.status(400).json({ error: 'Tipo de estabelecimento inválido' });
      }

      const metrics = await nursingDashboardService.getNursingDashboard(
        user.establishmentId,
        establishmentType as EstablishmentType,
        user.id
      );

      const [recentActivities, pendingTriages, criticalPatients] = await Promise.all([
        nursingDashboardService.getRecentNursingActivities(user.establishmentId),
        nursingDashboardService.getPendingTriages(user.establishmentId),
        nursingDashboardService.getCriticalPatients(user.establishmentId)
      ]);

      const dashboardData = {
        metrics,
        recentActivities,
        pendingTriages,
        criticalPatients,
        establishmentInfo: {
          name: user.establishmentName,
          type: establishmentType
        }
      };

      res.json(dashboardData);
    } catch (error: any) {
      console.error('Erro ao buscar dashboard de enfermagem:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  async getRecentActivities(req: Request, res: Response) {
    try {
      const user = req.user;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!['enfermeiro', 'tecnico_enfermagem'].includes(user.profile)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const activities = await nursingDashboardService.getRecentNursingActivities(
        user.establishmentId,
        limit
      );

      res.json(activities);
    } catch (error: any) {
      console.error('Erro ao buscar atividades recentes:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  async getPendingTriages(req: Request, res: Response) {
    try {
      const user = req.user;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!['enfermeiro', 'tecnico_enfermagem'].includes(user.profile)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const triages = await nursingDashboardService.getPendingTriages(
        user.establishmentId,
        limit
      );

      res.json(triages);
    } catch (error: any) {
      console.error('Erro ao buscar triagens pendentes:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  async getCriticalPatients(req: Request, res: Response) {
    try {
      const user = req.user;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!['enfermeiro', 'tecnico_enfermagem'].includes(user.profile)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const patients = await nursingDashboardService.getCriticalPatients(
        user.establishmentId,
        limit
      );

      res.json(patients);
    } catch (error: any) {
      console.error('Erro ao buscar pacientes críticos:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }
}