import { Request, Response } from 'express';
import { ExamService } from '../services/ExamService';

export class ExamController {
  constructor(private examService: ExamService) {}

  createExamRequest = async (req: Request, res: Response) => {
    try {
      const { id } = req.user; // From auth middleware
      const examRequest = await this.examService.createExamRequest(req.body, id);

      res.status(201).json({
        success: true,
        data: examRequest,
        message: 'Solicitação de exame criada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'EXAM_REQUEST_CREATION_FAILED'
        }
      });
    }
  };

  getExamRequestById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const examRequest = await this.examService.getExamRequestById(id);

      if (!examRequest) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Solicitação de exame não encontrada',
            code: 'EXAM_REQUEST_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: examRequest,
        message: 'Solicitação de exame encontrada'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'EXAM_REQUEST_FETCH_FAILED'
        }
      });
    }
  };

  searchExamRequests = async (req: Request, res: Response) => {
    try {
      const filters: any = {
        patientId: req.query.patientId as string | undefined,
        attendanceId: req.query.attendanceId as string | undefined,
        examType: req.query.examType as string | undefined,
        status: req.query.status as any,
        urgency: req.query.urgency as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined
      };

      const result = await this.examService.searchExamRequests(filters);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Solicitações de exame encontradas'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'EXAM_REQUEST_SEARCH_FAILED'
        }
      });
    }
  };

  updateExamRequest = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const examRequest = await this.examService.updateExamRequest(id, req.body);

      res.status(200).json({
        success: true,
        data: examRequest,
        message: 'Solicitação de exame atualizada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'EXAM_REQUEST_UPDATE_FAILED'
        }
      });
    }
  };

  scheduleExam = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { scheduledFor } = req.body;

      if (!scheduledFor) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Data de agendamento é obrigatória',
            code: 'SCHEDULE_DATE_REQUIRED'
          }
        });
      }

      const examRequest = await this.examService.scheduleExam(id, new Date(scheduledFor));

      res.status(200).json({
        success: true,
        data: examRequest,
        message: 'Exame agendado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'EXAM_SCHEDULE_FAILED'
        }
      });
    }
  };

  startExam = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { technician } = req.body;
      const examRequest = await this.examService.startExam(id, technician);

      res.status(200).json({
        success: true,
        data: examRequest,
        message: 'Exame iniciado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'EXAM_START_FAILED'
        }
      });
    }
  };

  completeExam = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { results, observations, reportedBy } = req.body;

      const examRequest = await this.examService.completeExam(id, results, observations, reportedBy);

      res.status(200).json({
        success: true,
        data: examRequest,
        message: 'Exame concluído com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'EXAM_COMPLETION_FAILED'
        }
      });
    }
  };

  cancelExam = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const examRequest = await this.examService.cancelExam(id, reason);

      res.status(200).json({
        success: true,
        data: examRequest,
        message: 'Exame cancelado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'EXAM_CANCELLATION_FAILED'
        }
      });
    }
  };

  getPendingExams = async (req: Request, res: Response) => {
    try {
      const examType = req.query.examType as string | undefined;
      const urgency = req.query.urgency as string | undefined;
      const examRequests = await this.examService.getPendingExams(examType, urgency);

      res.status(200).json({
        success: true,
        data: examRequests,
        message: 'Exames pendentes encontrados'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'PENDING_EXAMS_FETCH_FAILED'
        }
      });
    }
  };

  getExamTypes = async (req: Request, res: Response) => {
    try {
      const examTypes = await this.examService.getExamTypes();

      res.status(200).json({
        success: true,
        data: examTypes,
        message: 'Tipos de exame obtidos com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'EXAM_TYPES_FETCH_FAILED'
        }
      });
    }
  };

  getExamStats = async (req: Request, res: Response) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const stats = await this.examService.getExamStats(startDate, endDate);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas de exames obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'EXAM_STATS_FETCH_FAILED'
        }
      });
    }
  };

  getCriticalResults = async (req: Request, res: Response) => {
    try {
      const patientId = req.query.patientId as string | undefined;
      const examRequests = await this.examService.getCriticalResults(patientId);

      res.status(200).json({
        success: true,
        data: examRequests,
        message: 'Resultados críticos obtidos com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'CRITICAL_RESULTS_FETCH_FAILED'
        }
      });
    }
  };
}


