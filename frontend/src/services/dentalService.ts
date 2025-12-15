import api from './api';

export interface DentalAttendance {
  id: string;
  patientId: string;
  professionalId: string;
  establishmentId: string;
  attendanceId?: string;
  attendanceType: string;
  chiefComplaint: string;
  dentalHistory?: string;
  lastDentalVisit?: string;
  brushingFrequency?: number;
  usesFloss: boolean;
  odontogram?: any;
  periodontalExam?: any;
  softTissueExam?: string;
  procedures?: any[];
  diagnosis?: string;
  cid10Codes?: string[];
  treatmentPlan?: string;
  urgency: string;
  status: string;
  nextVisitDate?: string;
  nextVisitNotes?: string;
  notes?: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
  };
}

export const dentalService = {
  async getDashboard(establishmentId: string) {
    const response = await api.get(`/dental/dashboard?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getQueue(establishmentId: string) {
    const response = await api.get(`/dental/queue?establishmentId=${establishmentId}`);
    return response.data;
  },

  async list(params: {
    establishmentId: string;
    patientId?: string;
    attendanceType?: string;
    status?: string;
    urgency?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const response = await api.get(`/dental?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/dental/${id}`);
    return response.data;
  },

  async getPatientHistory(patientId: string) {
    const response = await api.get(`/dental/patient/${patientId}`);
    return response.data;
  },

  async getPatientOdontogram(patientId: string) {
    const response = await api.get(`/dental/patient/${patientId}/odontogram`);
    return response.data;
  },

  async create(data: Partial<DentalAttendance>) {
    const response = await api.post('/dental', data);
    return response.data;
  },

  async update(id: string, data: Partial<DentalAttendance>) {
    const response = await api.put(`/dental/${id}`, data);
    return response.data;
  },

  async addProcedure(id: string, procedure: {
    code: string;
    name: string;
    tooth?: string;
    surface?: string;
    notes?: string;
  }) {
    const response = await api.post(`/dental/${id}/procedures`, procedure);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/dental/${id}`);
    return response.data;
  }
};

