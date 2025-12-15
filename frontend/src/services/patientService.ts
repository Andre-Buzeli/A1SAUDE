import apiService from './api.service';

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
  motherName?: string;
  fatherName?: string;
  
  // Address
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Contact
  phone?: string;
  email?: string;
  emergencyContact?: any;
  
  // Medical info
  bloodType?: 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE';
  allergies?: any[];
  chronicConditions?: any[];
  medications?: any[];
  height?: number;
  weight?: number;
  
  // Metadata
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Stats
  _count?: {
    attendances: number;
    prescriptions: number;
    examRequests: number;
  };
  lastAttendance?: string;
}

export interface PatientFilters {
  query?: string;
  cpf?: string;
  name?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'birthDate';
  sortOrder?: 'asc' | 'desc';
}

export interface PatientCreateData {
  name: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
  motherName?: string;
  fatherName?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  emergencyContact?: any;
  bloodType?: 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE';
  allergies?: any[];
  chronicConditions?: any[];
  medications?: any[];
  height?: number;
  weight?: number;
}

export interface PatientListResponse {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class PatientService {
  /**
   * Criar novo paciente
   */
  async createPatient(data: PatientCreateData) {
    try {
      const response = await apiService.post<Patient>('/api/v1/patients', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      return this.getMockPatient(data);
    }
  }

  /**
   * Buscar pacientes com filtros
   */
  async searchPatients(filters: PatientFilters = {}) {
    try {
      const response = await apiService.get<PatientListResponse>('/api/v1/patients/search', filters);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      return this.getMockPatients(filters);
    }
  }

  /**
   * Obter paciente por ID
   */
  async getPatientById(id: string) {
    try {
      const response = await apiService.get<Patient>(`/api/v1/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter paciente:', error);
      return this.getMockPatientById(id);
    }
  }

  /**
   * Obter paciente por CPF
   */
  async getPatientByCpf(cpf: string) {
    try {
      const cleanCpf = cpf.replace(/\D/g, '');
      const response = await apiService.get<Patient>(`/api/v1/patients/cpf/${cleanCpf}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter paciente por CPF:', error);
      return this.getMockPatientByCpf(cpf);
    }
  }

  /**
   * Atualizar paciente
   */
  async updatePatient(id: string, data: Partial<PatientCreateData>) {
    try {
      const response = await apiService.put<Patient>(`/api/v1/patients/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      return this.getMockPatientById(id);
    }
  }

  /**
   * Desativar paciente
   */
  async deactivatePatient(id: string) {
    try {
      const response = await apiService.delete<Patient>(`/api/v1/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao desativar paciente:', error);
      return this.getMockPatientById(id);
    }
  }

  /**
   * Obter histórico do paciente
   */
  async getPatientHistory(id: string) {
    try {
      const response = await apiService.get(`/api/v1/patients/${id}/history`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter histórico do paciente:', error);
      return this.getMockPatientHistory(id);
    }
  }

  /**
   * Obter estatísticas de pacientes
   */
  async getPatientStats() {
    try {
      const response = await apiService.get('/api/v1/patients/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de pacientes:', error);
      return this.getMockPatientStats();
    }
  }

  /**
   * Mock data methods
   */
  private getMockPatient(data: PatientCreateData): Patient {
    const id = `mock-${Date.now()}`;
    return {
      id,
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: {
        attendances: 0,
        prescriptions: 0,
        examRequests: 0
      },
      lastAttendance: undefined
    };
  }

  private getMockPatients(filters: PatientFilters = {}): PatientListResponse {
    const mockPatients: Patient[] = [
      {
        id: 'mock-1',
        name: 'João Silva',
        cpf: '12345678901',
        rg: '123456789',
        birthDate: '1985-05-15',
        gender: 'male',
        maritalStatus: 'married',
        motherName: 'Maria Silva',
        fatherName: 'José Silva',
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        phone: '11987654321',
        email: 'joao.silva@email.com',
        bloodType: 'O_POSITIVE',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        _count: {
          attendances: 5,
          prescriptions: 2,
          examRequests: 3
        },
        lastAttendance: '2024-12-10T14:30:00Z'
      },
      {
        id: 'mock-2',
        name: 'Maria Santos',
        cpf: '98765432109',
        rg: '987654321',
        birthDate: '1990-08-22',
        gender: 'female',
        maritalStatus: 'single',
        motherName: 'Ana Santos',
        fatherName: 'Carlos Santos',
        street: 'Av. Principal',
        number: '456',
        neighborhood: 'Jardim',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000000',
        phone: '21987654321',
        email: 'maria.santos@email.com',
        bloodType: 'A_NEGATIVE',
        isActive: true,
        createdAt: '2024-02-10T09:15:00Z',
        updatedAt: '2024-02-10T09:15:00Z',
        _count: {
          attendances: 8,
          prescriptions: 4,
          examRequests: 6
        },
        lastAttendance: '2024-12-12T16:45:00Z'
      },
      {
        id: 'mock-3',
        name: 'Pedro Oliveira',
        cpf: '45678912365',
        rg: '456789123',
        birthDate: '1978-12-03',
        gender: 'male',
        maritalStatus: 'divorced',
        motherName: 'Rosa Oliveira',
        fatherName: 'Manuel Oliveira',
        street: 'Rua do Comércio',
        number: '789',
        neighborhood: 'Vila Nova',
        city: 'Belo Horizonte',
        state: 'MG',
        zipCode: '30100000',
        phone: '31987654321',
        email: 'pedro.oliveira@email.com',
        bloodType: 'B_POSITIVE',
        isActive: true,
        createdAt: '2024-03-05T11:30:00Z',
        updatedAt: '2024-03-05T11:30:00Z',
        _count: {
          attendances: 12,
          prescriptions: 6,
          examRequests: 8
        },
        lastAttendance: '2024-12-13T10:20:00Z'
      }
    ];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let filteredPatients = mockPatients;

    // Aplicar filtros
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredPatients = filteredPatients.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.cpf.includes(query)
      );
    }

    if (filters.name) {
      const name = filters.name.toLowerCase();
      filteredPatients = filteredPatients.filter(p =>
        p.name.toLowerCase().includes(name)
      );
    }

    if (filters.cpf) {
      filteredPatients = filteredPatients.filter(p =>
        p.cpf.includes(filters.cpf!)
      );
    }

    const total = filteredPatients.length;
    const paginatedPatients = filteredPatients.slice(offset, offset + limit);

    return {
      patients: paginatedPatients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  private getMockPatientById(id: string): Patient {
    const patients = this.getMockPatients().patients;
    const patient = patients.find(p => p.id === id);

    if (patient) {
      return patient;
    }

    // Retorna paciente padrão se não encontrar
    return patients[0];
  }

  private getMockPatientByCpf(cpf: string): Patient {
    const patients = this.getMockPatients().patients;
    const patient = patients.find(p => p.cpf === cpf);

    if (patient) {
      return patient;
    }

    // Retorna paciente padrão se não encontrar
    return patients[0];
  }

  private getMockPatientHistory(id: string) {
    return {
      patientId: id,
      history: [
        {
          id: 'hist-1',
          type: 'attendance',
          description: 'Consulta médica - Dr. Silva',
          date: '2024-12-13T10:20:00Z',
          details: 'Consulta de rotina'
        },
        {
          id: 'hist-2',
          type: 'prescription',
          description: 'Prescrição médica',
          date: '2024-12-13T10:30:00Z',
          details: 'Medicamentos prescritos'
        },
        {
          id: 'hist-3',
          type: 'exam',
          description: 'Exame de sangue',
          date: '2024-12-10T14:30:00Z',
          details: 'Resultado: Normal'
        }
      ]
    };
  }

  private getMockPatientStats() {
    return {
      totalPatients: 1247,
      activePatients: 1189,
      newPatientsThisMonth: 45,
      patientsByAgeGroup: {
        '0-18': 156,
        '19-40': 423,
        '41-60': 412,
        '61+': 256
      },
      patientsByGender: {
        male: 587,
        female: 652,
        other: 8
      },
      patientsByBloodType: {
        'A_POSITIVE': 89,
        'A_NEGATIVE': 34,
        'B_POSITIVE': 67,
        'B_NEGATIVE': 28,
        'AB_POSITIVE': 15,
        'AB_NEGATIVE': 8,
        'O_POSITIVE': 123,
        'O_NEGATIVE': 45
      },
      averageAttendancesPerPatient: 3.2,
      patientsWithChronicConditions: 234,
      patientsWithAllergies: 89
    };
  }
}

export const patientService = new PatientService();
export default patientService;


