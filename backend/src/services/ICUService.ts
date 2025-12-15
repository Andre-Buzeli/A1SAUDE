import { prisma } from '../server';

export class ICUService {
  
  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================
  
  async create(data: {
    patientId: string;
    establishmentId: string;
    admissionId?: string;
    bedId: string;
    admissionFrom: string;
    admissionReason: string;
    admissionDiagnosis: string;
    apacheScore?: number;
    sofaScore?: number;
    sapsScore?: number;
    attendingPhysicianId: string;
    ventilationMode?: string;
    sedationLevel?: string;
    vasopressors?: any;
    notes?: string;
  }) {
    return prisma.iCUAdmission.create({
      data: {
        ...data,
        admissionDate: new Date(),
        status: 'active',
        vasopressors: data.vasopressors ? JSON.stringify(data.vasopressors) : null
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  async getById(id: string) {
    return prisma.iCUAdmission.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true, allergies: true, bloodType: true }
        }
      }
    });
  }

  async update(id: string, data: Partial<{
    bedId: string;
    admissionDiagnosis: string;
    apacheScore: number;
    sofaScore: number;
    sapsScore: number;
    attendingPhysicianId: string;
    ventilationMode: string;
    sedationLevel: string;
    vasopressors: any;
    notes: string;
  }>) {
    return prisma.iCUAdmission.update({
      where: { id },
      data: {
        ...data,
        vasopressors: data.vasopressors ? JSON.stringify(data.vasopressors) : undefined
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  // ============================================================================
  // WORKFLOW
  // ============================================================================

  async discharge(id: string, data: {
    dischargeTo: string;
    dischargeReason: string;
    notes?: string;
  }) {
    const admission = await prisma.iCUAdmission.findUnique({
      where: { id },
      select: { admissionDate: true }
    });

    const dischargeDate = new Date();
    const lengthOfStay = admission
      ? Math.ceil((dischargeDate.getTime() - admission.admissionDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return prisma.iCUAdmission.update({
      where: { id },
      data: {
        status: data.dischargeTo === 'death' ? 'death' : 'discharged',
        dischargeDate,
        dischargeTo: data.dischargeTo,
        dischargeReason: data.dischargeReason,
        lengthOfStay,
        notes: data.notes
      }
    });
  }

  async transfer(id: string, data: {
    destinationUnit: string;
    transferReason: string;
    notes?: string;
  }) {
    const admission = await prisma.iCUAdmission.findUnique({
      where: { id },
      select: { admissionDate: true }
    });

    const dischargeDate = new Date();
    const lengthOfStay = admission
      ? Math.ceil((dischargeDate.getTime() - admission.admissionDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return prisma.iCUAdmission.update({
      where: { id },
      data: {
        status: 'transferred',
        dischargeDate,
        dischargeTo: 'transfer',
        dischargeReason: `Transferência para ${data.destinationUnit}: ${data.transferReason}`,
        lengthOfStay,
        notes: data.notes
      }
    });
  }

  async updateClinicalStatus(id: string, data: {
    ventilationMode?: string;
    sedationLevel?: string;
    vasopressors?: any;
    apacheScore?: number;
    sofaScore?: number;
    notes?: string;
  }) {
    return prisma.iCUAdmission.update({
      where: { id },
      data: {
        ...data,
        vasopressors: data.vasopressors ? JSON.stringify(data.vasopressors) : undefined
      }
    });
  }

  // ============================================================================
  // LIST AND SEARCH
  // ============================================================================

  async getActiveAdmissions(establishmentId: string) {
    return prisma.iCUAdmission.findMany({
      where: {
        establishmentId,
        status: 'active'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, bloodType: true }
        }
      },
      orderBy: { admissionDate: 'asc' }
    });
  }

  async list(params: {
    establishmentId: string;
    patientId?: string;
    status?: string;
    admissionFrom?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { establishmentId, patientId, status, admissionFrom, startDate, endDate, page = 1, limit = 20 } = params;
    
    const where: any = { establishmentId };
    
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    if (admissionFrom) where.admissionFrom = admissionFrom;
    if (startDate || endDate) {
      where.admissionDate = {};
      if (startDate) where.admissionDate.gte = startDate;
      if (endDate) where.admissionDate.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.iCUAdmission.findMany({
        where,
        include: {
          patient: {
            select: { id: true, name: true, cpf: true, birthDate: true }
          }
        },
        orderBy: { admissionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.iCUAdmission.count({ where })
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
  // BED MANAGEMENT
  // ============================================================================

  async getOccupiedBeds(establishmentId: string) {
    const activeAdmissions = await prisma.iCUAdmission.findMany({
      where: {
        establishmentId,
        status: 'active'
      },
      select: { bedId: true }
    });

    return activeAdmissions.map(a => a.bedId);
  }

  async changeBed(id: string, newBedId: string, reason: string) {
    return prisma.iCUAdmission.update({
      where: { id },
      data: {
        bedId: newBedId,
        notes: { append: `\nTroca de leito: ${reason}` }
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

    const [
      activeCount,
      todayAdmissions,
      todayDischarges,
      monthAdmissions,
      byVentilation,
      byAdmissionFrom,
      avgLengthOfStay,
      mortalityRate
    ] = await Promise.all([
      prisma.iCUAdmission.count({
        where: { establishmentId, status: 'active' }
      }),
      prisma.iCUAdmission.count({
        where: { establishmentId, admissionDate: { gte: today, lt: tomorrow } }
      }),
      prisma.iCUAdmission.count({
        where: { establishmentId, dischargeDate: { gte: today, lt: tomorrow } }
      }),
      prisma.iCUAdmission.count({
        where: { establishmentId, admissionDate: { gte: startOfMonth } }
      }),
      prisma.iCUAdmission.groupBy({
        by: ['ventilationMode'],
        where: { establishmentId, status: 'active' },
        _count: true
      }),
      prisma.iCUAdmission.groupBy({
        by: ['admissionFrom'],
        where: { establishmentId, admissionDate: { gte: startOfMonth } },
        _count: true
      }),
      prisma.iCUAdmission.aggregate({
        where: {
          establishmentId,
          status: { in: ['discharged', 'transferred', 'death'] },
          lengthOfStay: { not: null }
        },
        _avg: { lengthOfStay: true }
      }),
      // Calculate mortality rate for the month
      prisma.iCUAdmission.count({
        where: {
          establishmentId,
          status: 'death',
          dischargeDate: { gte: startOfMonth }
        }
      })
    ]);

    const monthTotal = await prisma.iCUAdmission.count({
      where: {
        establishmentId,
        dischargeDate: { gte: startOfMonth }
      }
    });

    return {
      activeCount,
      todayAdmissions,
      todayDischarges,
      monthAdmissions,
      avgLengthOfStay: avgLengthOfStay._avg.lengthOfStay || 0,
      mortalityRate: monthTotal > 0 ? ((mortalityRate / monthTotal) * 100).toFixed(1) : 0,
      byVentilation: byVentilation.map(v => ({ mode: v.ventilationMode || 'N/A', count: v._count })),
      byAdmissionFrom: byAdmissionFrom.map(a => ({ from: a.admissionFrom, count: a._count }))
    };
  }

  // ============================================================================
  // CLINICAL SCORES
  // ============================================================================

  getVentilationModes() {
    return [
      { id: 'spontaneous', name: 'Espontâneo', description: 'Respiração espontânea' },
      { id: 'invasive', name: 'Ventilação Mecânica Invasiva', description: 'VMI' },
      { id: 'niv', name: 'Ventilação Não Invasiva', description: 'VNI' },
      { id: 'cpap', name: 'CPAP', description: 'Pressão positiva contínua' },
      { id: 'bipap', name: 'BiPAP', description: 'Dois níveis de pressão' }
    ];
  }

  getSedationLevels() {
    return [
      { id: '-5', name: 'Não responsivo', description: 'RASS -5' },
      { id: '-4', name: 'Sedação profunda', description: 'RASS -4' },
      { id: '-3', name: 'Sedação moderada', description: 'RASS -3' },
      { id: '-2', name: 'Sedação leve', description: 'RASS -2' },
      { id: '-1', name: 'Sonolento', description: 'RASS -1' },
      { id: '0', name: 'Alerta e calmo', description: 'RASS 0' },
      { id: '1', name: 'Inquieto', description: 'RASS +1' },
      { id: '2', name: 'Agitado', description: 'RASS +2' },
      { id: '3', name: 'Muito agitado', description: 'RASS +3' },
      { id: '4', name: 'Combativo', description: 'RASS +4' }
    ];
  }
}

export const icuService = new ICUService();

