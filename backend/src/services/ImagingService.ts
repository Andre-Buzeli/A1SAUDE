/**
 * Serviço de Exames de Imagem
 * Sistema A1 Saúde
 */

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Schemas de validação
const createImagingExamSchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  requestedById: z.string().min(1, 'Médico solicitante é obrigatório'),
  establishmentId: z.string().min(1, 'Estabelecimento é obrigatório'),
  attendanceId: z.string().optional(),
  
  // Exame
  examType: z.enum(['RX', 'USG', 'TC', 'RM', 'MAM', 'DENS', 'ANGIO', 'PET']),
  examCode: z.string().min(1, 'Código do exame é obrigatório'),
  examName: z.string().min(1, 'Nome do exame é obrigatório'),
  bodyRegions: z.array(z.string()).min(1, 'Região anatômica é obrigatória'),
  laterality: z.enum(['bilateral', 'left', 'right', 'na']).optional(),
  
  // Indicação
  clinicalIndication: z.string().min(1, 'Indicação clínica é obrigatória'),
  diagnosticHypothesis: z.string().optional(),
  urgency: z.enum(['routine', 'urgent', 'emergency']).default('routine'),
  
  // Alertas
  contrastRequired: z.boolean().default(false),
  contrastType: z.string().optional(),
  contrastAllergy: z.boolean().default(false),
  claustrophobic: z.boolean().default(false),
  pregnant: z.boolean().default(false),
  pacemaker: z.boolean().default(false),
  metalImplants: z.string().optional(),
  
  observations: z.string().optional()
});

const reportExamSchema = z.object({
  findings: z.string().min(1, 'Achados são obrigatórios'),
  conclusion: z.string().min(1, 'Conclusão é obrigatória'),
  impression: z.string().optional(),
  recommendations: z.string().optional(),
  reportedById: z.string().min(1, 'Radiologista é obrigatório')
});

export interface ImagingExamFilters {
  patientId?: string;
  requestedById?: string;
  establishmentId?: string;
  examType?: string;
  status?: string;
  urgency?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface ImagingStats {
  total: number;
  requested: number;
  scheduled: number;
  completed: number;
  reported: number;
  byType: Record<string, number>;
  byUrgency: Record<string, number>;
  averageReportTime: number; // em horas
}

export class ImagingService {
  constructor(private prisma: PrismaClient) {}

  // ==================== CRUD ====================

  async requestExam(data: any) {
    const validatedData = createImagingExamSchema.parse(data);

    // Verificar se paciente existe
    const patient = await this.prisma.patient.findUnique({
      where: { id: validatedData.patientId }
    });

    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    // Verificar contraindicações
    if (validatedData.examType === 'RM') {
      if (validatedData.pacemaker) {
        throw new Error('Ressonância Magnética contraindicada para pacientes com marcapasso');
      }
    }

    if (validatedData.contrastRequired && validatedData.contrastAllergy) {
      throw new Error('Atenção: Paciente com histórico de alergia a contraste. Avaliar necessidade de preparo especial.');
    }

    return await this.prisma.imagingExam.create({
      data: {
        ...validatedData,
        bodyRegions: JSON.stringify(validatedData.bodyRegions),
        status: 'requested'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true }
        },
        establishment: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async getExamById(id: string) {
    const exam = await this.prisma.imagingExam.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true,
            phone: true
          }
        },
        establishment: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    if (!exam) {
      throw new Error('Exame não encontrado');
    }

    return {
      ...exam,
      bodyRegions: JSON.parse(exam.bodyRegions)
    };
  }

  async searchExams(filters: ImagingExamFilters) {
    const {
      patientId,
      requestedById,
      establishmentId,
      examType,
      status,
      urgency,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = filters;

    const where: any = {};

    if (patientId) where.patientId = patientId;
    if (requestedById) where.requestedById = requestedById;
    if (establishmentId) where.establishmentId = establishmentId;
    if (examType) where.examType = examType;
    if (status) where.status = status;
    if (urgency) where.urgency = urgency;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const total = await this.prisma.imagingExam.count({ where });

    const exams = await this.prisma.imagingExam.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true }
        },
        establishment: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      exams: exams.map(e => ({
        ...e,
        bodyRegions: JSON.parse(e.bodyRegions)
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async cancelExam(id: string, reason?: string) {
    const exam = await this.prisma.imagingExam.findUnique({ where: { id } });
    
    if (!exam) {
      throw new Error('Exame não encontrado');
    }

    if (['completed', 'reported'].includes(exam.status)) {
      throw new Error('Não é possível cancelar um exame já realizado');
    }

    return await this.prisma.imagingExam.update({
      where: { id },
      data: {
        status: 'cancelled',
        observations: reason 
          ? `${exam.observations || ''}\nCANCELADO: ${reason}`.trim()
          : exam.observations
      }
    });
  }

  // ==================== WORKFLOW ====================

  async scheduleExam(id: string, scheduledFor: Date, room?: string) {
    const exam = await this.prisma.imagingExam.findUnique({ where: { id } });
    
    if (!exam) {
      throw new Error('Exame não encontrado');
    }

    if (exam.status !== 'requested') {
      throw new Error('Exame não está aguardando agendamento');
    }

    return await this.prisma.imagingExam.update({
      where: { id },
      data: {
        status: 'scheduled',
        scheduledFor,
        room
      }
    });
  }

  async startExam(id: string, performedById: string) {
    const exam = await this.prisma.imagingExam.findUnique({ where: { id } });
    
    if (!exam) {
      throw new Error('Exame não encontrado');
    }

    if (!['requested', 'scheduled'].includes(exam.status)) {
      throw new Error('Exame não pode ser iniciado neste status');
    }

    return await this.prisma.imagingExam.update({
      where: { id },
      data: {
        status: 'in_progress',
        performedById
      }
    });
  }

  async completeExam(id: string, imagesCount: number, technicalNotes?: string, imagesUrls?: string[]) {
    const exam = await this.prisma.imagingExam.findUnique({ where: { id } });
    
    if (!exam) {
      throw new Error('Exame não encontrado');
    }

    if (exam.status !== 'in_progress') {
      throw new Error('Exame não está em andamento');
    }

    return await this.prisma.imagingExam.update({
      where: { id },
      data: {
        status: 'completed',
        performedAt: new Date(),
        imagesCount,
        technicalNotes,
        imagesUrls: imagesUrls ? JSON.stringify(imagesUrls) : undefined
      }
    });
  }

  async reportExam(id: string, data: any) {
    const exam = await this.prisma.imagingExam.findUnique({ where: { id } });
    
    if (!exam) {
      throw new Error('Exame não encontrado');
    }

    if (exam.status !== 'completed') {
      throw new Error('Exame ainda não foi realizado');
    }

    const validatedData = reportExamSchema.parse(data);

    return await this.prisma.imagingExam.update({
      where: { id },
      data: {
        ...validatedData,
        status: 'reported',
        reportedAt: new Date()
      },
      include: {
        patient: {
          select: { id: true, name: true }
        }
      }
    });
  }

  // ==================== WORKLISTS ====================

  async getPendingWorklist(establishmentId?: string, examType?: string) {
    const where: any = {
      status: { in: ['requested', 'scheduled'] }
    };

    if (establishmentId) where.establishmentId = establishmentId;
    if (examType) where.examType = examType;

    return await this.prisma.imagingExam.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true
          }
        }
      },
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'asc' }
      ]
    });
  }

  async getPendingReports(establishmentId?: string, reportedById?: string) {
    const where: any = {
      status: 'completed'
    };

    if (establishmentId) where.establishmentId = establishmentId;
    if (reportedById) where.reportedById = reportedById;

    return await this.prisma.imagingExam.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { urgency: 'desc' },
        { performedAt: 'asc' }
      ]
    });
  }

  // ==================== ESTATÍSTICAS ====================

  async getStats(establishmentId?: string, startDate?: Date, endDate?: Date): Promise<ImagingStats> {
    const where: any = {};
    
    if (establishmentId) where.establishmentId = establishmentId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const exams = await this.prisma.imagingExam.findMany({
      where,
      select: {
        status: true,
        examType: true,
        urgency: true,
        performedAt: true,
        reportedAt: true
      }
    });

    const total = exams.length;
    const requested = exams.filter(e => e.status === 'requested').length;
    const scheduled = exams.filter(e => e.status === 'scheduled').length;
    const completed = exams.filter(e => e.status === 'completed').length;
    const reported = exams.filter(e => e.status === 'reported').length;

    const byType: Record<string, number> = {};
    const byUrgency: Record<string, number> = {};
    let totalReportTime = 0;
    let reportCount = 0;

    exams.forEach(e => {
      byType[e.examType] = (byType[e.examType] || 0) + 1;
      byUrgency[e.urgency] = (byUrgency[e.urgency] || 0) + 1;
      
      if (e.performedAt && e.reportedAt) {
        totalReportTime += (e.reportedAt.getTime() - e.performedAt.getTime()) / 3600000;
        reportCount++;
      }
    });

    return {
      total,
      requested,
      scheduled,
      completed,
      reported,
      byType,
      byUrgency,
      averageReportTime: reportCount > 0 ? Math.round(totalReportTime / reportCount * 10) / 10 : 0
    };
  }

  async getTodayExams(establishmentId?: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const where: any = {
      scheduledFor: {
        gte: startOfDay,
        lt: endOfDay
      }
    };

    if (establishmentId) where.establishmentId = establishmentId;

    return await this.prisma.imagingExam.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true }
        }
      },
      orderBy: { scheduledFor: 'asc' }
    });
  }

  // ==================== DASHBOARD ====================

  async getDashboardData(establishmentId?: string) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [stats, pendingWorklist, pendingReports, todayExams] = await Promise.all([
      this.getStats(establishmentId, startOfMonth, endOfMonth),
      this.getPendingWorklist(establishmentId),
      this.getPendingReports(establishmentId),
      this.getTodayExams(establishmentId)
    ]);

    return {
      stats,
      pendingCount: pendingWorklist.length,
      pendingReportsCount: pendingReports.length,
      todayExams,
      urgentCount: pendingWorklist.filter(e => e.urgency === 'emergency').length
    };
  }

  // ==================== TIPOS DE EXAME ====================

  getExamTypes() {
    return [
      { code: 'RX', name: 'Raio-X', preparation: 'Nenhuma', avgDuration: 5 },
      { code: 'USG', name: 'Ultrassonografia', preparation: 'Jejum 8h (abdome)', avgDuration: 20 },
      { code: 'TC', name: 'Tomografia Computadorizada', preparation: 'Jejum 4h', avgDuration: 30 },
      { code: 'RM', name: 'Ressonância Magnética', preparation: 'Sem metais', avgDuration: 45 },
      { code: 'MAM', name: 'Mamografia', preparation: 'Nenhuma', avgDuration: 15 },
      { code: 'DENS', name: 'Densitometria Óssea', preparation: 'Nenhuma', avgDuration: 20 },
      { code: 'ANGIO', name: 'Angiografia', preparation: 'Jejum 6h', avgDuration: 60 },
      { code: 'PET', name: 'PET-CT', preparation: 'Jejum 6h, evitar exercícios', avgDuration: 90 }
    ];
  }

  getBodyRegions() {
    return [
      { code: 'HEAD', name: 'Crânio' },
      { code: 'FACE', name: 'Face' },
      { code: 'NECK', name: 'Pescoço' },
      { code: 'CHEST', name: 'Tórax' },
      { code: 'ABDOMEN', name: 'Abdome' },
      { code: 'PELVIS', name: 'Pelve' },
      { code: 'SPINE_C', name: 'Coluna Cervical' },
      { code: 'SPINE_T', name: 'Coluna Torácica' },
      { code: 'SPINE_L', name: 'Coluna Lombar' },
      { code: 'SPINE_S', name: 'Coluna Sacral' },
      { code: 'SHOULDER', name: 'Ombro' },
      { code: 'ARM', name: 'Braço' },
      { code: 'ELBOW', name: 'Cotovelo' },
      { code: 'FOREARM', name: 'Antebraço' },
      { code: 'WRIST', name: 'Punho' },
      { code: 'HAND', name: 'Mão' },
      { code: 'HIP', name: 'Quadril' },
      { code: 'THIGH', name: 'Coxa' },
      { code: 'KNEE', name: 'Joelho' },
      { code: 'LEG', name: 'Perna' },
      { code: 'ANKLE', name: 'Tornozelo' },
      { code: 'FOOT', name: 'Pé' }
    ];
  }
}

