import { prisma } from '../server';

export class MedicationRoomService {
  
  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================
  
  async create(data: {
    patientId: string;
    professionalId: string;
    establishmentId: string;
    attendanceId?: string;
    prescriptionId?: string;
    medicationName: string;
    dosage: string;
    route: string;
    scheduledTime: Date;
    notes?: string;
  }) {
    return prisma.medicationRoom.create({
      data: {
        ...data,
        status: 'scheduled'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  async getById(id: string) {
    return prisma.medicationRoom.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        }
      }
    });
  }

  async update(id: string, data: Partial<{
    medicationName: string;
    dosage: string;
    route: string;
    scheduledTime: Date;
    administeredAt: Date;
    administeredBy: string;
    status: string;
    vitalSignsBefore: string;
    vitalSignsAfter: string;
    reactions: string;
    notes: string;
  }>) {
    return prisma.medicationRoom.update({
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
    return prisma.medicationRoom.delete({
      where: { id }
    });
  }

  // ============================================================================
  // WORKFLOW
  // ============================================================================

  async startAdministration(id: string, performedBy: string) {
    return prisma.medicationRoom.update({
      where: { id },
      data: {
        status: 'in_progress'
      }
    });
  }

  async completeAdministration(id: string, data: {
    administeredBy: string;
    vitalSignsBefore?: any;
    vitalSignsAfter?: any;
    reactions?: string;
    notes?: string;
  }) {
    return prisma.medicationRoom.update({
      where: { id },
      data: {
        status: 'completed',
        administeredAt: new Date(),
        administeredBy: data.administeredBy,
        vitalSignsBefore: data.vitalSignsBefore ? JSON.stringify(data.vitalSignsBefore) : null,
        vitalSignsAfter: data.vitalSignsAfter ? JSON.stringify(data.vitalSignsAfter) : null,
        reactions: data.reactions,
        notes: data.notes
      }
    });
  }

  async cancelAdministration(id: string, reason: string) {
    return prisma.medicationRoom.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: reason
      }
    });
  }

  async refuseAdministration(id: string, reason: string) {
    return prisma.medicationRoom.update({
      where: { id },
      data: {
        status: 'refused',
        notes: `Recusado pelo paciente: ${reason}`
      }
    });
  }

  // ============================================================================
  // LIST AND QUEUE
  // ============================================================================

  async list(params: {
    establishmentId: string;
    patientId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { establishmentId, patientId, status, startDate, endDate, page = 1, limit = 20 } = params;
    
    const where: any = { establishmentId };
    
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.scheduledTime = {};
      if (startDate) where.scheduledTime.gte = startDate;
      if (endDate) where.scheduledTime.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.medicationRoom.findMany({
        where,
        include: {
          patient: {
            select: { id: true, name: true, cpf: true, birthDate: true }
          }
        },
        orderBy: { scheduledTime: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.medicationRoom.count({ where })
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

  async getQueue(establishmentId: string) {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAhead = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    return prisma.medicationRoom.findMany({
      where: {
        establishmentId,
        status: { in: ['scheduled', 'in_progress'] },
        scheduledTime: { gte: twoHoursAgo, lte: twoHoursAhead }
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      },
      orderBy: { scheduledTime: 'asc' }
    });
  }

  async getPendingForPatient(patientId: string) {
    return prisma.medicationRoom.findMany({
      where: {
        patientId,
        status: { in: ['scheduled', 'in_progress'] }
      },
      orderBy: { scheduledTime: 'asc' }
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

    const now = new Date();

    const [
      todayScheduled,
      todayCompleted,
      inProgress,
      overdue,
      byRoute
    ] = await Promise.all([
      prisma.medicationRoom.count({
        where: {
          establishmentId,
          scheduledTime: { gte: today, lt: tomorrow }
        }
      }),
      prisma.medicationRoom.count({
        where: {
          establishmentId,
          status: 'completed',
          administeredAt: { gte: today, lt: tomorrow }
        }
      }),
      prisma.medicationRoom.count({
        where: {
          establishmentId,
          status: 'in_progress'
        }
      }),
      prisma.medicationRoom.count({
        where: {
          establishmentId,
          status: 'scheduled',
          scheduledTime: { lt: now }
        }
      }),
      prisma.medicationRoom.groupBy({
        by: ['route'],
        where: { establishmentId, scheduledTime: { gte: today, lt: tomorrow } },
        _count: true
      })
    ]);

    return {
      todayScheduled,
      todayCompleted,
      inProgress,
      overdue,
      byRoute: byRoute.map(r => ({ route: r.route, count: r._count }))
    };
  }
}

export const medicationRoomService = new MedicationRoomService();

