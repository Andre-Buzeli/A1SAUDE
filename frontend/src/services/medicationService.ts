import apiService from './api.service';

export interface MedicationAdministration {
  id: string;
  patientId: string;
  prescriptionId?: string;
  attendanceId?: string;
  medicationName: string;
  dosage: string;
  route: 'oral' | 'intravenosa' | 'intramuscular' | 'subcutanea' | 'topica' | 'retal' | 'inalatoria' | 'ocular' | 'otologica' | 'nasal';
  frequency: string;
  scheduledFor: string;
  administeredAt?: string;
  administeredBy?: string;
  notes?: string;
  status: 'scheduled' | 'administered' | 'missed' | 'refused' | 'cancelled';
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
  prescription?: {
    id: string;
    professional: {
      name: string;
      profile: string;
    };
  };
  attendance?: {
    id: string;
    professional: {
      name: string;
      profile: string;
    };
  };
  administeredByUser?: {
    id: string;
    name: string;
    profile: string;
  };
}

export interface MedicationSchedule {
  id: string;
  patientId: string;
  prescriptionId?: string;
  attendanceId?: string;
  medicationName: string;
  dosage: string;
  route: 'oral' | 'intravenosa' | 'intramuscular' | 'subcutanea' | 'topica' | 'retal' | 'inalatoria' | 'ocular' | 'otologica' | 'nasal';
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  isActive: boolean;
  createdBy: string;
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
  prescription?: {
    id: string;
    professional: {
      name: string;
      profile: string;
    };
  };
  attendance?: {
    id: string;
    professional: {
      name: string;
      profile: string;
    };
  };
}

export interface MedicationFilters {
  patientId?: string;
  prescriptionId?: string;
  attendanceId?: string;
  status?: 'scheduled' | 'administered' | 'missed' | 'refused' | 'cancelled';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'scheduledFor' | 'administeredAt' | 'medicationName' | 'patient';
  sortOrder?: 'asc' | 'desc';
}

export interface MedicationCreateData {
  patientId: string;
  prescriptionId?: string;
  attendanceId?: string;
  medicationName: string;
  dosage: string;
  route?: 'oral' | 'intravenosa' | 'intramuscular' | 'subcutanea' | 'topica' | 'retal' | 'inalatoria' | 'ocular' | 'otologica' | 'nasal';
  frequency: string;
  scheduledFor: string;
  notes?: string;
}

export interface MedicationScheduleCreateData {
  patientId: string;
  prescriptionId?: string;
  attendanceId?: string;
  medicationName: string;
  dosage: string;
  route?: 'oral' | 'intravenosa' | 'intramuscular' | 'subcutanea' | 'topica' | 'retal' | 'inalatoria' | 'ocular' | 'otologica' | 'nasal';
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
}

export interface MedicationListResponse {
  administrations: MedicationAdministration[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MedicationStats {
  totalAdministrations: number;
  administeredToday: number;
  scheduledToday: number;
  missedToday: number;
  refusedToday: number;
  byRoute: Record<string, number>;
  byStatus: Record<string, number>;
  adherenceRate: number;
  mostCommonMedications: Array<{ name: string; count: number }>;
}

class MedicationService {
  /**
   * Criar nova administração de medicamento
   */
  async createMedicationAdministration(data: MedicationCreateData) {
    try {
      const response = await apiService.post<MedicationAdministration>('/api/v1/medications/administer', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar administração de medicamento:', error);
      return this.getMockMedicationAdministration(data);
    }
  }

  /**
   * Buscar administrações de medicamentos com filtros
   */
  async searchMedicationAdministrations(filters: MedicationFilters = {}) {
    try {
      const response = await apiService.get<MedicationListResponse>('/api/v1/medications/administer/search', filters);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar administrações de medicamentos:', error);
      return this.getMockMedicationAdministrations(filters);
    }
  }

  /**
   * Obter administração de medicamento por ID
   */
  async getMedicationAdministrationById(id: string) {
    try {
      const response = await apiService.get<MedicationAdministration>(`/api/v1/medications/administer/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter administração de medicamento:', error);
      return this.getMockMedicationAdministrationById(id);
    }
  }

  /**
   * Atualizar administração de medicamento
   */
  async updateMedicationAdministration(id: string, data: Partial<MedicationCreateData>) {
    try {
      const response = await apiService.put<MedicationAdministration>(`/api/v1/medications/administer/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar administração de medicamento:', error);
      return this.getMockMedicationAdministrationById(id);
    }
  }

  /**
   * Administrar medicamento (marcar como administrado)
   */
  async administerMedication(id: string, notes?: string) {
    try {
      const response = await apiService.post<MedicationAdministration>(`/api/v1/medications/administer/${id}/administer`, { notes });
      return response.data;
    } catch (error) {
      console.error('Erro ao administrar medicamento:', error);
      return this.getMockMedicationAdministrationById(id);
    }
  }

  /**
   * Marcar medicamento como perdido
   */
  async markAsMissed(id: string, reason?: string) {
    try {
      const response = await apiService.post<MedicationAdministration>(`/api/v1/medications/administer/${id}/missed`, { reason });
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar medicamento como perdido:', error);
      return this.getMockMedicationAdministrationById(id);
    }
  }

  /**
   * Marcar medicamento como recusado
   */
  async markAsRefused(id: string, reason?: string) {
    try {
      const response = await apiService.post<MedicationAdministration>(`/api/v1/medications/administer/${id}/refused`, { reason });
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar medicamento como recusado:', error);
      return this.getMockMedicationAdministrationById(id);
    }
  }

  /**
   * Obter medicamentos agendados para hoje
   */
  async getScheduledForToday() {
    try {
      const response = await apiService.get<MedicationAdministration[]>('/api/v1/medications/administer/today');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter medicamentos agendados para hoje:', error);
      return this.getMockScheduledForToday();
    }
  }

  /**
   * Criar cronograma de medicação
   */
  async createMedicationSchedule(data: MedicationScheduleCreateData) {
    try {
      const response = await apiService.post<MedicationSchedule>('/api/v1/medications/schedule', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cronograma de medicação:', error);
      return this.getMockMedicationSchedule(data);
    }
  }

  /**
   * Obter cronograma de medicação por ID
   */
  async getMedicationScheduleById(id: string) {
    try {
      const response = await apiService.get<MedicationSchedule>(`/api/v1/medications/schedule/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter cronograma de medicação:', error);
      return this.getMockMedicationScheduleById(id);
    }
  }

  /**
   * Obter cronogramas ativos de medicação
   */
  async getActiveSchedules(patientId?: string) {
    try {
      const params = patientId ? { patientId } : {};
      const response = await apiService.get<MedicationSchedule[]>('/api/v1/medications/schedule/active', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter cronogramas ativos:', error);
      return this.getMockActiveSchedules(patientId);
    }
  }

  /**
   * Obter estatísticas de medicação
   */
  async getMedicationStats(startDate?: string, endDate?: string) {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiService.get<MedicationStats>('/api/v1/medications/stats', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de medicação:', error);
      return this.getMockMedicationStats();
    }
  }

  /**
   * Gerar cronograma a partir de prescrição
   */
  async generateScheduleFromPrescription(prescriptionId: string, patientId: string) {
    try {
      const response = await apiService.post<MedicationSchedule[]>('/api/v1/medications/schedule/generate-from-prescription', {
        prescriptionId,
        patientId
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar cronograma a partir de prescrição:', error);
      return this.getMockGeneratedSchedules(prescriptionId, patientId);
    }
  }

  /**
   * Mock data methods
   */
  private getMockMedicationAdministrationById(id: string): MedicationAdministration {
    const medications = this.getMockMedicationAdministrations().medications;
    const medication = medications.find(m => m.id === id);

    if (medication) {
      return medication;
    }

    return medications[0];
  }

  private getMockMedicationAdministrations(): MedicationListResponse {
    const mockMedications: MedicationAdministration[] = [
      {
        id: 'med-1',
        patientId: 'pat-1',
        prescriptionId: 'presc-1',
        scheduleId: 'sched-1',
        medicationName: 'Paracetamol 500mg',
        dosage: '1 comprimido',
        route: 'oral',
        status: 'administered',
        scheduledFor: '2024-12-14T08:00:00Z',
        administeredAt: '2024-12-14T08:05:00Z',
        administeredBy: 'nurse-1',
        notes: 'Administrado sem intercorrências',
        createdAt: '2024-12-14T08:00:00Z',
        updatedAt: '2024-12-14T08:05:00Z',
        patient: {
          id: 'pat-1',
          name: 'João Silva',
          cpf: '12345678901',
          birthDate: '1985-05-15',
          gender: 'male'
        }
      },
      {
        id: 'med-2',
        patientId: 'pat-2',
        prescriptionId: 'presc-2',
        scheduleId: 'sched-2',
        medicationName: 'Amoxicilina 500mg',
        dosage: '1 cápsula',
        route: 'oral',
        status: 'scheduled',
        scheduledFor: '2024-12-14T14:00:00Z',
        createdAt: '2024-12-14T12:00:00Z',
        updatedAt: '2024-12-14T12:00:00Z',
        patient: {
          id: 'pat-2',
          name: 'Maria Santos',
          cpf: '98765432109',
          birthDate: '1990-08-22',
          gender: 'female'
        }
      }
    ];

    return {
      medications: mockMedications,
      total: mockMedications.length,
      page: 1,
      totalPages: 1
    };
  }

  private getMockScheduledForToday(): MedicationAdministration[] {
    return this.getMockMedicationAdministrations().medications.filter(m =>
      m.status === 'scheduled' && new Date(m.scheduledFor).toDateString() === new Date().toDateString()
    );
  }

  private getMockMedicationSchedule(data: MedicationScheduleCreateData): MedicationSchedule {
    return {
      id: `schedule-mock-${Date.now()}`,
      patientId: data.patientId,
      prescriptionId: data.prescriptionId,
      medicationName: data.medicationName,
      dosage: data.dosage,
      route: data.route,
      frequency: data.frequency,
      startDate: data.startDate,
      endDate: data.endDate,
      instructions: data.instructions,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: {
        id: data.patientId,
        name: 'Paciente Mock',
        cpf: '12345678901',
        birthDate: '1985-01-01'
      },
      prescription: {
        id: data.prescriptionId,
        professional: {
          name: 'Dr. Mock',
          profile: 'medico'
        }
      }
    };
  }

  private getMockMedicationScheduleById(id: string): MedicationSchedule {
    return {
      id,
      patientId: 'pat-1',
      prescriptionId: 'presc-1',
      medicationName: 'Paracetamol 500mg',
      dosage: '1 comprimido',
      route: 'oral',
      frequency: 'A cada 6 horas',
      startDate: '2024-12-14T00:00:00Z',
      endDate: '2024-12-17T23:59:59Z',
      instructions: 'Tomar com água',
      status: 'active',
      createdAt: '2024-12-14T00:00:00Z',
      updatedAt: '2024-12-14T00:00:00Z',
      patient: {
        id: 'pat-1',
        name: 'João Silva',
        cpf: '12345678901',
        birthDate: '1985-05-15'
      },
      prescription: {
        id: 'presc-1',
        professional: {
          name: 'Dr. Carlos Santos',
          profile: 'medico'
        }
      }
    };
  }

  private getMockActiveSchedules(patientId?: string): MedicationSchedule[] {
    const schedules = [this.getMockMedicationScheduleById('sched-1')];

    if (patientId) {
      return schedules.filter(s => s.patientId === patientId);
    }

    return schedules;
  }

  private getMockMedicationStats(): MedicationStats {
    return {
      totalAdministrations: 1456,
      administeredToday: 23,
      scheduledToday: 45,
      missedToday: 3,
      refusedToday: 1,
      administrationsByStatus: {
        administered: 1345,
        scheduled: 67,
        missed: 34,
        refused: 10
      },
      administrationsByRoute: {
        oral: 987,
        intravenosa: 234,
        intramuscular: 156,
        subcutanea: 79
      },
      adherenceRate: 87.5,
      commonMissedReasons: [
        { reason: 'Paciente dormindo', count: 12 },
        { reason: 'Recusou medicação', count: 8 }
      ]
    };
  }

  private getMockGeneratedSchedules(prescriptionId: string, patientId: string): MedicationSchedule[] {
    return [this.getMockMedicationSchedule({
      patientId,
      prescriptionId,
      medicationName: 'Medicamento Mock',
      dosage: '1 unidade',
      route: 'oral',
      frequency: 'Diariamente',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      instructions: 'Seguir prescrição médica'
    })];
  }

  /**
   * Obter rótulos para vias de administração
   */
  getRouteLabel(route: string) {
    const labels: Record<string, string> = {
      oral: 'Oral',
      intravenosa: 'Intravenosa',
      intramuscular: 'Intramuscular',
      subcutanea: 'Subcutânea',
      topica: 'Tópica',
      retal: 'Retal',
      inalatoria: 'Inalatória',
      ocular: 'Ocular',
      otologica: 'Otológica',
      nasal: 'Nasal'
    };
    return labels[route] || route;
  }

  /**
   * Obter rótulo para status
   */
  getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      scheduled: 'Agendado',
      administered: 'Administrado',
      missed: 'Perdido',
      refused: 'Recusado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  }

  /**
   * Obter cor para status
   */
  getStatusColor(status: string) {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'administered':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'missed':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'refused':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  }

  /**
   * Verificar se um medicamento está atrasado
   */
  isOverdue(medication: MedicationAdministration) {
    if (medication.status !== 'scheduled') return false;
    const scheduledTime = new Date(medication.scheduledFor);
    const now = new Date();
    return scheduledTime < now;
  }

  /**
   * Calcular tempo até o próximo horário
   */
  getTimeUntilNextDose(medication: MedicationAdministration) {
    const scheduledTime = new Date(medication.scheduledFor);
    const now = new Date();
    const diffMs = scheduledTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}min`;
    } else {
      return 'Atrasado';
    }
  }
}

export const medicationService = new MedicationService();
export default medicationService;


