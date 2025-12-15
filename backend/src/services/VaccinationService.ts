import { prisma } from '../server';

export class VaccinationService {
  
  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================
  
  async create(data: {
    patientId: string;
    professionalId: string;
    establishmentId: string;
    vaccineName: string;
    vaccineCode: string;
    manufacturer?: string;
    batch: string;
    expirationDate: Date;
    dose: string;
    doseNumber?: number;
    applicationDate?: Date;
    applicationSite: string;
    route: string;
    campaignId?: string;
    campaignName?: string;
    nextDoseDate?: Date;
    notes?: string;
  }) {
    return prisma.vaccination.create({
      data: {
        ...data,
        status: 'applied'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  async getById(id: string) {
    return prisma.vaccination.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  async update(id: string, data: Partial<{
    vaccineName: string;
    vaccineCode: string;
    manufacturer: string;
    batch: string;
    expirationDate: Date;
    dose: string;
    doseNumber: number;
    applicationSite: string;
    route: string;
    hasAdverseReaction: boolean;
    adverseReactionDesc: string;
    adverseReactionDate: Date;
    status: string;
    postponeReason: string;
    nextDoseDate: Date;
    notes: string;
  }>) {
    return prisma.vaccination.update({
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
    return prisma.vaccination.delete({
      where: { id }
    });
  }

  // ============================================================================
  // LIST AND SEARCH
  // ============================================================================

  async list(params: {
    establishmentId: string;
    patientId?: string;
    vaccineName?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { establishmentId, patientId, vaccineName, status, startDate, endDate, page = 1, limit = 20 } = params;
    
    const where: any = { establishmentId };
    
    if (patientId) where.patientId = patientId;
    if (vaccineName) where.vaccineName = { contains: vaccineName };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.applicationDate = {};
      if (startDate) where.applicationDate.gte = startDate;
      if (endDate) where.applicationDate.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.vaccination.findMany({
        where,
        include: {
          patient: {
            select: { id: true, name: true, cpf: true, birthDate: true }
          }
        },
        orderBy: { applicationDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.vaccination.count({ where })
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
  // PATIENT VACCINATION HISTORY
  // ============================================================================

  async getPatientHistory(patientId: string) {
    return prisma.vaccination.findMany({
      where: { patientId },
      orderBy: { applicationDate: 'desc' }
    });
  }

  async getPendingVaccinations(patientId: string) {
    const today = new Date();
    return prisma.vaccination.findMany({
      where: {
        patientId,
        nextDoseDate: { lte: today },
        status: 'applied'
      },
      orderBy: { nextDoseDate: 'asc' }
    });
  }

  // ============================================================================
  // CAMPAIGN
  // ============================================================================

  async getCampaignStats(establishmentId: string, campaignName: string) {
    const [total, applied, pending] = await Promise.all([
      prisma.vaccination.count({
        where: { establishmentId, campaignName, status: 'applied' }
      }),
      prisma.vaccination.count({
        where: { establishmentId, campaignName, status: 'scheduled' }
      }),
      prisma.vaccination.count({
        where: { establishmentId, campaignName, status: 'postponed' }
      })
    ]);

    return { total, applied, pending, postponed: pending };
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

    const [todayCount, monthCount, pendingNextDose, byVaccine] = await Promise.all([
      prisma.vaccination.count({
        where: {
          establishmentId,
          applicationDate: { gte: today, lt: tomorrow }
        }
      }),
      prisma.vaccination.count({
        where: {
          establishmentId,
          applicationDate: { gte: startOfMonth }
        }
      }),
      prisma.vaccination.count({
        where: {
          establishmentId,
          nextDoseDate: { lte: tomorrow },
          status: 'applied'
        }
      }),
      prisma.vaccination.groupBy({
        by: ['vaccineName'],
        where: { establishmentId, applicationDate: { gte: startOfMonth } },
        _count: true,
        orderBy: { _count: { vaccineName: 'desc' } },
        take: 10
      })
    ]);

    return {
      todayCount,
      monthCount,
      pendingNextDose,
      byVaccine: byVaccine.map(v => ({ name: v.vaccineName, count: v._count }))
    };
  }

  // ============================================================================
  // ADVERSE REACTIONS
  // ============================================================================

  async reportAdverseReaction(id: string, data: {
    adverseReactionDesc: string;
    adverseReactionDate?: Date;
  }) {
    return prisma.vaccination.update({
      where: { id },
      data: {
        hasAdverseReaction: true,
        adverseReactionDesc: data.adverseReactionDesc,
        adverseReactionDate: data.adverseReactionDate || new Date()
      }
    });
  }

  async getAdverseReactions(establishmentId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      establishmentId,
      hasAdverseReaction: true
    };

    if (startDate || endDate) {
      where.adverseReactionDate = {};
      if (startDate) where.adverseReactionDate.gte = startDate;
      if (endDate) where.adverseReactionDate.lte = endDate;
    }

    return prisma.vaccination.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      },
      orderBy: { adverseReactionDate: 'desc' }
    });
  }
}

export const vaccinationService = new VaccinationService();

