import { Request, Response } from 'express';
import { MedicationService } from '../services/MedicationService';

export class MedicationController {
  constructor(private medicationService: MedicationService) {}

  // Medication Administration endpoints
  createMedicationAdministration = async (req: Request, res: Response) => {
    try {
      const { id } = req.user; // From auth middleware
      const administration = await this.medicationService.createMedicationAdministration(req.body, id);

      res.status(201).json({
        success: true,
        data: administration,
        message: 'Administração de medicamento criada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'MEDICATION_ADMINISTRATION_CREATION_FAILED'
        }
      });
    }
  };

  getMedicationAdministrationById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const administration = await this.medicationService.getMedicationAdministrationById(id);

      if (!administration) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Administração de medicamento não encontrada',
            code: 'MEDICATION_ADMINISTRATION_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: administration,
        message: 'Administração de medicamento encontrada'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'MEDICATION_ADMINISTRATION_FETCH_FAILED'
        }
      });
    }
  };

  searchMedicationAdministrations = async (req: Request, res: Response) => {
    try {
      const filters: any = {
        patientId: req.query.patientId as string | undefined,
        prescriptionId: req.query.prescriptionId as string | undefined,
        attendanceId: req.query.attendanceId as string | undefined,
        status: req.query.status as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined
      };

      const result = await this.medicationService.searchMedicationAdministrations(filters);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Administrações de medicamento encontradas'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'MEDICATION_ADMINISTRATION_SEARCH_FAILED'
        }
      });
    }
  };

  updateMedicationAdministration = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const administration = await this.medicationService.updateMedicationAdministration(id, req.body);

      res.status(200).json({
        success: true,
        data: administration,
        message: 'Administração de medicamento atualizada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'MEDICATION_ADMINISTRATION_UPDATE_FAILED'
        }
      });
    }
  };

  administerMedication = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const { id: administeredBy } = req.user;
      const administration = await this.medicationService.administerMedication(id, administeredBy, notes);

      res.status(200).json({
        success: true,
        data: administration,
        message: 'Medicamento administrado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'MEDICATION_ADMINISTRATION_FAILED'
        }
      });
    }
  };

  markAsMissed = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const administration = await this.medicationService.markMedicationAsMissed(id, reason);

      res.status(200).json({
        success: true,
        data: administration,
        message: 'Medicamento marcado como perdido'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'MEDICATION_MARK_MISSED_FAILED'
        }
      });
    }
  };

  markAsRefused = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const administration = await this.medicationService.markMedicationAsRefused(id, reason);

      res.status(200).json({
        success: true,
        data: administration,
        message: 'Medicamento marcado como recusado'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'MEDICATION_MARK_REFUSED_FAILED'
        }
      });
    }
  };

  getScheduledForToday = async (req: Request, res: Response) => {
    try {
      const administrations = await this.medicationService.getScheduledMedicationsForToday();

      res.status(200).json({
        success: true,
        data: administrations,
        message: 'Medicamentos agendados para hoje obtidos com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'TODAY_MEDICATIONS_FETCH_FAILED'
        }
      });
    }
  };

  // Medication Schedule endpoints
  createMedicationSchedule = async (req: Request, res: Response) => {
    try {
      const { id } = req.user; // From auth middleware
      const schedule = await this.medicationService.createMedicationSchedule(req.body, id);

      res.status(201).json({
        success: true,
        data: schedule,
        message: 'Cronograma de medicação criado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'MEDICATION_SCHEDULE_CREATION_FAILED'
        }
      });
    }
  };

  getMedicationScheduleById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const schedule = await this.medicationService.getMedicationScheduleById(id);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Cronograma de medicação não encontrado',
            code: 'MEDICATION_SCHEDULE_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: schedule,
        message: 'Cronograma de medicação encontrado'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'MEDICATION_SCHEDULE_FETCH_FAILED'
        }
      });
    }
  };

  getActiveSchedules = async (req: Request, res: Response) => {
    try {
      const patientId = req.query.patientId as string | undefined;
      const schedules = await this.medicationService.getActiveMedicationSchedules(patientId);

      res.status(200).json({
        success: true,
        data: schedules,
        message: 'Cronogramas ativos obtidos com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'ACTIVE_SCHEDULES_FETCH_FAILED'
        }
      });
    }
  };

  // Statistics and reports
  getMedicationStats = async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const stats = await this.medicationService.getMedicationStats(startDate, endDate);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas de medicação obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'MEDICATION_STATS_FETCH_FAILED'
        }
      });
    }
  };

  generateScheduleFromPrescription = async (req: Request, res: Response) => {
    try {
      const { prescriptionId, patientId } = req.body;
      const { id: createdBy } = req.user;

      if (!prescriptionId || !patientId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'ID da prescrição e paciente são obrigatórios',
            code: 'MISSING_PARAMETERS'
          }
        });
      }

      const schedules = await this.medicationService.generateMedicationScheduleFromPrescription(
        prescriptionId,
        patientId,
        createdBy
      );

      res.status(201).json({
        success: true,
        data: schedules,
        message: `${schedules.length} cronogramas criados a partir da prescrição`
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'SCHEDULE_GENERATION_FAILED'
        }
      });
    }
  };
}


