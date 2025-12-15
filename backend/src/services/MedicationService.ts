import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const createMedicationAdministrationSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  prescriptionId: z.string().optional(),
  attendanceId: z.string().optional(),
  medicationName: z.string().min(1, 'Nome do medicamento é obrigatório'),
  dosage: z.string().min(1, 'Dosagem é obrigatória'),
  route: z.enum(['oral', 'iv', 'im', 'subcutaneous', 'topical', 'inhaled', 'rectal', 'vaginal']),
  frequency: z.string().min(1, 'Frequência é obrigatória'),
  scheduledFor: z.date().optional(),
  administeredAt: z.date().optional(),
  administeredBy: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'administered', 'missed', 'held']).default('scheduled')
});

const updateMedicationAdministrationSchema = createMedicationAdministrationSchema.partial();

const createMedicationScheduleSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  prescriptionId: z.string().min(1, 'ID da prescrição é obrigatório'),
  medicationName: z.string().min(1, 'Nome do medicamento é obrigatório'),
  dosage: z.string().min(1, 'Dosagem é obrigatória'),
  route: z.enum(['oral', 'iv', 'im', 'subcutaneous', 'topical', 'inhaled', 'rectal', 'vaginal']),
  frequency: z.string().min(1, 'Frequência é obrigatória'),
  startDate: z.date(),
  endDate: z.date().optional(),
  scheduledTimes: z.array(z.date()),
  notes: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).default('active')
});

// Types
interface MedicationAdministrationWithDetails {
  id: string;
  patientId: string;
  prescriptionId?: string;
  attendanceId?: string;
  medicationName: string;
  dosage: string;
  route: string;
  frequency: string;
  scheduledFor?: Date;
  administeredAt?: Date;
  administeredBy?: string;
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  patient: {
    id: string;
    name: string;
    cpf: string;
    birthDate: Date;
    gender: string;
  };
  prescription?: {
    id: string;
    professional: {
      id: string;
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

interface MedicationScheduleWithDetails {
  id: string;
  patientId: string;
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  route: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  scheduledTimes: Date[];
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  patient: {
    id: string;
    name: string;
    cpf: string;
  };
  prescription: {
    id: string;
    professional: {
      id: string;
      name: string;
      profile: string;
    };
  };
}

export class MedicationService {
  constructor(private prisma: PrismaClient) {}

  async createMedicationAdministration(data: any, administeredBy: string): Promise<MedicationAdministrationWithDetails> {
    const validatedData = createMedicationAdministrationSchema.parse(data);
    const created = await this.prisma.medicationAdministration.create({
      data: {
        patientId: validatedData.patientId,
        prescriptionId: validatedData.prescriptionId,
        attendanceId: validatedData.attendanceId,
        medicationName: validatedData.medicationName,
        dosage: validatedData.dosage,
        route: validatedData.route,
        frequency: validatedData.frequency,
        scheduledFor: validatedData.scheduledFor,
        administeredAt: validatedData.administeredAt,
        administeredBy: validatedData.administeredBy || administeredBy,
        notes: validatedData.notes,
        status: validatedData.status
      },
      include: {
        patient: { select: { id: true, name: true, cpf: true, birthDate: true, gender: true } },
        prescription: { select: { id: true, professional: { select: { id: true, name: true, profile: true } } } }
      }
    });
    return created as unknown as MedicationAdministrationWithDetails;
  }

  async updateMedicationAdministration(id: string, data: any): Promise<MedicationAdministrationWithDetails> {
    const validatedData = updateMedicationAdministrationSchema.parse(data);

    const updated = await this.prisma.medicationAdministration.update({
      where: { id },
      data: validatedData,
      include: {
        patient: { select: { id: true, name: true, cpf: true, birthDate: true, gender: true } },
        prescription: { select: { id: true, professional: { select: { id: true, name: true, profile: true } } } }
      }
    });
    return updated as unknown as MedicationAdministrationWithDetails;
  }

  async getMedicationAdministration(id: string): Promise<MedicationAdministrationWithDetails | null> {
    // Mock implementation
    return {
      id: id,
      patientId: 'mock-patient-id',
      prescriptionId: 'mock-prescription-id',
      attendanceId: 'mock-attendance-id',
      medicationName: 'Medicamento Mock',
      dosage: '500mg',
      route: 'oral',
      frequency: '2x ao dia',
      scheduledFor: new Date(),
      administeredAt: new Date(),
      administeredBy: 'mock-user-id',
      notes: 'Notas mock',
      status: 'administered',
      createdAt: new Date(),
      updatedAt: new Date(),
      patient: {
        id: 'mock-patient-id',
        name: 'Paciente Mock',
        cpf: '000.000.000-00',
        birthDate: new Date(),
        gender: 'M'
      },
      prescription: {
        id: 'mock-prescription-id',
        professional: {
          id: 'mock-professional-id',
          name: 'Dr. Mock',
          profile: 'medico'
        }
      },
      administeredByUser: {
        id: 'mock-user-id',
        name: 'Profissional Mock',
        profile: 'enfermeiro'
      }
    };
  }

  async createMedicationSchedule(data: any): Promise<MedicationScheduleWithDetails> {
    const validatedData = createMedicationScheduleSchema.parse(data);

    const created = await this.prisma.medicationSchedule.create({
      data: {
        patientId: validatedData.patientId,
        prescriptionId: validatedData.prescriptionId,
        medicationName: validatedData.medicationName,
        dosage: validatedData.dosage,
        route: validatedData.route,
        frequency: validatedData.frequency,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        scheduledTimes: validatedData.scheduledTimes,
        notes: validatedData.notes,
        status: validatedData.status
      },
      include: {
        patient: { select: { id: true, name: true, cpf: true } },
        prescription: { select: { id: true, professional: { select: { id: true, name: true, profile: true } } } }
      }
    });
    return created as unknown as MedicationScheduleWithDetails;
  }

  async getMedicationSchedules(patientId: string): Promise<MedicationScheduleWithDetails[]> {
    const schedules = await this.prisma.medicationSchedule.findMany({
      where: { patientId },
      include: {
        patient: { select: { id: true, name: true, cpf: true } },
        prescription: { select: { id: true, professional: { select: { id: true, name: true, profile: true } } } }
      },
      orderBy: { startDate: 'desc' }
    });
    return schedules as unknown as MedicationScheduleWithDetails[];
  }

  async getMedicationAdministrations(filters: {
    patientId?: string;
    prescriptionId?: string;
    administeredBy?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<MedicationAdministrationWithDetails[]> {
    const where: any = {};
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.prescriptionId) where.prescriptionId = filters.prescriptionId;
    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) where.administeredAt = {
      gte: filters.dateFrom,
      lte: filters.dateTo
    };
    const list = await this.prisma.medicationAdministration.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, cpf: true, birthDate: true, gender: true } },
        prescription: { select: { id: true, professional: { select: { id: true, name: true, profile: true } } } }
      },
      orderBy: { administeredAt: 'desc' }
    });
    return list as unknown as MedicationAdministrationWithDetails[];
  }

  async getMedicationAdherence(patientId: string): Promise<{
    totalScheduled: number;
    totalAdministered: number;
    totalMissed: number;
    adherenceRate: number;
  }> {
    const [totalScheduled, totalAdministered, totalMissed] = await Promise.all([
      this.prisma.medicationAdministration.count({ where: { patientId, status: 'scheduled' } }),
      this.prisma.medicationAdministration.count({ where: { patientId, status: 'administered' } }),
      this.prisma.medicationAdministration.count({ where: { patientId, status: 'missed' } })
    ]);
    const adherenceRate = totalScheduled > 0 ? Math.round((totalAdministered / totalScheduled) * 100) : 0;
    return { totalScheduled, totalAdministered, totalMissed, adherenceRate };
  }
}
