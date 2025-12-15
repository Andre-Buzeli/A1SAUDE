import api from './api';

export interface Vaccination {
  id: string;
  patientId: string;
  professionalId: string;
  establishmentId: string;
  vaccineName: string;
  vaccineCode: string;
  manufacturer?: string;
  batch: string;
  expirationDate: string;
  dose: string;
  doseNumber: number;
  applicationDate: string;
  applicationSite: string;
  route: string;
  campaignId?: string;
  campaignName?: string;
  hasAdverseReaction: boolean;
  adverseReactionDesc?: string;
  adverseReactionDate?: string;
  status: string;
  postponeReason?: string;
  nextDoseDate?: string;
  notes?: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
  };
}

export const vaccinationService = {
  async getDashboard(establishmentId: string) {
    const response = await api.get(`/vaccination/dashboard?establishmentId=${establishmentId}`);
    return response.data;
  },

  async list(params: {
    establishmentId: string;
    patientId?: string;
    vaccineName?: string;
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
    const response = await api.get(`/vaccination?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/vaccination/${id}`);
    return response.data;
  },

  async getPatientHistory(patientId: string) {
    const response = await api.get(`/vaccination/patient/${patientId}`);
    return response.data;
  },

  async getPendingVaccinations(patientId: string) {
    const response = await api.get(`/vaccination/patient/${patientId}/pending`);
    return response.data;
  },

  async getAdverseReactions(establishmentId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams({ establishmentId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/vaccination/adverse-reactions?${params.toString()}`);
    return response.data;
  },

  async create(data: Partial<Vaccination>) {
    const response = await api.post('/vaccination', data);
    return response.data;
  },

  async update(id: string, data: Partial<Vaccination>) {
    const response = await api.put(`/vaccination/${id}`, data);
    return response.data;
  },

  async reportAdverseReaction(id: string, data: { adverseReactionDesc: string; adverseReactionDate?: string }) {
    const response = await api.post(`/vaccination/${id}/adverse-reaction`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/vaccination/${id}`);
    return response.data;
  }
};

