import { PrismaClient, ExamRequest, ExamStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const createExamRequestSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  attendanceId: z.string().optional(),
  examType: z.string().min(1, 'Tipo de exame é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  clinicalData: z.string().optional(),
  instructions: z.string().optional()
});

const updateExamRequestSchema = z.object({
  status: z.enum(['requested', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  scheduledFor: z.string().transform(str => new Date(str)).optional(),
  completedAt: z.string().transform(str => new Date(str)).optional(),
  results: z.any().optional(),
  observations: z.string().optional(),
  technician: z.string().optional(),
  reportedBy: z.string().optional()
});

const searchExamRequestSchema = z.object({
  patientId: z.string().optional(),
  attendanceId: z.string().optional(),
  examType: z.string().optional(),
  status: z.enum(['requested', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['requestedAt', 'scheduledFor', 'patient', 'examType']).default('requestedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export interface ExamRequestFilters {
  patientId?: string;
  attendanceId?: string;
  examType?: string;
  status?: ExamStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'requestedAt' | 'scheduledFor' | 'patient' | 'examType';
  sortOrder?: 'asc' | 'desc';
}

export interface ExamResult {
  parameter: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status?: 'normal' | 'abnormal' | 'critical';
  notes?: string;
}

export type ExamRequestWithDetails = Omit<ExamRequest, 'results'> & {
  patient: {
    id: string;
    name: string;
    cpf: string;
    birthDate: Date;
    gender: string;
  };
  attendance?: {
    id: string;
    chiefComplaint: string;
    professional: {
      name: string;
      profile: string;
    };
  };
  results?: ExamResult[];
};

export class ExamService {
  constructor(private prisma: PrismaClient) {}

  async createExamRequest(data: any, requestedBy: string): Promise<ExamRequestWithDetails> {
    const validatedData = createExamRequestSchema.parse(data);

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: validatedData.patientId }
    });

    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    // Verify attendance exists if provided
    if (validatedData.attendanceId) {
      const attendance = await this.prisma.attendance.findUnique({
        where: { id: validatedData.attendanceId }
      });

      if (!attendance) {
        throw new Error('Atendimento não encontrado');
      }
    }

    // Create exam request (only Prisma model fields)
    const examRequest = await this.prisma.examRequest.create({
      data: {
        patientId: validatedData.patientId,
        attendanceId: validatedData.attendanceId,
        examType: validatedData.examType,
        description: validatedData.description,
        status: 'requested',
        requestedAt: new Date()
      },
      include: {
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            professional: {
              select: {
                name: true,
                profile: true
              }
            }
          }
        }
      }
    });

    const patientInfo = await this.prisma.patient.findUnique({
      where: { id: examRequest.patientId },
      select: {
        id: true,
        name: true,
        cpf: true,
        birthDate: true,
        gender: true
      }
    });

    if (!patientInfo) {
      throw new Error('Paciente não encontrado');
    }

    return {
      ...examRequest,
      patient: patientInfo,
      results: examRequest.results as unknown as ExamResult[]
    } as ExamRequestWithDetails;
  }

  async getExamRequestById(id: string): Promise<ExamRequestWithDetails | null> {
    const examRequest = await this.prisma.examRequest.findUnique({
      where: { id },
      include: {
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            professional: {
              select: {
                name: true,
                profile: true
              }
            }
          }
        }
      }
    });

    if (!examRequest) return null;

    const patientInfo = await this.prisma.patient.findUnique({
      where: { id: examRequest.patientId },
      select: {
        id: true,
        name: true,
        cpf: true,
        birthDate: true,
        gender: true
      }
    });

    if (!patientInfo) return null;

    return {
      ...examRequest,
      patient: patientInfo,
      results: examRequest.results as unknown as ExamResult[]
    } as ExamRequestWithDetails;
  }

  async searchExamRequests(filters: ExamRequestFilters): Promise<{
    examRequests: ExamRequestWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const validatedFilters = searchExamRequestSchema.parse(filters);
    const { 
      patientId, 
      attendanceId, 
      examType, 
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
    if (attendanceId) where.attendanceId = attendanceId;
    if (examType) where.examType = { contains: examType, mode: 'insensitive' };
    if (status) where.status = status;

    if (startDate || endDate) {
      where.requestedAt = {};
      if (startDate) where.requestedAt.gte = startDate;
      if (endDate) where.requestedAt.lte = endDate;
    }

    // Build orderBy clause
    let orderBy: any;
    switch (sortBy) {
      case 'patient':
        // Prisma não suporta orderBy por relação ausente; ordenamos em memória após busca
        orderBy = { requestedAt: sortOrder };
        break;
      default:
        orderBy = { [sortBy]: sortOrder };
    }

    // Get total count
    const total = await this.prisma.examRequest.count({ where });

    // Get exam requests
    const examRequests = await this.prisma.examRequest.findMany({
      where,
      include: {
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            professional: {
              select: {
                name: true,
                profile: true
              }
            }
          }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    });

    // Buscar pacientes em lote para evitar N+1
    const patientIds = Array.from(new Set(examRequests.map(e => e.patientId)));
    const patients = await this.prisma.patient.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, name: true, cpf: true, birthDate: true, gender: true }
    });
    const patientMap = new Map<string, { id: string; name: string; cpf: string; birthDate: Date; gender: string }>(
      patients.map(p => [p.id, p])
    );

    let examRequestsWithResults = examRequests.map(examRequest => ({
      ...examRequest,
      patient: patientMap.get(examRequest.patientId),
      results: examRequest.results as unknown as ExamResult[]
    })) as ExamRequestWithDetails[];

    // Ordenação por nome do paciente em memória, se solicitada
    if (sortBy === 'patient') {
      examRequestsWithResults.sort((a, b) => {
        const na = a.patient?.name || '';
        const nb = b.patient?.name || '';
        return sortOrder === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
      });
    }

    return {
      examRequests: examRequestsWithResults,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateExamRequest(id: string, data: any): Promise<ExamRequestWithDetails> {
    const validatedData = updateExamRequestSchema.parse(data);

    // Check if exam request exists
    const existingExamRequest = await this.prisma.examRequest.findUnique({
      where: { id }
    });

    if (!existingExamRequest) {
      throw new Error('Solicitação de exame não encontrada');
    }

    // Atualizar apenas campos existentes no modelo Prisma
    const dataToUpdate: any = {};
    if (validatedData.status !== undefined) dataToUpdate.status = validatedData.status;
    if (validatedData.scheduledFor !== undefined) dataToUpdate.scheduledFor = validatedData.scheduledFor;
    if (validatedData.completedAt !== undefined) dataToUpdate.completedAt = validatedData.completedAt;
    if (validatedData.results !== undefined) {
      dataToUpdate.results = validatedData.results as unknown as Prisma.InputJsonValue;
    }

    const examRequest = await this.prisma.examRequest.update({
      where: { id },
      data: dataToUpdate,
      include: {
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            professional: {
              select: {
                name: true,
                profile: true
              }
            }
          }
        }
      }
    });

    const patientInfo = await this.prisma.patient.findUnique({
      where: { id: examRequest.patientId },
      select: { id: true, name: true, cpf: true, birthDate: true, gender: true }
    });

    return {
      ...examRequest,
      patient: patientInfo || undefined,
      results: examRequest.results as unknown as ExamResult[]
    } as ExamRequestWithDetails;
  }

  async scheduleExam(id: string, scheduledFor: Date): Promise<ExamRequestWithDetails> {
    return this.updateExamRequest(id, {
      status: 'scheduled',
      scheduledFor: scheduledFor.toISOString()
    });
  }

  async startExam(id: string, technician?: string): Promise<ExamRequestWithDetails> {
    return this.updateExamRequest(id, {
      status: 'in_progress',
      technician
    });
  }

  async completeExam(
    id: string, 
    results: ExamResult[], 
    reportedBy: string,
    observations?: string
  ): Promise<ExamRequestWithDetails> {
    return this.updateExamRequest(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      results,
      reportedBy,
      observations
    });
  }

  async cancelExam(id: string, reason?: string): Promise<ExamRequestWithDetails> {
    return this.updateExamRequest(id, {
      status: 'cancelled',
      observations: reason
    });
  }

  async getPendingExams(examType?: string, urgency?: string): Promise<ExamRequestWithDetails[]> {
    const where: any = {
      status: {
        in: ['requested', 'scheduled']
      }
    };

    if (examType) {
      where.examType = { contains: examType, mode: 'insensitive' };
    }

    const examRequests = await this.prisma.examRequest.findMany({
      where,
      include: {
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            professional: {
              select: {
                name: true,
                profile: true
              }
            }
          }
        }
      },
      orderBy: { requestedAt: 'asc' }
    });

    const patientIds = Array.from(new Set(examRequests.map(e => e.patientId)));
    const patients = await this.prisma.patient.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, name: true, cpf: true, birthDate: true, gender: true }
    });
    const patientMap = new Map<string, { id: string; name: string; cpf: string; birthDate: Date; gender: string }>(
      patients.map(p => [p.id, p])
    );

    return examRequests.map(examRequest => ({
      ...examRequest,
      patient: patientMap.get(examRequest.patientId),
      results: examRequest.results as unknown as ExamResult[]
    })) as ExamRequestWithDetails[];
  }

  async getExamTypes(): Promise<Array<{ type: string; count: number }>> {
    const examTypes = await this.prisma.examRequest.groupBy({
      by: ['examType'],
      _count: {
        examType: true
      },
      orderBy: {
        _count: {
          examType: 'desc'
        }
      }
    });

    return examTypes.map(item => ({
      type: item.examType,
      count: item._count.examType
    }));
  }

  async getExamStats(startDate?: Date, endDate?: Date): Promise<{
    total: number;
    requested: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    averageCompletionTime: number;
  }> {
    const where: any = {};

    if (startDate || endDate) {
      where.requestedAt = {};
      if (startDate) where.requestedAt.gte = startDate;
      if (endDate) where.requestedAt.lte = endDate;
    }

    const [examRequests, completedExams] = await Promise.all([
      this.prisma.examRequest.findMany({
        where,
        select: {
          status: true,
          examType: true,
          requestedAt: true,
          completedAt: true
        }
      }),
      this.prisma.examRequest.findMany({
        where: {
          ...where,
          status: 'completed',
          completedAt: { not: null }
        },
        select: {
          requestedAt: true,
          completedAt: true
        }
      })
    ]);

    const total = examRequests.length;
    const requested = examRequests.filter(e => e.status === 'requested').length;
    const scheduled = examRequests.filter(e => e.status === 'scheduled').length;
    const inProgress = examRequests.filter(e => e.status === 'in_progress').length;
    const completed = examRequests.filter(e => e.status === 'completed').length;
    const cancelled = examRequests.filter(e => e.status === 'cancelled').length;

    const byStatus = examRequests.reduce((acc, exam) => {
      acc[exam.status] = (acc[exam.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = examRequests.reduce((acc, exam) => {
      acc[exam.examType] = (acc[exam.examType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average completion time for completed exams
    const completionTimes = completedExams
      .filter(e => e.completedAt)
      .map(e => e.completedAt!.getTime() - e.requestedAt.getTime());
    
    const averageCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length / (1000 * 60 * 60) // in hours
      : 0;

    return {
      total,
      requested,
      scheduled,
      inProgress,
      completed,
      cancelled,
      byStatus,
      byType,
      averageCompletionTime
    };
  }

  async getCriticalResults(patientId?: string): Promise<ExamRequestWithDetails[]> {
    const where: any = {
      status: 'completed'
    };

    if (patientId) {
      where.patientId = patientId;
    }

    const examRequests = await this.prisma.examRequest.findMany({
      where,
      include: {
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            professional: {
              select: {
                name: true,
                profile: true
              }
            }
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    // Buscar pacientes em lote
    const patientIds = Array.from(new Set(examRequests.map(e => e.patientId)));
    const patients = await this.prisma.patient.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, name: true, cpf: true, birthDate: true, gender: true }
    });
    const patientMap = new Map<string, { id: string; name: string; cpf: string; birthDate: Date; gender: string }>(
      patients.map(p => [p.id, p])
    );

    // Filtrar resultados críticos em memória
    const withDetails = examRequests.map(examRequest => ({
      ...examRequest,
      patient: patientMap.get(examRequest.patientId),
      results: examRequest.results as unknown as ExamResult[]
    })) as ExamRequestWithDetails[];

    return withDetails.filter(er => (er.results || []).some(r => r.status === 'critical'));
  }
}
