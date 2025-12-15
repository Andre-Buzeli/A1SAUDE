import { Request, Response } from 'express';
import { AttendanceService } from '../services/AttendanceService';

export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  createAttendance = async (req: Request, res: Response) => {
    try {
      const attendance = await this.attendanceService.createAttendance(req.body);

      res.status(201).json({
        success: true,
        data: attendance,
        message: 'Atendimento criado com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'ATTENDANCE_CREATION_FAILED'
        }
      });
    }
  };

  getAttendanceById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const attendance = await this.attendanceService.getAttendanceById(id);

      if (!attendance) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Atendimento não encontrado',
            code: 'ATTENDANCE_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Atendimento encontrado'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'INTERNAL_ERROR'
        }
      });
    }
  };

  searchAttendances = async (req: Request, res: Response) => {
    try {
      const filters = req.query;
      const result = await this.attendanceService.searchAttendances(filters as any);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Atendimentos encontrados'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'INTERNAL_ERROR'
        }
      });
    }
  };

  startAttendance = async (req: Request, res: Response) => {
    try {
      const attendanceData = {
        ...req.body,
        professionalId: req.user!.id,
        status: 'in_progress',
        startTime: new Date()
      };

      const attendance = await this.attendanceService.createAttendance(attendanceData);

      res.status(201).json({
        success: true,
        data: attendance,
        message: 'Atendimento iniciado com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'ATTENDANCE_START_FAILED'
        }
      });
    }
  };

  updateAttendanceSOAP = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const soapData = req.body; // { subjective, objective, assessment, plan }

      const attendance = await this.attendanceService.updateAttendanceSOAP(id, soapData);

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'SOAP atualizado com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'SOAP_UPDATE_FAILED'
        }
      });
    }
  };

  completeAttendance = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { subjective, objective, assessment, plan, notes } = req.body;

      let attendance;
      if (subjective || objective || assessment || plan) {
        attendance = await this.attendanceService.updateAttendance(id, {
          status: 'completed',
          endTime: new Date().toISOString(),
          subjective,
          objective,
          assessment,
          plan,
          notes
        });
      } else {
        attendance = await this.attendanceService.completeAttendance(id, notes);
      }

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Atendimento finalizado com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'ATTENDANCE_COMPLETION_FAILED'
        }
      });
    }
  };

  completeAttendanceSimple = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const attendance = await this.attendanceService.completeAttendance(id, notes);

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Atendimento finalizado com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'ATTENDANCE_COMPLETION_FAILED'
        }
      });
    }
  };

  updateAttendance = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const attendance = await this.attendanceService.updateAttendance(id, req.body);

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Atendimento atualizado com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'ATTENDANCE_UPDATE_FAILED'
        }
      });
    }
  };

  completeAttendanceWithSOAP = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { subjective, objective, assessment, plan, notes } = req.body;

      const attendance = await this.attendanceService.updateAttendance(id, {
        status: 'completed',
        endTime: new Date().toISOString(),
        subjective,
        objective,
        assessment,
        plan,
        notes
      });

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Atendimento finalizado com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'ATTENDANCE_COMPLETE_FAILED'
        }
      });
    }
  };

  cancelAttendance = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const attendance = await this.attendanceService.cancelAttendance(id, reason);

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Atendimento cancelado com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'ATTENDANCE_CANCEL_FAILED'
        }
      });
    }
  };

  getActiveAttendances = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.query;
      const attendances = await this.attendanceService.getActiveAttendances(
        establishmentId as string | undefined
      );

      res.status(200).json({
        success: true,
        data: attendances,
        message: 'Atendimentos ativos encontrados'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'INTERNAL_ERROR'
        }
      });
    }
  };

  getAttendanceStats = async (req: Request, res: Response) => {
    try {
      const { establishmentId, startDate, endDate } = req.query;
      
      const stats = await this.attendanceService.getAttendanceStats(
        establishmentId as string | undefined,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas de atendimentos'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'INTERNAL_ERROR'
        }
      });
    }
  };
}

