import { prisma } from '../server';

export class MinorSurgeryService {
  
  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================
  
  async create(data: {
    patientId: string;
    professionalId: string;
    establishmentId: string;
    attendanceId?: string;
    procedureCode: string;
    procedureName: string;
    procedureType: string;
    bodyRegion: string;
    laterality?: string;
    anesthesiaType?: string;
    anesthetic?: string;
    scheduledFor?: Date;
    notes?: string;
  }) {
    return prisma.minorSurgery.create({
      data: {
        ...data,
        status: data.scheduledFor ? 'scheduled' : 'in_progress'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  async getById(id: string) {
    return prisma.minorSurgery.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        }
      }
    });
  }

  async update(id: string, data: Partial<{
    procedureCode: string;
    procedureName: string;
    procedureType: string;
    bodyRegion: string;
    laterality: string;
    anesthesiaType: string;
    anesthetic: string;
    scheduledFor: Date;
    startTime: Date;
    endTime: Date;
    duration: number;
    status: string;
    materialsUsed: string;
    sutureType: string;
    sutureCount: number;
    postProcedureNotes: string;
    complications: string;
    returnDate: Date;
    returnInstructions: string;
    notes: string;
  }>) {
    return prisma.minorSurgery.update({
      where: { id },
      data,
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  async delete(id: string) {
    return prisma.minorSurgery.delete({
      where: { id }
    });
  }

  // ============================================================================
  // WORKFLOW
  // ============================================================================

  async start(id: string) {
    return prisma.minorSurgery.update({
      where: { id },
      data: {
        status: 'in_progress',
        startTime: new Date()
      }
    });
  }

  async complete(id: string, data: {
    materialsUsed?: any[];
    sutureType?: string;
    sutureCount?: number;
    postProcedureNotes?: string;
    complications?: string;
    returnDate?: Date;
    returnInstructions?: string;
    notes?: string;
  }) {
    const procedure = await prisma.minorSurgery.findUnique({
      where: { id },
      select: { startTime: true }
    });

    const endTime = new Date();
    const duration = procedure?.startTime
      ? Math.round((endTime.getTime() - procedure.startTime.getTime()) / 60000)
      : null;

    return prisma.minorSurgery.update({
      where: { id },
      data: {
        status: 'completed',
        endTime,
        duration,
        materialsUsed: data.materialsUsed ? JSON.stringify(data.materialsUsed) : null,
        sutureType: data.sutureType,
        sutureCount: data.sutureCount,
        postProcedureNotes: data.postProcedureNotes,
        complications: data.complications,
        returnDate: data.returnDate,
        returnInstructions: data.returnInstructions,
        notes: data.notes
      }
    });
  }

  async cancel(id: string, reason: string) {
    return prisma.minorSurgery.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: reason
      }
    });
  }

  // ============================================================================
  // LIST AND SEARCH
  // ============================================================================

  async list(params: {
    establishmentId: string;
    patientId?: string;
    procedureType?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { establishmentId, patientId, procedureType, status, startDate, endDate, page = 1, limit = 20 } = params;
    
    const where: any = { establishmentId };
    
    if (patientId) where.patientId = patientId;
    if (procedureType) where.procedureType = procedureType;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.minorSurgery.findMany({
        where,
        include: {
          patient: {
            select: { id: true, name: true, cpf: true, birthDate: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.minorSurgery.count({ where })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTodayProcedures(establishmentId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.minorSurgery.findMany({
      where: {
        establishmentId,
        createdAt: { gte: today, lt: tomorrow }
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ============================================================================
  // PATIENT HISTORY
  // ============================================================================

  async getPatientHistory(patientId: string) {
    return prisma.minorSurgery.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ============================================================================
  // DASHBOARD STATS
  // ============================================================================

  async getDashboardStats(establishmentId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayCount,
      monthCount,
      inProgress,
      byType,
      complications
    ] = await Promise.all([
      prisma.minorSurgery.count({
        where: { establishmentId, createdAt: { gte: today, lt: tomorrow } }
      }),
      prisma.minorSurgery.count({
        where: { establishmentId, createdAt: { gte: startOfMonth } }
      }),
      prisma.minorSurgery.count({
        where: { establishmentId, status: 'in_progress' }
      }),
      prisma.minorSurgery.groupBy({
        by: ['procedureType'],
        where: { establishmentId, createdAt: { gte: startOfMonth } },
        _count: true
      }),
      prisma.minorSurgery.count({
        where: {
          establishmentId,
          createdAt: { gte: startOfMonth },
          complications: { not: null }
        }
      })
    ]);

    return {
      todayCount,
      monthCount,
      inProgress,
      complications,
      byType: byType.map(t => ({ type: t.procedureType, count: t._count }))
    };
  }

  // ============================================================================
  // PROCEDURE TYPES
  // ============================================================================

  getProcedureTypes() {
    return [
      { id: 'suture', name: 'Sutura', description: 'Fechamento de feridas' },
      { id: 'drainage', name: 'Drenagem', description: 'Drenagem de abscessos' },
      { id: 'biopsy', name: 'Biópsia', description: 'Coleta de tecido para análise' },
      { id: 'excision', name: 'Exérese', description: 'Remoção de lesões' },
      { id: 'debridement', name: 'Debridamento', description: 'Limpeza de feridas' },
      { id: 'dressing', name: 'Curativo Especial', description: 'Curativos complexos' },
      { id: 'foreign_body_removal', name: 'Retirada de Corpo Estranho', description: 'Remoção de objetos' },
      { id: 'nail_removal', name: 'Cantoplastia', description: 'Unha encravada' },
      { id: 'cauterization', name: 'Cauterização', description: 'Cauterização de lesões' }
    ];
  }
}

export const minorSurgeryService = new MinorSurgeryService();

