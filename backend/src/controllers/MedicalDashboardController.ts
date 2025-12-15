import { Request, Response } from 'express';
import { MedicalDashboardService } from '../services/MedicalDashboardService';
import { AuthenticatedRequest } from '../types/auth';
import { hasPermission } from '../config/permissions';

const medicalDashboardService = new MedicalDashboardService();

export class MedicalDashboardController {
  
  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const { establishmentType } = req.params;
      const user = req.user!;

      // Verificar se o usuário tem permissão médica
      if (!hasPermission(user.permissions, 'medico:read')) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas médicos podem acessar este dashboard.'
        });
      }

      // Verificar se o tipo de estabelecimento é válido
      if (!['hospital', 'upa', 'ubs'].includes(establishmentType)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de estabelecimento inválido. Use: hospital, upa ou ubs.'
        });
      }

      // Verificar se o usuário tem acesso ao tipo de estabelecimento
      const establishmentPermission = `${establishmentType}:access` as any;
      if (!hasPermission(user.permissions, establishmentPermission)) {
        return res.status(403).json({
          success: false,
          message: `Acesso negado ao estabelecimento tipo ${establishmentType}.`
        });
      }

      // Buscar métricas do dashboard
      const metrics = await medicalDashboardService.getMedicalDashboard(
        user.establishmentId,
        establishmentType as any,
        user.id
      );

      // Buscar atendimentos recentes
      const recentAttendances = await medicalDashboardService.getRecentAttendances(
        user.establishmentId,
        5
      );

      // Buscar próximos agendamentos
      const upcomingAppointments = await medicalDashboardService.getUpcomingAppointments(
        user.establishmentId,
        5
      );

      res.json({
        success: true,
        data: {
          metrics,
          recentAttendances,
          upcomingAppointments,
          establishmentInfo: {
            id: user.establishmentId,
            name: user.establishmentName,
            type: establishmentType
          }
        }
      });

    } catch (error: unknown) {
      console.error('Erro ao buscar dashboard médico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar dashboard médico.'
      });
    }
  }

  async getMetrics(req: AuthenticatedRequest, res: Response) {
    try {
      const { establishmentType } = req.params;
      const user = req.user!;

      // Verificar permissões
      if (!hasPermission(user.permissions, 'medico:read')) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado.'
        });
      }

      const metrics = await medicalDashboardService.getMedicalDashboard(
        user.establishmentId,
        establishmentType as any,
        user.id
      );

      res.json({
        success: true,
        data: metrics
      });

    } catch (error: unknown) {
      console.error('Erro ao buscar métricas médicas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor.'
      });
    }
  }

  async getRecentAttendances(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const limit = parseInt(req.query.limit as string) || 10;

      // Verificar permissões
      if (!hasPermission(user.permissions, 'medico:read')) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado.'
        });
      }

      const attendances = await medicalDashboardService.getRecentAttendances(
        user.establishmentId,
        limit
      );

      res.json({
        success: true,
        data: attendances
      });

    } catch (error: unknown) {
      console.error('Erro ao buscar atendimentos recentes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor.'
      });
    }
  }

  async getUpcomingAppointments(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const limit = parseInt(req.query.limit as string) || 10;

      // Verificar permissões
      if (!hasPermission(user.permissions, 'medico:read')) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado.'
        });
      }

      const appointments = await medicalDashboardService.getUpcomingAppointments(
        user.establishmentId,
        limit
      );

      res.json({
        success: true,
        data: appointments
      });

    } catch (error: unknown) {
      console.error('Erro ao buscar próximos agendamentos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor.'
      });
    }
  }
}