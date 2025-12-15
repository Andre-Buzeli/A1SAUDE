import { PrismaClient, Patient, Gender, MaritalStatus, BloodType } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const createPatientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  rg: z.string().optional(),
  birthDate: z.string().transform(str => new Date(str)),
  gender: z.enum(['male', 'female', 'other']),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'other']),
  motherName: z.string().optional(),
  fatherName: z.string().optional(),
  
  // Address
  street: z.string().min(1, 'Logradouro é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório').max(2),
  zipCode: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
  
  // Contact
  phone: z.string().optional(),
  email: z.string().email().optional(),
  emergencyContact: z.any().optional(),
  
  // Medical info
  allergies: z.array(z.any()).optional(),
  chronicConditions: z.array(z.any()).optional(),
  medications: z.array(z.any()).optional(),
  bloodType: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional(),
  height: z.number().optional(),
  weight: z.number().optional()
});

const updatePatientSchema = createPatientSchema.partial();

const searchPatientSchema = z.object({
  query: z.string().optional(),
  cpf: z.string().optional(),
  name: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'birthDate']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export interface PatientFilters {
  query?: string;
  cpf?: string;
  name?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'birthDate';
  sortOrder?: 'asc' | 'desc';
}

export interface PatientWithStats extends Patient {
  _count?: {
    attendances: number;
    prescriptions: number;
    examRequests: number;
  };
  lastAttendance?: Date;
}

export class PatientService {
  constructor(private prisma: PrismaClient) {}

  async createPatient(data: any): Promise<Patient> {
    const validatedData = createPatientSchema.parse(data);
    
    // Check if patient already exists
    const existingPatient = await this.prisma.patient.findUnique({
      where: { cpf: validatedData.cpf }
    });

    if (existingPatient) {
      throw new Error('Paciente já cadastrado com este CPF');
    }

    return await this.prisma.patient.create({
      data: {
        // Ensure required fields explicitly set to satisfy Prisma types
        name: validatedData.name,
        cpf: validatedData.cpf,
        birthDate: validatedData.birthDate,
        gender: validatedData.gender as Gender,
        maritalStatus: validatedData.maritalStatus as MaritalStatus,
        street: validatedData.street,
        number: validatedData.number,
        neighborhood: validatedData.neighborhood,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        // Optional fields
        rg: validatedData.rg,
        motherName: validatedData.motherName,
        fatherName: validatedData.fatherName,
        complement: validatedData.complement,
        phone: validatedData.phone,
        email: validatedData.email,
        emergencyContact: validatedData.emergencyContact,
        bloodType: validatedData.bloodType as BloodType | undefined,
        height: validatedData.height,
        weight: validatedData.weight,
        allergies: validatedData.allergies || [],
        chronicConditions: validatedData.chronicConditions || [],
        medications: validatedData.medications || []
      }
    });
  }

  async getPatientById(id: string): Promise<PatientWithStats | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attendances: true,
            prescriptions: true,
            examRequests: true
          }
        },
        attendances: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true }
        }
      }
    });

    if (!patient) return null;

    return {
      ...patient,
      lastAttendance: patient.attendances[0]?.createdAt
    };
  }

  async getPatientByCpf(cpf: string): Promise<PatientWithStats | null> {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    const patient = await this.prisma.patient.findUnique({
      where: { cpf: cleanCpf },
      include: {
        _count: {
          select: {
            attendances: true,
            prescriptions: true,
            examRequests: true
          }
        },
        attendances: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true }
        }
      }
    });

    if (!patient) return null;

    return {
      ...patient,
      lastAttendance: patient.attendances[0]?.createdAt
    };
  }

  async searchPatients(filters: PatientFilters): Promise<{
    patients: PatientWithStats[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const validatedFilters = searchPatientSchema.parse(filters);
    const { query, cpf, name, page, limit, sortBy, sortOrder } = validatedFilters;

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { cpf: { contains: query.replace(/\D/g, '') } },
        { email: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (cpf) {
      where.cpf = { contains: cpf.replace(/\D/g, '') };
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    // Get total count
    const total = await this.prisma.patient.count({ where });

    // Get patients
    const patients = await this.prisma.patient.findMany({
      where,
      include: {
        _count: {
          select: {
            attendances: true,
            prescriptions: true,
            examRequests: true
          }
        },
        attendances: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    });

    const patientsWithStats: PatientWithStats[] = patients.map(patient => ({
      ...patient,
      lastAttendance: patient.attendances[0]?.createdAt
    }));

    return {
      patients: patientsWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updatePatient(id: string, data: any): Promise<Patient> {
    const validatedData = updatePatientSchema.parse(data);

    // Check if patient exists
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id }
    });

    if (!existingPatient) {
      throw new Error('Paciente não encontrado');
    }

    // If CPF is being updated, check for duplicates
    if (validatedData.cpf && validatedData.cpf !== existingPatient.cpf) {
      const duplicatePatient = await this.prisma.patient.findUnique({
        where: { cpf: validatedData.cpf }
      });

      if (duplicatePatient) {
        throw new Error('Já existe um paciente cadastrado com este CPF');
      }
    }

    return await this.prisma.patient.update({
      where: { id },
      data: validatedData
    });
  }

  async deactivatePatient(id: string): Promise<Patient> {
    const patient = await this.prisma.patient.findUnique({
      where: { id }
    });

    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    return await this.prisma.patient.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async getPatientHistory(id: string): Promise<{
    attendances: any[];
    prescriptions: any[];
    examRequests: any[];
    vitalSigns: any[];
  }> {
    const patient = await this.prisma.patient.findUnique({
      where: { id }
    });

    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    const [attendances, prescriptions, examRequests, vitalSigns] = await Promise.all([
      this.prisma.attendance.findMany({
        where: { patientId: id },
        include: {
          professional: {
            select: { name: true, profile: true }
          },
          establishment: {
            select: { name: true, type: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.prescription.findMany({
        where: { patientId: id },
        include: {
          professional: {
            select: { name: true, profile: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.examRequest.findMany({
        where: { patientId: id },
        orderBy: { requestedAt: 'desc' }
      }),
      this.prisma.vitalSigns.findMany({
        where: { patientId: id },
        orderBy: { recordedAt: 'desc' },
        take: 20 // Last 20 vital signs records
      })
    ]);

    return {
      attendances,
      prescriptions,
      examRequests,
      vitalSigns
    };
  }

  async getPatientStats(): Promise<{
    total: number;
    activeToday: number;
    newThisMonth: number;
    byGender: Record<string, number>;
    byAgeGroup: Record<string, number>;
  }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      total,
      activeToday,
      newThisMonth,
      allPatients
    ] = await Promise.all([
      this.prisma.patient.count({ where: { isActive: true } }),
      this.prisma.patient.count({
        where: {
          isActive: true,
          attendances: {
            some: {
              createdAt: { gte: startOfDay }
            }
          }
        }
      }),
      this.prisma.patient.count({
        where: {
          isActive: true,
          createdAt: { gte: startOfMonth }
        }
      }),
      this.prisma.patient.findMany({
        where: { isActive: true },
        select: { gender: true, birthDate: true }
      })
    ]);

    // Calculate gender distribution
    const byGender = allPatients.reduce((acc, patient) => {
      acc[patient.gender] = (acc[patient.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate age group distribution
    const byAgeGroup = allPatients.reduce((acc, patient) => {
      const age = Math.floor((Date.now() - patient.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      let ageGroup: string;
      
      if (age < 18) ageGroup = '0-17';
      else if (age < 30) ageGroup = '18-29';
      else if (age < 50) ageGroup = '30-49';
      else if (age < 65) ageGroup = '50-64';
      else ageGroup = '65+';

      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      activeToday,
      newThisMonth,
      byGender,
      byAgeGroup
    };
  }
}
