import { Request, Response } from 'express';
import { TriageService } from '../services/TriageService';

export class TriageController {
  constructor(private triageService: TriageService) {}

  createTriage = async (req: Request, res: Response) => {
    try {
      const { id } = req.user; // From auth middleware
      const triage = await this.triageService.createTriage(req.body, id);

      res.status(201).json({
        success: true,
        data: triage,
        message: 'Triagem criada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'TRIAGE_CREATION_FAILED'
        }
      });
    }
  };

  getTriageById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const triage = await this.triageService.getTriageById(id);

      if (!triage) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Triagem não encontrada',
            code: 'TRIAGE_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: triage,
        message: 'Triagem encontrada'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'TRIAGE_FETCH_FAILED'
        }
      });
    }
  };

  searchTriages = async (req: Request, res: Response) => {
    try {
      const filters: any = {
        patientId: req.query.patientId as string | undefined,
        attendanceId: req.query.attendanceId as string | undefined,
        status: req.query.status as any,
        priority: req.query.priority as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined
      };

      const result = await this.triageService.searchTriages(filters);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Triagens encontradas'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'TRIAGE_SEARCH_FAILED'
        }
      });
    }
  };

  updateTriage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const triage = await this.triageService.updateTriage(id, req.body);

      res.status(200).json({
        success: true,
        data: triage,
        message: 'Triagem atualizada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'TRIAGE_UPDATE_FAILED'
        }
      });
    }
  };

  updateTriageStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['waiting', 'in_progress', 'completed', 'transferred'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Status inválido',
            code: 'INVALID_STATUS'
          }
        });
      }

      const triage = await this.triageService.updateTriageStatus(id, status);

      res.status(200).json({
        success: true,
        data: triage,
        message: 'Status da triagem atualizado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'TRIAGE_STATUS_UPDATE_FAILED'
        }
      });
    }
  };

  getWaitingQueue = async (req: Request, res: Response) => {
    try {
      const queue = await this.triageService.getWaitingQueue();

      res.status(200).json({
        success: true,
        data: queue,
        message: 'Fila de espera obtida com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'WAITING_QUEUE_FETCH_FAILED'
        }
      });
    }
  };

  getTriageStats = async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const stats = await this.triageService.getTriageStats(startDate, endDate);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas de triagem obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'TRIAGE_STATS_FETCH_FAILED'
        }
      });
    }
  };

  calculatePriority = async (req: Request, res: Response) => {
    try {
      const { chiefComplaint, vitalSigns, discriminators, presentation, consciousness } = req.body;

      if (!chiefComplaint) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Queixa principal é obrigatória',
            code: 'CHIEF_COMPLAINT_REQUIRED'
          }
        });
      }

      const result = await this.triageService.calculatePriorityOverride(
        chiefComplaint,
        vitalSigns || {},
        discriminators || [],
        presentation || 'walking',
        consciousness || 'alert'
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Prioridade calculada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'PRIORITY_CALCULATION_FAILED'
        }
      });
    }
  };
}


