/**
 * Serviço de Visitas Domiciliares
 * Sistema A1 Saúde - UBS
 */

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Schemas de validação
const createHomeVisitSchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  professionalId: z.string().min(1, 'Profissional é obrigatório'),
  establishmentId: z.string().min(1, 'Estabelecimento é obrigatório'),
  
  // Agendamento
  scheduledDate: z.string().transform(str => new Date(str)),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  visitType: z.enum(['routine', 'followup', 'active_search', 'bedridden', 'post_discharge', 'newborn', 'prenatal']),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
});

const completeVisitSchema = z.object({
  realizedAt: z.string().transform(str => new Date(str)),
  duration: z.number().min(1).optional(),
  
  // Condições do Domicílio
  hasRunningWater: z.boolean().optional(),
  hasSewage: z.boolean().optional(),
  hasGarbageCollection: z.boolean().optional(),
  hasElectricity: z.boolean().optional(),
  buildingType: z.enum(['masonry', 'wood', 'mixed', 'improvised', 'other']).optional(),
  roomsCount: z.number().optional(),
  residentsCount: z.number().optional(),
  
  // Registro da Visita
  situationFound: z.string().optional(),
  patientCondition: z.string().optional(),
  actionsPerformed: z.array(z.string()).optional(),
  orientationsGiven: z.string().optional(),
  referrals: z.string().optional(),
  
  // Follow-up
  nextVisitDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  observations: z.string().optional()
});

export interface HomeVisitFilters {
  patientId?: string;
  professionalId?: string;
  establishmentId?: string;
  status?: string;
  visitType?: string;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface HomeVisitStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export class HomeVisitService {
  constructor(private prisma: PrismaClient) {}

  // ==================== CRUD ====================

  async createVisit(data: any) {
    const validatedData = createHomeVisitSchema.parse(data);

    // Verificar se paciente existe
    const patient = await this.prisma.patient.findUnique({
      where: { id: validatedData.patientId }
    });

    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    return await this.prisma.homeVisit.create({
      data: {
        ...validatedData,
        status: 'scheduled'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, phone: true }
        },
        establishment: {
          select: { id: true, name: true, type: true }
        }
      }
    });
  }

  async getVisitById(id: string) {
    const visit = await this.prisma.homeVisit.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true,
            phone: true,
            street: true,
            number: true,
            neighborhood: true,
            city: true
          }
        },
        establishment: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    if (!visit) {
      throw new Error('Visita não encontrada');
    }

    return visit;
  }

  async searchVisits(filters: HomeVisitFilters) {
    const {
      patientId,
      professionalId,
      establishmentId,
      status,
      visitType,
      priority,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = filters;

    const where: any = {};

    if (patientId) where.patientId = patientId;
    if (professionalId) where.professionalId = professionalId;
    if (establishmentId) where.establishmentId = establishmentId;
    if (status) where.status = status;
    if (visitType) where.visitType = visitType;
    if (priority) where.priority = priority;

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = startDate;
      if (endDate) where.scheduledDate.lte = endDate;
    }

    const total = await this.prisma.homeVisit.count({ where });

    const visits = await this.prisma.homeVisit.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            street: true,
            number: true,
            neighborhood: true
          }
        },
        establishment: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      visits,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateVisit(id: string, data: any) {
    const existing = await this.prisma.homeVisit.findUnique({ where: { id } });
    
    if (!existing) {
      throw new Error('Visita não encontrada');
    }

    // Não permitir atualização de visitas já finalizadas
    if (existing.status === 'completed') {
      throw new Error('Não é possível alterar uma visita já finalizada');
    }

    return await this.prisma.homeVisit.update({
      where: { id },
      data,
      include: {
        patient: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async cancelVisit(id: string, reason: string) {
    const visit = await this.prisma.homeVisit.findUnique({ where: { id } });
    
    if (!visit) {
      throw new Error('Visita não encontrada');
    }

    if (visit.status === 'completed') {
      throw new Error('Não é possível cancelar uma visita já finalizada');
    }

    return await this.prisma.homeVisit.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancellationReason: reason
      }
    });
  }

  // ==================== WORKFLOW ====================

  async startVisit(id: string) {
    const visit = await this.prisma.homeVisit.findUnique({ where: { id } });
    
    if (!visit) {
      throw new Error('Visita não encontrada');
    }

    if (visit.status !== 'scheduled') {
      throw new Error('Visita não está agendada');
    }

    return await this.prisma.homeVisit.update({
      where: { id },
      data: {
        status: 'in_progress'
      }
    });
  }

  async completeVisit(id: string, data: any) {
    const visit = await this.prisma.homeVisit.findUnique({ where: { id } });
    
    if (!visit) {
      throw new Error('Visita não encontrada');
    }

    if (visit.status === 'completed') {
      throw new Error('Visita já foi finalizada');
    }

    if (visit.status === 'cancelled') {
      throw new Error('Visita foi cancelada');
    }

    const validatedData = completeVisitSchema.parse(data);

    return await this.prisma.homeVisit.update({
      where: { id },
      data: {
        ...validatedData,
        status: 'completed',
        actionsPerformed: validatedData.actionsPerformed 
          ? JSON.stringify(validatedData.actionsPerformed) 
          : undefined
      },
      include: {
        patient: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async rescheduleVisit(id: string, newDate: Date, newTime: string, reason?: string) {
    const visit = await this.prisma.homeVisit.findUnique({ where: { id } });
    
    if (!visit) {
      throw new Error('Visita não encontrada');
    }

    if (visit.status === 'completed') {
      throw new Error('Não é possível reagendar uma visita já finalizada');
    }

    return await this.prisma.homeVisit.update({
      where: { id },
      data: {
        scheduledDate: newDate,
        scheduledTime: newTime,
        status: 'rescheduled',
        observations: reason 
          ? `${visit.observations || ''}\nReagendado: ${reason}`.trim()
          : visit.observations
      }
    });
  }

  async markNotFound(id: string, observations?: string) {
    const visit = await this.prisma.homeVisit.findUnique({ where: { id } });
    
    if (!visit) {
      throw new Error('Visita não encontrada');
    }

    return await this.prisma.homeVisit.update({
      where: { id },
      data: {
        status: 'not_found',
        observations: observations || 'Paciente não encontrado no endereço'
      }
    });
  }

  // ==================== ESTATÍSTICAS ====================

  async getStats(establishmentId?: string, startDate?: Date, endDate?: Date): Promise<HomeVisitStats> {
    const where: any = {};
    
    if (establishmentId) where.establishmentId = establishmentId;
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = startDate;
      if (endDate) where.scheduledDate.lte = endDate;
    }

    const visits = await this.prisma.homeVisit.findMany({
      where,
      select: {
        status: true,
        visitType: true,
        priority: true
      }
    });

    const total = visits.length;
    const scheduled = visits.filter(v => v.status === 'scheduled').length;
    const completed = visits.filter(v => v.status === 'completed').length;
    const cancelled = visits.filter(v => v.status === 'cancelled').length;

    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    visits.forEach(v => {
      byType[v.visitType] = (byType[v.visitType] || 0) + 1;
      byPriority[v.priority] = (byPriority[v.priority] || 0) + 1;
    });

    return {
      total,
      scheduled,
      completed,
      cancelled,
      byType,
      byPriority
    };
  }

  async getTodayVisits(professionalId?: string, establishmentId?: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const where: any = {
      scheduledDate: {
        gte: startOfDay,
        lt: endOfDay
      }
    };

    if (professionalId) where.professionalId = professionalId;
    if (establishmentId) where.establishmentId = establishmentId;

    return await this.prisma.homeVisit.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            street: true,
            number: true,
            neighborhood: true
          }
        }
      },
      orderBy: { scheduledTime: 'asc' }
    });
  }

  async getPendingVisits(establishmentId?: string) {
    const where: any = {
      status: { in: ['scheduled', 'rescheduled'] },
      scheduledDate: { lt: new Date() }
    };

    if (establishmentId) where.establishmentId = establishmentId;

    return await this.prisma.homeVisit.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  // ==================== DASHBOARD ====================

  async getDashboardData(establishmentId?: string) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const where: any = {};
    if (establishmentId) where.establishmentId = establishmentId;

    const [stats, todayVisits, pendingVisits, recentCompleted] = await Promise.all([
      this.getStats(establishmentId, startOfMonth, endOfMonth),
      this.getTodayVisits(undefined, establishmentId),
      this.getPendingVisits(establishmentId),
      this.prisma.homeVisit.findMany({
        where: {
          ...where,
          status: 'completed'
        },
        include: {
          patient: {
            select: { id: true, name: true }
          }
        },
        orderBy: { realizedAt: 'desc' },
        take: 5
      })
    ]);

    return {
      stats,
      todayVisits,
      pendingCount: pendingVisits.length,
      recentCompleted
    };
  }
}

