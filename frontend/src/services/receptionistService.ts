import { api } from './api';

export interface ReceptionistMetrics {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  walkInPatients: number;
  averageWaitTime: number;
  patientSatisfaction: number;
}

export interface AppointmentData {
  id: string;
  patientName: string;
  patientId: string;
  professionalName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'exam' | 'procedure';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  checkInTime?: string;
  estimatedDuration: number;
}

export interface QueueItem {
  id: string;
  patientName: string;
  patientId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedWaitTime: number;
  position: number;
  specialty: string;
  checkInTime: string;
  status: 'waiting' | 'called' | 'in-consultation' | 'completed';
}

export interface ReceptionistAlert {
  id: string;
  type: 'overdue-appointment' | 'long-wait' | 'no-show' | 'cancellation' | 'urgent-patient';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  patientName?: string;
  appointmentId?: string;
}

export interface DailyReport {
  date: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  walkInPatients: number;
  averageWaitTime: number;
  patientSatisfaction: number;
  revenue: number;
  mostRequestedSpecialties: Array<{
    specialty: string;
    count: number;
    percentage: number;
  }>;
}

export interface WalkInPatientData {
  name: string;
  cpf: string;
  phone: string;
  specialty: string;
  priority: string;
  reason: string;
}

export class ReceptionistService {
  private api = api;

  async getDashboardMetrics(): Promise<ReceptionistMetrics> {
    try {
      const response = await this.api.get('/receptionist/dashboard-metrics');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Mock data fallback
      return {
        totalAppointments: 45,
        confirmedAppointments: 32,
        pendingAppointments: 8,
        cancelledAppointments: 3,
        noShowAppointments: 2,
        walkInPatients: 12,
        averageWaitTime: 18,
        patientSatisfaction: 4.2
      };
    }
  }

  async getTodayAppointments(): Promise<AppointmentData[]> {
    try {
      const response = await this.api.get('/receptionist/today-appointments');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      // Mock data fallback
      const today = new Date().toISOString().split('T')[0];
      return [
        {
          id: '1',
          patientName: 'Maria Silva',
          patientId: 'P001',
          professionalName: 'Dr. João Santos',
          specialty: 'Clínico Geral',
          date: today,
          time: '09:00',
          status: 'confirmed',
          type: 'consultation',
          priority: 'medium',
          estimatedDuration: 30
        },
        {
          id: '2',
          patientName: 'Pedro Oliveira',
          patientId: 'P002',
          professionalName: 'Dra. Ana Costa',
          specialty: 'Pediatria',
          date: today,
          time: '09:30',
          status: 'scheduled',
          type: 'consultation',
          priority: 'high',
          estimatedDuration: 25
        }
      ];
    }
  }

  async getCurrentQueue(): Promise<QueueItem[]> {
    try {
      const response = await this.api.get('/receptionist/current-queue');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching current queue:', error);
      // Mock data fallback
      return [
        {
          id: '1',
          patientName: 'Carlos Mendes',
          patientId: 'P003',
          priority: 'medium',
          estimatedWaitTime: 5,
          position: 1,
          specialty: 'Ortopedia',
          checkInTime: '09:55',
          status: 'in-consultation'
        }
      ];
    }
  }

  async getActiveAlerts(): Promise<ReceptionistAlert[]> {
    try {
      const response = await this.api.get('/receptionist/active-alerts');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      // Mock data fallback
      return [
        {
          id: '1',
          type: 'overdue-appointment',
          title: 'Consulta Atrasada',
          message: 'Paciente Carlos Mendes está há 10 minutos em espera',
          severity: 'medium',
          timestamp: new Date().toISOString(),
          patientName: 'Carlos Mendes',
          appointmentId: '3'
        }
      ];
    }
  }

  async checkInPatient(appointmentId: string): Promise<void> {
    try {
      await this.api.post(`/receptionist/check-in/${appointmentId}`);
    } catch (error) {
      console.error('Error checking in patient:', error);
      throw new Error('Erro ao fazer check-in do paciente');
    }
  }

  async checkOutPatient(appointmentId: string): Promise<void> {
    try {
      await this.api.post(`/receptionist/check-out/${appointmentId}`);
    } catch (error) {
      console.error('Error checking out patient:', error);
      throw new Error('Erro ao fazer check-out do paciente');
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
    try {
      await this.api.patch(`/receptionist/appointment-status/${appointmentId}`, { status });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw new Error('Erro ao atualizar status do compromisso');
    }
  }

  async registerWalkInPatient(patientData: WalkInPatientData): Promise<AppointmentData> {
    try {
      const response = await this.api.post('/receptionist/walk-in-patient', patientData);
      return response.data.data;
    } catch (error) {
      console.error('Error registering walk-in patient:', error);
      throw new Error('Erro ao registrar paciente sem horário marcado');
    }
  }

  async getDailyReport(date: string): Promise<DailyReport> {
    try {
      const response = await this.api.get(`/receptionist/daily-report/${date}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching daily report:', error);
      // Mock data fallback
      return {
        date,
        totalAppointments: 45,
        completedAppointments: 38,
        cancelledAppointments: 4,
        noShowAppointments: 3,
        walkInPatients: 12,
        averageWaitTime: 18,
        patientSatisfaction: 4.2,
        revenue: 2850.00,
        mostRequestedSpecialties: [
          { specialty: 'Clínico Geral', count: 15, percentage: 33.3 },
          { specialty: 'Pediatria', count: 8, percentage: 17.8 }
        ]
      };
    }
  }

  async getWeeklySchedule(): Promise<any[]> {
    try {
      const response = await this.api.get('/receptionist/weekly-schedule');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
      // Mock data fallback
      const today = new Date();
      const weekDays = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        weekDays.push({
          date: date.toISOString().split('T')[0],
          dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
          totalAppointments: Math.floor(Math.random() * 20) + 25,
          availableSlots: Math.floor(Math.random() * 10) + 5,
          busySlots: Math.floor(Math.random() * 15) + 10
        });
      }
      
      return weekDays;
    }
  }
}

export const receptionistService = new ReceptionistService();