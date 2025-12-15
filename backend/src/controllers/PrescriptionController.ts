import { Request, Response } from 'express';
import { PrescriptionService } from '../services/PrescriptionService';

export class PrescriptionController {
  constructor(private prescriptionService: PrescriptionService) {}

  createPrescription = async (req: Request, res: Response) => {
    try {
      const prescription = await this.prescriptionService.createPrescription(req.body);

      res.status(201).json({
        success: true,
        data: prescription,
        message: 'Prescrição criada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'PRESCRIPTION_CREATION_FAILED'
        }
      });
    }
  };

  getPrescriptionById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const prescription = await this.prescriptionService.getPrescriptionById(id);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Prescrição não encontrada',
            code: 'PRESCRIPTION_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: prescription,
        message: 'Prescrição encontrada'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'PRESCRIPTION_FETCH_FAILED'
        }
      });
    }
  };

  searchPrescriptions = async (req: Request, res: Response) => {
    try {
      const filters = {
        patientId: req.query.patientId as string | undefined,
        professionalId: req.query.professionalId as string | undefined,
        attendanceId: req.query.attendanceId as string | undefined,
        status: req.query.status as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined
      };

      const result = await this.prescriptionService.searchPrescriptions(filters);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Prescrições encontradas'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'PRESCRIPTION_SEARCH_FAILED'
        }
      });
    }
  };

  getActivePrescriptions = async (req: Request, res: Response) => {
    try {
      const patientId = req.query.patientId as string | undefined;
      const prescriptions = await this.prescriptionService.getActivePrescriptions(patientId);

      res.status(200).json({
        success: true,
        data: prescriptions,
        message: 'Prescrições ativas encontradas'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'ACTIVE_PRESCRIPTIONS_FETCH_FAILED'
        }
      });
    }
  };

  updatePrescription = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const prescription = await this.prescriptionService.updatePrescription(id, req.body);

      res.status(200).json({
        success: true,
        data: prescription,
        message: 'Prescrição atualizada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'PRESCRIPTION_UPDATE_FAILED'
        }
      });
    }
  };

  cancelPrescription = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const prescription = await this.prescriptionService.cancelPrescription(id, reason);

      res.status(200).json({
        success: true,
        data: prescription,
        message: 'Prescrição cancelada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'PRESCRIPTION_CANCELLATION_FAILED'
        }
      });
    }
  };

  completePrescription = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const prescription = await this.prescriptionService.completePrescription(id);

      res.status(200).json({
        success: true,
        data: prescription,
        message: 'Prescrição concluída com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'PRESCRIPTION_COMPLETION_FAILED'
        }
      });
    }
  };

  getPrescriptionStats = async (req: Request, res: Response) => {
    try {
      const professionalId = req.query.professionalId as string | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const stats = await this.prescriptionService.getPrescriptionStats(
        professionalId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas de prescrições obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'PRESCRIPTION_STATS_FETCH_FAILED'
        }
      });
    }
  };
}


