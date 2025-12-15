import { PrismaClient, Attendance, AttendanceType, AttendanceStatus } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const createAttendanceSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  professionalId: z.string().min(1, 'ID do profissional é obrigatório'),
  establishmentId: z.string().min(1, 'ID do estabelecimento é obrigatório'),
  unitId: z.string().optional(),
  type: z.enum(['consultation', 'emergency', 'procedure', 'surgery', 'exam', 'vaccination']),
  chiefComplaint: z.string().min(1, 'Queixa principal é obrigatória'),
  notes: z.string().optional()
});

const updateAttendanceSchema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  chiefComplaint: z.string().optional(),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  notes: z.string().optional(),
  endTime: z.string().transform(str => new Date(str)).optional()
});

const searchAttendanceSchema = z.object({
  patientId: z.string().optional(),
  professionalId: z.string().optional(),
  establishmentId: z.string().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  type: z.enum(['consultation', 'emergency', 'procedure', 'surgery', 'exam', 'vaccination']).optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['startTime', 'createdAt', 'patient', 'professional']).default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export interface AttendanceFilters {
  patientId?: string;
  professionalId?: string;
  establishmentId?: string;
  status?: AttendanceStatus;
  type?: AttendanceType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'startTime' | 'createdAt' | 'patient' | 'professional';
  sortOrder?: 'asc' | 'desc';
}

export interface AttendanceWithDetails extends Attendance {
  patient: {
    id: string;
    name: string;
    cpf: string;
    birthDate: Date;
    gender: string;
  };
  professional: {
    id: string;
    name: string;
    profile: string;
  };
  establishment: {
    id: string;
    name: string;
    type: string;
  };
  unit?: {
    id: string;
    name: string;
  };
  prescriptions?: any[];
  examRequests?: any[];
  procedures?: any[];
  triage?: any;
}

export class AttendanceService {
  constructor(private prisma: PrismaClient) {}

  async createAttendance(data: any): Promise<AttendanceWithDetails> {
    const validatedData = createAttendanceSchema.parse(data);

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: validatedData.patientId }
    });

    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    // Verify professional exists
    const professional = await this.prisma.user.findUnique({
      where: { id: validatedData.professionalId }
    });

    if (!professional) {
      throw new Error('Profissional não encontrado');
    }

    // Verify establishment exists
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: validatedData.establishmentId }
    });

    if (!establishment) {
      throw new Error('Estabelecimento não encontrado');
    }

    // Create attendance (use relational connects instead of raw foreign keys)
    const attendance = await this.prisma.attendance.create({
      data: {
        type: validatedData.type,
        status: 'scheduled',
        startTime: new Date(),
        chiefComplaint: validatedData.chiefComplaint,
        notes: validatedData.notes,
        patient: { connect: { id: validatedData.patientId } },
        professional: { connect: { id: validatedData.professionalId } },
        establishment: { connect: { id: validatedData.establishmentId } },
        ...(validatedData.unitId ? { unit: { connect: { id: validatedData.unitId } } } : {})
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        },
        establishment: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        unit: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return attendance as AttendanceWithDetails;
  }

  async getAttendanceById(id: string): Promise<AttendanceWithDetails | null> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        },
        establishment: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        unit: {
          select: {
            id: true,
            name: true
          }
        },
        prescriptions: true,
        examRequests: true,
        procedures: true,
        triage: true
      }
    });

    return attendance as AttendanceWithDetails | null;
  }

  async searchAttendances(filters: AttendanceFilters): Promise<{
    attendances: AttendanceWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const validatedFilters = searchAttendanceSchema.parse(filters);
    const { 
      patientId, 
      professionalId, 
      establishmentId, 
      status, 
      type, 
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
    if (establishmentId) where.establishmentId = establishmentId;
    if (status) where.status = status;
    if (type) where.type = type;

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = startDate;
      if (endDate) where.startTime.lte = endDate;
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
    const total = await this.prisma.attendance.count({ where });

    // Get attendances
    const attendances = await this.prisma.attendance.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        },
        establishment: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        unit: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      attendances: attendances as AttendanceWithDetails[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateAttendance(id: string, data: any): Promise<AttendanceWithDetails> {
    const validatedData = updateAttendanceSchema.parse(data);

    // Check if attendance exists
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: { id }
    });

    if (!existingAttendance) {
      throw new Error('Atendimento não encontrado');
    }

    const attendance = await this.prisma.attendance.update({
      where: { id },
      data: validatedData,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        },
        establishment: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        unit: {
          select: {
            id: true,
            name: true
          }
        },
        prescriptions: true,
        examRequests: true,
        procedures: true,
        triage: true
      }
    });

    return attendance as AttendanceWithDetails;
  }

  async startAttendance(id: string): Promise<AttendanceWithDetails> {
    return this.updateAttendance(id, {
      status: 'in_progress',
      startTime: new Date().toISOString()
    });
  }

  async updateAttendanceSOAP(id: string, soapData: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  }): Promise<AttendanceWithDetails> {
    return this.updateAttendance(id, soapData);
  }

  async completeAttendance(id: string, notes?: string): Promise<AttendanceWithDetails> {
    return this.updateAttendance(id, {
      status: 'completed',
      endTime: new Date().toISOString(),
      notes
    });
  }

  async cancelAttendance(id: string, reason?: string): Promise<AttendanceWithDetails> {
    return this.updateAttendance(id, {
      status: 'cancelled',
      notes: reason
    });
  }

  async getActiveAttendances(establishmentId?: string): Promise<AttendanceWithDetails[]> {
    const where: any = {
      status: {
        in: ['scheduled', 'in_progress']
      }
    };

    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        },
        establishment: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        unit: {
          select: {
            id: true,
            name: true
          }
        },
        triage: true
      },
      orderBy: [
        { triage: { priority: 'asc' } },
        { startTime: 'asc' }
      ]
    });

    return attendances as AttendanceWithDetails[];
  }

  async getAttendanceStats(establishmentId?: string, startDate?: Date, endDate?: Date): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    scheduled: number;
    cancelled: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    averageDuration: number;
  }> {
    const where: any = {};

    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = startDate;
      if (endDate) where.startTime.lte = endDate;
    }

    const [attendances, completedAttendances] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        select: {
          type: true,
          status: true,
          startTime: true,
          endTime: true
        }
      }),
      this.prisma.attendance.findMany({
        where: {
          ...where,
          status: 'completed',
          endTime: { not: null }
        },
        select: {
          startTime: true,
          endTime: true
        }
      })
    ]);

    const total = attendances.length;
    const completed = attendances.filter(a => a.status === 'completed').length;
    const inProgress = attendances.filter(a => a.status === 'in_progress').length;
    const scheduled = attendances.filter(a => a.status === 'scheduled').length;
    const cancelled = attendances.filter(a => a.status === 'cancelled').length;

    const byType = attendances.reduce((acc, attendance) => {
      acc[attendance.type] = (acc[attendance.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = attendances.reduce((acc, attendance) => {
      acc[attendance.status] = (acc[attendance.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average duration for completed attendances
    const durations = completedAttendances
      .filter(a => a.endTime)
      .map(a => a.endTime!.getTime() - a.startTime.getTime());
    
    const averageDuration = durations.length > 0 
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length / (1000 * 60) // in minutes
      : 0;

    return {
      total,
      completed,
      inProgress,
      scheduled,
      cancelled,
      byType,
      byStatus,
      averageDuration
    };
  }
}
