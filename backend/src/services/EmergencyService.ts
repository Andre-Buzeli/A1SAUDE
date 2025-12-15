import { prisma } from '../server';

export class EmergencyService {
  
  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================
  
  async create(data: {
    patientId: string;
    professionalId: string;
    establishmentId: string;
    triageId?: string;
    arrivalMode: string;
    origin?: string;
    manchesterColor: string;
    chiefComplaint: string;
  }) {
    return prisma.emergencyAttendance.create({
      data: {
        ...data,
        arrivalTime: new Date(),
        status: 'waiting'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });
  }

  async getById(id: string) {
    return prisma.emergencyAttendance.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true, phone: true, allergies: true }
        }
      }
    });
  }

  async update(id: string, data: Partial<{
    manchesterColor: string;
    chiefComplaint: string;
    firstContactTime: Date;
    medicalStartTime: Date;
    disposition: string;
    dispositionTime: Date;
    status: string;
    observationBedId: string;
    observationStartTime: Date;
    observationEndTime: Date;
    notes: string;
  }>) {
    return prisma.emergencyAttendance.update({
      where: { id },
      data,
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

  async startTriage(id: string) {
    return prisma.emergencyAttendance.update({
      where: { id },
      data: {
        status: 'in_triage',
        firstContactTime: new Date()
      }
    });
  }

  async completeTriage(id: string, manchesterColor: string) {
    return prisma.emergencyAttendance.update({
      where: { id },
      data: {
        status: 'waiting_medical',
        manchesterColor
      }
    });
  }

  async startMedicalAttendance(id: string) {
    return prisma.emergencyAttendance.update({
      where: { id },
      data: {
        status: 'in_attendance',
        medicalStartTime: new Date()
      }
    });
  }

  async moveToObservation(id: string, bedId: string) {
    return prisma.emergencyAttendance.update({
      where: { id },
      data: {
        status: 'observation',
        observationBedId: bedId,
        observationStartTime: new Date()
      }
    });
  }

  async completeAttendance(id: string, disposition: string, notes?: string) {
    return prisma.emergencyAttendance.update({
      where: { id },
      data: {
        status: 'completed',
        disposition,
        dispositionTime: new Date(),
        notes
      }
    });
  }

  // ============================================================================
  // QUEUE AND LIST
  // ============================================================================

  async getQueue(establishmentId: string) {
    return prisma.emergencyAttendance.findMany({
      where: {
        establishmentId,
        status: { in: ['waiting', 'in_triage', 'waiting_medical', 'in_attendance', 'observation'] }
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      },
      orderBy: [
        {
          manchesterColor: 'asc' // red, orange, yellow, green, blue
        },
        { arrivalTime: 'asc' }
      ]
    });
  }

  async getWaitingByPriority(establishmentId: string) {
    const waiting = await prisma.emergencyAttendance.findMany({
      where: {
        establishmentId,
        status: 'waiting_medical'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      }
    });

    // Group by Manchester color
    const grouped = {
      red: waiting.filter(w => w.manchesterColor === 'red'),
      orange: waiting.filter(w => w.manchesterColor === 'orange'),
      yellow: waiting.filter(w => w.manchesterColor === 'yellow'),
      green: waiting.filter(w => w.manchesterColor === 'green'),
      blue: waiting.filter(w => w.manchesterColor === 'blue')
    };

    return grouped;
  }

  async getObservation(establishmentId: string) {
    return prisma.emergencyAttendance.findMany({
      where: {
        establishmentId,
        status: 'observation'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true, birthDate: true }
        }
      },
      orderBy: { observationStartTime: 'asc' }
    });
  }

  async list(params: {
    establishmentId: string;
    patientId?: string;
    manchesterColor?: string;
    status?: string;
    disposition?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { establishmentId, patientId, manchesterColor, status, disposition, startDate, endDate, page = 1, limit = 20 } = params;
    
    const where: any = { establishmentId };
    
    if (patientId) where.patientId = patientId;
    if (manchesterColor) where.manchesterColor = manchesterColor;
    if (status) where.status = status;
    if (disposition) where.disposition = disposition;
    if (startDate || endDate) {
      where.arrivalTime = {};
      if (startDate) where.arrivalTime.gte = startDate;
      if (endDate) where.arrivalTime.lte = endDate;
    }

    const [items, total] = await Promise.all([
      prisma.emergencyAttendance.findMany({
        where,
        include: {
          patient: {
            select: { id: true, name: true, cpf: true, birthDate: true }
          }
        },
        orderBy: { arrivalTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.emergencyAttendance.count({ where })
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
  // DASHBOARD STATS
  // ============================================================================

  async getDashboardStats(establishmentId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalToday,
      waiting,
      inAttendance,
      observation,
      completed,
      byColor,
      byDisposition,
      avgWaitTime
    ] = await Promise.all([
      prisma.emergencyAttendance.count({
        where: { establishmentId, arrivalTime: { gte: today, lt: tomorrow } }
      }),
      prisma.emergencyAttendance.count({
        where: { establishmentId, status: { in: ['waiting', 'waiting_medical'] } }
      }),
      prisma.emergencyAttendance.count({
        where: { establishmentId, status: { in: ['in_triage', 'in_attendance'] } }
      }),
      prisma.emergencyAttendance.count({
        where: { establishmentId, status: 'observation' }
      }),
      prisma.emergencyAttendance.count({
        where: { establishmentId, status: 'completed', arrivalTime: { gte: today, lt: tomorrow } }
      }),
      prisma.emergencyAttendance.groupBy({
        by: ['manchesterColor'],
        where: { establishmentId, arrivalTime: { gte: today, lt: tomorrow } },
        _count: true
      }),
      prisma.emergencyAttendance.groupBy({
        by: ['disposition'],
        where: { establishmentId, status: 'completed', arrivalTime: { gte: today, lt: tomorrow } },
        _count: true
      }),
      // Calculate average wait time for completed attendances
      prisma.emergencyAttendance.findMany({
        where: {
          establishmentId,
          status: 'completed',
          arrivalTime: { gte: today, lt: tomorrow },
          medicalStartTime: { not: null }
        },
        select: { arrivalTime: true, medicalStartTime: true }
      })
    ]);

    // Calculate average wait time in minutes
    let avgWait = 0;
    if (avgWaitTime.length > 0) {
      const totalWait = avgWaitTime.reduce((sum, a) => {
        if (a.medicalStartTime) {
          return sum + (a.medicalStartTime.getTime() - a.arrivalTime.getTime());
        }
        return sum;
      }, 0);
      avgWait = Math.round(totalWait / avgWaitTime.length / 60000);
    }

    return {
      totalToday,
      waiting,
      inAttendance,
      observation,
      completed,
      avgWaitTime: avgWait,
      byColor: byColor.map(c => ({ color: c.manchesterColor, count: c._count })),
      byDisposition: byDisposition.map(d => ({ disposition: d.disposition, count: d._count }))
    };
  }

  // ============================================================================
  // MANCHESTER PROTOCOL
  // ============================================================================

  getManchesterColors() {
    return [
      { id: 'red', name: 'Vermelho', description: 'Emergência - Atendimento imediato', maxWait: 0 },
      { id: 'orange', name: 'Laranja', description: 'Muito urgente - Até 10 minutos', maxWait: 10 },
      { id: 'yellow', name: 'Amarelo', description: 'Urgente - Até 60 minutos', maxWait: 60 },
      { id: 'green', name: 'Verde', description: 'Pouco urgente - Até 120 minutos', maxWait: 120 },
      { id: 'blue', name: 'Azul', description: 'Não urgente - Até 240 minutos', maxWait: 240 }
    ];
  }
}

export const emergencyService = new EmergencyService();

