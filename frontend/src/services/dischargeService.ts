import api from './api';

export interface Discharge {
  id: string;
  patientId: string;
  establishmentId: string;
  admissionId: string;
  dischargeDate: string;
  dischargeType: string;
  physicianId: string;
  physicianName: string;
  crm: string;
  patientCondition: string;
  mainDiagnosis: string;
  mainCid10: string;
  secondaryDiagnosis?: any[];
  secondaryCid10?: string[];
  procedures?: any[];
  instructions?: string;
  restrictions?: string;
  dietRecommendations?: string;
  activityRecommendations?: string;
  prescriptions?: any[];
  returnDate?: string;
  returnInstructions?: string;
  referrals?: any[];
  dischargeSummary?: string;
  status: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
  };
}

export const dischargeService = {
  async getDashboard(establishmentId: string) {
    const response = await api.get(`/discharge/dashboard?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getTypes() {
    const response = await api.get('/discharge/types');
    return response.data;
  },

  async getConditions() {
    const response = await api.get('/discharge/conditions');
    return response.data;
  },

  async getPending(establishmentId: string) {
    const response = await api.get(`/discharge/pending?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getTodayDischarges(establishmentId: string) {
    const response = await api.get(`/discharge/today?establishmentId=${establishmentId}`);
    return response.data;
  },

  async list(params: {
    establishmentId: string;
    patientId?: string;
    dischargeType?: string;
    patientCondition?: string;
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
    const response = await api.get(`/discharge?${searchParams.toString()}`);
    return response.data;
  },

  async getPatientHistory(patientId: string) {
    const response = await api.get(`/discharge/patient/${patientId}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/discharge/${id}`);
    return response.data;
  },

  async create(data: Partial<Discharge>) {
    const response = await api.post('/discharge', data);
    return response.data;
  },

  async update(id: string, data: Partial<Discharge>) {
    const response = await api.put(`/discharge/${id}`, data);
    return response.data;
  },

  async complete(id: string) {
    const response = await api.post(`/discharge/${id}/complete`);
    return response.data;
  },

  async cancel(id: string, reason: string) {
    const response = await api.post(`/discharge/${id}/cancel`, { reason });
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/discharge/${id}`);
    return response.data;
  }
};

