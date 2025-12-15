/**
 * Serviço de Visitas Domiciliares - Frontend
 * Sistema A1 Saúde
 */

import api from './api';

export interface HomeVisit {
  id: string;
  patientId: string;
  professionalId: string;
  establishmentId: string;
  scheduledDate: string;
  scheduledTime: string;
  visitType: string;
  reason: string;
  priority: string;
  status: string;
  realizedAt?: string;
  duration?: number;
  cancellationReason?: string;
  hasRunningWater?: boolean;
  hasSewage?: boolean;
  hasGarbageCollection?: boolean;
  hasElectricity?: boolean;
  buildingType?: string;
  roomsCount?: number;
  residentsCount?: number;
  situationFound?: string;
  patientCondition?: string;
  actionsPerformed?: string;
  orientationsGiven?: string;
  referrals?: string;
  nextVisitDate?: string;
  observations?: string;
  patient?: {
    id: string;
    name: string;
    phone?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
  };
  establishment?: {
    id: string;
    name: string;
  };
}

export interface HomeVisitFilters {
  patientId?: string;
  professionalId?: string;
  establishmentId?: string;
  status?: string;
  visitType?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface HomeVisitStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface HomeVisitDashboard {
  stats: HomeVisitStats;
  todayVisits: HomeVisit[];
  pendingCount: number;
  recentCompleted: HomeVisit[];
}

export interface CreateHomeVisitData {
  patientId: string;
  professionalId: string;
  establishmentId: string;
  scheduledDate: string;
  scheduledTime: string;
  visitType: string;
  reason: string;
  priority?: string;
}

export interface CompleteVisitData {
  realizedAt: string;
  duration?: number;
  hasRunningWater?: boolean;
  hasSewage?: boolean;
  hasGarbageCollection?: boolean;
  hasElectricity?: boolean;
  buildingType?: string;
  roomsCount?: number;
  residentsCount?: number;
  situationFound?: string;
  patientCondition?: string;
  actionsPerformed?: string[];
  orientationsGiven?: string;
  referrals?: string;
  nextVisitDate?: string;
  observations?: string;
}

class HomeVisitService {
  private baseUrl = '/api/v1/home-visits';

  async getDashboard(establishmentId?: string): Promise<HomeVisitDashboard> {
    const params = establishmentId ? `?establishmentId=${establishmentId}` : '';
    const response = await api.get(`${this.baseUrl}/dashboard${params}`);
    return response.data.data;
  }

  async getStats(establishmentId?: string, startDate?: string, endDate?: string): Promise<HomeVisitStats> {
    const params = new URLSearchParams();
    if (establishmentId) params.append('establishmentId', establishmentId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`${this.baseUrl}/stats?${params.toString()}`);
    return response.data.data;
  }

  async getVisits(filters: HomeVisitFilters = {}): Promise<{ visits: HomeVisit[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data.data;
  }

  async getTodayVisits(professionalId?: string, establishmentId?: string): Promise<HomeVisit[]> {
    const params = new URLSearchParams();
    if (professionalId) params.append('professionalId', professionalId);
    if (establishmentId) params.append('establishmentId', establishmentId);
    
    const response = await api.get(`${this.baseUrl}/today?${params.toString()}`);
    return response.data.data;
  }

  async getPendingVisits(establishmentId?: string): Promise<HomeVisit[]> {
    const params = establishmentId ? `?establishmentId=${establishmentId}` : '';
    const response = await api.get(`${this.baseUrl}/pending${params}`);
    return response.data.data;
  }

  async getVisitById(id: string): Promise<HomeVisit> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async createVisit(data: CreateHomeVisitData): Promise<HomeVisit> {
    const response = await api.post(this.baseUrl, data);
    return response.data.data;
  }

  async updateVisit(id: string, data: Partial<CreateHomeVisitData>): Promise<HomeVisit> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  async startVisit(id: string): Promise<HomeVisit> {
    const response = await api.post(`${this.baseUrl}/${id}/start`);
    return response.data.data;
  }

  async completeVisit(id: string, data: CompleteVisitData): Promise<HomeVisit> {
    const response = await api.post(`${this.baseUrl}/${id}/complete`, data);
    return response.data.data;
  }

  async cancelVisit(id: string, reason: string): Promise<HomeVisit> {
    const response = await api.post(`${this.baseUrl}/${id}/cancel`, { reason });
    return response.data.data;
  }

  async rescheduleVisit(id: string, newDate: string, newTime: string, reason?: string): Promise<HomeVisit> {
    const response = await api.post(`${this.baseUrl}/${id}/reschedule`, { newDate, newTime, reason });
    return response.data.data;
  }

  async markNotFound(id: string, observations?: string): Promise<HomeVisit> {
    const response = await api.post(`${this.baseUrl}/${id}/not-found`, { observations });
    return response.data.data;
  }
}

export const homeVisitService = new HomeVisitService();
export default homeVisitService;

