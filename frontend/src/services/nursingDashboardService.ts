import apiService from './api.service';

export interface NursingDashboardData {
  metrics: {
    totalPatients: number;
    todayAttendances: number;
    pendingTriages: number;
    completedTriages: number;
    averageTriageTime: number;
    criticalPatients: number;
    medicationsAdministered: number;
    vitalSignsRecorded: number;
    nursingCareActivities: number;
    establishmentSpecificMetrics: any;
  };
  recentActivities: any[];
  pendingTriages: any[];
  criticalPatients: any[];
  establishmentInfo: {
    name: string;
    type: string;
  };
}

export class NursingDashboardService {
  async getDashboard(establishmentType: 'hospital' | 'upa' | 'ubs'): Promise<NursingDashboardData> {
    try {
      const response = await apiService.get<NursingDashboardData>(`/api/v1/nursing/dashboard/${establishmentType}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar dashboard de enfermagem:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar dashboard de enfermagem');
    }
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`/api/v1/nursing/activities/recent`, { limit });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar atividades recentes:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar atividades recentes');
    }
  }

  async getPendingTriages(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`/api/v1/nursing/triages/pending`, { limit });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar triagens pendentes:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar triagens pendentes');
    }
  }

  async getCriticalPatients(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`/api/v1/nursing/patients/critical`, { limit });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar pacientes críticos:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar pacientes críticos');
    }
  }
}

export const nursingDashboardService = new NursingDashboardService();
