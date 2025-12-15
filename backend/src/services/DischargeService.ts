import { prisma } from '../server';

export class DischargeService {
  
  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================
  
  async create(data: {
    patientId: string;
    establishmentId: string;
    admissionId: string;
    dischargeType: string;
    physicianId: string;
    physicianName: string;
    crm: string;
    patientCondition: string;
    mainDiagnosis: string;
    mainCid10: string;
    secondaryDiagnosis?: any[];
    secondaryCid10?: string[];
    procedures?: any[];
    instructions?: string;
    restrictions?: string;
    dietRecommendations?: string;
    activityRecommendations?: string;
    prescriptions?: any[];
    returnDate?: Date;
    returnInstructions?: string;
    referrals?: any[];
    dischargeSummary?: string;
  }) {
    return prisma.discharge.create({
      data: {
        ...data,
        dischargeDate: new Date(),
        status: 'pending',
        secondaryDiagnosis: data.secondaryDiagnosis ? JSON.stringify(data.secondaryDiagnosis) : null,
        secondaryCid10: data.secondaryCid10 ? JSON.stringify(data.secondaryCid10) : null,
        procedures: data.procedures ? JSON.stringify(data.procedures) : null,
        prescriptions: data.prescriptions ? JSON.stringify(data.prescriptions) : null,
        referrals: data.referrals ? JSON.stringify(data.referrals) : null
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  async getById(id: string) {
    const discharge = await prisma.discharge.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        }
      }
    });

    if (discharge) {
      return {
        ...discharge,
        secondaryDiagnosis: discharge.secondaryDiagnosis ? JSON.parse(discharge.secondaryDiagnosis) : null,
        secondaryCid10: discharge.secondaryCid10 ? JSON.parse(discharge.secondaryCid10) : null,
        procedures: discharge.procedures ? JSON.parse(discharge.procedures) : null,
        prescriptions: discharge.prescriptions ? JSON.parse(discharge.prescriptions) : null,
        referrals: discharge.referrals ? JSON.parse(discharge.referrals) : null
      };
    }

    return null;
  }

  async update(id: string, data: Partial<{
    dischargeType: string;
    patientCondition: string;
    mainDiagnosis: string;
    mainCid10: string;
    secondaryDiagnosis: any[];
    secondaryCid10: string[];
    procedures: any[];
    instructions: string;
    restrictions: string;
    dietRecommendations: string;
    activityRecommendations: string;
    prescriptions: any[];
    returnDate: Date;
    returnInstructions: string;
    referrals: any[];
    dischargeSummary: string;
    status: string;
  }>) {
    const updateData: any = { ...data };
    
    if (data.secondaryDiagnosis) updateData.secondaryDiagnosis = JSON.stringify(data.secondaryDiagnosis);
    if (data.secondaryCid10) updateData.secondaryCid10 = JSON.stringify(data.secondaryCid10);
    if (data.procedures) updateData.procedures = JSON.stringify(data.procedures);
    if (data.prescriptions) updateData.prescriptions = JSON.stringify(data.prescriptions);
    if (data.referrals) updateData.referrals = JSON.stringify(data.referrals);

    return prisma.discharge.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  async delete(id: string) {
    return prisma.discharge.delete({
      where: { id }
    });
  }

  // ============================================================================
  // WORKFLOW
  // ============================================================================

  async complete(id: string) {
    // Update admission status as well
    const discharge = await prisma.discharge.findUnique({
      where: { id },
      select: { admissionId: true }
    });

    if (discharge?.admissionId) {
      await prisma.admission.update({
        where: { id: discharge.admissionId },
        data: {
          status: 'discharged',
          dischargeDate: new Date()
        }
      });
    }

    return prisma.discharge.update({
      where: { id },
      data: { status: 'completed' }
    });
  }

  async cancel(id: string, reason: string) {
    return prisma.discharge.update({
      where: { id },
      data: {
        status: 'cancelled'
      }
    });
  }

  // ============================================================================
  // LIST AND SEARCH
  // ============================================================================

  async list(params: {
    establishmentId: string;
    patientId?: string;
    dischargeType?: string;
    patientCondition?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { establishmentId, patientId, dischargeType, patientCondition, status, startDate, endDate, page = 1, limit = 20 } = params;
    
    const where: any = { establishmentId };
    
    if (patientId) where.patientId = patientId;
    if (dischargeType) where.dischargeType = dischargeType;
    if (patientCondition) where.patientCondition = patientCondition;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.dischargeDate = {};
      if (startDate) where.dischargeDate.gte = startDate;
      if (endDate) where.dischargeDate.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.discharge.findMany({
        where,
        include: {
          patient: {
            select: { id: true, name: true, cpf: true, birthDate: true }
          }
        },
        orderBy: { dischargeDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.discharge.count({ where })
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

  async getPending(establishmentId: string) {
    return prisma.discharge.findMany({
      where: {
        establishmentId,
        status: 'pending'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      },
      orderBy: { dischargeDate: 'asc' }
    });
  }

  async getTodayDischarges(establishmentId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.discharge.findMany({
      where: {
        establishmentId,
        dischargeDate: { gte: today, lt: tomorrow }
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      },
      orderBy: { dischargeDate: 'desc' }
    });
  }

  // ============================================================================
  // PATIENT HISTORY
  // ============================================================================

  async getPatientHistory(patientId: string) {
    return prisma.discharge.findMany({
      where: { patientId },
      orderBy: { dischargeDate: 'desc' }
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
      pending,
      byType,
      byCondition
    ] = await Promise.all([
      prisma.discharge.count({
        where: { establishmentId, dischargeDate: { gte: today, lt: tomorrow } }
      }),
      prisma.discharge.count({
        where: { establishmentId, dischargeDate: { gte: startOfMonth } }
      }),
      prisma.discharge.count({
        where: { establishmentId, status: 'pending' }
      }),
      prisma.discharge.groupBy({
        by: ['dischargeType'],
        where: { establishmentId, dischargeDate: { gte: startOfMonth } },
        _count: true
      }),
      prisma.discharge.groupBy({
        by: ['patientCondition'],
        where: { establishmentId, dischargeDate: { gte: startOfMonth } },
        _count: true
      })
    ]);

    return {
      todayCount,
      monthCount,
      pending,
      byType: byType.map(t => ({ type: t.dischargeType, count: t._count })),
      byCondition: byCondition.map(c => ({ condition: c.patientCondition, count: c._count }))
    };
  }

  // ============================================================================
  // DISCHARGE TYPES
  // ============================================================================

  getDischargeTypes() {
    return [
      { id: 'medical', name: 'Alta Médica', description: 'Alta por melhora clínica' },
      { id: 'request', name: 'Alta a Pedido', description: 'Solicitada pelo paciente/família' },
      { id: 'transfer', name: 'Transferência', description: 'Transferido para outra unidade' },
      { id: 'death', name: 'Óbito', description: 'Falecimento' },
      { id: 'escape', name: 'Evasão', description: 'Paciente evadiu' }
    ];
  }

  getPatientConditions() {
    return [
      { id: 'improved', name: 'Melhorado', description: 'Melhora clínica' },
      { id: 'cured', name: 'Curado', description: 'Cura completa' },
      { id: 'stable', name: 'Estável', description: 'Condição estável' },
      { id: 'unchanged', name: 'Inalterado', description: 'Sem mudança significativa' },
      { id: 'worsened', name: 'Piorado', description: 'Piora clínica' },
      { id: 'death', name: 'Óbito', description: 'Falecimento' }
    ];
  }
}

export const dischargeService = new DischargeService();

