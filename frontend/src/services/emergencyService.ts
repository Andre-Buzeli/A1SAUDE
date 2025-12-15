import api from './api';

export interface EmergencyAttendance {
  id: string;
  patientId: string;
  professionalId: string;
  establishmentId: string;
  triageId?: string;
  arrivalTime: string;
  arrivalMode: string;
  origin?: string;
  manchesterColor: string;
  chiefComplaint: string;
  firstContactTime?: string;
  medicalStartTime?: string;
  disposition?: string;
  dispositionTime?: string;
  status: string;
  observationBedId?: string;
  observationStartTime?: string;
  observationEndTime?: string;
  notes?: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    allergies?: string;
  };
}

export const emergencyService = {
  async getDashboard(establishmentId: string) {
    const response = await api.get(`/emergency/dashboard?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getManchesterColors() {
    const response = await api.get('/emergency/manchester-colors');
    return response.data;
  },

  async getQueue(establishmentId: string) {
    const response = await api.get(`/emergency/queue?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getWaitingByPriority(establishmentId: string) {
    const response = await api.get(`/emergency/waiting-by-priority?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getObservation(establishmentId: string) {
    const response = await api.get(`/emergency/observation?establishmentId=${establishmentId}`);
    return response.data;
  },

  async list(params: {
    establishmentId: string;
    patientId?: string;
    manchesterColor?: string;
    status?: string;
    disposition?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const response = await api.get(`/emergency?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/emergency/${id}`);
    return response.data;
  },

  async create(data: Partial<EmergencyAttendance>) {
    const response = await api.post('/emergency', data);
    return response.data;
  },

  async update(id: string, data: Partial<EmergencyAttendance>) {
    const response = await api.put(`/emergency/${id}`, data);
    return response.data;
  },

  async startTriage(id: string) {
    const response = await api.post(`/emergency/${id}/start-triage`);
    return response.data;
  },

  async completeTriage(id: string, manchesterColor: string) {
    const response = await api.post(`/emergency/${id}/complete-triage`, { manchesterColor });
    return response.data;
  },

  async startMedicalAttendance(id: string) {
    const response = await api.post(`/emergency/${id}/start-medical`);
    return response.data;
  },

  async moveToObservation(id: string, bedId: string) {
    const response = await api.post(`/emergency/${id}/observation`, { bedId });
    return response.data;
  },

  async completeAttendance(id: string, disposition: string, notes?: string) {
    const response = await api.post(`/emergency/${id}/complete`, { disposition, notes });
    return response.data;
  }
};

