import { prisma } from '../server';

export class LabService {
  
  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================
  
  async create(data: {
    patientId: string;
    requestedById: string;
    establishmentId: string;
    attendanceId?: string;
    examCode: string;
    examName: string;
    examCategory: string;
    material: string;
    clinicalIndication: string;
    fastingRequired?: boolean;
    fastingHours?: number;
    scheduledFor?: Date;
  }) {
    return prisma.labExam.create({
      data: {
        ...data,
        status: 'requested'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  async getById(id: string) {
    return prisma.labExam.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        }
      }
    });
  }

  async update(id: string, data: Partial<{
    status: string;
    scheduledFor: Date;
    collectedAt: Date;
    collectedBy: string;
    sampleId: string;
    results: string;
    referenceValues: string;
    interpretation: string;
    isNormal: boolean;
    isCritical: boolean;
    criticalAlert: string;
    analyzedBy: string;
    analyzedAt: Date;
    validatedBy: string;
    validatedAt: Date;
    observations: string;
  }>) {
    return prisma.labExam.update({
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
    return prisma.labExam.delete({
      where: { id }
    });
  }

  // ============================================================================
  // LIST AND SEARCH
  // ============================================================================

  async list(params: {
    establishmentId: string;
    patientId?: string;
    examCategory?: string;
    status?: string;
    isCritical?: boolean;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { establishmentId, patientId, examCategory, status, isCritical, startDate, endDate, page = 1, limit = 20 } = params;
    
    const where: any = { establishmentId };
    
    if (patientId) where.patientId = patientId;
    if (examCategory) where.examCategory = examCategory;
    if (status) where.status = status;
    if (isCritical !== undefined) where.isCritical = isCritical;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.labExam.findMany({
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
      prisma.labExam.count({ where })
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
  // WORKFLOW
  // ============================================================================

  async schedule(id: string, scheduledFor: Date) {
    return prisma.labExam.update({
      where: { id },
      data: {
        status: 'scheduled',
        scheduledFor
      }
    });
  }

  async collect(id: string, data: {
    collectedBy: string;
    sampleId: string;
    collectedAt?: Date;
  }) {
    return prisma.labExam.update({
      where: { id },
      data: {
        status: 'collected',
        collectedAt: data.collectedAt || new Date(),
        collectedBy: data.collectedBy,
        sampleId: data.sampleId
      }
    });
  }

  async process(id: string) {
    return prisma.labExam.update({
      where: { id },
      data: {
        status: 'processing'
      }
    });
  }

  async addResults(id: string, data: {
    results: any;
    referenceValues?: any;
    interpretation?: string;
    isNormal?: boolean;
    isCritical?: boolean;
    criticalAlert?: string;
    analyzedBy: string;
  }) {
    return prisma.labExam.update({
      where: { id },
      data: {
        results: JSON.stringify(data.results),
        referenceValues: data.referenceValues ? JSON.stringify(data.referenceValues) : null,
        interpretation: data.interpretation,
        isNormal: data.isNormal,
        isCritical: data.isCritical,
        criticalAlert: data.criticalAlert,
        analyzedBy: data.analyzedBy,
        analyzedAt: new Date(),
        status: 'completed'
      }
    });
  }

  async validate(id: string, validatedBy: string) {
    return prisma.labExam.update({
      where: { id },
      data: {
        validatedBy,
        validatedAt: new Date()
      }
    });
  }

  // ============================================================================
  // PATIENT HISTORY
  // ============================================================================

  async getPatientHistory(patientId: string, examCategory?: string) {
    const where: any = { patientId };
    if (examCategory) where.examCategory = examCategory;

    return prisma.labExam.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  // ============================================================================
  // WORKLIST
  // ============================================================================

  async getWorklist(establishmentId: string, status?: string) {
    const where: any = { establishmentId };
    if (status) {
      where.status = status;
    } else {
      where.status = { in: ['scheduled', 'collected', 'processing'] };
    }

    return prisma.labExam.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      },
      orderBy: [
        { isCritical: 'desc' },
        { scheduledFor: 'asc' },
        { createdAt: 'asc' }
      ]
    });
  }

  async getCriticalAlerts(establishmentId: string) {
    return prisma.labExam.findMany({
      where: {
        establishmentId,
        isCritical: true,
        validatedAt: null
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        }
      },
      orderBy: { analyzedAt: 'desc' }
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

    const [
      todayRequested,
      todayCollected,
      todayCompleted,
      pending,
      criticalPending,
      byCategory
    ] = await Promise.all([
      prisma.labExam.count({
        where: { establishmentId, createdAt: { gte: today, lt: tomorrow } }
      }),
      prisma.labExam.count({
        where: { establishmentId, collectedAt: { gte: today, lt: tomorrow } }
      }),
      prisma.labExam.count({
        where: { establishmentId, status: 'completed', analyzedAt: { gte: today, lt: tomorrow } }
      }),
      prisma.labExam.count({
        where: { establishmentId, status: { in: ['requested', 'scheduled', 'collected', 'processing'] } }
      }),
      prisma.labExam.count({
        where: { establishmentId, isCritical: true, validatedAt: null }
      }),
      prisma.labExam.groupBy({
        by: ['examCategory'],
        where: { establishmentId, createdAt: { gte: today, lt: tomorrow } },
        _count: true
      })
    ]);

    return {
      todayRequested,
      todayCollected,
      todayCompleted,
      pending,
      criticalPending,
      byCategory: byCategory.map(c => ({ category: c.examCategory, count: c._count }))
    };
  }

  // ============================================================================
  // EXAM CATEGORIES
  // ============================================================================

  getExamCategories() {
    return [
      { id: 'hematology', name: 'Hematologia', description: 'Hemograma, coagulograma' },
      { id: 'biochemistry', name: 'Bioquímica', description: 'Glicose, ureia, creatinina, enzimas' },
      { id: 'urinalysis', name: 'Urinálise', description: 'EAS, cultura de urina' },
      { id: 'microbiology', name: 'Microbiologia', description: 'Culturas, antibiograma' },
      { id: 'serology', name: 'Sorologia', description: 'HIV, hepatites, sífilis' },
      { id: 'hormones', name: 'Hormônios', description: 'TSH, T4, FSH, LH' },
      { id: 'coagulation', name: 'Coagulação', description: 'TP, TTPA, INR' },
      { id: 'immunology', name: 'Imunologia', description: 'PCR, VHS, FAN' }
    ];
  }
}

export const labService = new LabService();

