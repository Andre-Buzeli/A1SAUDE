import api from './api';

export interface MinorSurgery {
  id: string;
  patientId: string;
  professionalId: string;
  establishmentId: string;
  attendanceId?: string;
  procedureCode: string;
  procedureName: string;
  procedureType: string;
  bodyRegion: string;
  laterality?: string;
  anesthesiaType?: string;
  anesthetic?: string;
  scheduledFor?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  status: string;
  materialsUsed?: any[];
  sutureType?: string;
  sutureCount?: number;
  postProcedureNotes?: string;
  complications?: string;
  returnDate?: string;
  returnInstructions?: string;
  notes?: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
  };
}

export const minorSurgeryService = {
  async getDashboard(establishmentId: string) {
    const response = await api.get(`/minor-surgery/dashboard?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getProcedureTypes() {
    const response = await api.get('/minor-surgery/procedure-types');
    return response.data;
  },

  async getTodayProcedures(establishmentId: string) {
    const response = await api.get(`/minor-surgery/today?establishmentId=${establishmentId}`);
    return response.data;
  },

  async list(params: {
    establishmentId: string;
    patientId?: string;
    procedureType?: string;
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
    const response = await api.get(`/minor-surgery?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/minor-surgery/${id}`);
    return response.data;
  },

  async getPatientHistory(patientId: string) {
    const response = await api.get(`/minor-surgery/patient/${patientId}`);
    return response.data;
  },

  async create(data: Partial<MinorSurgery>) {
    const response = await api.post('/minor-surgery', data);
    return response.data;
  },

  async update(id: string, data: Partial<MinorSurgery>) {
    const response = await api.put(`/minor-surgery/${id}`, data);
    return response.data;
  },

  async start(id: string) {
    const response = await api.post(`/minor-surgery/${id}/start`);
    return response.data;
  },

  async complete(id: string, data: {
    materialsUsed?: any[];
    sutureType?: string;
    sutureCount?: number;
    postProcedureNotes?: string;
    complications?: string;
    returnDate?: string;
    returnInstructions?: string;
    notes?: string;
  }) {
    const response = await api.post(`/minor-surgery/${id}/complete`, data);
    return response.data;
  },

  async cancel(id: string, reason: string) {
    const response = await api.post(`/minor-surgery/${id}/cancel`, { reason });
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/minor-surgery/${id}`);
    return response.data;
  }
};

