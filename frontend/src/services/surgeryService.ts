/**
 * Serviço de Centro Cirúrgico - Frontend
 * Sistema A1 Saúde
 */

import api from './api';

export interface Surgery {
  id: string;
  patientId: string;
  establishmentId: string;
  admissionId?: string;
  procedureCode: string;
  procedureName: string;
  procedureType: string;
  laterality?: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  roomNumber: string;
  surgeonId: string;
  assistantIds?: string;
  anesthetistId?: string;
  instrumenterId?: string;
  nursingTeam?: string;
  anesthesiaType?: string;
  asaScore?: string;
  preOpNotes?: string;
  preOpExams?: string;
  consentSigned: boolean;
  fastingConfirmed: boolean;
  status: string;
  actualStartTime?: string;
  actualEndTime?: string;
  complications?: string;
  bloodLoss?: number;
  surgicalNotes?: string;
  recoveryNotes?: string;
  materialsUsed?: string;
  specialEquipment?: string;
  patient?: {
    id: string;
    name: string;
    cpf?: string;
    birthDate?: string;
    gender?: string;
    bloodType?: string;
    allergies?: string;
  };
  establishment?: {
    id: string;
    name: string;
  };
}

export interface SurgeryFilters {
  patientId?: string;
  surgeonId?: string;
  establishmentId?: string;
  status?: string;
  procedureType?: string;
  roomNumber?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SurgeryStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  byType: Record<string, number>;
  byRoom: Record<string, number>;
  averageDuration: number;
}

export interface RoomStatus {
  roomNumber: string;
  status: 'available' | 'in_use' | 'preparing' | 'cleaning' | 'maintenance';
  currentSurgery?: {
    id: string;
    procedureName: string;
    patientName: string;
    surgeonName: string;
    startTime: string;
    estimatedEnd: string;
  };
  nextSurgery?: {
    id: string;
    procedureName: string;
    scheduledTime: string;
  };
}

export interface SurgeryDashboard {
  stats: SurgeryStats;
  todaySurgeries: Surgery[];
  roomsStatus: RoomStatus[];
  inProgress: number;
  availableRooms: number;
  totalRooms: number;
}

export interface CreateSurgeryData {
  patientId: string;
  establishmentId: string;
  admissionId?: string;
  procedureCode: string;
  procedureName: string;
  procedureType: string;
  laterality?: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  roomNumber: string;
  surgeonId: string;
  assistantIds?: string[];
  anesthetistId?: string;
  instrumenterId?: string;
  nursingTeam?: string[];
  anesthesiaType?: string;
  asaScore?: string;
  preOpNotes?: string;
  preOpExams?: string[];
}

export interface CompleteSurgeryData {
  actualEndTime: string;
  complications?: string;
  bloodLoss?: number;
  surgicalNotes?: string;
  recoveryNotes?: string;
  materialsUsed?: { name: string; quantity: number; lot?: string }[];
}

class SurgeryService {
  private baseUrl = '/api/v1/surgery';

  async getDashboard(establishmentId: string): Promise<SurgeryDashboard> {
    const response = await api.get(`${this.baseUrl}/dashboard?establishmentId=${establishmentId}`);
    return response.data.data;
  }

  async getStats(establishmentId?: string, startDate?: string, endDate?: string): Promise<SurgeryStats> {
    const params = new URLSearchParams();
    if (establishmentId) params.append('establishmentId', establishmentId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`${this.baseUrl}/stats?${params.toString()}`);
    return response.data.data;
  }

  async getRoomsStatus(establishmentId: string): Promise<RoomStatus[]> {
    const response = await api.get(`${this.baseUrl}/rooms/status?establishmentId=${establishmentId}`);
    return response.data.data;
  }

  async getSurgeries(filters: SurgeryFilters = {}): Promise<{ surgeries: Surgery[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data.data;
  }

  async getTodaySurgeries(establishmentId?: string): Promise<Surgery[]> {
    const params = establishmentId ? `?establishmentId=${establishmentId}` : '';
    const response = await api.get(`${this.baseUrl}/today${params}`);
    return response.data.data;
  }

  async getSurgeryById(id: string): Promise<Surgery> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async createSurgery(data: CreateSurgeryData): Promise<Surgery> {
    const response = await api.post(this.baseUrl, data);
    return response.data.data;
  }

  async updateSurgery(id: string, data: Partial<CreateSurgeryData>): Promise<Surgery> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  async cancelSurgery(id: string, reason?: string): Promise<Surgery> {
    const response = await api.delete(`${this.baseUrl}/${id}`, { data: { reason } });
    return response.data.data;
  }

  async confirmPreOp(id: string, consentSigned: boolean, fastingConfirmed: boolean): Promise<Surgery> {
    const response = await api.post(`${this.baseUrl}/${id}/confirm-preop`, { consentSigned, fastingConfirmed });
    return response.data.data;
  }

  async startSurgery(id: string): Promise<Surgery> {
    const response = await api.post(`${this.baseUrl}/${id}/start`);
    return response.data.data;
  }

  async completeSurgery(id: string, data: CompleteSurgeryData): Promise<Surgery> {
    const response = await api.post(`${this.baseUrl}/${id}/complete`, data);
    return response.data.data;
  }

  async moveToRecovery(id: string, recoveryNotes?: string): Promise<Surgery> {
    const response = await api.post(`${this.baseUrl}/${id}/recovery`, { recoveryNotes });
    return response.data.data;
  }
}

export const surgeryService = new SurgeryService();
export default surgeryService;

