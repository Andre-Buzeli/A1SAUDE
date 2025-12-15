import { Request, Response } from 'express';
import { PatientService } from '../services/PatientService';

export class PatientController {
  constructor(private patientService: PatientService) {}

  createPatient = async (req: Request, res: Response) => {
    try {
      const patient = await this.patientService.createPatient(req.body);

      res.status(201).json({
        success: true,
        data: patient,
        message: 'Paciente criado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'PATIENT_CREATION_FAILED'
        }
      });
    }
  };

  getPatientById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const patient = await this.patientService.getPatientById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Paciente não encontrado',
            code: 'PATIENT_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: patient,
        message: 'Paciente encontrado'
      });
    } catch (error: unknown) {
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

  getPatientByCpf = async (req: Request, res: Response) => {
    try {
      const { cpf } = req.params;
      const patient = await this.patientService.getPatientByCpf(cpf);

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Paciente não encontrado',
            code: 'PATIENT_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: patient,
        message: 'Paciente encontrado'
      });
    } catch (error: unknown) {
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

  searchPatients = async (req: Request, res: Response) => {
    try {
      const filters = req.query;
      const result = await this.patientService.searchPatients(filters);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Busca realizada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'SEARCH_FAILED'
        }
      });
    }
  };

  updatePatient = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const patient = await this.patientService.updatePatient(id, req.body);

      res.status(200).json({
        success: true,
        data: patient,
        message: 'Paciente atualizado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'PATIENT_UPDATE_FAILED'
        }
      });
    }
  };

  deactivatePatient = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const patient = await this.patientService.deactivatePatient(id);

      res.status(200).json({
        success: true,
        data: patient,
        message: 'Paciente desativado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'PATIENT_DEACTIVATION_FAILED'
        }
      });
    }
  };

  getPatientHistory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const history = await this.patientService.getPatientHistory(id);

      res.status(200).json({
        success: true,
        data: history,
        message: 'Histórico do paciente obtido com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'HISTORY_FETCH_FAILED'
        }
      });
    }
  };

  getPatientStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.patientService.getPatientStats();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas de pacientes obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'STATS_FETCH_FAILED'
        }
      });
    }
  };
}