import { PrismaClient } from '@prisma/client';

interface SecretaryMetrics {
  totalAppointments: number;
  appointmentsToday: number;
  pendingDocuments: number;
  completedDocuments: number;
  overdueDocuments: number;
  patientRegistrations: number;
}

interface Appointment {
  id: string;
  patientName: string;
  patientCpf: string;
  professionalName: string;
  specialty: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  type: 'consultation' | 'exam' | 'procedure';
  notes?: string;
}

interface Document {
  id: string;
  type: 'patient_registration' | 'insurance_form' | 'medical_record' | 'report' | 'certificate';
  title: string;
  patientName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  createdBy: string;
}

interface Alert {
  id: string;
  type: 'appointment' | 'document' | 'system' | 'patient';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  isRead: boolean;
  actionRequired?: boolean;
}

export class SecretaryService {
  constructor(private prisma: PrismaClient) {}

  async getSecretaryMetrics(secretaryId: string): Promise<SecretaryMetrics> {
    try {
      // Mock implementation - in real scenario, calculate from database
      return {
        totalAppointments: 156,
        appointmentsToday: 24,
        pendingDocuments: 18,
        completedDocuments: 89,
        overdueDocuments: 3,
        patientRegistrations: 42
      };
    } catch (error) {
      console.error('Error fetching secretary metrics:', error);
      throw new Error('Failed to fetch secretary metrics');
    }
  }

  async getAppointments(secretaryId: string, date?: string, status?: string): Promise<Appointment[]> {
    try {
      // Mock implementation - in real scenario, query database
      const appointments: Appointment[] = [
        {
          id: '1',
          patientName: 'João da Silva',
          patientCpf: '123.456.789-00',
          professionalName: 'Dr. Carlos Oliveira',
          specialty: 'Clínica Geral',
          date: new Date(),
          time: '09:00',
          status: 'confirmed',
          type: 'consultation',
          notes: 'Paciente com dor de cabeça frequente'
        },
        {
          id: '2',
          patientName: 'Maria Santos',
          patientCpf: '987.654.321-00',
          professionalName: 'Dra. Ana Costa',
          specialty: 'Pediatria',
          date: new Date(),
          time: '10:30',
          status: 'scheduled',
          type: 'consultation'
        },
        {
          id: '3',
          patientName: 'Pedro Oliveira',
          patientCpf: '456.789.123-00',
          professionalName: 'Dr. João Silva',
          specialty: 'Ortopedia',
          date: new Date(Date.now() + 86400000), // Tomorrow
          time: '14:00',
          status: 'scheduled',
          type: 'consultation'
        },
        {
          id: '4',
          patientName: 'Ana Paula',
          patientCpf: '789.123.456-00',
          professionalName: 'Dra. Maria Silva',
          specialty: 'Ginecologia',
          date: new Date(),
          time: '15:30',
          status: 'cancelled',
          type: 'consultation',
          notes: 'Paciente solicitou cancelamento'
        }
      ];

      if (date) {
        const targetDate = new Date(date);
        return appointments.filter(apt => 
          apt.date.toDateString() === targetDate.toDateString()
        );
      }

      if (status) {
        return appointments.filter(apt => apt.status === status);
      }

      return appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
  }

  async getDocuments(secretaryId: string, status?: string, type?: string): Promise<Document[]> {
    try {
      // Mock implementation - in real scenario, query database
      const documents: Document[] = [
        {
          id: '1',
          type: 'patient_registration',
          title: 'Cadastro - João da Silva',
          patientName: 'João da Silva',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date(Date.now() - 86400000), // Yesterday
          dueDate: new Date(Date.now() + 86400000), // Tomorrow
          createdBy: 'Recepcionista'
        },
        {
          id: '2',
          type: 'medical_record',
          title: 'Prontuário - Maria Santos',
          patientName: 'Maria Santos',
          status: 'in_progress',
          priority: 'high',
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
          dueDate: new Date(),
          createdBy: 'Secretário'
        },
        {
          id: '3',
          type: 'certificate',
          title: 'Atestado - Pedro Oliveira',
          patientName: 'Pedro Oliveira',
          status: 'completed',
          priority: 'urgent',
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
          completedAt: new Date(),
          createdBy: 'Médico'
        },
        {
          id: '4',
          type: 'insurance_form',
          title: 'Formulário Convênio - Ana Paula',
          patientName: 'Ana Paula',
          status: 'pending',
          priority: 'high',
          createdAt: new Date(Date.now() - 259200000), // 3 days ago
          dueDate: new Date(Date.now() - 86400000), // Yesterday
          createdBy: 'Recepcionista'
        }
      ];

      if (status) {
        return documents.filter(doc => doc.status === status);
      }

      if (type) {
        return documents.filter(doc => doc.type === type);
      }

      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents');
    }
  }

  async getAlerts(secretaryId: string): Promise<Alert[]> {
    try {
      // Mock implementation - in real scenario, query database
      return [
        {
          id: '1',
          type: 'appointment',
          title: 'Consulta em 15 minutos',
          description: 'João da Silva - Dr. Carlos Oliveira às 09:00',
          priority: 'medium',
          createdAt: new Date(Date.now() - 900000), // 15 minutes ago
          isRead: false,
          actionRequired: true
        },
        {
          id: '2',
          type: 'document',
          title: 'Documento vencendo',
          description: 'Formulário de convênio de Ana Paula vence hoje',
          priority: 'high',
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
          isRead: false,
          actionRequired: true
        },
        {
          id: '3',
          type: 'patient',
          title: 'Novo paciente cadastrado',
          description: 'Lucas Ferreira foi cadastrado com sucesso',
          priority: 'low',
          createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
          isRead: true,
          actionRequired: false
        },
        {
          id: '4',
          type: 'system',
          title: 'Sistema em manutenção',
          description: 'Manutenção programada para às 18:00',
          priority: 'medium',
          createdAt: new Date(Date.now() - 7200000), // 2 hours ago
          isRead: true,
          actionRequired: false
        }
      ];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw new Error('Failed to fetch alerts');
    }
  }

  async createAppointment(secretaryId: string, appointmentData: Partial<Appointment>): Promise<Appointment> {
    try {
      // Mock implementation - in real scenario, create in database
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientName: appointmentData.patientName || 'Paciente',
        patientCpf: appointmentData.patientCpf || '000.000.000-00',
        professionalName: appointmentData.professionalName || 'Profissional',
        specialty: appointmentData.specialty || 'Clínica Geral',
        date: appointmentData.date || new Date(),
        time: appointmentData.time || '09:00',
        status: 'scheduled',
        type: appointmentData.type || 'consultation',
        notes: appointmentData.notes
      };

      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new Error('Failed to create appointment');
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: Appointment['status']): Promise<Appointment> {
    try {
      // Mock implementation - in real scenario, update in database
      return {
        id: appointmentId,
        patientName: 'João da Silva',
        patientCpf: '123.456.789-00',
        professionalName: 'Dr. Carlos Oliveira',
        specialty: 'Clínica Geral',
        date: new Date(),
        time: '09:00',
        status: status,
        type: 'consultation'
      };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw new Error('Failed to update appointment status');
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      // Mock implementation - in real scenario, update in database
      console.log(`Alert ${alertId} marked as read`);
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw new Error('Failed to mark alert as read');
    }
  }
}