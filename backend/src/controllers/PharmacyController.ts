import { Request, Response } from 'express';
import { PharmacyDashboardService } from '../services/PharmacyDashboardService';
import { EstablishmentType } from '../types/auth';

const pharmacyDashboardService = new PharmacyDashboardService();

export class PharmacyController {
  
  async getDashboard(req: Request, res: Response) {
    try {
      const { establishmentType } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se o usuário tem permissão de farmacêutico
      if (user.profile !== 'farmaceutico') {
        return res.status(403).json({ error: 'Acesso negado. Apenas farmacêuticos podem acessar este dashboard.' });
      }

      // Validar tipo de estabelecimento
      if (!['hospital', 'upa', 'ubs'].includes(establishmentType)) {
        return res.status(400).json({ error: 'Tipo de estabelecimento inválido' });
      }

      const metrics = await pharmacyDashboardService.getPharmacyDashboard(
        user.establishmentId,
        establishmentType as EstablishmentType
      );

      const [pendingPrescriptions, stockAlerts, recentActivities] = await Promise.all([
        pharmacyDashboardService.getPendingPrescriptions(user.establishmentId),
        pharmacyDashboardService.getStockAlerts(user.establishmentId),
        pharmacyDashboardService.getRecentActivities(user.establishmentId)
      ]);

      const dashboardData = {
        metrics,
        pendingPrescriptions,
        stockAlerts,
        recentActivities,
        establishmentInfo: {
          name: user.establishmentName,
          type: establishmentType
        }
      };

      res.json({
        success: true,
        data: dashboardData
      });

    } catch (error: any) {
      console.error('Erro ao obter dashboard farmacêutico:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao carregar dashboard farmacêutico'
      });
    }
  }

  async getPendingPrescriptions(req: Request, res: Response) {
    try {
      const user = req.user;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!user || user.profile !== 'farmaceutico') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const prescriptions = await pharmacyDashboardService.getPendingPrescriptions(
        user.establishmentId,
        limit
      );

      res.json({
        success: true,
        data: prescriptions
      });

    } catch (error: any) {
      console.error('Erro ao obter prescrições pendentes:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao carregar prescrições pendentes'
      });
    }
  }

  async getStockAlerts(req: Request, res: Response) {
    try {
      const user = req.user;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!user || user.profile !== 'farmaceutico') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const alerts = await pharmacyDashboardService.getStockAlerts(
        user.establishmentId,
        limit
      );

      res.json({
        success: true,
        data: alerts
      });

    } catch (error: any) {
      console.error('Erro ao obter alertas de estoque:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao carregar alertas de estoque'
      });
    }
  }

  async processPrescription(req: Request, res: Response) {
    try {
      const user = req.user;
      const { prescriptionId } = req.params;

      if (!user || user.profile !== 'farmaceutico') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const result = await pharmacyDashboardService.processPrescription(prescriptionId);

      res.json({
        success: true,
        data: result,
        message: 'Prescrição processada com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao processar prescrição:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao processar prescrição'
      });
    }
  }

  async requestRestock(req: Request, res: Response) {
    try {
      const user = req.user;
      const { medicationId, quantity } = req.body;

      if (!user || user.profile !== 'farmaceutico') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      if (!medicationId || !quantity) {
        return res.status(400).json({ error: 'Medicamento e quantidade são obrigatórios' });
      }

      const result = await pharmacyDashboardService.requestRestock(medicationId, quantity);

      res.json({
        success: true,
        data: result,
        message: 'Solicitação de reposição realizada com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao solicitar reposição:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao solicitar reposição'
      });
    }
  }
}