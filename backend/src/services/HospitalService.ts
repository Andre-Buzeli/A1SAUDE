import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const createAdmissionSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  bedId: z.string().optional(),
  reason: z.string().min(1, 'Motivo da internação é obrigatório'),
  diagnosis: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  attendingPhysician: z.string().optional(),
  observations: z.string().optional()
});

const createSurgerySchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  procedure: z.string().min(1, 'Procedimento é obrigatório'),
  surgeon: z.string().min(1, 'Cirurgião é obrigatório'),
  scheduledDate: z.string().transform(str => new Date(str)),
  duration: z.number().min(1, 'Duração deve ser maior que 0'),
  room: z.string().optional(),
  priority: z.enum(['elective', 'urgent', 'emergency']).default('elective'),
  preOpRequirements: z.array(z.string()).optional(),
  observations: z.string().optional()
});

export interface HospitalStats {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  totalAdmissions: number;
  activeAdmissions: number;
  avgLengthOfStay: number;
  surgeriesToday: number;
  surgeriesThisWeek: number;
  icuOccupancy: number;
}

export class HospitalService {
  constructor(private prisma: PrismaClient) {}

  // Admissões/Internações
  async createAdmission(data: any, professionalId: string) {
    const validatedData = createAdmissionSchema.parse(data);

    // Find available bed if not specified
    let bedId = validatedData.bedId;
    if (!bedId) {
      const availableBed = await this.prisma.bed.findFirst({
        where: {
          establishmentId: data.establishmentId,
          status: 'available'
        }
      });

      if (!availableBed) {
        throw new Error('Nenhum leito disponível para internação');
      }

      bedId = availableBed.id;

      // Update bed status
      await this.prisma.bed.update({
        where: { id: bedId },
        data: { status: 'occupied' }
      });
    }

    return await this.prisma.admission.create({
      data: {
        patientId: validatedData.patientId,
        bedId,
        reason: validatedData.reason,
        diagnosis: validatedData.diagnosis,
        priority: validatedData.priority,
        attendingPhysician: validatedData.attendingPhysician,
        observations: validatedData.observations,
        status: 'active'
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        },
        bed: {
          include: {
            unit: true
          }
        }
      }
    });
  }

  async getAdmissions(establishmentId: string, filters?: any) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      bed: {
        establishmentId
      }
    };

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.unitId) where.bed = { unitId: filters.unitId };

    const [admissions, total] = await Promise.all([
      this.prisma.admission.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              cpf: true,
              birthDate: true,
              gender: true
            }
          },
          bed: {
            include: {
              unit: true
            }
          }
        },
        orderBy: { admissionDate: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.admission.count({ where })
    ]);

    return {
      admissions,
      total,
      page,
      limit,
      hasMore: total > page * limit
    };
  }

  async dischargePatient(admissionId: string, dischargeReason: string, observations?: string) {
    // Get current admission
    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
      include: { bed: true }
    });

    if (!admission) {
      throw new Error('Internação não encontrada');
    }

    // Update admission
    const updatedAdmission = await this.prisma.admission.update({
      where: { id: admissionId },
      data: {
        status: 'discharged',
        dischargeDate: new Date(),
        dischargeReason: dischargeReason
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        },
        bed: {
          include: {
            unit: true
          }
        }
      }
    });

    // Free up the bed
    await this.prisma.bed.update({
      where: { id: admission.bedId },
      data: { status: 'available' }
    });

    return updatedAdmission;
  }

  async transferPatient(admissionId: string, newBedId: string, reason: string) {
    // Get current admission
    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
      include: { bed: true }
    });

    if (!admission) {
      throw new Error('Internação não encontrada');
    }

    // Check if new bed is available
    const newBed = await this.prisma.bed.findUnique({
      where: { id: newBedId }
    });

    if (!newBed || newBed.status !== 'available') {
      throw new Error('Leito de destino não está disponível');
    }

    // Update beds
    await this.prisma.bed.update({
      where: { id: admission.bedId },
      data: { status: 'available' }
    });

    await this.prisma.bed.update({
      where: { id: newBedId },
      data: { status: 'occupied' }
    });

    // Update admission
    return await this.prisma.admission.update({
      where: { id: admissionId },
      data: {
        bedId: newBedId,
        transferReason: reason
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        },
        bed: {
          include: {
            unit: true
          }
        }
      }
    });
  }

  // Leitos
  async getBedMap(establishmentId: string, unitId?: string) {
    const where: any = { establishmentId };
    if (unitId) where.unitId = unitId;

    const beds = await this.prisma.bed.findMany({
      where,
      include: {
        unit: true,
        // Note: Prisma doesn't support nested relations with admissions directly
        // We'll need to handle this differently or add a computed field
      },
      orderBy: [
        { unit: { name: 'asc' } },
        { number: 'asc' }
      ]
    });

    // Group by unit
    const groupedBeds = beds.reduce((acc, bed) => {
      const unitName = bed.unit.name;
      if (!acc[unitName]) {
        acc[unitName] = [];
      }
      acc[unitName].push({
        id: bed.id,
        number: bed.number,
        type: bed.type,
        status: bed.status,
        isActive: bed.isActive
      });
      return acc;
    }, {} as Record<string, any[]>);

    return {
      units: groupedBeds,
      totalBeds: beds.length,
      availableBeds: beds.filter(b => b.status === 'available').length,
      occupiedBeds: beds.filter(b => b.status === 'occupied').length,
      maintenanceBeds: beds.filter(b => b.status === 'maintenance').length
    };
  }

  async updateBedStatus(bedId: string, status: string, reason?: string) {
    return await this.prisma.bed.update({
      where: { id: bedId },
      data: {
        status,
        // TODO: Add maintenance reason field to schema if needed
      },
      include: {
        unit: true
      }
    });
  }

  // Centro Cirúrgico - Placeholder (would need Surgery model)
  async createSurgery(data: any, professionalId: string) {
    // TODO: Implement when Surgery model is added to schema
    throw new Error('Centro cirúrgico ainda não implementado - aguardando model Surgery');
  }

  async getSurgeries(establishmentId: string, filters?: any) {
    // TODO: Implement when Surgery model is added to schema
    return {
      surgeries: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false
    };
  }

  async updateSurgeryStatus(surgeryId: string, status: string, notes?: string) {
    // TODO: Implement when Surgery model is added to schema
    throw new Error('Centro cirúrgico ainda não implementado - aguardando model Surgery');
  }

  // UTI - Basic monitoring
  async getICUPatients(establishmentId: string) {
    // Get ICU unit beds
    const icuBeds = await this.prisma.bed.findMany({
      where: {
        establishmentId,
        unit: {
          name: {
            contains: 'UTI'
          }
        },
        status: 'occupied'
      },
      include: {
        unit: true
      }
    });

    // Get admissions for these beds
    const bedIds = icuBeds.map(b => b.id);
    const admissions = await this.prisma.admission.findMany({
      where: {
        bedId: { in: bedIds },
        status: 'active'
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        },
        bed: {
          include: {
            unit: true
          }
        }
      }
    });

    return admissions;
  }

  // Estatísticas hospitalares
  async getHospitalStats(establishmentId: string, period: string = 'today'): Promise<HospitalStats> {
    const dateFilter = this.getDateFilter(period);

    const [
      beds,
      admissions,
      activeAdmissions,
      avgLengthOfStay,
      surgeriesToday
    ] = await Promise.all([
      // Total de leitos
      this.prisma.bed.count({
        where: { establishmentId }
      }),

      // Total de internações no período
      this.prisma.admission.count({
        where: {
          bed: { establishmentId },
          admissionDate: dateFilter
        }
      }),

      // Internações ativas
      this.prisma.admission.count({
        where: {
          bed: { establishmentId },
          status: 'active'
        }
      }),

      // Tempo médio de internação (calculado via diferença entre dischargeDate e admissionDate)
      this.prisma.admission.findMany({
        where: {
          bed: { establishmentId },
          dischargeDate: { not: null }
        },
        select: { admissionDate: true, dischargeDate: true }
      }),

      // Cirurgias hoje (placeholder - would need Surgery model)
      Promise.resolve(0)
    ]);

    const occupiedBeds = await this.prisma.bed.count({
      where: {
        establishmentId,
        status: 'occupied'
      }
    });

    // Calcular média de internação em dias
    const losRecords = Array.isArray(avgLengthOfStay) ? avgLengthOfStay : [];
    const avgLengthOfStayDays = losRecords.length
      ? losRecords
          .map(r => (r.dischargeDate!.getTime() - r.admissionDate.getTime()) / (1000 * 60 * 60 * 24))
          .filter(v => v > 0)
          .reduce((s, v) => s + v, 0) / losRecords.length
      : 0;

    return {
      totalBeds: beds,
      occupiedBeds,
      availableBeds: beds - occupiedBeds,
      occupancyRate: beds > 0 ? (occupiedBeds / beds) * 100 : 0,
      totalAdmissions: admissions,
      activeAdmissions,
      avgLengthOfStay: Number(avgLengthOfStayDays.toFixed(2)),
      surgeriesToday,
      surgeriesThisWeek: 0, // TODO: Calculate for week
      icuOccupancy: 0 // TODO: Calculate ICU occupancy
    };
  }

  private getDateFilter(period: string): { gte?: Date; lte?: Date } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case 'today':
        return { gte: today };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { gte: weekStart };
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { gte: monthStart };
      default:
        return { gte: today };
    }
  }
}
