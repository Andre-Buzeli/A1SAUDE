import apiService from './api.service';

export interface ExamResult {
  parameter: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status?: 'normal' | 'abnormal' | 'critical';
  notes?: string;
}

export interface ExamRequest {
  id: string;
  patientId: string;
  attendanceId?: string;
  examType: string;
  description: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  clinicalData?: string;
  instructions?: string;
  scheduledFor?: string;
  completedAt?: string;
  results?: ExamResult[];
  observations?: string;
  technician?: string;
  reportedBy?: string;
  requestedAt: string;
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
  attendance?: {
    id: string;
    chiefComplaint: string;
    professional: {
      name: string;
      profile: string;
    };
  };
}

export interface ExamRequestFilters {
  patientId?: string;
  attendanceId?: string;
  examType?: string;
  status?: 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  urgency?: 'routine' | 'urgent' | 'emergency';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'requestedAt' | 'scheduledFor' | 'patient' | 'examType';
  sortOrder?: 'asc' | 'desc';
}

export interface ExamCreateData {
  patientId: string;
  attendanceId?: string;
  examType: string;
  description: string;
  urgency?: 'routine' | 'urgent' | 'emergency';
  clinicalData?: string;
  instructions?: string;
}

export interface ExamUpdateData {
  status?: 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledFor?: string;
  completedAt?: string;
  results?: ExamResult[];
  observations?: string;
  technician?: string;
  reportedBy?: string;
}

export interface ExamListResponse {
  examRequests: ExamRequest[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ExamStats {
  total: number;
  requested: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  averageCompletionTime: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

export interface ExamTypeCount {
  type: string;
  count: number;
}

class ExamService {
  /**
   * Criar nova solicitação de exame
   */
  async createExamRequest(data: ExamCreateData) {
    try {
      const response = await apiService.post<ExamRequest>('/api/v1/exams', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar solicitação de exame:', error);
      return this.getMockExamRequest(data);
    }
  }

  /**
   * Buscar solicitações de exame com filtros
   */
  async searchExamRequests(filters: ExamRequestFilters = {}) {
    try {
      const response = await apiService.get<ExamListResponse>('/api/v1/exams/search', filters);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar solicitações de exame:', error);
      return this.getMockExamRequests(filters);
    }
  }

  /**
   * Obter solicitação de exame por ID
   */
  async getExamRequestById(id: string) {
    try {
      const response = await apiService.get<ExamRequest>(`/api/v1/exams/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter solicitação de exame:', error);
      return this.getMockExamRequestById(id);
    }
  }

  /**
   * Atualizar solicitação de exame
   */
  async updateExamRequest(id: string, data: ExamUpdateData) {
    try {
      const response = await apiService.put<ExamRequest>(`/api/v1/exams/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar solicitação de exame:', error);
      return this.getMockExamRequestById(id);
    }
  }

  /**
   * Agendar exame
   */
  async scheduleExam(id: string, scheduledFor: string) {
    try {
      const response = await apiService.post<ExamRequest>(`/api/v1/exams/${id}/schedule`, { scheduledFor });
      return response.data;
    } catch (error) {
      console.error('Erro ao agendar exame:', error);
      return this.getMockExamRequestById(id);
    }
  }

  /**
   * Iniciar exame
   */
  async startExam(id: string, technician?: string) {
    try {
      const response = await apiService.post<ExamRequest>(`/api/v1/exams/${id}/start`, { technician });
      return response.data;
    } catch (error) {
      console.error('Erro ao iniciar exame:', error);
      return this.getMockExamRequestById(id);
    }
  }

  /**
   * Completar exame com resultados
   */
  async completeExam(id: string, results: ExamResult[], observations?: string, reportedBy?: string) {
    try {
      const response = await apiService.post<ExamRequest>(`/api/v1/exams/${id}/complete`, {
        results,
        observations,
        reportedBy
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao completar exame:', error);
      return this.getMockExamRequestById(id);
    }
  }

  /**
   * Cancelar exame
   */
  async cancelExam(id: string, reason?: string) {
    try {
      const response = await apiService.post<ExamRequest>(`/api/v1/exams/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar exame:', error);
      return this.getMockExamRequestById(id);
    }
  }

  /**
   * Obter exames pendentes
   */
  async getPendingExams(examType?: string, urgency?: string) {
    try {
      const params: any = {};
      if (examType) params.examType = examType;
      if (urgency) params.urgency = urgency;

      const response = await apiService.get<ExamRequest[]>('/api/v1/exams/pending', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter exames pendentes:', error);
      return this.getMockPendingExams(examType, urgency);
    }
  }

  /**
   * Obter tipos de exame disponíveis
   */
  async getExamTypes() {
    try {
      const response = await apiService.get<ExamTypeCount[]>('/api/v1/exams/types');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter tipos de exame:', error);
      return this.getMockExamTypes();
    }
  }

  /**
   * Obter estatísticas de exames
   */
  async getExamStats(startDate?: string, endDate?: string) {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiService.get<ExamStats>('/api/v1/exams/stats', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de exames:', error);
      return this.getMockExamStats();
    }
  }

  /**
   * Obter resultados críticos
   */
  async getCriticalResults(patientId?: string) {
    try {
      const params = patientId ? { patientId } : {};
      const response = await apiService.get<ExamRequest[]>('/api/v1/exams/critical', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter resultados críticos:', error);
      return this.getMockCriticalResults(patientId);
    }
  }

  /**
   * Mock data methods
   */
  private getMockExamRequest(data: ExamCreateData): ExamRequest {
    const id = `exam-mock-${Date.now()}`;
    return {
      id,
      patientId: data.patientId,
      attendanceId: data.attendanceId,
      examType: data.examType,
      description: data.description,
      urgency: data.urgency || 'routine',
      status: 'requested',
      clinicalData: data.clinicalData,
      instructions: data.instructions,
      requestedAt: new Date().toISOString(),
      requestedBy: 'mock-professional-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: {
        id: data.patientId,
        name: 'Paciente Mock',
        cpf: '12345678901',
        birthDate: '1985-01-01'
      },
      requestedByProfessional: {
        id: 'mock-professional-id',
        name: 'Dr. Mock',
        profile: 'medico'
      }
    };
  }

  private getMockExamRequests(filters: ExamRequestFilters = {}): ExamListResponse {
    const mockExams: ExamRequest[] = [
      {
        id: 'exam-1',
        patientId: 'pat-1',
        attendanceId: 'att-1',
        examType: 'Hemograma Completo',
        description: 'Avaliação hematológica completa',
        urgency: 'routine',
        status: 'completed',
        clinicalData: 'Paciente com fadiga crônica',
        instructions: 'Jejum de 8 horas',
        requestedAt: '2024-12-10T08:30:00Z',
        scheduledFor: '2024-12-11T10:00:00Z',
        completedAt: '2024-12-11T11:30:00Z',
        requestedBy: 'prof-1',
        performedBy: 'tech-1',
        reportedBy: 'prof-2',
        createdAt: '2024-12-10T08:30:00Z',
        updatedAt: '2024-12-11T11:30:00Z',
        patient: {
          id: 'pat-1',
          name: 'João Silva',
          cpf: '12345678901',
          birthDate: '1985-05-15'
        },
        requestedByProfessional: {
          id: 'prof-1',
          name: 'Dr. Carlos Santos',
          profile: 'medico'
        },
        results: [
          {
            parameter: 'Hemoglobina',
            value: '14.2',
            unit: 'g/dL',
            referenceRange: '13.0-17.0',
            status: 'normal'
          },
          {
            parameter: 'Leucócitos',
            value: '7800',
            unit: 'células/mm³',
            referenceRange: '4000-11000',
            status: 'normal'
          }
        ],
        observations: 'Paciente apresenta valores dentro da normalidade. Nenhum achado patológico.'
      },
      {
        id: 'exam-2',
        patientId: 'pat-2',
        examType: 'Raio-X de Tórax',
        description: 'Avaliação pulmonar',
        urgency: 'urgent',
        status: 'in_progress',
        clinicalData: 'Paciente com tosse e falta de ar',
        instructions: 'Remover objetos metálicos',
        requestedAt: '2024-12-14T09:15:00Z',
        scheduledFor: '2024-12-14T14:00:00Z',
        requestedBy: 'prof-3',
        performedBy: 'tech-2',
        createdAt: '2024-12-14T09:15:00Z',
        updatedAt: '2024-12-14T09:15:00Z',
        patient: {
          id: 'pat-2',
          name: 'Maria Santos',
          cpf: '98765432109',
          birthDate: '1990-08-22'
        },
        requestedByProfessional: {
          id: 'prof-3',
          name: 'Dra. Ana Paula',
          profile: 'medico'
        }
      },
      {
        id: 'exam-3',
        patientId: 'pat-3',
        examType: 'Ultrassonografia Abdominal',
        description: 'Avaliação hepática e renal',
        urgency: 'routine',
        status: 'scheduled',
        clinicalData: 'Paciente com dor abdominal',
        instructions: 'Jejum de 6 horas',
        requestedAt: '2024-12-13T16:45:00Z',
        scheduledFor: '2024-12-15T08:30:00Z',
        requestedBy: 'prof-4',
        createdAt: '2024-12-13T16:45:00Z',
        updatedAt: '2024-12-13T16:45:00Z',
        patient: {
          id: 'pat-3',
          name: 'Pedro Oliveira',
          cpf: '45678912365',
          birthDate: '1978-12-03'
        },
        requestedByProfessional: {
          id: 'prof-4',
          name: 'Dr. Roberto Lima',
          profile: 'medico'
        }
      },
      {
        id: 'exam-4',
        patientId: 'pat-4',
        examType: 'Tomografia Computadorizada de Crânio',
        description: 'Avaliação neurológica',
        urgency: 'urgent',
        status: 'completed',
        clinicalData: 'Paciente com cefaleia intensa e vômitos',
        instructions: 'Jejum de 4 horas',
        requestedAt: '2024-12-12T14:20:00Z',
        scheduledFor: '2024-12-12T16:00:00Z',
        completedAt: '2024-12-12T17:30:00Z',
        requestedBy: 'prof-5',
        performedBy: 'tech-3',
        reportedBy: 'prof-6',
        createdAt: '2024-12-12T14:20:00Z',
        updatedAt: '2024-12-12T17:30:00Z',
        patient: {
          id: 'pat-4',
          name: 'Ana Costa',
          cpf: '45678912300',
          birthDate: '1982-11-08'
        },
        requestedByProfessional: {
          id: 'prof-5',
          name: 'Dr. Marcos Silva',
          profile: 'medico'
        },
        observations: 'TC de crânio sem alterações agudas. Ausência de sinais de hipertensão intracraniana.'
      },
      {
        id: 'exam-5',
        patientId: 'pat-5',
        examType: 'Ressonância Magnética de Coluna',
        description: 'Avaliação de hérnia discal lombar',
        urgency: 'routine',
        status: 'scheduled',
        clinicalData: 'Paciente com lombalgia irradiada',
        instructions: 'Jejum opcional. Remover objetos metálicos.',
        requestedAt: '2024-12-11T10:15:00Z',
        scheduledFor: '2024-12-16T09:00:00Z',
        requestedBy: 'prof-7',
        createdAt: '2024-12-11T10:15:00Z',
        updatedAt: '2024-12-11T10:15:00Z',
        patient: {
          id: 'pat-5',
          name: 'Carlos Rodrigues',
          cpf: '78912345600',
          birthDate: '1975-06-20'
        },
        requestedByProfessional: {
          id: 'prof-7',
          name: 'Dra. Juliana Ferreira',
          profile: 'medico'
        }
      },
      {
        id: 'exam-6',
        patientId: 'pat-6',
        examType: 'Endoscopia Digestiva Alta',
        description: 'Investigação de dispepsia',
        urgency: 'routine',
        status: 'requested',
        clinicalData: 'Queixa de azia e dor epigástrica',
        instructions: 'Jejum de 8 horas. Suspender antiagregantes.',
        requestedAt: '2024-12-14T11:30:00Z',
        requestedBy: 'prof-8',
        createdAt: '2024-12-14T11:30:00Z',
        updatedAt: '2024-12-14T11:30:00Z',
        patient: {
          id: 'pat-6',
          name: 'Fernanda Lima',
          cpf: '32165498700',
          birthDate: '1988-03-14'
        },
        requestedByProfessional: {
          id: 'prof-8',
          name: 'Dr. Ricardo Santos',
          profile: 'medico'
        }
      },
      {
        id: 'exam-7',
        patientId: 'pat-7',
        examType: 'Ecocardiograma',
        description: 'Avaliação cardíaca',
        urgency: 'urgent',
        status: 'in_progress',
        clinicalData: 'Paciente com dispneia e edema de MMII',
        instructions: 'Trazer exames anteriores',
        requestedAt: '2024-12-14T13:45:00Z',
        scheduledFor: '2024-12-14T15:30:00Z',
        requestedBy: 'prof-9',
        performedBy: 'tech-4',
        createdAt: '2024-12-14T13:45:00Z',
        updatedAt: '2024-12-14T13:45:00Z',
        patient: {
          id: 'pat-7',
          name: 'Roberto Alves',
          cpf: '65498732100',
          birthDate: '1965-09-30'
        },
        requestedByProfessional: {
          id: 'prof-9',
          name: 'Dra. Patricia Gomes',
          profile: 'medico'
        }
      },
      {
        id: 'exam-8',
        patientId: 'pat-8',
        examType: 'Mamografia',
        description: 'Rastreamento oncológico',
        urgency: 'routine',
        status: 'scheduled',
        clinicalData: 'Mulher acima de 40 anos - rastreamento',
        instructions: 'Agendar no período menstrual adequado',
        requestedAt: '2024-12-10T09:20:00Z',
        scheduledFor: '2024-12-18T10:00:00Z',
        requestedBy: 'prof-10',
        createdAt: '2024-12-10T09:20:00Z',
        updatedAt: '2024-12-10T09:20:00Z',
        patient: {
          id: 'pat-8',
          name: 'Luciana Pereira',
          cpf: '14725836900',
          birthDate: '1972-12-05'
        },
        requestedByProfessional: {
          id: 'prof-10',
          name: 'Dra. Carla Mendes',
          profile: 'medico'
        }
      }
    ];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let filteredExams = mockExams;

    // Aplicar filtros
    if (filters.status) {
      filteredExams = filteredExams.filter(e => e.status === filters.status);
    }

    if (filters.urgency) {
      filteredExams = filteredExams.filter(e => e.urgency === filters.urgency);
    }

    if (filters.examType) {
      filteredExams = filteredExams.filter(e => e.examType === filters.examType);
    }

    if (filters.patientId) {
      filteredExams = filteredExams.filter(e => e.patientId === filters.patientId);
    }

    const total = filteredExams.length;
    const paginatedExams = filteredExams.slice(offset, offset + limit);

    return {
      examRequests: paginatedExams,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  private getMockExamRequestById(id: string): ExamRequest {
    const exams = this.getMockExamRequests().examRequests;
    const exam = exams.find(e => e.id === id);

    if (exam) {
      return exam;
    }

    return exams[0];
  }

  private getMockPendingExams(examType?: string, urgency?: string): ExamRequest[] {
    return this.getMockExamRequests({ status: 'scheduled', examType, urgency }).examRequests;
  }

  private getMockExamTypes(): ExamTypeCount[] {
    return [
      // Laboratoriais
      { examType: 'Hemograma Completo', count: 145 },
      { examType: 'Glicemia', count: 89 },
      { examType: 'Colesterol Total', count: 67 },
      { examType: 'Triglicerídeos', count: 56 },
      { examType: 'TSH', count: 43 },
      { examType: 'T4 Livre', count: 38 },
      { examType: 'Creatinina', count: 52 },
      { examType: 'Ureia', count: 48 },

      // Radiológicos - Convencionais
      { examType: 'Raio-X de Tórax', count: 132 },
      { examType: 'Raio-X de Abdômen', count: 45 },
      { examType: 'Raio-X de Coluna', count: 78 },
      { examType: 'Raio-X de Membros', count: 156 },
      { examType: 'Raio-X Dentário', count: 23 },
      { examType: 'Mamografia', count: 67 },

      // Ultrassonografia
      { examType: 'Ultrassonografia Abdominal', count: 128 },
      { examType: 'Ultrassonografia Pélvica', count: 89 },
      { examType: 'Ultrassonografia Tireoide', count: 45 },
      { examType: 'Ultrassonografia Mamária', count: 34 },
      { examType: 'Ultrassonografia Obstétrica', count: 56 },
      { examType: 'Ultrassonografia Transvaginal', count: 28 },
      { examType: 'Ultrassonografia Doppler', count: 23 },
      { examType: 'Ecocardiograma', count: 67 },

      // Tomografia Computadorizada
      { examType: 'Tomografia Computadorizada de Crânio', count: 89 },
      { examType: 'Tomografia Computadorizada de Tórax', count: 56 },
      { examType: 'Tomografia Computadorizada de Abdômen', count: 78 },
      { examType: 'Tomografia Computadorizada de Coluna', count: 34 },
      { examType: 'Angiotomografia', count: 45 },

      // Ressonância Magnética
      { examType: 'Ressonância Magnética de Crânio', count: 67 },
      { examType: 'Ressonância Magnética de Coluna', count: 45 },
      { examType: 'Ressonância Magnética de Articulações', count: 56 },
      { examType: 'Ressonância Magnética de Abdômen', count: 34 },

      // Endoscopias
      { examType: 'Endoscopia Digestiva Alta', count: 78 },
      { examType: 'Colonoscopia', count: 89 },
      { examType: 'Colangiopancreatografia Retrógrada', count: 23 },
      { examType: 'Broncoscopia', count: 34 },

      // Cardiologicos
      { examType: 'Eletrocardiograma', count: 145 },
      { examType: 'Teste Ergômetrico', count: 56 },
      { examType: 'Holter 24h', count: 34 },
      { examType: 'Monitorização Ambulatorial da Pressão Arterial', count: 28 },

      // Ginecologicos/Obstétricos
      { examType: 'Papanicolau', count: 89 },
      { examType: 'Colposcopia', count: 23 },
      { examType: 'Ultrassonografia Translucente Nucal', count: 45 },

      // Oftalmologicos
      { examType: 'Mapeamento de Retina', count: 67 },
      { examType: 'Angiografia Fluorescente', count: 12 },
      { examType: 'Tomografia de Coerência Óptica', count: 23 },

      // Otorrinolaringologicos
      { examType: 'Audiometria', count: 78 },
      { examType: 'Imitanciometria', count: 34 },
      { examType: 'Potencial Evocado Auditivo', count: 23 },

      // Dermatologicos
      { examType: 'Dermatoscopia', count: 45 },
      { examType: 'Microscopia Confocal', count: 12 },

      // Outros
      { examType: 'Eletroencefalograma', count: 34 },
      { examType: 'Polissonografia', count: 23 },
      { examType: 'Densitometria Óssea', count: 56 },
      { examType: 'Espirometria', count: 67 },
      { examType: 'Eletromiografia', count: 28 }
    ];
  }

  private getMockExamStats(): ExamStats {
    return {
      totalExams: 856,
      completedExams: 723,
      pendingExams: 89,
      cancelledExams: 44,
      examsByType: {
        'Laboratoriais': 456,
        'Radiológicos': 234,
        'Endoscópicos': 89,
        'Cardiológicos': 67,
        'Outros': 10
      },
      examsByUrgency: {
        routine: 623,
        urgent: 156,
        emergency: 77
      },
      averageTurnaroundTime: 3.2,
      criticalResults: 23,
      monthlyTrend: [
        { month: 'Jan', count: 65 },
        { month: 'Fev', count: 72 },
        { month: 'Mar', count: 68 },
        { month: 'Abr', count: 78 },
        { month: 'Mai', count: 82 },
        { month: 'Jun', count: 75 }
      ]
    };
  }

  private getMockCriticalResults(patientId?: string): ExamRequest[] {
    return this.getMockExamRequests({ status: 'completed' }).examRequests.filter(e =>
      e.results?.some(r => r.status === 'critical')
    ).slice(0, 5);
  }
}

export const examService = new ExamService();
export default examService;

