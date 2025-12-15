import { Request, Response } from 'express';
import { HospitalService } from '../services/HospitalService';

export class HospitalController {
  constructor(private hospitalService: HospitalService) {}

  // Admissões/Internações
  createAdmission = async (req: Request, res: Response) => {
    try {
      const { id: professionalId } = req.user!;
      const admissionData = {
        ...req.body,
        establishmentId: req.user!.establishmentId
      };

      const admission = await this.hospitalService.createAdmission(admissionData, professionalId);

      res.status(201).json({
        success: true,
        data: admission,
        message: 'Internação criada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'ADMISSION_CREATION_FAILED'
        }
      });
    }
  };

  getAdmissions = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const filters = req.query;

      const result = await this.hospitalService.getAdmissions(establishmentId, filters as any);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Internações obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'ADMISSIONS_FETCH_FAILED'
        }
      });
    }
  };

  dischargePatient = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { dischargeReason, observations } = req.body;

      const admission = await this.hospitalService.dischargePatient(id, dischargeReason, observations);

      res.status(200).json({
        success: true,
        data: admission,
        message: 'Paciente liberado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'DISCHARGE_FAILED'
        }
      });
    }
  };

  transferPatient = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { newBedId, reason } = req.body;

      const admission = await this.hospitalService.transferPatient(id, newBedId, reason);

      res.status(200).json({
        success: true,
        data: admission,
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

  // Leitos
  getBedMap = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { unitId } = req.query;

      const bedMap = await this.hospitalService.getBedMap(establishmentId, unitId as string);

      res.status(200).json({
        success: true,
        data: bedMap,
        message: 'Mapa de leitos obtido com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'BED_MAP_FETCH_FAILED'
        }
      });
    }
  };

  updateBedStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const bed = await this.hospitalService.updateBedStatus(id, status, reason);

      res.status(200).json({
        success: true,
        data: bed,
        message: 'Status do leito atualizado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'BED_UPDATE_FAILED'
        }
      });
    }
  };

  // Centro Cirúrgico
  createSurgery = async (req: Request, res: Response) => {
    try {
      const { id: professionalId } = req.user!;
      const surgeryData = {
        ...req.body,
        establishmentId: req.user!.establishmentId
      };

      const surgery = await this.hospitalService.createSurgery(surgeryData, professionalId);

      res.status(201).json({
        success: true,
        data: surgery,
        message: 'Cirurgia agendada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'SURGERY_CREATION_FAILED'
        }
      });
    }
  };

  getSurgeries = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const filters = req.query;

      const result = await this.hospitalService.getSurgeries(establishmentId, filters as any);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Cirurgias obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'SURGERIES_FETCH_FAILED'
        }
      });
    }
  };

  updateSurgeryStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const surgery = await this.hospitalService.updateSurgeryStatus(id, status, notes);

      res.status(200).json({
        success: true,
        data: surgery,
        message: 'Status da cirurgia atualizado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'SURGERY_UPDATE_FAILED'
        }
      });
    }
  };

  // UTI - Monitoramento básico
  getICUPatients = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;

      const icuPatients = await this.hospitalService.getICUPatients(establishmentId);

      res.status(200).json({
        success: true,
        data: icuPatients,
        message: 'Pacientes da UTI obtidos com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'ICU_PATIENTS_FETCH_FAILED'
        }
      });
    }
  };

  // Estatísticas hospitalares
  getHospitalStats = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { period = 'today' } = req.query;

      const stats = await this.hospitalService.getHospitalStats(establishmentId, period as string);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas hospitalares obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'HOSPITAL_STATS_FETCH_FAILED'
        }
      });
    }
  };
}
