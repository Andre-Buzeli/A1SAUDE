/**
 * Serviço de RH / Gestão de Pessoas - Frontend
 * Sistema A1 Saúde
 */

import apiService from './api.service';

// ==================== TYPES ====================

export interface Employee {
  id: string;
  registrationNumber: string;
  name: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  nationality: string;
  
  // Endereço
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Contato
  phone: string;
  email: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Profissional
  position: string;
  department: string;
  establishmentId: string;
  admissionDate: string;
  terminationDate?: string;
  terminationReason?: string;
  
  // Contrato
  contractType: 'CLT' | 'PJ' | 'TEMP' | 'INTERN' | 'STATUTORY';
  baseSalary: number;
  workHours: number;
  scaleType: '12x36' | '24x48' | '5x2' | '6x1' | 'ADM';
  
  // Dados Bancários
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  pixKey?: string;
  
  documents?: string;
  userId?: string;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  establishment?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn1?: string;
  clockOut1?: string;
  clockIn2?: string;
  clockOut2?: string;
  overtimeMinutes: number;
  lateMinutes: number;
  absentMinutes: number;
  status: 'pending' | 'approved' | 'rejected' | 'justified';
  justification?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  employee?: {
    name: string;
    registrationNumber: string;
  };
}

export interface Vacation {
  id: string;
  employeeId: string;
  referenceYear: number;
  startDate: string;
  endDate: string;
  daysTotal: number;
  daysUsed: number;
  sellDays: number;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  employee?: {
    name: string;
    registrationNumber: string;
    department: string;
  };
}

export interface Leave {
  id: string;
  employeeId: string;
  leaveType: 'medical' | 'maternity' | 'paternity' | 'bereavement' | 'marriage' | 'study' | 'unpaid' | 'other';
  startDate: string;
  endDate?: string;
  expectedReturn?: string;
  actualReturn?: string;
  documentNumber?: string;
  documentUrl?: string;
  status: 'active' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
  employee?: {
    name: string;
    registrationNumber: string;
    department: string;
  };
}

export interface WorkSchedule {
  id: string;
  name: string;
  establishmentId: string;
  department?: string;
  scaleType: '12x36' | '24x48' | '5x2' | '6x1' | 'custom';
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface ScheduleAssignment {
  id: string;
  scheduleId: string;
  employeeId: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  shiftType: 'day' | 'night' | 'off' | 'vacation' | 'leave';
  status: 'scheduled' | 'confirmed' | 'swapped' | 'cancelled';
  swappedWith?: string;
  notes?: string;
  employee?: {
    name: string;
    registrationNumber: string;
  };
}

export interface EmployeeStats {
  total: number;
  byCLT: number;
  byPJ: number;
  byDepartment: Record<string, number>;
  byPosition: Record<string, number>;
  averageSalary: number;
  totalPayroll: number;
}

export interface RHDashboardData {
  stats: EmployeeStats;
  alerts: {
    pendingVacations: number;
    activeLeaves: number;
    todayAbsent: number;
  };
  recentHires: {
    id: string;
    name: string;
    position: string;
    department: string;
    admissionDate: string;
  }[];
}

export interface EmployeeFilters {
  query?: string;
  establishmentId?: string;
  department?: string;
  contractType?: string;
  position?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ==================== SERVICE ====================

class RHService {
  private baseUrl = '/api/v1/rh';

  // ==================== DASHBOARD ====================

  async getDashboard(establishmentId?: string): Promise<RHDashboardData> {
    const params = establishmentId ? { establishmentId } : {};
    const response = await apiService.get(`${this.baseUrl}/dashboard`, params);
    return response.data;
  }

  async getStats(establishmentId?: string): Promise<EmployeeStats> {
    const params = establishmentId ? { establishmentId } : {};
    const response = await apiService.get(`${this.baseUrl}/stats`, params);
    return response.data;
  }

  // ==================== EMPLOYEES ====================

  async getEmployees(filters: EmployeeFilters = {}): Promise<{
    employees: Employee[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiService.get(`${this.baseUrl}/employees`, filters);
    return response.data;
  }

  async getEmployeeById(id: string): Promise<Employee> {
    const response = await apiService.get(`${this.baseUrl}/employees/${id}`);
    return response.data;
  }

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const response = await apiService.post(`${this.baseUrl}/employees`, data);
    return response.data;
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    const response = await apiService.put(`${this.baseUrl}/employees/${id}`, data);
    return response.data;
  }

  async terminateEmployee(id: string, reason: string, terminationDate: string): Promise<Employee> {
    const response = await apiService.post(`${this.baseUrl}/employees/${id}/terminate`, {
      reason,
      terminationDate
    });
    return response.data;
  }

  // ==================== TIME RECORDS ====================

  async getTimeRecords(employeeId: string, startDate: string, endDate: string): Promise<TimeRecord[]> {
    const response = await apiService.get(`${this.baseUrl}/time-records`, {
      employeeId,
      startDate,
      endDate
    });
    return response.data;
  }

  async clockIn(employeeId: string, timestamp?: string): Promise<TimeRecord> {
    const response = await apiService.post(`${this.baseUrl}/time-records/clock-in`, {
      employeeId,
      timestamp
    });
    return response.data;
  }

  async clockOut(employeeId: string, timestamp?: string): Promise<TimeRecord> {
    const response = await apiService.post(`${this.baseUrl}/time-records/clock-out`, {
      employeeId,
      timestamp
    });
    return response.data;
  }

  async approveTimeRecord(id: string): Promise<TimeRecord> {
    const response = await apiService.post(`${this.baseUrl}/time-records/${id}/approve`);
    return response.data;
  }

  async justifyTimeRecord(id: string, justification: string): Promise<TimeRecord> {
    const response = await apiService.post(`${this.baseUrl}/time-records/${id}/justify`, {
      justification
    });
    return response.data;
  }

  // ==================== VACATIONS ====================

  async getVacations(filters: {
    employeeId?: string;
    status?: string;
    year?: number;
  } = {}): Promise<Vacation[]> {
    const response = await apiService.get(`${this.baseUrl}/vacations`, filters);
    return response.data;
  }

  async requestVacation(data: {
    employeeId: string;
    referenceYear: number;
    startDate: string;
    endDate: string;
    daysTotal: number;
    sellDays?: number;
    notes?: string;
  }): Promise<Vacation> {
    const response = await apiService.post(`${this.baseUrl}/vacations`, data);
    return response.data;
  }

  async approveVacation(id: string): Promise<Vacation> {
    const response = await apiService.post(`${this.baseUrl}/vacations/${id}/approve`);
    return response.data;
  }

  async rejectVacation(id: string, reason: string): Promise<Vacation> {
    const response = await apiService.post(`${this.baseUrl}/vacations/${id}/reject`, { reason });
    return response.data;
  }

  // ==================== LEAVES ====================

  async getLeaves(filters: {
    employeeId?: string;
    status?: string;
    leaveType?: string;
  } = {}): Promise<Leave[]> {
    const response = await apiService.get(`${this.baseUrl}/leaves`, filters);
    return response.data;
  }

  async createLeave(data: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate?: string;
    expectedReturn?: string;
    documentNumber?: string;
    documentUrl?: string;
    reason: string;
    notes?: string;
  }): Promise<Leave> {
    const response = await apiService.post(`${this.baseUrl}/leaves`, data);
    return response.data;
  }

  async endLeave(id: string, actualReturn: string): Promise<Leave> {
    const response = await apiService.post(`${this.baseUrl}/leaves/${id}/end`, { actualReturn });
    return response.data;
  }

  // ==================== SCHEDULES ====================

  async getSchedules(establishmentId?: string): Promise<WorkSchedule[]> {
    const params = establishmentId ? { establishmentId } : {};
    const response = await apiService.get(`${this.baseUrl}/schedules`, params);
    return response.data;
  }

  async createSchedule(data: {
    name: string;
    establishmentId: string;
    department?: string;
    scaleType: string;
    startDate: string;
    endDate?: string;
  }): Promise<WorkSchedule> {
    const response = await apiService.post(`${this.baseUrl}/schedules`, data);
    return response.data;
  }

  async getScheduleAssignments(
    scheduleId: string,
    startDate: string,
    endDate: string
  ): Promise<ScheduleAssignment[]> {
    const response = await apiService.get(`${this.baseUrl}/schedules/${scheduleId}/assignments`, {
      startDate,
      endDate
    });
    return response.data;
  }

  async assignToSchedule(
    scheduleId: string,
    employeeId: string,
    date: string,
    shift: { start: string; end: string; type: string }
  ): Promise<ScheduleAssignment> {
    const response = await apiService.post(`${this.baseUrl}/schedules/${scheduleId}/assign`, {
      employeeId,
      date,
      shift
    });
    return response.data;
  }

  async swapShifts(assignment1Id: string, assignment2Id: string): Promise<{ success: boolean }> {
    const response = await apiService.post(`${this.baseUrl}/schedules/swap`, {
      assignment1Id,
      assignment2Id
    });
    return response.data;
  }

  // ==================== HELPERS ====================

  getContractTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      CLT: 'CLT',
      PJ: 'Pessoa Jurídica',
      TEMP: 'Temporário',
      INTERN: 'Estagiário',
      STATUTORY: 'Estatutário'
    };
    return labels[type] || type;
  }

  getLeaveTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      medical: 'Atestado Médico',
      maternity: 'Licença Maternidade',
      paternity: 'Licença Paternidade',
      bereavement: 'Licença Luto',
      marriage: 'Licença Casamento',
      study: 'Licença para Estudos',
      unpaid: 'Licença não Remunerada',
      other: 'Outros'
    };
    return labels[type] || type;
  }

  getScaleTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      '12x36': '12x36',
      '24x48': '24x48',
      '5x2': '5x2 (Seg-Sex)',
      '6x1': '6x1',
      ADM: 'Administrativo',
      custom: 'Personalizado'
    };
    return labels[type] || type;
  }

  getVacationStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      in_progress: 'Em andamento',
      completed: 'Concluído'
    };
    return labels[status] || status;
  }

  getVacationStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status] || colors.pending;
  }
}

export const rhService = new RHService();
export default rhService;

