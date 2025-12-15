import { prisma } from '../server';

export class HealthProgramService {
  
  // ============================================================================
  // PROGRAM MANAGEMENT
  // ============================================================================
  
  async createProgram(data: {
    name: string;
    description?: string;
    establishmentId: string;
  }) {
    return prisma.healthProgram.create({
      data: {
        ...data,
        isActive: true
      }
    });
  }

  async getPrograms(establishmentId: string) {
    return prisma.healthProgram.findMany({
      where: { establishmentId, isActive: true },
      include: {
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getProgramById(id: string) {
    return prisma.healthProgram.findUnique({
      where: { id },
      include: {
        enrollments: {
          where: { status: 'active' },
          include: {
            patient: {
              select: { id: true, name: true, cpf: true, birthDate: true }
            }
          }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });
  }

  async updateProgram(id: string, data: Partial<{
    name: string;
    description: string;
    isActive: boolean;
  }>) {
    return prisma.healthProgram.update({
      where: { id },
      data
    });
  }

  // ============================================================================
  // ENROLLMENT MANAGEMENT
  // ============================================================================

  async enrollPatient(data: {
    programId: string;
    patientId: string;
    professionalId: string;
    establishmentId: string;
    programData?: string;
    riskLevel?: string;
    nextVisitDate?: Date;
    notes?: string;
  }) {
    return prisma.programEnrollment.create({
      data: {
        ...data,
        status: 'active',
        enrollmentDate: new Date()
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        },
        program: true
      }
    });
  }

  async getEnrollmentById(id: string) {
    return prisma.programEnrollment.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        },
        program: true
      }
    });
  }

  async updateEnrollment(id: string, data: Partial<{
    status: string;
    exitDate: Date;
    exitReason: string;
    programData: string;
    lastVisitDate: Date;
    nextVisitDate: Date;
    riskLevel: string;
    notes: string;
  }>) {
    return prisma.programEnrollment.update({
      where: { id },
      data,
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        },
        program: true
      }
    });
  }

  async listEnrollments(params: {
    establishmentId: string;
    programId?: string;
    status?: string;
    riskLevel?: string;
    page?: number;
    limit?: number;
  }) {
    const { establishmentId, programId, status, riskLevel, page = 1, limit = 20 } = params;

    const where: any = { establishmentId };
    if (programId) where.programId = programId;
    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;

    const [items, total] = await Promise.all([
      prisma.programEnrollment.findMany({
        where,
        include: {
          patient: {
            select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
          },
          program: true
        },
        orderBy: { enrollmentDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.programEnrollment.count({ where })
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
  // PATIENT PROGRAMS
  // ============================================================================

  async getPatientPrograms(patientId: string) {
    return prisma.programEnrollment.findMany({
      where: { patientId },
      include: {
        program: true
      },
      orderBy: { enrollmentDate: 'desc' }
    });
  }

  // ============================================================================
  // PENDING VISITS
  // ============================================================================

  async getPendingVisits(establishmentId: string, programId?: string) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const where: any = {
      establishmentId,
      status: 'active',
      nextVisitDate: { lte: today }
    };

    if (programId) where.programId = programId;

    return prisma.programEnrollment.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        },
        program: true
      },
      orderBy: { nextVisitDate: 'asc' }
    });
  }

  // ============================================================================
  // DASHBOARD STATS
  // ============================================================================

  async getDashboardStats(establishmentId: string) {
    const [programs, totalEnrollments, activeEnrollments, highRisk, pendingVisits] = await Promise.all([
      prisma.healthProgram.findMany({
        where: { establishmentId, isActive: true },
        include: {
          _count: {
            select: { enrollments: { where: { status: 'active' } } }
          }
        }
      }),
      prisma.programEnrollment.count({ where: { establishmentId } }),
      prisma.programEnrollment.count({ where: { establishmentId, status: 'active' } }),
      prisma.programEnrollment.count({ where: { establishmentId, status: 'active', riskLevel: 'high' } }),
      prisma.programEnrollment.count({
        where: {
          establishmentId,
          status: 'active',
          nextVisitDate: { lte: new Date() }
        }
      })
    ]);

    return {
      programs: programs.map(p => ({
        id: p.id,
        name: p.name,
        activeCount: p._count.enrollments
      })),
      totalEnrollments,
      activeEnrollments,
      highRisk,
      pendingVisits
    };
  }

  // ============================================================================
  // SPECIFIC PROGRAMS DATA
  // ============================================================================

  async getHiperdiaData(establishmentId: string) {
    const enrollments = await prisma.programEnrollment.findMany({
      where: {
        establishmentId,
        status: 'active',
        program: { name: 'hiperdia' }
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        }
      }
    });

    // Parse programData for each enrollment
    return enrollments.map(e => ({
      ...e,
      programData: e.programData ? JSON.parse(e.programData) : null
    }));
  }

  async getPrenatalData(establishmentId: string) {
    const enrollments = await prisma.programEnrollment.findMany({
      where: {
        establishmentId,
        status: 'active',
        program: { name: 'prenatal' }
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        }
      }
    });

    return enrollments.map(e => ({
      ...e,
      programData: e.programData ? JSON.parse(e.programData) : null
    }));
  }

  async getChildcareData(establishmentId: string) {
    const enrollments = await prisma.programEnrollment.findMany({
      where: {
        establishmentId,
        status: 'active',
        program: { name: 'childcare' }
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        }
      }
    });

    return enrollments.map(e => ({
      ...e,
      programData: e.programData ? JSON.parse(e.programData) : null
    }));
  }

  async getElderlyData(establishmentId: string) {
    const enrollments = await prisma.programEnrollment.findMany({
      where: {
        establishmentId,
        status: 'active',
        program: { name: 'elderly' }
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true }
        }
      }
    });

    return enrollments.map(e => ({
      ...e,
      programData: e.programData ? JSON.parse(e.programData) : null
    }));
  }
}

export const healthProgramService = new HealthProgramService();

