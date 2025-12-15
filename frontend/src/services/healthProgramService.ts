import api from './api';

export interface HealthProgram {
  id: string;
  name: string;
  description?: string;
  establishmentId: string;
  isActive: boolean;
  _count?: {
    enrollments: number;
  };
}

export interface ProgramEnrollment {
  id: string;
  programId: string;
  patientId: string;
  professionalId: string;
  establishmentId: string;
  enrollmentDate: string;
  status: string;
  exitDate?: string;
  exitReason?: string;
  programData?: any;
  lastVisitDate?: string;
  nextVisitDate?: string;
  riskLevel?: string;
  notes?: string;
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    phone?: string;
  };
  program?: HealthProgram;
}

export const healthProgramService = {
  async getDashboard(establishmentId: string) {
    const response = await api.get(`/health-programs/dashboard?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getPrograms(establishmentId: string) {
    const response = await api.get(`/health-programs?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getProgramById(id: string) {
    const response = await api.get(`/health-programs/${id}`);
    return response.data;
  },

  async createProgram(data: Partial<HealthProgram>) {
    const response = await api.post('/health-programs', data);
    return response.data;
  },

  async updateProgram(id: string, data: Partial<HealthProgram>) {
    const response = await api.put(`/health-programs/${id}`, data);
    return response.data;
  },

  // Enrollments
  async listEnrollments(params: {
    establishmentId: string;
    programId?: string;
    status?: string;
    riskLevel?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const response = await api.get(`/health-programs/enrollments/list?${searchParams.toString()}`);
    return response.data;
  },

  async getPendingVisits(establishmentId: string, programId?: string) {
    const params = new URLSearchParams({ establishmentId });
    if (programId) params.append('programId', programId);
    const response = await api.get(`/health-programs/enrollments/pending-visits?${params.toString()}`);
    return response.data;
  },

  async getPatientPrograms(patientId: string) {
    const response = await api.get(`/health-programs/enrollments/patient/${patientId}`);
    return response.data;
  },

  async enrollPatient(data: Partial<ProgramEnrollment>) {
    const response = await api.post('/health-programs/enrollments', data);
    return response.data;
  },

  async getEnrollmentById(id: string) {
    const response = await api.get(`/health-programs/enrollments/${id}`);
    return response.data;
  },

  async updateEnrollment(id: string, data: Partial<ProgramEnrollment>) {
    const response = await api.put(`/health-programs/enrollments/${id}`, data);
    return response.data;
  },

  // Specific programs
  async getHiperdiaData(establishmentId: string) {
    const response = await api.get(`/health-programs/hiperdia?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getPrenatalData(establishmentId: string) {
    const response = await api.get(`/health-programs/prenatal?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getChildcareData(establishmentId: string) {
    const response = await api.get(`/health-programs/childcare?establishmentId=${establishmentId}`);
    return response.data;
  },

  async getElderlyData(establishmentId: string) {
    const response = await api.get(`/health-programs/elderly?establishmentId=${establishmentId}`);
    return response.data;
  }
};

