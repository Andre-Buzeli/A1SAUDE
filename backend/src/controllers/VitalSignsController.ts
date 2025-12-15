import { Request, Response } from 'express';
import { VitalSignsService } from '../services/VitalSignsService';

export class VitalSignsController {
  constructor(private vitalSignsService: VitalSignsService) {}

  createVitalSigns = async (req: Request, res: Response) => {
    try {
      const { id } = req.user; // From auth middleware
      const vitalSigns = await this.vitalSignsService.createVitalSigns(req.body, id);

      res.status(201).json({
        success: true,
        data: vitalSigns,
        message: 'Sinais vitais registrados com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'VITAL_SIGNS_CREATION_FAILED'
        }
      });
    }
  };

  getVitalSignsById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const vitalSigns = await this.vitalSignsService.getVitalSignsById(id);

      if (!vitalSigns) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Sinais vitais não encontrados',
            code: 'VITAL_SIGNS_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: vitalSigns,
        message: 'Sinais vitais encontrados'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'VITAL_SIGNS_FETCH_FAILED'
        }
      });
    }
  };

  searchVitalSigns = async (req: Request, res: Response) => {
    try {
      const filters: any = {
        patientId: req.query.patientId as string | undefined,
        attendanceId: req.query.attendanceId as string | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        measuredBy: req.query.measuredBy as string | undefined,
        hasAlerts: req.query.hasAlerts ? req.query.hasAlerts === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined
      };

      const result = await this.vitalSignsService.searchVitalSigns(filters);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Sinais vitais encontrados'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'VITAL_SIGNS_SEARCH_FAILED'
        }
      });
    }
  };

  updateVitalSigns = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const vitalSigns = await this.vitalSignsService.updateVitalSigns(id, req.body);

      res.status(200).json({
        success: true,
        data: vitalSigns,
        message: 'Sinais vitais atualizados com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'VITAL_SIGNS_UPDATE_FAILED'
        }
      });
    }
  };

  getLatestVitalSigns = async (req: Request, res: Response) => {
    try {
      const patientId = req.params.patientId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      const vitalSigns = await this.vitalSignsService.getLatestVitalSigns(patientId, limit);

      res.status(200).json({
        success: true,
        data: vitalSigns,
        message: 'Últimos sinais vitais obtidos com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'LATEST_VITAL_SIGNS_FETCH_FAILED'
        }
      });
    }
  };

  getVitalSignsWithAlerts = async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const vitalSigns = await this.vitalSignsService.getVitalSignsWithAlerts(limit);

      res.status(200).json({
        success: true,
        data: vitalSigns,
        message: 'Sinais vitais com alertas obtidos com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'VITAL_SIGNS_ALERTS_FETCH_FAILED'
        }
      });
    }
  };

  getVitalSignsTrends = async (req: Request, res: Response) => {
    try {
      const { patientId } = req.params;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;

      const trends = await this.vitalSignsService.getVitalSignsTrends(patientId, days);

      res.status(200).json({
        success: true,
        data: trends,
        message: 'Tendências de sinais vitais obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'VITAL_SIGNS_TRENDS_FETCH_FAILED'
        }
      });
    }
  };

  getVitalSignsStats = async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const stats = await this.vitalSignsService.getVitalSignsStats(startDate, endDate);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas de sinais vitais obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'VITAL_SIGNS_STATS_FETCH_FAILED'
        }
      });
    }
  };
}


