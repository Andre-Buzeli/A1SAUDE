import { PhysiotherapistDashboardData } from '@/types/physiotherapist';

export interface PhysiotherapistDashboardData {
  totalPatients: number;
  activeSessions: number;
  pendingEvaluations: number;
  completedSessions: number;
  monthlySessions: number;
  weeklySessions: number;
  rehabilitationAlerts: number;
  avgSessionDuration: number;
  patientImprovement: number;
  establishmentType: 'hospital' | 'upa' | 'ubs';
  specific: {
    // Hospital specific
    postSurgeryRehab?: number;
    neuroRehabSessions?: number;
    orthoRehabSessions?: number;
    // UPA specific
    traumaRehabCases?: number;
    emergencyRehab?: number;
    sportsInjuries?: number;
    // UBS specific
    chronicPainManagement?: number;
    elderlyRehabPrograms?: number;
    communityExercisePrograms?: number;
  };
}

class PhysiotherapistDashboardService {
  private API_URL = '/api/v1/physiotherapist';

  async getDashboard(establishmentType: 'hospital' | 'upa' | 'ubs'): Promise<PhysiotherapistDashboardData> {
    try {
      const response = await fetch(`${this.API_URL}/dashboard/${establishmentType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dashboard fisioterapia');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dashboard fisioterapia:', error);
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
    type?: 'functional' | 'mobility' | 'strength' | 'all';
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
    type: 'functional' | 'mobility' | 'strength';
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

  async getRehabilitationAlerts() {
    try {
      const response = await fetch(`${this.API_URL}/rehabilitation-alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar alertas de reabilitação');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar alertas de reabilitação:', error);
      return { alerts: [] };
    }
  }

  private getMockDashboardData(establishmentType: 'hospital' | 'upa' | 'ubs'): PhysiotherapistDashboardData {
    const baseData = {
      totalPatients: Math.floor(Math.random() * 40) + 15,
      activeSessions: Math.floor(Math.random() * 20) + 8,
      pendingEvaluations: Math.floor(Math.random() * 12) + 3,
      completedSessions: Math.floor(Math.random() * 150) + 80,
      monthlySessions: Math.floor(Math.random() * 60) + 30,
      weeklySessions: Math.floor(Math.random() * 15) + 8,
      rehabilitationAlerts: Math.floor(Math.random() * 10) + 2,
      avgSessionDuration: Math.floor(Math.random() * 30) + 45,
      patientImprovement: Math.floor(Math.random() * 25) + 70,
      establishmentType
    };

    switch (establishmentType) {
      case 'hospital':
        return {
          ...baseData,
          specific: {
            postSurgeryRehab: Math.floor(Math.random() * 15) + 5,
            neuroRehabSessions: Math.floor(Math.random() * 20) + 8,
            orthoRehabSessions: Math.floor(Math.random() * 25) + 10
          }
        };
      case 'upa':
        return {
          ...baseData,
          specific: {
            traumaRehabCases: Math.floor(Math.random() * 12) + 3,
            emergencyRehab: Math.floor(Math.random() * 18) + 5,
            sportsInjuries: Math.floor(Math.random() * 20) + 6
          }
        };
      case 'ubs':
        return {
          ...baseData,
          specific: {
            chronicPainManagement: Math.floor(Math.random() * 25) + 8,
            elderlyRehabPrograms: Math.floor(Math.random() * 20) + 6,
            communityExercisePrograms: Math.floor(Math.random() * 15) + 4
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

export const physiotherapistDashboardService = new PhysiotherapistDashboardService();