import api from './api';

export interface ICUAdmission {
  id: string;
  patientId: string;
  establishmentId: string;
  admissionId?: string;
  bedId: string;
  admissionDate: string;
  admissionFrom: string;
  admissionReason: string;
  admissionDiagnosis: string;
  apacheScore?: number;
  sofaScore?: number;
  sapsScore?: number;
  attendingPhysicianId: string;
  ventilationMode?: string;
  sedationLevel?: string;
  vasopressors?: any;
  dischargeDate?: string;
  dischargeTo?: string;
  dischargeReason?: string;
  status: string;
  lengthOfStay?: number;
  notes?: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    bloodType?: string;
    allergies?: string;
  };
}

export const icuService = {
  async getDashboard(establishmentId: string) {
    const response = await api.get(`/icu/dashboard?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getVentilationModes() {
    const response = await api.get('/icu/ventilation-modes');
    return response.data;
  },

  async getSedationLevels() {
    const response = await api.get('/icu/sedation-levels');
    return response.data;
  },

  async getActiveAdmissions(establishmentId: string) {
    const response = await api.get(`/icu/active?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getOccupiedBeds(establishmentId: string) {
    const response = await api.get(`/icu/occupied-beds?establishmentId=${establishmentId}`);
    return response.data;
  },

  async list(params: {
    establishmentId: string;
    patientId?: string;
    status?: string;
    admissionFrom?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const response = await api.get(`/icu?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/icu/${id}`);
    return response.data;
  },

  async create(data: Partial<ICUAdmission>) {
    const response = await api.post('/icu', data);
    return response.data;
  },

  async update(id: string, data: Partial<ICUAdmission>) {
    const response = await api.put(`/icu/${id}`, data);
    return response.data;
  },

  async updateClinicalStatus(id: string, data: {
    ventilationMode?: string;
    sedationLevel?: string;
    vasopressors?: any;
    apacheScore?: number;
    sofaScore?: number;
    notes?: string;
  }) {
    const response = await api.put(`/icu/${id}/clinical-status`, data);
    return response.data;
  },

  async changeBed(id: string, newBedId: string, reason: string) {
    const response = await api.post(`/icu/${id}/change-bed`, { newBedId, reason });
    return response.data;
  },

  async discharge(id: string, data: {
    dischargeTo: string;
    dischargeReason: string;
    notes?: string;
  }) {
    const response = await api.post(`/icu/${id}/discharge`, data);
    return response.data;
  },

  async transfer(id: string, data: {
    destinationUnit: string;
    transferReason: string;
    notes?: string;
  }) {
    const response = await api.post(`/icu/${id}/transfer`, data);
    return response.data;
  }
};

