import { PrismaClient } from '@prisma/client';
import { EstablishmentType } from '../types/auth';

const prisma = new PrismaClient();

export interface MedicalMetrics {
  totalPatients: number;
  todayAttendances: number;
  pendingAttendances: number;
  completedAttendances: number;
  averageWaitTime: number;
  criticalPatients: number;
  prescriptionsToday: number;
  examsRequested: number;
  establishmentSpecificMetrics: any;
}

export class MedicalDashboardService {
  
  async getMedicalDashboard(
    establishmentId: string, 
    establishmentType: EstablishmentType,
    userId: string
  ): Promise<MedicalMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Métricas básicas comuns a todos os estabelecimentos
    const [
      totalPatients,
      todayAttendances,
      pendingAttendances,
      completedAttendances,
      prescriptionsToday,
      examsRequested,
      criticalPatients
    ] = await Promise.all([
      // Total de pacientes únicos atendidos no estabelecimento
      prisma.patient.count({
        where: {
          attendances: {
            some: {
              establishmentId: establishmentId
            }
          }
        }
      }),

      // Atendimentos de hoje
      prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Atendimentos pendentes
      prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          status: {
            in: ['scheduled', 'in_progress']
          }
        }
      }),

      // Atendimentos completados hoje
      prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          status: 'completed',
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Prescrições de hoje
      prisma.prescription.count({
        where: {
          professionalId: userId,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Exames solicitados hoje
      prisma.examRequest.count({
        where: {
          attendance: {
            establishmentId: establishmentId,
            professionalId: userId
          },
          requestedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Pacientes críticos (triagem vermelha/laranja)
      prisma.triage.count({
        where: {
          attendance: {
            establishmentId: establishmentId
          },
          priority: {
            in: ['red', 'orange']
          },
          triageTime: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ]);

    // Calcular tempo médio de espera
    const averageWaitTime = await this.calculateAverageWaitTime(establishmentId, today, tomorrow);

    // Métricas específicas por tipo de estabelecimento
    const establishmentSpecificMetrics = await this.getEstablishmentSpecificMetrics(
      establishmentId, 
      establishmentType, 
      today, 
      tomorrow
    );

    return {
      totalPatients,
      todayAttendances,
      pendingAttendances,
      completedAttendances,
      averageWaitTime,
      criticalPatients,
      prescriptionsToday,
      examsRequested,
      establishmentSpecificMetrics
    };
  }

  private async calculateAverageWaitTime(
    establishmentId: string, 
    today: Date, 
    tomorrow: Date
  ): Promise<number> {
    const attendances = await prisma.attendance.findMany({
      where: {
        establishmentId: establishmentId,
        startTime: {
          gte: today,
          lt: tomorrow
        },
        status: 'completed'
      },
      include: {
        triage: true
      }
    });

    if (attendances.length === 0) return 0;

    const totalWaitTime = attendances.reduce((sum, attendance) => {
      if (attendance.triage) {
        const waitTime = attendance.startTime.getTime() - attendance.triage.triageTime.getTime();
        return sum + Math.max(0, waitTime / (1000 * 60)); // em minutos
      }
      return sum;
    }, 0);

    return Math.round(totalWaitTime / attendances.length);
  }

  private async getEstablishmentSpecificMetrics(
    establishmentId: string,
    establishmentType: EstablishmentType,
    today: Date,
    tomorrow: Date
  ): Promise<any> {
    switch (establishmentType) {
      case 'hospital':
        return this.getHospitalMetrics(establishmentId, today, tomorrow);
      case 'upa':
        return this.getUPAMetrics(establishmentId, today, tomorrow);
      case 'ubs':
        return this.getUBSMetrics(establishmentId, today, tomorrow);
      default:
        return {};
    }
  }

  private async getHospitalMetrics(establishmentId: string, today: Date, tomorrow: Date) {
    const [
      totalBeds,
      occupiedBeds,
      surgeriesToday,
      icuPatients,
      dischargesPlanned
    ] = await Promise.all([
      // Total de leitos
      prisma.bed.count({
        where: {
          establishmentId: establishmentId,
          isActive: true
        }
      }),

      // Leitos ocupados
      prisma.bed.count({
        where: {
          establishmentId: establishmentId,
          status: 'occupied',
          isActive: true
        }
      }),

      // Cirurgias de hoje
      prisma.procedure.count({
        where: {
          attendance: {
            establishmentId: establishmentId
          },
          name: {
            contains: 'cirurgia',
            mode: 'insensitive'
          },
          performedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Pacientes na UTI
      prisma.admission.count({
        where: {
          bed: {
            establishmentId: establishmentId,
            unit: {
              name: {
                contains: 'UTI',
                mode: 'insensitive'
              }
            }
          },
          status: 'active'
        }
      }),

      // Altas planejadas para hoje
      prisma.admission.count({
        where: {
          bed: {
            establishmentId: establishmentId
          },
          dischargeDate: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ]);

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      totalBeds,
      occupiedBeds,
      occupancyRate,
      surgeriesToday,
      icuPatients,
      dischargesPlanned
    };
  }

  private async getUPAMetrics(establishmentId: string, today: Date, tomorrow: Date) {
    const [
      emergencyAttendances,
      triageDistribution,
      observationPatients,
      ambulanceDispatches
    ] = await Promise.all([
      // Atendimentos de emergência
      prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          type: 'emergency',
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Distribuição por prioridade de triagem
      prisma.triage.groupBy({
        by: ['priority'],
        where: {
          attendance: {
            establishmentId: establishmentId
          },
          triageTime: {
            gte: today,
            lt: tomorrow
          }
        },
        _count: {
          priority: true
        }
      }),

      // Pacientes em observação
      prisma.bed.count({
        where: {
          establishmentId: establishmentId,
          unit: {
            name: {
              contains: 'observação',
              mode: 'insensitive'
            }
          },
          status: 'occupied'
        }
      }),

      // Despachos de ambulância (simulado - seria integração externa)
      0 // Placeholder para integração futura
    ]);

    const triageStats = triageDistribution.reduce((acc, item) => {
      acc[item.priority] = item._count.priority;
      return acc;
    }, {} as Record<string, number>);

    return {
      emergencyAttendances,
      triageStats,
      observationPatients,
      ambulanceDispatches
    };
  }

  private async getUBSMetrics(establishmentId: string, today: Date, tomorrow: Date) {
    const [
      scheduledConsultations,
      vaccinationsToday,
      preventiveCare,
      homeVisits
    ] = await Promise.all([
      // Consultas agendadas para hoje
      prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          type: 'consultation',
          status: 'scheduled',
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Vacinações de hoje
      prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          type: 'vaccination',
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Cuidados preventivos
      prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          type: 'consultation',
          chiefComplaint: {
            contains: 'preventivo',
            mode: 'insensitive'
          },
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Visitas domiciliares (placeholder)
      0 // Seria implementado com tabela específica
    ]);

    return {
      scheduledConsultations,
      vaccinationsToday,
      preventiveCare,
      homeVisits
    };
  }

  async getRecentAttendances(establishmentId: string, limit: number = 10) {
    return prisma.attendance.findMany({
      where: {
        establishmentId: establishmentId
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        },
        triage: {
          select: {
            priority: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      },
      take: limit
    });
  }

  async getUpcomingAppointments(establishmentId: string, limit: number = 10) {
    const now = new Date();
    
    return prisma.attendance.findMany({
      where: {
        establishmentId: establishmentId,
        status: 'scheduled',
        startTime: {
          gte: now
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      },
      take: limit
    });
  }
}