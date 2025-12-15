import { prisma } from '../server';

export class DentalService {
  
  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================
  
  async create(data: {
    patientId: string;
    professionalId: string;
    establishmentId: string;
    attendanceId?: string;
    attendanceType: string;
    chiefComplaint: string;
    dentalHistory?: string;
    lastDentalVisit?: Date;
    brushingFrequency?: number;
    usesFloss?: boolean;
    odontogram?: string;
    periodontalExam?: string;
    softTissueExam?: string;
    diagnosis?: string;
    cid10Codes?: string;
    treatmentPlan?: string;
    urgency?: string;
    nextVisitDate?: Date;
    nextVisitNotes?: string;
    notes?: string;
  }) {
    return prisma.dentalAttendance.create({
      data: {
        ...data,
        status: 'in_progress'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  async getById(id: string) {
    return prisma.dentalAttendance.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        }
      }
    });
  }

  async update(id: string, data: Partial<{
    attendanceType: string;
    chiefComplaint: string;
    dentalHistory: string;
    lastDentalVisit: Date;
    brushingFrequency: number;
    usesFloss: boolean;
    odontogram: string;
    periodontalExam: string;
    softTissueExam: string;
    procedures: string;
    diagnosis: string;
    cid10Codes: string;
    treatmentPlan: string;
    urgency: string;
    status: string;
    nextVisitDate: Date;
    nextVisitNotes: string;
    notes: string;
  }>) {
    return prisma.dentalAttendance.update({
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
    return prisma.dentalAttendance.delete({
      where: { id }
    });
  }

  // ============================================================================
  // LIST AND SEARCH
  // ============================================================================

  async list(params: {
    establishmentId: string;
    patientId?: string;
    attendanceType?: string;
    status?: string;
    urgency?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { establishmentId, patientId, attendanceType, status, urgency, startDate, endDate, page = 1, limit = 20 } = params;
    
    const where: any = { establishmentId };
    
    if (patientId) where.patientId = patientId;
    if (attendanceType) where.attendanceType = attendanceType;
    if (status) where.status = status;
    if (urgency) where.urgency = urgency;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.dentalAttendance.findMany({
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
      prisma.dentalAttendance.count({ where })
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

  // ============================================================================
  // PATIENT DENTAL HISTORY
  // ============================================================================

  async getPatientHistory(patientId: string) {
    return prisma.dentalAttendance.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPatientOdontogram(patientId: string) {
    const lastAttendance = await prisma.dentalAttendance.findFirst({
      where: { patientId, odontogram: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: { odontogram: true, createdAt: true }
    });

    return lastAttendance ? {
      odontogram: lastAttendance.odontogram ? JSON.parse(lastAttendance.odontogram) : null,
      lastUpdate: lastAttendance.createdAt
    } : null;
  }

  // ============================================================================
  // PROCEDURES
  // ============================================================================

  async addProcedure(id: string, procedure: {
    code: string;
    name: string;
    tooth?: string;
    surface?: string;
    notes?: string;
    performedAt?: Date;
  }) {
    const attendance = await prisma.dentalAttendance.findUnique({
      where: { id },
      select: { procedures: true }
    });

    const procedures = attendance?.procedures ? JSON.parse(attendance.procedures) : [];
    procedures.push({
      ...procedure,
      performedAt: procedure.performedAt || new Date()
    });

    return prisma.dentalAttendance.update({
      where: { id },
      data: {
        procedures: JSON.stringify(procedures)
      }
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

    const [todayCount, monthCount, pendingReturns, byType, urgentCount] = await Promise.all([
      prisma.dentalAttendance.count({
        where: {
          establishmentId,
          createdAt: { gte: today, lt: tomorrow }
        }
      }),
      prisma.dentalAttendance.count({
        where: {
          establishmentId,
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.dentalAttendance.count({
        where: {
          establishmentId,
          nextVisitDate: { lte: tomorrow },
          status: 'completed'
        }
      }),
      prisma.dentalAttendance.groupBy({
        by: ['attendanceType'],
        where: { establishmentId, createdAt: { gte: startOfMonth } },
        _count: true
      }),
      prisma.dentalAttendance.count({
        where: {
          establishmentId,
          urgency: 'urgency',
          status: { in: ['scheduled', 'in_progress'] }
        }
      })
    ]);

    return {
      todayCount,
      monthCount,
      pendingReturns,
      urgentCount,
      byType: byType.map(t => ({ type: t.attendanceType, count: t._count }))
    };
  }

  // ============================================================================
  // QUEUE MANAGEMENT
  // ============================================================================

  async getQueue(establishmentId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.dentalAttendance.findMany({
      where: {
        establishmentId,
        createdAt: { gte: today, lt: tomorrow },
        status: { in: ['scheduled', 'in_progress'] }
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      },
      orderBy: [
        { urgency: 'asc' },
        { createdAt: 'asc' }
      ]
    });
  }
}

export const dentalService = new DentalService();

