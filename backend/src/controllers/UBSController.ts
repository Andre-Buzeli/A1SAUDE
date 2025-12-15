import { Request, Response } from 'express';
import { UBSService } from '../services/UBSService';

export class UBSController {
  constructor(private ubsService: UBSService) {}

  // Agendamentos
  createAppointment = async (req: Request, res: Response) => {
    try {
      const { id: professionalId } = req.user!;
      const appointmentData = {
        ...req.body,
        establishmentId: req.user!.establishmentId
      };

      const appointment = await this.ubsService.createAppointment(appointmentData, professionalId);

      res.status(201).json({
        success: true,
        data: appointment,
        message: 'Consulta agendada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'APPOINTMENT_CREATION_FAILED'
        }
      });
    }
  };

  getAppointments = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const filters = req.query;

      const result = await this.ubsService.getAppointments(establishmentId, filters as any);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Agendamentos obtidos com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'APPOINTMENTS_FETCH_FAILED'
        }
      });
    }
  };

  updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const appointment = await this.ubsService.updateAppointmentStatus(id, status, notes);

      res.status(200).json({
        success: true,
        data: appointment,
        message: 'Status da consulta atualizado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'APPOINTMENT_UPDATE_FAILED'
        }
      });
    }
  };

  cancelAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const appointment = await this.ubsService.cancelAppointment(id, reason);

      res.status(200).json({
        success: true,
        data: appointment,
        message: 'Consulta cancelada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'APPOINTMENT_CANCEL_FAILED'
        }
      });
    }
  };

  // Vacinações
  recordVaccination = async (req: Request, res: Response) => {
    try {
      const { id: professionalId } = req.user!;
      const vaccinationData = {
        ...req.body,
        establishmentId: req.user!.establishmentId
      };

      const vaccination = await this.ubsService.recordVaccination(vaccinationData, professionalId);

      res.status(201).json({
        success: true,
        data: vaccination,
        message: 'Vacinação registrada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'VACCINATION_RECORD_FAILED'
        }
      });
    }
  };

  getVaccinationHistory = async (req: Request, res: Response) => {
    try {
      const { patientId } = req.params;

      const history = await this.ubsService.getVaccinationHistory(patientId);

      res.status(200).json({
        success: true,
        data: history,
        message: 'Histórico de vacinas obtido com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'VACCINATION_HISTORY_FETCH_FAILED'
        }
      });
    }
  };

  getVaccinationCard = async (req: Request, res: Response) => {
    try {
      const { patientId } = req.params;

      const card = await this.ubsService.getVaccinationCard(patientId);

      res.status(200).json({
        success: true,
        data: card,
        message: 'Carteira de vacinação obtida com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'VACCINATION_CARD_FETCH_FAILED'
        }
      });
    }
  };

  // Estatísticas da UBS
  getUBSStats = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { period = 'today' } = req.query;

      const stats = await this.ubsService.getUBSStats(establishmentId, period as string);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas da UBS obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'UBS_STATS_FETCH_FAILED'
        }
      });
    }
  };

  // Verificar próximas vacinas
  getUpcomingVaccinations = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { days = 30 } = req.query;

      const vaccinations = await this.ubsService.getUpcomingVaccinations(establishmentId, Number(days));

      res.status(200).json({
        success: true,
        data: vaccinations,
        message: 'Próximas vacinações obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'UPCOMING_VACCINATIONS_FETCH_FAILED'
        }
      });
    }
  };
}
