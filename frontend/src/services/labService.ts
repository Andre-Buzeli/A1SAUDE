import api from './api';

export interface LabExam {
  id: string;
  patientId: string;
  requestedById: string;
  establishmentId: string;
  attendanceId?: string;
  examCode: string;
  examName: string;
  examCategory: string;
  material: string;
  clinicalIndication: string;
  fastingRequired: boolean;
  fastingHours?: number;
  status: string;
  scheduledFor?: string;
  collectedAt?: string;
  collectedBy?: string;
  sampleId?: string;
  results?: any;
  referenceValues?: any;
  interpretation?: string;
  isNormal?: boolean;
  isCritical: boolean;
  criticalAlert?: string;
  analyzedBy?: string;
  analyzedAt?: string;
  validatedBy?: string;
  validatedAt?: string;
  observations?: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
  };
}

export const labService = {
  async getDashboard(establishmentId: string) {
    const response = await api.get(`/lab/dashboard?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/lab/categories');
    return response.data;
  },

  async getWorklist(establishmentId: string, status?: string) {
    const params = new URLSearchParams({ establishmentId });
    if (status) params.append('status', status);
    const response = await api.get(`/lab/worklist?${params.toString()}`);
    return response.data;
  },

  async getCriticalAlerts(establishmentId: string) {
    const response = await api.get(`/lab/critical-alerts?establishmentId=${establishmentId}`);
    return response.data;
  },

  async list(params: {
    establishmentId: string;
    patientId?: string;
    examCategory?: string;
    status?: string;
    isCritical?: boolean;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const response = await api.get(`/lab?${searchParams.toString()}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/lab/${id}`);
    return response.data;
  },

  async getPatientHistory(patientId: string, examCategory?: string) {
    const params = examCategory ? `?examCategory=${examCategory}` : '';
    const response = await api.get(`/lab/patient/${patientId}${params}`);
    return response.data;
  },

  async create(data: Partial<LabExam>) {
    const response = await api.post('/lab', data);
    return response.data;
  },

  async update(id: string, data: Partial<LabExam>) {
    const response = await api.put(`/lab/${id}`, data);
    return response.data;
  },

  async schedule(id: string, scheduledFor: string) {
    const response = await api.post(`/lab/${id}/schedule`, { scheduledFor });
    return response.data;
  },

  async collect(id: string, data: { collectedBy: string; sampleId: string }) {
    const response = await api.post(`/lab/${id}/collect`, data);
    return response.data;
  },

  async process(id: string) {
    const response = await api.post(`/lab/${id}/process`);
    return response.data;
  },

  async addResults(id: string, data: {
    results: any;
    referenceValues?: any;
    interpretation?: string;
    isNormal?: boolean;
    isCritical?: boolean;
    criticalAlert?: string;
    analyzedBy: string;
  }) {
    const response = await api.post(`/lab/${id}/results`, data);
    return response.data;
  },

  async validate(id: string, validatedBy: string) {
    const response = await api.post(`/lab/${id}/validate`, { validatedBy });
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/lab/${id}`);
    return response.data;
  }
};

