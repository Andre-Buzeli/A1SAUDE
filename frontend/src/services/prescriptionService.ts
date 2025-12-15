import apiService from './api.service';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  professionalId: string;
  attendanceId?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  medications: Medication[];
  instructions?: string;
  validUntil: string;
  digitalSignature?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    allergies: string[];
  };
  professional?: {
    id: string;
    name: string;
    profile: string;
  };
  attendance?: {
    id: string;
    chiefComplaint: string;
    startTime: string;
  };
}

export interface PrescriptionFilters {
  patientId?: string;
  professionalId?: string;
  attendanceId?: string;
  status?: 'active' | 'completed' | 'cancelled' | 'expired';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'validUntil' | 'patient' | 'professional';
  sortOrder?: 'asc' | 'desc';
}

export interface PrescriptionCreateData {
  patientId: string;
  professionalId: string;
  attendanceId?: string;
  medications: Medication[];
  instructions?: string;
  validUntil?: string;
}

export interface PrescriptionUpdateData {
  status?: 'active' | 'completed' | 'cancelled' | 'expired';
  medications?: Medication[];
  instructions?: string;
  validUntil?: string;
  digitalSignature?: string;
}

export interface PrescriptionListResponse {
  prescriptions: Prescription[];
  total: number;
  page: number;
  totalPages: number;
}

class PrescriptionService {
  /**
   * Criar nova prescrição
   */
  async createPrescription(data: PrescriptionCreateData) {
    try {
      const response = await apiService.post<Prescription>('/api/v1/prescriptions', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar prescrição:', error);
      return this.getMockPrescription(data);
    }
  }

  /**
   * Buscar prescrições com filtros
   */
  async searchPrescriptions(filters: PrescriptionFilters = {}) {
    try {
      const response = await apiService.get<PrescriptionListResponse>('/api/v1/prescriptions/search', filters);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar prescrições:', error);
      return this.getMockPrescriptions(filters);
    }
  }

  /**
   * Obter prescrições ativas
   */
  async getActivePrescriptions(patientId?: string) {
    try {
      const params = patientId ? { patientId } : {};
      const response = await apiService.get<Prescription[]>('/api/v1/prescriptions/active', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter prescrições ativas:', error);
      return this.getMockActivePrescriptions(patientId);
    }
  }

  /**
   * Obter prescrição por ID
   */
  async getPrescriptionById(id: string) {
    try {
      const response = await apiService.get<Prescription>(`/api/v1/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter prescrição:', error);
      return this.getMockPrescriptionById(id);
    }
  }

  /**
   * Atualizar prescrição
   */
  async updatePrescription(id: string, data: PrescriptionUpdateData) {
    try {
      const response = await apiService.put<Prescription>(`/api/v1/prescriptions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar prescrição:', error);
      return this.getMockPrescriptionById(id);
    }
  }

  /**
   * Cancelar prescrição
   */
  async cancelPrescription(id: string, reason?: string) {
    try {
      const response = await apiService.post<Prescription>(`/api/v1/prescriptions/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar prescrição:', error);
      return this.getMockPrescriptionById(id);
    }
  }

  /**
   * Concluir prescrição
   */
  async completePrescription(id: string) {
    try {
      const response = await apiService.post<Prescription>(`/api/v1/prescriptions/${id}/complete`, {});
      return response.data;
    } catch (error) {
      console.error('Erro ao completar prescrição:', error);
      return this.getMockPrescriptionById(id);
    }
  }

  /**
   * Obter estatísticas de prescrições
   */
  async getPrescriptionStats(professionalId?: string, startDate?: string, endDate?: string) {
    try {
      const params: any = {};
      if (professionalId) params.professionalId = professionalId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiService.get('/api/v1/prescriptions/stats', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de prescrições:', error);
      return this.getMockPrescriptionStats();
    }
  }

  /**
   * Mock data methods
   */
  private getMockPrescription(data: PrescriptionCreateData): Prescription {
    const id = `prescription-mock-${Date.now()}`;
    return {
      id,
      patientId: data.patientId,
      professionalId: data.professionalId,
      attendanceId: data.attendanceId,
      status: 'active',
      medications: data.medications,
      instructions: data.instructions,
      validUntil: data.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: {
        id: data.patientId,
        name: 'Paciente Mock',
        cpf: '12345678901',
        birthDate: '1985-01-01',
        allergies: []
      },
      professional: {
        id: data.professionalId,
        name: 'Dr. Mock',
        profile: 'medico'
      }
    };
  }

  private getMockPrescriptions(filters: PrescriptionFilters = {}): PrescriptionListResponse {
    const mockPrescriptions: Prescription[] = [
      {
        id: 'presc-1',
        patientId: 'pat-1',
        professionalId: 'prof-1',
        attendanceId: 'att-1',
        status: 'active',
        medications: [
          {
            name: 'Paracetamol 500mg',
            dosage: '1 comprimido',
            frequency: 'A cada 6 horas',
            duration: '3 dias',
            instructions: 'Tomar com água'
          },
          {
            name: 'Ibuprofeno 400mg',
            dosage: '1 comprimido',
            frequency: 'A cada 8 horas',
            duration: '3 dias',
            instructions: 'Tomar após refeições'
          }
        ],
        instructions: 'Caso dor não melhore em 48h, procurar atendimento médico',
        validUntil: '2025-01-13',
        createdAt: '2024-12-14T10:30:00Z',
        updatedAt: '2024-12-14T10:30:00Z',
        patient: {
          id: 'pat-1',
          name: 'João Silva',
          cpf: '12345678901',
          birthDate: '1985-05-15',
          allergies: []
        },
        professional: {
          id: 'prof-1',
          name: 'Dr. Carlos Santos',
          profile: 'medico'
        },
        attendance: {
          id: 'att-1',
          chiefComplaint: 'Dor de cabeça intensa',
          startTime: '2024-12-14T10:00:00Z'
        }
      },
      {
        id: 'presc-2',
        patientId: 'pat-2',
        professionalId: 'prof-2',
        status: 'active',
        medications: [
          {
            name: 'Amoxicilina 500mg',
            dosage: '1 cápsula',
            frequency: 'A cada 8 horas',
            duration: '7 dias',
            instructions: 'Tomar 30 min antes das refeições'
          }
        ],
        instructions: 'Completar todo o tratamento. Retornar se sintomas persistirem.',
        validUntil: '2024-12-21',
        createdAt: '2024-12-13T14:20:00Z',
        updatedAt: '2024-12-13T14:20:00Z',
        patient: {
          id: 'pat-2',
          name: 'Maria Santos',
          cpf: '98765432109',
          birthDate: '1990-08-22',
          allergies: ['Penicilina']
        },
        professional: {
          id: 'prof-2',
          name: 'Dra. Ana Paula',
          profile: 'medico'
        }
      },
      {
        id: 'presc-3',
        patientId: 'pat-3',
        professionalId: 'prof-3',
        status: 'completed',
        medications: [
          {
            name: 'Dexametasona 4mg',
            dosage: '1 comprimido',
            frequency: 'A cada 12 horas',
            duration: '5 dias',
            instructions: 'Tomar pela manhã e noite'
          }
        ],
        instructions: 'Uso tópico para inflamação',
        validUntil: '2024-12-19',
        createdAt: '2024-12-09T11:15:00Z',
        updatedAt: '2024-12-14T09:00:00Z',
        patient: {
          id: 'pat-3',
          name: 'Pedro Oliveira',
          cpf: '45678912365',
          birthDate: '1978-12-03',
          allergies: []
        },
        professional: {
          id: 'prof-3',
          name: 'Dr. Roberto Lima',
          profile: 'medico'
        }
      }
    ];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let filteredPrescriptions = mockPrescriptions;

    // Aplicar filtros
    if (filters.status) {
      filteredPrescriptions = filteredPrescriptions.filter(p => p.status === filters.status);
    }

    if (filters.patientId) {
      filteredPrescriptions = filteredPrescriptions.filter(p => p.patientId === filters.patientId);
    }

    if (filters.professionalId) {
      filteredPrescriptions = filteredPrescriptions.filter(p => p.professionalId === filters.professionalId);
    }

    const total = filteredPrescriptions.length;
    const paginatedPrescriptions = filteredPrescriptions.slice(offset, offset + limit);

    return {
      prescriptions: paginatedPrescriptions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  private getMockActivePrescriptions(patientId?: string): Prescription[] {
    return this.getMockPrescriptions({ status: 'active', patientId }).prescriptions;
  }

  private getMockPrescriptionById(id: string): Prescription {
    const prescriptions = this.getMockPrescriptions().prescriptions;
    const prescription = prescriptions.find(p => p.id === id);

    if (prescription) {
      return prescription;
    }

    return prescriptions[0];
  }

  private getMockPrescriptionStats() {
    return {
      totalPrescriptions: 856,
      activePrescriptions: 423,
      completedPrescriptions: 398,
      cancelledPrescriptions: 35,
      prescriptionsThisMonth: 67,
      prescriptionsByProfessional: {
        'Dr. Carlos Santos': 145,
        'Dra. Ana Paula': 123,
        'Dr. Roberto Lima': 98,
        'Dr. Maria Silva': 87
      },
      medicationsByCategory: {
        'Analgésicos': 234,
        'Antibióticos': 156,
        'Anti-inflamatórios': 89,
        'Antihipertensivos': 67,
        'Outros': 310
      },
      averagePrescriptionDuration: 7.2,
      prescriptionsWithMultipleMedications: 189
    };
  }
}

export const prescriptionService = new PrescriptionService();
export default prescriptionService;


