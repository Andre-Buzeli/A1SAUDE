/**
 * Serviço de Exames de Imagem - Frontend
 * Sistema A1 Saúde
 */

import api from './api';

export interface ImagingExam {
  id: string;
  patientId: string;
  requestedById: string;
  establishmentId: string;
  attendanceId?: string;
  examType: string;
  examCode: string;
  examName: string;
  bodyRegions: string[];
  laterality?: string;
  clinicalIndication: string;
  diagnosticHypothesis?: string;
  urgency: string;
  contrastRequired: boolean;
  contrastType?: string;
  contrastAllergy: boolean;
  claustrophobic: boolean;
  pregnant: boolean;
  pacemaker: boolean;
  metalImplants?: string;
  status: string;
  scheduledFor?: string;
  room?: string;
  performedAt?: string;
  performedById?: string;
  technicalNotes?: string;
  findings?: string;
  conclusion?: string;
  impression?: string;
  recommendations?: string;
  reportedById?: string;
  reportedAt?: string;
  imagesCount: number;
  imagesUrls?: string;
  dicomStudyUid?: string;
  observations?: string;
  patient?: {
    id: string;
    name: string;
    cpf?: string;
    birthDate?: string;
    gender?: string;
    phone?: string;
  };
  establishment?: {
    id: string;
    name: string;
  };
}

export interface ImagingExamFilters {
  patientId?: string;
  requestedById?: string;
  establishmentId?: string;
  examType?: string;
  status?: string;
  urgency?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ImagingStats {
  total: number;
  requested: number;
  scheduled: number;
  completed: number;
  reported: number;
  byType: Record<string, number>;
  byUrgency: Record<string, number>;
  averageReportTime: number;
}

export interface ImagingDashboard {
  stats: ImagingStats;
  pendingCount: number;
  pendingReportsCount: number;
  todayExams: ImagingExam[];
  urgentCount: number;
}

export interface ExamType {
  code: string;
  name: string;
  preparation: string;
  avgDuration: number;
}

export interface BodyRegion {
  code: string;
  name: string;
}

export interface CreateImagingExamData {
  patientId: string;
  requestedById: string;
  establishmentId: string;
  attendanceId?: string;
  examType: string;
  examCode: string;
  examName: string;
  bodyRegions: string[];
  laterality?: string;
  clinicalIndication: string;
  diagnosticHypothesis?: string;
  urgency?: string;
  contrastRequired?: boolean;
  contrastType?: string;
  contrastAllergy?: boolean;
  claustrophobic?: boolean;
  pregnant?: boolean;
  pacemaker?: boolean;
  metalImplants?: string;
  observations?: string;
}

export interface ReportExamData {
  findings: string;
  conclusion: string;
  impression?: string;
  recommendations?: string;
  reportedById: string;
}

class ImagingService {
  private baseUrl = '/api/v1/imaging';

  async getDashboard(establishmentId?: string): Promise<ImagingDashboard> {
    const params = establishmentId ? `?establishmentId=${establishmentId}` : '';
    const response = await api.get(`${this.baseUrl}/dashboard${params}`);
    return response.data.data;
  }

  async getStats(establishmentId?: string, startDate?: string, endDate?: string): Promise<ImagingStats> {
    const params = new URLSearchParams();
    if (establishmentId) params.append('establishmentId', establishmentId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`${this.baseUrl}/stats?${params.toString()}`);
    return response.data.data;
  }

  async getExamTypes(): Promise<ExamType[]> {
    const response = await api.get(`${this.baseUrl}/exam-types`);
    return response.data.data;
  }

  async getBodyRegions(): Promise<BodyRegion[]> {
    const response = await api.get(`${this.baseUrl}/body-regions`);
    return response.data.data;
  }

  async getWorklist(establishmentId?: string, examType?: string): Promise<ImagingExam[]> {
    const params = new URLSearchParams();
    if (establishmentId) params.append('establishmentId', establishmentId);
    if (examType) params.append('examType', examType);
    
    const response = await api.get(`${this.baseUrl}/worklist?${params.toString()}`);
    return response.data.data;
  }

  async getPendingReports(establishmentId?: string, reportedById?: string): Promise<ImagingExam[]> {
    const params = new URLSearchParams();
    if (establishmentId) params.append('establishmentId', establishmentId);
    if (reportedById) params.append('reportedById', reportedById);
    
    const response = await api.get(`${this.baseUrl}/pending-reports?${params.toString()}`);
    return response.data.data;
  }

  async getExams(filters: ImagingExamFilters = {}): Promise<{ exams: ImagingExam[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data.data;
  }

  async getTodayExams(establishmentId?: string): Promise<ImagingExam[]> {
    const params = establishmentId ? `?establishmentId=${establishmentId}` : '';
    const response = await api.get(`${this.baseUrl}/today${params}`);
    return response.data.data;
  }

  async getExamById(id: string): Promise<ImagingExam> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async requestExam(data: CreateImagingExamData): Promise<ImagingExam> {
    const response = await api.post(this.baseUrl, data);
    return response.data.data;
  }

  async cancelExam(id: string, reason?: string): Promise<ImagingExam> {
    const response = await api.delete(`${this.baseUrl}/${id}`, { data: { reason } });
    return response.data.data;
  }

  async scheduleExam(id: string, scheduledFor: string, room?: string): Promise<ImagingExam> {
    const response = await api.post(`${this.baseUrl}/${id}/schedule`, { scheduledFor, room });
    return response.data.data;
  }

  async startExam(id: string, performedById: string): Promise<ImagingExam> {
    const response = await api.post(`${this.baseUrl}/${id}/start`, { performedById });
    return response.data.data;
  }

  async completeExam(id: string, imagesCount: number, technicalNotes?: string, imagesUrls?: string[]): Promise<ImagingExam> {
    const response = await api.post(`${this.baseUrl}/${id}/complete`, { imagesCount, technicalNotes, imagesUrls });
    return response.data.data;
  }

  async reportExam(id: string, data: ReportExamData): Promise<ImagingExam> {
    const response = await api.post(`${this.baseUrl}/${id}/report`, data);
    return response.data.data;
  }
}

export const imagingService = new ImagingService();
export default imagingService;

