import { Request, Response } from 'express';
import { TriageService } from '../services/TriageService';
import { AttendanceService } from '../services/AttendanceService';

export class UPAController {
  constructor(
    private triageService: TriageService,
    private attendanceService: AttendanceService
  ) {}

  // Triagem Manchester
  createTriage = async (req: Request, res: Response) => {
    try {
      const { id: professionalId } = req.user!;
      const triageData = {
        ...req.body,
        establishmentId: req.user!.establishmentId
      };

      const triage = await this.triageService.createTriage(triageData, professionalId);

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

  // Reavaliar triagem (mudar prioridade se necessário)
  reEvaluateTriage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { newPriority, reason } = req.body;

      const triage = await this.triageService.reEvaluateTriage(id, newPriority, reason);

      res.status(200).json({
        success: true,
        data: triage,
        message: 'Triagem reavaliada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'TRIAGE_REVALUATION_FAILED'
        }
      });
    }
  };

  // Fila de atendimento ordenada por prioridade
  getWaitingQueue = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { page = 1, limit = 20 } = req.query;

      const queue = await this.triageService.getWaitingQueue(establishmentId, {
        page: Number(page),
        limit: Number(limit)
      });

      res.status(200).json({
        success: true,
        data: queue,
        message: 'Fila de atendimento obtida com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'QUEUE_FETCH_FAILED'
        }
      });
    }
  };

  // Observação de pacientes (sala de observação)
  getObservationPatients = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { page = 1, limit = 20 } = req.query;

      const patients = await this.triageService.getObservationPatients(establishmentId, {
        page: Number(page),
        limit: Number(limit)
      });

      res.status(200).json({
        success: true,
        data: patients,
        message: 'Pacientes em observação obtidos com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'OBSERVATION_FETCH_FAILED'
        }
      });
    }
  };

  // Atualizar status de observação
  updateObservationStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, observations } = req.body;

      const result = await this.triageService.updateObservationStatus(id, status, observations);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Status de observação atualizado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'OBSERVATION_UPDATE_FAILED'
        }
      });
    }
  };

  // Estatísticas da UPA
  getUPAStats = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { period = 'today' } = req.query;

      const stats = await this.triageService.getUPAStats(establishmentId, period as string);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas da UPA obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'UPA_STATS_FETCH_FAILED'
        }
      });
    }
  };

  // Transferir paciente para hospital
  transferToHospital = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { destinationHospitalId, reason, priority } = req.body;

      const result = await this.triageService.transferToHospital(id, destinationHospitalId, reason, priority);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Paciente transferido com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'TRANSFER_FAILED'
        }
      });
    }
  };
}
