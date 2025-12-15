import { PrismaClient, Prescription, PrescriptionStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const medicationSchema = z.object({
  name: z.string().min(1, 'Nome do medicamento é obrigatório'),
  dosage: z.string().min(1, 'Dosagem é obrigatória'),
  frequency: z.string().min(1, 'Frequência é obrigatória'),
  duration: z.string().min(1, 'Duração é obrigatória'),
  instructions: z.string().optional(),
  quantity: z.number().min(1, 'Quantidade deve ser maior que zero').optional()
});

const createPrescriptionSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  professionalId: z.string().min(1, 'ID do profissional é obrigatório'),
  attendanceId: z.string().optional(),
  medications: z.array(medicationSchema).min(1, 'Pelo menos um medicamento é obrigatório'),
  instructions: z.string().optional(),
  validUntil: z.string().transform(str => new Date(str)).optional()
});

const updatePrescriptionSchema = z.object({
  status: z.enum(['active', 'completed', 'cancelled', 'expired']).optional(),
  medications: z.array(medicationSchema).optional(),
  instructions: z.string().optional(),
  validUntil: z.string().transform(str => new Date(str)).optional(),
  digitalSignature: z.string().optional()
});

const searchPrescriptionSchema = z.object({
  patientId: z.string().optional(),
  professionalId: z.string().optional(),
  attendanceId: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled', 'expired']).optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'validUntil', 'patient', 'professional']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export interface PrescriptionFilters {
  patientId?: string;
  professionalId?: string;
  attendanceId?: string;
  status?: PrescriptionStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'validUntil' | 'patient' | 'professional';
  sortOrder?: 'asc' | 'desc';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
}

export type PrescriptionWithDetails = Omit<Prescription, 'medications'> & {
  patient: {
    id: string;
    name: string;
    cpf: string;
    birthDate: Date;
    allergies: any[];
  };
  professional: {
    id: string;
    name: string;
    profile: string;
  };
  attendance?: {
    id: string;
    chiefComplaint: string;
    startTime: Date;
  };
  medications: Medication[];
};

export class PrescriptionService {
  constructor(private prisma: PrismaClient) {}

  async createPrescription(data: any): Promise<PrescriptionWithDetails> {
    const validatedData = createPrescriptionSchema.parse(data);

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: validatedData.patientId },
      select: { id: true, allergies: true }
    });

    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    // Verify professional exists and has prescription permission
    const professional = await this.prisma.user.findUnique({
      where: { id: validatedData.professionalId }
    });

    if (!professional) {
      throw new Error('Profissional não encontrado');
    }

    if (professional.profile !== 'medico') {
      throw new Error('Apenas médicos podem prescrever medicamentos');
    }

    // Check for drug allergies
    const patientAllergies = patient.allergies as string[];
    const prescribedMedications = validatedData.medications.map(m => m.name.toLowerCase());
    
    const allergyConflicts = patientAllergies.filter(allergy => 
      prescribedMedications.some(med => med.includes(allergy.toLowerCase()))
    );

    if (allergyConflicts.length > 0) {
      throw new Error(`Paciente tem alergia a: ${allergyConflicts.join(', ')}`);
    }

    // Set default valid until (30 days from now)
    const validUntil = validatedData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create prescription
    const prescription = await this.prisma.prescription.create({
      data: {
        patientId: validatedData.patientId,
        professionalId: validatedData.professionalId,
        attendanceId: validatedData.attendanceId,
        status: 'active',
        medications: validatedData.medications as unknown as Prisma.InputJsonValue[],
        instructions: validatedData.instructions,
        validUntil
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            allergies: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        },
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            startTime: true
          }
        }
      }
    });

    return {
      ...prescription,
      medications: prescription.medications as unknown as Medication[]
    } as PrescriptionWithDetails;
  }

  async getPrescriptionById(id: string): Promise<PrescriptionWithDetails | null> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            allergies: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        },
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            startTime: true
          }
        }
      }
    });

    if (!prescription) return null;

    return {
      ...prescription,
      medications: prescription.medications as unknown as Medication[]
    } as PrescriptionWithDetails;
  }

  async searchPrescriptions(filters: PrescriptionFilters): Promise<{
    prescriptions: PrescriptionWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const validatedFilters = searchPrescriptionSchema.parse(filters);
    const { 
      patientId, 
      professionalId, 
      attendanceId, 
      status, 
      startDate, 
      endDate, 
      page, 
      limit, 
      sortBy, 
      sortOrder 
    } = validatedFilters;

    // Build where clause
    const where: any = {};

    if (patientId) where.patientId = patientId;
    if (professionalId) where.professionalId = professionalId;
    if (attendanceId) where.attendanceId = attendanceId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Build orderBy clause
    let orderBy: any;
    switch (sortBy) {
      case 'patient':
        orderBy = { patient: { name: sortOrder } };
        break;
      case 'professional':
        orderBy = { professional: { name: sortOrder } };
        break;
      default:
        orderBy = { [sortBy]: sortOrder };
    }

    // Get total count
    const total = await this.prisma.prescription.count({ where });

    // Get prescriptions
    const prescriptions = await this.prisma.prescription.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            allergies: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        },
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            startTime: true
          }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    });

    const prescriptionsWithMedications = prescriptions.map(prescription => ({
      ...prescription,
      medications: prescription.medications as unknown as Medication[]
    })) as PrescriptionWithDetails[];

    return {
      prescriptions: prescriptionsWithMedications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updatePrescription(id: string, data: any): Promise<PrescriptionWithDetails> {
    const validatedData = updatePrescriptionSchema.parse(data);

    // Check if prescription exists
    const existingPrescription = await this.prisma.prescription.findUnique({
      where: { id }
    });

    if (!existingPrescription) {
      throw new Error('Prescrição não encontrada');
    }

    const dataToUpdate: any = { ...validatedData };
    if (validatedData.medications) {
      dataToUpdate.medications = validatedData.medications as unknown as Prisma.InputJsonValue[];
    }

    const prescription = await this.prisma.prescription.update({
      where: { id },
      data: dataToUpdate,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            allergies: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        },
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            startTime: true
          }
        }
      }
    });

    return {
      ...prescription,
      medications: prescription.medications as unknown as Medication[]
    } as PrescriptionWithDetails;
  }

  async cancelPrescription(id: string, reason?: string): Promise<PrescriptionWithDetails> {
    return this.updatePrescription(id, {
      status: 'cancelled',
      instructions: reason ? `Cancelada: ${reason}` : 'Cancelada'
    });
  }

  async completePrescription(id: string): Promise<PrescriptionWithDetails> {
    return this.updatePrescription(id, {
      status: 'completed'
    });
  }

  async getActivePrescriptions(patientId?: string): Promise<PrescriptionWithDetails[]> {
    const where: any = {
      status: 'active',
      validUntil: { gte: new Date() }
    };

    if (patientId) {
      where.patientId = patientId;
    }

    const prescriptions = await this.prisma.prescription.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            allergies: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        },
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            startTime: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return prescriptions.map(prescription => ({
      ...prescription,
      medications: prescription.medications as unknown as Medication[]
    })) as PrescriptionWithDetails[];
  }

  async checkDrugInteractions(medications: Medication[]): Promise<{
    interactions: Array<{
      drug1: string;
      drug2: string;
      severity: 'mild' | 'moderate' | 'severe';
      description: string;
    }>;
    warnings: string[];
  }> {
    // This is a simplified drug interaction checker
    // In a real system, this would integrate with a comprehensive drug database
    const interactions: any[] = [];
    const warnings: string[] = [];

    // Common drug interactions (simplified)
    const knownInteractions = [
      {
        drugs: ['warfarina', 'aspirina'],
        severity: 'severe' as const,
        description: 'Risco aumentado de sangramento'
      },
      {
        drugs: ['digoxina', 'furosemida'],
        severity: 'moderate' as const,
        description: 'Risco de toxicidade da digoxina'
      },
      {
        drugs: ['enalapril', 'espironolactona'],
        severity: 'moderate' as const,
        description: 'Risco de hipercalemia'
      }
    ];

    const medicationNames = medications.map(m => m.name.toLowerCase());

    for (const interaction of knownInteractions) {
      const foundDrugs = interaction.drugs.filter(drug => 
        medicationNames.some(med => med.includes(drug))
      );

      if (foundDrugs.length >= 2) {
        interactions.push({
          drug1: foundDrugs[0],
          drug2: foundDrugs[1],
          severity: interaction.severity,
          description: interaction.description
        });
      }
    }

    // Check for duplicate medications
    const medicationCounts = medicationNames.reduce((acc, med) => {
      acc[med] = (acc[med] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(medicationCounts).forEach(([med, count]) => {
      if (count > 1) {
        warnings.push(`Medicamento duplicado: ${med}`);
      }
    });

    return { interactions, warnings };
  }

  async getPrescriptionStats(professionalId?: string, startDate?: Date, endDate?: Date): Promise<{
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    expired: number;
    byStatus: Record<string, number>;
    mostPrescribedMedications: Array<{ name: string; count: number }>;
  }> {
    const where: any = {};

    if (professionalId) {
      where.professionalId = professionalId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const prescriptions = await this.prisma.prescription.findMany({
      where,
      select: {
        status: true,
        medications: true
      }
    });

    const total = prescriptions.length;
    const active = prescriptions.filter(p => p.status === 'active').length;
    const completed = prescriptions.filter(p => p.status === 'completed').length;
    const cancelled = prescriptions.filter(p => p.status === 'cancelled').length;
    const expired = prescriptions.filter(p => p.status === 'expired').length;

    const byStatus = prescriptions.reduce((acc, prescription) => {
      acc[prescription.status] = (acc[prescription.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count most prescribed medications
    const medicationCounts: Record<string, number> = {};
    prescriptions.forEach(prescription => {
      const medications = prescription.medications as unknown as Medication[];
      medications.forEach(med => {
        medicationCounts[med.name] = (medicationCounts[med.name] || 0) + 1;
      });
    });

    const mostPrescribedMedications = Object.entries(medicationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      total,
      active,
      completed,
      cancelled,
      expired,
      byStatus,
      mostPrescribedMedications
    };
  }
}
