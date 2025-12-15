import apiService from './api.service';

export interface TriageRecord {
  id: string;
  patientId: string;
  attendanceId?: string;
  triagedBy: string;
  chiefComplaint: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'transferred';

  // Vital signs
  respiratoryRate?: number;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  oxygenSaturation?: number;
  painScale?: number;

  // Discriminators
  discriminator1?: string;
  discriminator2?: string;
  discriminator3?: string;
  discriminator4?: string;
  discriminator5?: string;

  // Clinical presentation
  presentation?: 'walking' | 'walking_with_help' | 'wheelchair' | 'stretcher';
  consciousness?: 'alert' | 'confused' | 'lethargic' | 'unconscious';

  // Manchester triage results
  calculatedPriority?: 'immediate' | 'very_urgent' | 'urgent' | 'standard' | 'non_urgent';
  finalPriority?: 'immediate' | 'very_urgent' | 'urgent' | 'standard' | 'non_urgent';

  // Professional override
  overrideReason?: string;

  // Additional info
  observations?: string;
  waitingTime?: number;

  // Timestamps
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

export interface TriageFilters {
  patientId?: string;
  attendanceId?: string;
  status?: 'waiting' | 'in_progress' | 'completed' | 'transferred';
  priority?: 'immediate' | 'very_urgent' | 'urgent' | 'standard' | 'non_urgent';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'priority' | 'waitingTime';
  sortOrder?: 'asc' | 'desc';
}

export interface TriageCreateData {
  patientId: string;
  attendanceId?: string;
  chiefComplaint: string;

  // Vital signs
  respiratoryRate?: number;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  oxygenSaturation?: number;
  painScale?: number;

  // Discriminators
  discriminator1?: string;
  discriminator2?: string;
  discriminator3?: string;
  discriminator4?: string;
  discriminator5?: string;

  // Clinical presentation
  presentation?: 'walking' | 'walking_with_help' | 'wheelchair' | 'stretcher';
  consciousness?: 'alert' | 'confused' | 'lethargic' | 'unconscious';

  // Override
  finalPriority?: 'immediate' | 'very_urgent' | 'urgent' | 'standard' | 'non_urgent';
  overrideReason?: string;

  // Additional info
  observations?: string;
}

export interface TriageUpdateData {
  status?: 'waiting' | 'in_progress' | 'completed' | 'transferred';
  finalPriority?: 'immediate' | 'very_urgent' | 'urgent' | 'standard' | 'non_urgent';
  overrideReason?: string;
  observations?: string;
  waitingTime?: number;

  // Vital signs updates
  respiratoryRate?: number;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  oxygenSaturation?: number;
  painScale?: number;

  // Discriminators updates
  discriminator1?: string;
  discriminator2?: string;
  discriminator3?: string;
  discriminator4?: string;
  discriminator5?: string;

  // Clinical presentation updates
  presentation?: 'walking' | 'walking_with_help' | 'wheelchair' | 'stretcher';
  consciousness?: 'alert' | 'confused' | 'lethargic' | 'unconscious';
}

export interface TriageListResponse {
  triages: TriageRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ManchesterTriageResult {
  priority: 'immediate' | 'very_urgent' | 'urgent' | 'standard' | 'non_urgent';
  discriminators: string[];
  reasoning: string;
  recommendedTime: string;
}

export interface TriageStats {
  total: number;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  averageWaitingTime: number;
  priorityDistribution: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
}

class TriageService {
  /**
   * Criar nova triagem
   */
  async createTriage(data: TriageCreateData) {
    try {
      const response = await apiService.post<TriageRecord>('/api/v1/triage', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar triagem:', error);
      return this.getMockTriage(data);
    }
  }

  /**
   * Buscar triagens com filtros
   */
  async searchTriages(filters: TriageFilters = {}) {
    try {
      const response = await apiService.get<TriageListResponse>('/api/v1/triage/search', filters);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar triagens:', error);
      return this.getMockTriages(filters);
    }
  }

  /**
   * Obter triagem por ID
   */
  async getTriageById(id: string) {
    try {
      const response = await apiService.get<TriageRecord>(`/api/v1/triage/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter triagem:', error);
      return this.getMockTriageById(id);
    }
  }

  /**
   * Atualizar triagem
   */
  async updateTriage(id: string, data: TriageUpdateData) {
    try {
      const response = await apiService.put<TriageRecord>(`/api/v1/triage/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar triagem:', error);
      return this.getMockTriageById(id);
    }
  }

  /**
   * Atualizar status da triagem
   */
  async updateTriageStatus(id: string, status: 'waiting' | 'in_progress' | 'completed' | 'transferred') {
    try {
      const response = await apiService.patch<TriageRecord>(`/api/v1/triage/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status da triagem:', error);
      return this.getMockTriageById(id);
    }
  }

  /**
   * Obter fila de espera
   */
  async getWaitingQueue() {
    try {
      const response = await apiService.get<TriageRecord[]>('/api/v1/triage/queue');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter fila de espera:', error);
      return this.getMockWaitingQueue();
    }
  }

  /**
   * Obter estatísticas de triagem
   */
  async getTriageStats(startDate?: string, endDate?: string) {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiService.get<TriageStats>('/api/v1/triage/stats', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de triagem:', error);
      return this.getMockTriageStats();
    }
  }

  /**
   * Mock data methods
   */
  private getMockTriage(data: TriageCreateData): TriageRecord {
    const id = `triage-mock-${Date.now()}`;
    return {
      id,
      patientId: data.patientId,
      attendanceId: data.attendanceId,
      triagedBy: data.triagedBy || 'Triage Mock',
      triagedAt: new Date().toISOString(),
      status: 'waiting',
      chiefComplaint: data.chiefComplaint,
      respiratoryRate: data.respiratoryRate || 16,
      heartRate: data.heartRate || 72,
      bloodPressureSystolic: data.bloodPressureSystolic || 120,
      bloodPressureDiastolic: data.bloodPressureDiastolic || 80,
      temperature: data.temperature || 36.5,
      oxygenSaturation: data.oxygenSaturation || 98,
      painScale: data.painScale,
      discriminator1: data.discriminator1,
      discriminator2: data.discriminator2,
      discriminator3: data.discriminator3,
      discriminator4: data.discriminator4,
      discriminator5: data.discriminator5,
      presentation: data.presentation || 'walking',
      consciousness: data.consciousness || 'alert',
      calculatedPriority: this.calculateTriagePriority({
        respiratoryRate: data.respiratoryRate,
        heartRate: data.heartRate,
        bloodPressureSystolic: data.bloodPressureSystolic,
        bloodPressureDiastolic: data.bloodPressureDiastolic,
        temperature: data.temperature,
        oxygenSaturation: data.oxygenSaturation,
        consciousness: data.consciousness,
        chiefComplaint: data.chiefComplaint
      }),
      finalPriority: data.finalPriority,
      overrideReason: data.overrideReason,
      estimatedWaitTime: this.estimateWaitTime(this.calculateTriagePriority({
        respiratoryRate: data.respiratoryRate,
        heartRate: data.heartRate,
        bloodPressureSystolic: data.bloodPressureSystolic,
        bloodPressureDiastolic: data.bloodPressureDiastolic,
        temperature: data.temperature,
        oxygenSaturation: data.oxygenSaturation,
        consciousness: data.consciousness,
        chiefComplaint: data.chiefComplaint
      })),
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: {
        id: data.patientId,
        name: 'Paciente Mock',
        cpf: '12345678901',
        birthDate: '1985-01-01',
        gender: 'male'
      }
    };
  }

  private getMockTriages(filters: TriageFilters = {}): TriageListResponse {
    const mockTriages: TriageRecord[] = [
      {
        id: 'triage-1',
        patientId: 'pat-1',
        triagedBy: 'Enf. Silva',
        triagedAt: '2024-12-14T08:30:00Z',
        status: 'waiting',
        chiefComplaint: 'Dor abdominal intensa',
        respiratoryRate: 18,
        heartRate: 85,
        bloodPressureSystolic: 135,
        bloodPressureDiastolic: 95,
        temperature: 37.8,
        oxygenSaturation: 96,
        painScale: 8,
        presentation: 'walking',
        consciousness: 'alert',
        calculatedPriority: 'urgent',
        finalPriority: 'urgent',
        estimatedWaitTime: 45,
        notes: 'Paciente com sinais de infecção',
        createdAt: '2024-12-14T08:30:00Z',
        updatedAt: '2024-12-14T08:30:00Z',
        patient: {
          id: 'pat-1',
          name: 'João Silva',
          cpf: '12345678901',
          birthDate: '1985-05-15',
          gender: 'male'
        }
      },
      {
        id: 'triage-2',
        patientId: 'pat-2',
        triagedBy: 'Enf. Santos',
        triagedAt: '2024-12-14T08:15:00Z',
        status: 'in_progress',
        chiefComplaint: 'Fratura no braço esquerdo',
        respiratoryRate: 16,
        heartRate: 72,
        bloodPressureSystolic: 125,
        bloodPressureDiastolic: 85,
        temperature: 36.7,
        oxygenSaturation: 98,
        painScale: 7,
        presentation: 'walking_with_help',
        consciousness: 'alert',
        calculatedPriority: 'urgent',
        finalPriority: 'urgent',
        estimatedWaitTime: 30,
        notes: 'Fratura exposta, imobilizada',
        createdAt: '2024-12-14T08:15:00Z',
        updatedAt: '2024-12-14T08:15:00Z',
        patient: {
          id: 'pat-2',
          name: 'Maria Santos',
          cpf: '98765432109',
          birthDate: '1990-08-22',
          gender: 'female'
        }
      },
      {
        id: 'triage-3',
        patientId: 'pat-3',
        triagedBy: 'Enf. Oliveira',
        triagedAt: '2024-12-14T07:45:00Z',
        status: 'completed',
        chiefComplaint: 'Consulta de rotina',
        respiratoryRate: 14,
        heartRate: 68,
        bloodPressureSystolic: 118,
        bloodPressureDiastolic: 78,
        temperature: 36.5,
        oxygenSaturation: 99,
        painScale: 0,
        presentation: 'walking',
        consciousness: 'alert',
        calculatedPriority: 'standard',
        finalPriority: 'standard',
        estimatedWaitTime: 90,
        createdAt: '2024-12-14T07:45:00Z',
        updatedAt: '2024-12-14T08:00:00Z',
        patient: {
          id: 'pat-3',
          name: 'Pedro Oliveira',
          cpf: '45678912365',
          birthDate: '1978-12-03',
          gender: 'male'
        }
      }
    ];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let filteredTriages = mockTriages;

    // Aplicar filtros
    if (filters.status) {
      filteredTriages = filteredTriages.filter(t => t.status === filters.status);
    }

    if (filters.finalPriority) {
      filteredTriages = filteredTriages.filter(t => t.finalPriority === filters.finalPriority);
    }

    if (filters.patientId) {
      filteredTriages = filteredTriages.filter(t => t.patientId === filters.patientId);
    }

    const total = filteredTriages.length;
    const paginatedTriages = filteredTriages.slice(offset, offset + limit);

    return {
      triages: paginatedTriages,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  private getMockTriageById(id: string): TriageRecord {
    const triages = this.getMockTriages().triages;
    const triage = triages.find(t => t.id === id);

    if (triage) {
      return triage;
    }

    return triages[0];
  }

  private getMockWaitingQueue(): TriageRecord[] {
    return this.getMockTriages({ status: 'waiting' }).triages.sort((a, b) => {
      const priorityOrder = { immediate: 0, very_urgent: 1, urgent: 2, standard: 3, non_urgent: 4 };
      return priorityOrder[a.finalPriority || 'standard'] - priorityOrder[b.finalPriority || 'standard'];
    });
  }

  private getMockTriageStats(): TriageStats {
    return {
      totalTriages: 856,
      triagesToday: 45,
      averageWaitTime: 28,
      priorityDistribution: {
        immediate: 12,
        very_urgent: 23,
        urgent: 156,
        standard: 423,
        non_urgent: 242
      },
      statusDistribution: {
        waiting: 67,
        in_progress: 23,
        completed: 723,
        transferred: 43
      },
      peakHours: [
        { hour: '08:00', count: 15 },
        { hour: '09:00', count: 22 },
        { hour: '10:00', count: 18 },
        { hour: '11:00', count: 25 }
      ],
      commonComplaints: [
        { complaint: 'Dor abdominal', count: 89 },
        { complaint: 'Fratura/Trauma', count: 67 },
        { complaint: 'Febre', count: 54 },
        { complaint: 'Dor torácica', count: 43 },
        { complaint: 'Consulta rotina', count: 156 }
      ],
      performanceMetrics: {
        averageTriageTime: 8.5,
        patientSatisfaction: 4.2,
        accuracyRate: 92.3
      }
    };
  }

  /**
   * Calcular prioridade usando algoritmo Manchester
   */
  async calculatePriority(data: {
    chiefComplaint: string;
    vitalSigns?: {
      respiratoryRate?: number;
      heartRate?: number;
      bloodPressureSystolic?: number;
      bloodPressureDiastolic?: number;
      temperature?: number;
      oxygenSaturation?: number;
      painScale?: number;
    };
    discriminators?: string[];
    presentation?: 'walking' | 'walking_with_help' | 'wheelchair' | 'stretcher';
    consciousness?: 'alert' | 'confused' | 'lethargic' | 'unconscious';
  }) {
    const response = await apiService.post<ManchesterTriageResult>('/api/v1/triage/calculate-priority', data);
    return response.data;
  }

  /**
   * Obter cores para prioridades
   */
  getPriorityColor(priority: string) {
    switch (priority) {
      case 'immediate':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'very_urgent':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'urgent':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'standard':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'non_urgent':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  }

  /**
   * Obter rótulo da prioridade
   */
  getPriorityLabel(priority: string) {
    const labels: Record<string, string> = {
      immediate: 'Imediato',
      very_urgent: 'Muito Urgente',
      urgent: 'Urgente',
      standard: 'Padrão',
      non_urgent: 'Não Urgente'
    };
    return labels[priority] || priority;
  }

  /**
   * Obter tempo recomendado para prioridade
   */
  getRecommendedTime(priority: string) {
    const times: Record<string, string> = {
      immediate: 'Imediato',
      very_urgent: '10 minutos',
      urgent: '1 hora',
      standard: '2-4 horas',
      non_urgent: '4-24 horas'
    };
    return times[priority] || 'N/A';
  }

  /**
   * Obter rótulo do status
   */
  getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      waiting: 'Aguardando',
      in_progress: 'Em Andamento',
      completed: 'Concluída',
      transferred: 'Transferida'
    };
    return labels[status] || status;
  }

  /**
   * Obter cor do status
   */
  getStatusColor(status: string) {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'transferred':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  }
}

export const triageService = new TriageService();
export default triageService;


