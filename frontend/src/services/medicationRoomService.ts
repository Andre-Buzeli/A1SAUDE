import api from './api';

export interface MedicationRoomRecord {
  id: string;
  patientId: string;
  professionalId: string;
  establishmentId: string;
  attendanceId?: string;
  prescriptionId?: string;
  medicationName: string;
  dosage: string;
  route: string;
  scheduledTime: string;
  administeredAt?: string;
  administeredBy?: string;
  status: string;
  vitalSignsBefore?: any;
  vitalSignsAfter?: any;
  reactions?: string;
  notes?: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
  };
}

export const medicationRoomService = {
  async getDashboard(establishmentId: string) {
    const response = await api.get(`/medication-room/dashboard?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getQueue(establishmentId: string) {
    const response = await api.get(`/medication-room/queue?establishmentId=${establishmentId}`);
    return response.data;
  },

  async list(params: {
    establishmentId: string;
    patientId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const response = await api.get(`/medication-room?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/medication-room/${id}`);
    return response.data;
  },

  async getPendingForPatient(patientId: string) {
    const response = await api.get(`/medication-room/patient/${patientId}/pending`);
    return response.data;
  },

  async create(data: Partial<MedicationRoomRecord>) {
    const response = await api.post('/medication-room', data);
    return response.data;
  },

  async update(id: string, data: Partial<MedicationRoomRecord>) {
    const response = await api.put(`/medication-room/${id}`, data);
    return response.data;
  },

  async startAdministration(id: string, performedBy: string) {
    const response = await api.post(`/medication-room/${id}/start`, { performedBy });
    return response.data;
  },

  async completeAdministration(id: string, data: {
    administeredBy: string;
    vitalSignsBefore?: any;
    vitalSignsAfter?: any;
    reactions?: string;
    notes?: string;
  }) {
    const response = await api.post(`/medication-room/${id}/complete`, data);
    return response.data;
  },

  async cancelAdministration(id: string, reason: string) {
    const response = await api.post(`/medication-room/${id}/cancel`, { reason });
    return response.data;
  },

  async refuseAdministration(id: string, reason: string) {
    const response = await api.post(`/medication-room/${id}/refuse`, { reason });
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/medication-room/${id}`);
    return response.data;
  }
};

