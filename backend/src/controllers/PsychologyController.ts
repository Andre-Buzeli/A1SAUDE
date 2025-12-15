import { Request, Response } from 'express';
import { PsychologyDashboardService } from '../services/PsychologyDashboardService';
import { AuthRequest } from '../middlewares/auth';

export class PsychologyController {
  private psychologyDashboardService: PsychologyDashboardService;

  constructor() {
    this.psychologyDashboardService = new PsychologyDashboardService();
  }

  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { establishmentType } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se o usuário tem permissão de psicólogo
      if (req.user?.profile !== 'psicologo') {
        return res.status(403).json({ error: 'Acesso negado. Perfil de psicólogo requerido.' });
      }

      if (!['hospital', 'upa', 'ubs'].includes(establishmentType)) {
        return res.status(400).json({ error: 'Tipo de estabelecimento inválido' });
      }

      const dashboardData = await this.psychologyDashboardService.getDashboardData(
        userId,
        establishmentType as 'hospital' | 'upa' | 'ubs'
      );

      res.json(dashboardData);
    } catch (error) {
      console.error('Erro ao buscar dashboard psicologia:', error);
      res.status(500).json({ error: 'Erro interno ao buscar dashboard' });
    }
  }

  async getPatients(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10, status = 'all', search = '' } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (req.user?.profile !== 'psicologo') {
        return res.status(403).json({ error: 'Acesso negado. Perfil de psicólogo requerido.' });
      }

      const patients = await this.psychologyDashboardService.getPatients(
        userId,
        {
          page: Number(page),
          limit: Number(limit),
          status: status as string,
          search: search as string
        }
      );

      res.json(patients);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      res.status(500).json({ error: 'Erro interno ao buscar pacientes' });
    }
  }

  async getSessions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { 
        page = 1, 
        limit = 10, 
        status = 'all', 
        patientId = '',
        dateFrom = '',
        dateTo = ''
      } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (req.user?.profile !== 'psicologo') {
        return res.status(403).json({ error: 'Acesso negado. Perfil de psicólogo requerido.' });
      }

      const sessions = await this.psychologyDashboardService.getSessions(
        userId,
        {
          page: Number(page),
          limit: Number(limit),
          status: status as string,
          patientId: patientId as string,
          dateFrom: dateFrom as string,
          dateTo: dateTo as string
        }
      );

      res.json(sessions);
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      res.status(500).json({ error: 'Erro interno ao buscar sessões' });
    }
  }

  async getEvaluations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { 
        page = 1, 
        limit = 10, 
        status = 'all', 
        patientId = '',
        type = 'all'
      } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (req.user?.profile !== 'psicologo') {
        return res.status(403).json({ error: 'Acesso negado. Perfil de psicólogo requerido.' });
      }

      const evaluations = await this.psychologyDashboardService.getEvaluations(
        userId,
        {
          page: Number(page),
          limit: Number(limit),
          status: status as string,
          patientId: patientId as string,
          type: type as string
        }
      );

      res.json(evaluations);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      res.status(500).json({ error: 'Erro interno ao buscar avaliações' });
    }
  }

  async createEvaluation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { patientId, type, notes, scores, recommendations } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (req.user?.profile !== 'psicologo') {
        return res.status(403).json({ error: 'Acesso negado. Perfil de psicólogo requerido.' });
      }

      if (!patientId || !type || !notes) {
        return res.status(400).json({ error: 'Dados obrigatórios faltando' });
      }

      const evaluation = await this.psychologyDashboardService.createEvaluation(
        userId,
        {
          patientId,
          type,
          notes,
          scores,
          recommendations
        }
      );

      res.status(201).json(evaluation);
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      res.status(500).json({ error: 'Erro interno ao criar avaliação' });
    }
  }

  async getMentalHealthAlerts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (req.user?.profile !== 'psicologo') {
        return res.status(403).json({ error: 'Acesso negado. Perfil de psicólogo requerido.' });
      }

      const alerts = await this.psychologyDashboardService.getMentalHealthAlerts(userId);

      res.json(alerts);
    } catch (error) {
      console.error('Erro ao buscar alertas de saúde mental:', error);
      res.status(500).json({ error: 'Erro interno ao buscar alertas' });
    }
  }

  async getPsychologyReports(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { type = 'monthly', dateFrom, dateTo } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (req.user?.profile !== 'psicologo') {
        return res.status(403).json({ error: 'Acesso negado. Perfil de psicólogo requerido.' });
      }

      const reports = await this.psychologyDashboardService.getPsychologyReports(
        userId,
        {
          type: type as string,
          dateFrom: dateFrom as string,
          dateTo: dateTo as string
        }
      );

      res.json(reports);
    } catch (error) {
      console.error('Erro ao buscar relatórios psicologia:', error);
      res.status(500).json({ error: 'Erro interno ao buscar relatórios' });
    }
  }
}