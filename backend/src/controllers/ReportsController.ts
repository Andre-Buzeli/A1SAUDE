import { Request, Response } from 'express';
import { ReportsService } from '../services/ReportsService';

export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  // Relatório de atendimentos
  getAttendanceReport = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { startDate, endDate, format = 'json' } = req.query;

      const report = await this.reportsService.generateAttendanceReport(
        establishmentId,
        startDate as string,
        endDate as string
      );

      if (format === 'pdf') {
        const pdfBuffer = await this.reportsService.generatePDFReport(report, 'Relatório de Atendimentos');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-atendimentos.pdf');
        res.send(pdfBuffer);
      } else if (format === 'excel') {
        const excelBuffer = await this.reportsService.generateExcelReport(report, 'atendimentos');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-atendimentos.xlsx');
        res.send(excelBuffer);
      } else {
        res.status(200).json({
          success: true,
          data: report,
          message: 'Relatório de atendimentos gerado com sucesso'
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'ATTENDANCE_REPORT_FAILED'
        }
      });
    }
  };

  // Relatório de pacientes
  getPatientReport = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { format = 'json' } = req.query;

      const report = await this.reportsService.generatePatientReport(establishmentId);

      if (format === 'pdf') {
        const pdfBuffer = await this.reportsService.generatePDFReport(report, 'Relatório de Pacientes');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-pacientes.pdf');
        res.send(pdfBuffer);
      } else if (format === 'excel') {
        const excelBuffer = await this.reportsService.generateExcelReport(report, 'pacientes');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-pacientes.xlsx');
        res.send(excelBuffer);
      } else {
        res.status(200).json({
          success: true,
          data: report,
          message: 'Relatório de pacientes gerado com sucesso'
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'PATIENT_REPORT_FAILED'
        }
      });
    }
  };

  // Dashboard de métricas
  getDashboardMetrics = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { period = 'today' } = req.query;

      const metrics = await this.reportsService.getDashboardMetrics(establishmentId, period as string);

      res.status(200).json({
        success: true,
        data: metrics,
        message: 'Métricas do dashboard obtidas com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'DASHBOARD_METRICS_FAILED'
        }
      });
    }
  };

  // Relatório financeiro
  getFinancialReport = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { startDate, endDate, format = 'json' } = req.query;

      const report = await this.reportsService.generateFinancialReport(
        establishmentId,
        startDate as string,
        endDate as string
      );

      if (format === 'pdf') {
        const pdfBuffer = await this.reportsService.generatePDFReport(report, 'Relatório Financeiro');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-financeiro.pdf');
        res.send(pdfBuffer);
      } else if (format === 'excel') {
        const excelBuffer = await this.reportsService.generateExcelReport(report, 'financeiro');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-financeiro.xlsx');
        res.send(excelBuffer);
      } else {
        res.status(200).json({
          success: true,
          data: report,
          message: 'Relatório financeiro gerado com sucesso'
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'FINANCIAL_REPORT_FAILED'
        }
      });
    }
  };

  // Relatório epidemiológico
  getEpidemiologyReport = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { startDate, endDate, disease, format = 'json' } = req.query;

      const report = await this.reportsService.generateEpidemiologyReport(
        establishmentId,
        startDate as string,
        endDate as string,
        disease as string
      );

      if (format === 'pdf') {
        const pdfBuffer = await this.reportsService.generatePDFReport(report, 'Relatório Epidemiológico');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-epidemiologico.pdf');
        res.send(pdfBuffer);
      } else if (format === 'excel') {
        const excelBuffer = await this.reportsService.generateExcelReport(report, 'epidemiologia');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-epidemiologico.xlsx');
        res.send(excelBuffer);
      } else {
        res.status(200).json({
          success: true,
          data: report,
          message: 'Relatório epidemiológico gerado com sucesso'
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'EPIDEMIOLOGY_REPORT_FAILED'
        }
      });
    }
  };

  // Lista de relatórios disponíveis
  getAvailableReports = async (req: Request, res: Response) => {
    try {
      const reports = [
        {
          id: 'attendance',
          name: 'Relatório de Atendimentos',
          description: 'Relatório completo de atendimentos por período',
          formats: ['json', 'pdf', 'excel'],
          parameters: ['startDate', 'endDate']
        },
        {
          id: 'patients',
          name: 'Relatório de Pacientes',
          description: 'Cadastro de pacientes ativos',
          formats: ['json', 'pdf', 'excel'],
          parameters: []
        },
        {
          id: 'financial',
          name: 'Relatório Financeiro',
          description: 'Relatório de receitas e despesas',
          formats: ['json', 'pdf', 'excel'],
          parameters: ['startDate', 'endDate']
        },
        {
          id: 'epidemiology',
          name: 'Relatório Epidemiológico',
          description: 'Notificações e casos de doenças',
          formats: ['json', 'pdf', 'excel'],
          parameters: ['startDate', 'endDate', 'disease']
        }
      ];

      res.status(200).json({
        success: true,
        data: reports,
        message: 'Relatórios disponíveis obtidos com sucesso'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'AVAILABLE_REPORTS_FAILED'
        }
      });
    }
  };
}
