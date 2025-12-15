import { PrismaClient } from '@prisma/client';

export interface ReceptionistMetrics {
  totalAppointments: number;
  pendingCheckIns: number;
  completedCheckIns: number;
  averageWaitTime: number;
  dailyAppointments: number;
  monthlyAppointments: number;
}

export interface PatientQueueItem {
  id: string;
  patientName: string;
  patientCpf: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'waiting' | 'in_consultation' | 'completed' | 'canceled';
  estimatedWaitTime: number;
  checkInTime: Date;
  appointmentType: 'consultation' | 'emergency' | 'exam' | 'procedure';
  doctorName?: string;
  room?: string;
}

export interface CheckInData {
  patientId: string;
  appointmentType: 'consultation' | 'emergency' | 'exam' | 'procedure';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

export interface AppointmentData {
  id: string;
  patientName: string;
  patientCpf: string;
  doctorName: string;
  date: Date;
  time: string;
  type: 'consultation' | 'emergency' | 'exam' | 'procedure';
  status: 'scheduled' | 'confirmed' | 'waiting' | 'in_consultation' | 'completed' | 'canceled';
  room?: string;
  notes?: string;
}

export interface ReceptionistAlert {
  id: string;
  type: 'patient_waiting' | 'doctor_delay' | 'room_available' | 'emergency';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  read: boolean;
}

export class ReceptionistService {
  constructor(private prisma: PrismaClient) {}

  async getReceptionistMetrics(receptionistId: string): Promise<ReceptionistMetrics> {
    try {
      // Mock implementation since models don't exist
      return {
        totalAppointments: 156,
        pendingCheckIns: 12,
        completedCheckIns: 89,
        averageWaitTime: 25,
        dailyAppointments: 34,
        monthlyAppointments: 678
      };
    } catch (error) {
      console.error('Error fetching receptionist metrics:', error);
      throw new Error('Failed to fetch receptionist metrics');
    }
  }

  async getPatientQueue(receptionistId: string): Promise<PatientQueueItem[]> {
    try {
      // Mock implementation since models don't exist
      return [
        {
          id: '1',
          patientName: 'Maria Silva',
          patientCpf: '123.456.789-00',
          priority: 'high',
          status: 'waiting',
          estimatedWaitTime: 15,
          checkInTime: new Date(),
          appointmentType: 'consultation',
          doctorName: 'Dr. João Santos',
          room: 'Sala 1'
        },
        {
          id: '2',
          patientName: 'João Oliveira',
          patientCpf: '987.654.321-00',
          priority: 'medium',
          status: 'waiting',
          estimatedWaitTime: 30,
          checkInTime: new Date(),
          appointmentType: 'consultation',
          doctorName: 'Dr. Ana Costa',
          room: 'Sala 2'
        }
      ];
    } catch (error) {
      console.error('Error fetching patient queue:', error);
      throw new Error('Failed to fetch patient queue');
    }
  }

  async processCheckIn(receptionistId: string, checkInData: CheckInData): Promise<PatientQueueItem> {
    try {
      // Mock implementation since models don't exist
      return {
        id: '3',
        patientName: 'Carlos Souza',
        patientCpf: '456.789.123-00',
        priority: checkInData.priority || 'low',
        status: 'waiting',
        estimatedWaitTime: 20,
        checkInTime: new Date(),
        appointmentType: checkInData.appointmentType,
        room: 'Sala 3'
      };
    } catch (error) {
      console.error('Error processing check-in:', error);
      throw new Error('Failed to process check-in');
    }
  }

  async getAppointments(receptionistId: string, date: Date): Promise<AppointmentData[]> {
    try {
      // Mock implementation since models don't exist
      return [
        {
          id: '1',
          patientName: 'Maria Silva',
          patientCpf: '123.456.789-00',
          doctorName: 'Dr. João Santos',
          date: date,
          time: '09:00',
          type: 'consultation',
          status: 'scheduled',
          room: 'Sala 1',
          notes: 'Paciente hipertensa'
        },
        {
          id: '2',
          patientName: 'João Oliveira',
          patientCpf: '987.654.321-00',
          doctorName: 'Dr. Ana Costa',
          date: date,
          time: '10:30',
          type: 'consultation',
          status: 'confirmed',
          room: 'Sala 2',
          notes: 'Rotina'
        }
      ];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
  }

  async updateAppointmentStatus(receptionistId: string, appointmentId: string, status: string): Promise<AppointmentData> {
    try {
      // Mock implementation since models don't exist
      return {
        id: appointmentId,
        patientName: 'Maria Silva',
        patientCpf: '123.456.789-00',
        doctorName: 'Dr. João Santos',
        date: new Date(),
        time: '09:00',
        type: 'consultation',
        status: status as any,
        room: 'Sala 1',
        notes: 'Status atualizado'
      };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  async getAlerts(receptionistId: string): Promise<ReceptionistAlert[]> {
    try {
      // Mock implementation since models don't exist
      return [
        {
          id: '1',
          type: 'patient_waiting',
          title: 'Paciente aguardando',
          message: 'Maria Silva está aguardando há 30 minutos',
          priority: 'medium',
          createdAt: new Date(),
          read: false
        },
        {
          id: '2',
          type: 'doctor_delay',
          title: 'Atraso médico',
          message: 'Dr. João Santos está atrasado 15 minutos',
          priority: 'low',
          createdAt: new Date(),
          read: false
        }
      ];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw new Error('Failed to fetch alerts');
    }
  }

  async markAlertAsRead(receptionistId: string, alertId: string): Promise<boolean> {
    try {
      // Mock implementation since models don't exist
      return true;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw new Error('Failed to mark alert as read');
    }
  }

  // Additional methods required by routes
  async getDashboardMetrics(receptionistId: string): Promise<ReceptionistMetrics> {
    return this.getReceptionistMetrics(receptionistId);
  }

  async getTodayAppointments(receptionistId: string): Promise<AppointmentData[]> {
    const today = new Date();
    return this.getAppointments(receptionistId, today);
  }

  async getCurrentQueue(receptionistId: string): Promise<PatientQueueItem[]> {
    return this.getPatientQueue(receptionistId);
  }

  async getActiveAlerts(receptionistId: string): Promise<ReceptionistAlert[]> {
    return this.getAlerts(receptionistId);
  }

  async checkInPatient(receptionistId: string, appointmentId: string): Promise<boolean> {
    try {
      // Mock implementation since models don't exist
      return true;
    } catch (error) {
      console.error('Error checking in patient:', error);
      throw new Error('Failed to check in patient');
    }
  }

  async checkOutPatient(receptionistId: string, appointmentId: string): Promise<boolean> {
    try {
      // Mock implementation since models don't exist
      return true;
    } catch (error) {
      console.error('Error checking out patient:', error);
      throw new Error('Failed to check out patient');
    }
  }

  async registerWalkInPatient(receptionistId: string, patientData: any): Promise<AppointmentData> {
    try {
      // Mock implementation since models don't exist
      return {
        id: 'walk-in-1',
        patientName: patientData.name || 'Paciente Sem Nome',
        patientCpf: patientData.cpf || '000.000.000-00',
        doctorName: 'Dr. Disponível',
        date: new Date(),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'emergency',
        status: 'waiting',
        room: 'Sala de Emergência'
      };
    } catch (error) {
      console.error('Error registering walk-in patient:', error);
      throw new Error('Failed to register walk-in patient');
    }
  }

  async getDailyReport(receptionistId: string, date: Date): Promise<any> {
    try {
      // Mock implementation since models don't exist
      return {
        date: date,
        totalAppointments: 45,
        completedAppointments: 38,
        canceledAppointments: 3,
        noShowAppointments: 4,
        averageWaitTime: 18,
        totalPatients: 42,
        newPatients: 5
      };
    } catch (error) {
      console.error('Error getting daily report:', error);
      throw new Error('Failed to get daily report');
    }
  }

  async getWeeklySchedule(receptionistId: string): Promise<any> {
    try {
      // Mock implementation since models don't exist
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      return {
        weekStart: weekStart,
        weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
        totalAppointments: 180,
        availableSlots: 45,
        bookedSlots: 135,
        doctors: [
          { name: 'Dr. João Santos', appointments: 25 },
          { name: 'Dr. Ana Costa', appointments: 30 },
          { name: 'Dr. Pedro Silva', appointments: 20 }
        ]
      };
    } catch (error) {
      console.error('Error getting weekly schedule:', error);
      throw new Error('Failed to get weekly schedule');
    }
  }
}