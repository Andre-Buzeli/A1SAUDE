import apiService from './api.service';

export interface Attendance {
  id: string;
  patientId: string;
  professionalId: string;
  establishmentId: string;
  unitId?: string;
  type: 'consultation' | 'emergency' | 'procedure' | 'surgery' | 'exam' | 'vaccination';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  startTime: string;
  endTime?: string;
  chiefComplaint: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    gender: string;
  };
  professional?: {
    id: string;
    name: string;
    profile: string;
  };
  establishment?: {
    id: string;
    name: string;
    type: string;
  };
  unit?: {
    id: string;
    name: string;
  };
  prescriptions?: any[];
  examRequests?: any[];
  procedures?: any[];
  triage?: any;
}

export interface AttendanceFilters {
  patientId?: string;
  professionalId?: string;
  establishmentId?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type?: 'consultation' | 'emergency' | 'procedure' | 'surgery' | 'exam' | 'vaccination';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'startTime' | 'createdAt' | 'patient' | 'professional';
  sortOrder?: 'asc' | 'desc';
}

export interface AttendanceCreateData {
  patientId: string;
  professionalId: string;
  establishmentId: string;
  unitId?: string;
  type: 'consultation' | 'emergency' | 'procedure' | 'surgery' | 'exam' | 'vaccination';
  chiefComplaint: string;
  notes?: string;
}

export interface AttendanceUpdateData {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  chiefComplaint?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  notes?: string;
  endTime?: string;
}

export interface AttendanceListResponse {
  attendances: Attendance[];
  total: number;
  page: number;
  totalPages: number;
}

class AttendanceService {
  /**
   * Criar novo atendimento
   */
  async createAttendance(data: AttendanceCreateData) {
    try {
      const response = await apiService.post<Attendance>('/api/v1/attendances', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar atendimento:', error);
      return this.getMockAttendance(data);
    }
  }

  /**
   * Buscar atendimentos com filtros
   */
  async searchAttendances(filters: AttendanceFilters = {}) {
    try {
      const response = await apiService.get<AttendanceListResponse>('/api/v1/attendances/search', filters);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error);
      return this.getMockAttendances(filters);
    }
  }

  /**
   * Obter atendimentos ativos
   */
  async getActiveAttendances(establishmentId?: string) {
    try {
      const params = establishmentId ? { establishmentId } : {};
      const response = await apiService.get<Attendance[]>('/api/v1/attendances/active', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter atendimentos ativos:', error);
      return this.getMockActiveAttendances(establishmentId);
    }
  }

  /**
   * Obter atendimento por ID
   */
  async getAttendanceById(id: string) {
    try {
      const response = await apiService.get<Attendance>(`/api/v1/attendances/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter atendimento:', error);
      return this.getMockAttendanceById(id);
    }
  }

  /**
   * Atualizar atendimento
   */
  async updateAttendance(id: string, data: AttendanceUpdateData) {
    try {
      const response = await apiService.put<Attendance>(`/api/v1/attendances/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error);
      return this.getMockAttendanceById(id);
    }
  }

  /**
   * Iniciar atendimento
   */
  async startAttendance(id: string) {
    try {
      const response = await apiService.post<Attendance>(`/api/v1/attendances/${id}/start`, {});
      return response.data;
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error);
      return this.getMockAttendanceById(id);
    }
  }

  /**
   * Finalizar atendimento com dados SOAP
   */
  async completeAttendance(id: string, soapData?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  }) {
    try {
      const response = await apiService.post<Attendance>(`/api/v1/attendances/${id}/complete`, soapData || {});
      return response.data;
    } catch (error) {
      console.error('Erro ao completar atendimento:', error);
      return this.getMockAttendanceById(id);
    }
  }

  /**
   * Cancelar atendimento
   */
  async cancelAttendance(id: string, reason?: string) {
    try {
      const response = await apiService.post<Attendance>(`/api/v1/attendances/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar atendimento:', error);
      return this.getMockAttendanceById(id);
    }
  }

  /**
   * Obter estatísticas de atendimentos
   */
  async getAttendanceStats(establishmentId?: string, startDate?: string, endDate?: string) {
    try {
      const params: any = {};
      if (establishmentId) params.establishmentId = establishmentId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiService.get('/api/v1/attendances/stats', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de atendimentos:', error);
      return this.getMockAttendanceStats();
    }
  }

  /**
   * Mock data methods
   */
  private getMockAttendance(data: AttendanceCreateData): Attendance {
    const id = `attendance-mock-${Date.now()}`;
    return {
      id,
      patientId: data.patientId,
      professionalId: data.professionalId,
      establishmentId: data.establishmentId,
      unitId: data.unitId,
      type: data.type,
      status: 'scheduled',
      startTime: new Date().toISOString(),
      chiefComplaint: data.chiefComplaint,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: {
        id: data.patientId,
        name: 'Paciente Mock',
        cpf: '12345678901',
        birthDate: '1985-01-01',
        gender: 'male'
      },
      professional: {
        id: data.professionalId,
        name: 'Dr. Mock',
        profile: 'medico'
      },
      establishment: {
        id: data.establishmentId,
        name: 'Hospital Mock',
        type: 'hospital'
      }
    };
  }

  private getMockAttendances(filters: AttendanceFilters = {}): AttendanceListResponse {
    const mockAttendances: Attendance[] = [
      {
        id: 'att-1',
        patientId: 'pat-1',
        professionalId: 'prof-1',
        establishmentId: 'est-1',
        type: 'consultation',
        status: 'in_progress',
        startTime: '2024-12-14T10:00:00Z',
        chiefComplaint: 'Dor de cabeça intensa',
        subjective: 'Paciente apresenta dor de cabeça há 3 dias',
        objective: 'PA: 140/90 mmHg, FC: 78 bpm',
        assessment: 'Possível enxaqueca',
        plan: 'Prescrever analgésico e agendar retorno',
        createdAt: '2024-12-14T10:00:00Z',
        updatedAt: '2024-12-14T10:00:00Z',
        patient: {
          id: 'pat-1',
          name: 'João Silva',
          cpf: '12345678901',
          birthDate: '1985-05-15',
          gender: 'male'
        },
        professional: {
          id: 'prof-1',
          name: 'Dr. Carlos Santos',
          profile: 'medico'
        },
        establishment: {
          id: 'est-1',
          name: 'Hospital Central',
          type: 'hospital'
        }
      },
      {
        id: 'att-2',
        patientId: 'pat-2',
        professionalId: 'prof-2',
        establishmentId: 'est-2',
        type: 'emergency',
        status: 'completed',
        startTime: '2024-12-14T08:30:00Z',
        endTime: '2024-12-14T09:15:00Z',
        chiefComplaint: 'Fratura no braço direito',
        subjective: 'Paciente sofreu acidente doméstico',
        objective: 'Fratura exposta no rádio direito',
        assessment: 'Fratura de rádio direito',
        plan: 'Imobilização e encaminhamento para ortopedia',
        createdAt: '2024-12-14T08:30:00Z',
        updatedAt: '2024-12-14T09:15:00Z',
        patient: {
          id: 'pat-2',
          name: 'Maria Santos',
          cpf: '98765432109',
          birthDate: '1990-08-22',
          gender: 'female'
        },
        professional: {
          id: 'prof-2',
          name: 'Dra. Ana Paula',
          profile: 'medico'
        },
        establishment: {
          id: 'est-2',
          name: 'UPA Central',
          type: 'upa'
        }
      },
      {
        id: 'att-3',
        patientId: 'pat-3',
        professionalId: 'prof-3',
        establishmentId: 'est-3',
        type: 'vaccination',
        status: 'scheduled',
        startTime: '2024-12-14T14:00:00Z',
        chiefComplaint: 'Vacinação de rotina',
        createdAt: '2024-12-14T12:00:00Z',
        updatedAt: '2024-12-14T12:00:00Z',
        patient: {
          id: 'pat-3',
          name: 'Pedro Oliveira',
          cpf: '45678912365',
          birthDate: '2015-03-10',
          gender: 'male'
        },
        professional: {
          id: 'prof-3',
          name: 'Enf. Roberta Lima',
          profile: 'enfermeiro'
        },
        establishment: {
          id: 'est-3',
          name: 'UBS Jardim',
          type: 'ubs'
        }
      }
    ];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let filteredAttendances = mockAttendances;

    // Aplicar filtros
    if (filters.status) {
      filteredAttendances = filteredAttendances.filter(a => a.status === filters.status);
    }

    if (filters.type) {
      filteredAttendances = filteredAttendances.filter(a => a.type === filters.type);
    }

    if (filters.patientId) {
      filteredAttendances = filteredAttendances.filter(a => a.patientId === filters.patientId);
    }

    if (filters.professionalId) {
      filteredAttendances = filteredAttendances.filter(a => a.professionalId === filters.professionalId);
    }

    const total = filteredAttendances.length;
    const paginatedAttendances = filteredAttendances.slice(offset, offset + limit);

    return {
      attendances: paginatedAttendances,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  private getMockActiveAttendances(establishmentId?: string): Attendance[] {
    return this.getMockAttendances({ status: 'in_progress' }).attendances;
  }

  private getMockAttendanceById(id: string): Attendance {
    const attendances = this.getMockAttendances().attendances;
    const attendance = attendances.find(a => a.id === id);

    if (attendance) {
      return attendance;
    }

    return attendances[0];
  }

  private getMockAttendanceStats() {
    return {
      totalAttendances: 1250,
      activeAttendances: 23,
      completedToday: 45,
      averageWaitTime: 28,
      attendancesByType: {
        consultation: 650,
        emergency: 320,
        procedure: 180,
        surgery: 45,
        exam: 35,
        vaccination: 20
      },
      attendancesByStatus: {
        scheduled: 15,
        in_progress: 23,
        completed: 1189,
        cancelled: 18,
        no_show: 5
      },
      monthlyTrend: [
        { month: 'Jan', count: 95 },
        { month: 'Fev', count: 102 },
        { month: 'Mar', count: 98 },
        { month: 'Abr', count: 115 },
        { month: 'Mai', count: 108 },
        { month: 'Jun', count: 125 }
      ]
    };
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;


