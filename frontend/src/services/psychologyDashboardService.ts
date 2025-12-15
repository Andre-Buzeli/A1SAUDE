import { PsychologyDashboardData } from '@/types/psychology';

export interface PsychologyDashboardData {
  totalPatients: number;
  activeConsultations: number;
  pendingEvaluations: number;
  completedSessions: number;
  monthlySessions: number;
  weeklySessions: number;
  mentalHealthAlerts: number;
  avgSessionDuration: number;
  patientSatisfaction: number;
  establishmentType: 'hospital' | 'upa' | 'ubs';
  specific: {
    // Hospital specific
    psychiatricEmergencies?: number;
    groupTherapySessions?: number;
    medicationAdherence?: number;
    // UPA specific
    suicideRiskCases?: number;
    crisisInterventions?: number;
    emergencyConsultations?: number;
    // UBS specific
    familyTherapySessions?: number;
    communityMentalHealth?: number;
    preventionPrograms?: number;
  };
}

class PsychologyDashboardService {
  private API_URL = '/api/v1/psychology';

  async getDashboard(establishmentType: 'hospital' | 'upa' | 'ubs'): Promise<PsychologyDashboardData> {
    try {
      const response = await fetch(`${this.API_URL}/dashboard/${establishmentType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dashboard psicologia');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dashboard psicologia:', error);
      return this.getMockDashboardData(establishmentType);
    }
  }

  async getPatients(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'inactive' | 'all';
    search?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);

      const response = await fetch(`${this.API_URL}/patients?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar pacientes');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      return { patients: [], total: 0 };
    }
  }

  async getSessions(params?: {
    page?: number;
    limit?: number;
    status?: 'scheduled' | 'completed' | 'cancelled' | 'all';
    patientId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.patientId) queryParams.append('patientId', params.patientId);
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

      const response = await fetch(`${this.API_URL}/sessions?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar sessões');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      return { sessions: [], total: 0 };
    }
  }

  async getEvaluations(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'completed' | 'all';
    patientId?: string;
    type?: 'psychological' | 'cognitive' | 'behavioral' | 'all';
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.patientId) queryParams.append('patientId', params.patientId);
      if (params?.type) queryParams.append('type', params.type);

      const response = await fetch(`${this.API_URL}/evaluations?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar avaliações');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      return { evaluations: [], total: 0 };
    }
  }

  async createEvaluation(data: {
    patientId: string;
    type: 'psychological' | 'cognitive' | 'behavioral';
    notes: string;
    scores?: Record<string, number>;
    recommendations?: string[];
  }) {
    try {
      const response = await fetch(`${this.API_URL}/evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar avaliação');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      throw error;
    }
  }

  async getMentalHealthAlerts() {
    try {
      const response = await fetch(`${this.API_URL}/mental-health-alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar alertas de saúde mental');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar alertas de saúde mental:', error);
      return { alerts: [] };
    }
  }

  private getMockDashboardData(establishmentType: 'hospital' | 'upa' | 'ubs'): PsychologyDashboardData {
    const baseData = {
      totalPatients: Math.floor(Math.random() * 50) + 20,
      activeConsultations: Math.floor(Math.random() * 15) + 5,
      pendingEvaluations: Math.floor(Math.random() * 10) + 2,
      completedSessions: Math.floor(Math.random() * 200) + 100,
      monthlySessions: Math.floor(Math.random() * 80) + 40,
      weeklySessions: Math.floor(Math.random() * 20) + 10,
      mentalHealthAlerts: Math.floor(Math.random() * 8) + 1,
      avgSessionDuration: Math.floor(Math.random() * 30) + 45,
      patientSatisfaction: Math.floor(Math.random() * 20) + 80,
      establishmentType
    };

    switch (establishmentType) {
      case 'hospital':
        return {
          ...baseData,
          specific: {
            psychiatricEmergencies: Math.floor(Math.random() * 15) + 3,
            groupTherapySessions: Math.floor(Math.random() * 20) + 5,
            medicationAdherence: Math.floor(Math.random() * 30) + 70
          }
        };
      case 'upa':
        return {
          ...baseData,
          specific: {
            suicideRiskCases: Math.floor(Math.random() * 10) + 2,
            crisisInterventions: Math.floor(Math.random() * 12) + 3,
            emergencyConsultations: Math.floor(Math.random() * 25) + 8
          }
        };
      case 'ubs':
        return {
          ...baseData,
          specific: {
            familyTherapySessions: Math.floor(Math.random() * 15) + 5,
            communityMentalHealth: Math.floor(Math.random() * 30) + 10,
            preventionPrograms: Math.floor(Math.random() * 8) + 2
          }
        };
      default:
        return {
          ...baseData,
          specific: {}
        };
    }
  }
}

export const psychologyDashboardService = new PsychologyDashboardService();