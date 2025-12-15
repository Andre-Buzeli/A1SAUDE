import { apiService } from './api.service';

export interface MedicalMetrics {
  totalPatients: number;
  todayAttendances: number;
  pendingAttendances: number;
  completedAttendances: number;
  averageWaitTime: number;
  criticalPatients: number;
  prescriptionsToday: number;
  examsRequested: number;
  establishmentSpecificMetrics: any;
}

export interface RecentAttendance {
  id: string;
  startTime: string;
  status: string;
  chiefComplaint: string;
  patient: {
    id: string;
    name: string;
    cpf: string;
  };
  professional: {
    id: string;
    name: string;
    profile: string;
  };
  triage?: {
    priority: string;
  };
}

export interface UpcomingAppointment {
  id: string;
  startTime: string;
  status: string;
  patient: {
    id: string;
    name: string;
    cpf: string;
  };
  professional: {
    id: string;
    name: string;
    profile: string;
  };
}

export interface MedicalDashboardData {
  metrics: MedicalMetrics;
  recentAttendances: RecentAttendance[];
  upcomingAppointments: UpcomingAppointment[];
  establishmentInfo: {
    id: string;
    name: string;
    type: string;
  };
}

export class MedicalDashboardService {
  
  async getDashboard(establishmentType: 'hospital' | 'upa' | 'ubs'): Promise<MedicalDashboardData> {
    const response = await apiService.get(`/medical/dashboard/${establishmentType}`);
    return response.data;
  }

  async getMetrics(establishmentType: 'hospital' | 'upa' | 'ubs'): Promise<MedicalMetrics> {
    const response = await apiService.get(`/medical/dashboard/${establishmentType}/metrics`);
    return response.data;
  }

  async getRecentAttendances(limit: number = 10): Promise<RecentAttendance[]> {
    const response = await apiService.get(`/medical/recent-attendances?limit=${limit}`);
    return response.data;
  }

  async getUpcomingAppointments(limit: number = 10): Promise<UpcomingAppointment[]> {
    const response = await apiService.get(`/medical/upcoming-appointments?limit=${limit}`);
    return response.data;
  }
}

export const medicalDashboardService = new MedicalDashboardService();