import { PrismaClient } from '@prisma/client';
import { EstablishmentType } from '../types/auth';

export interface NursingMetrics {
  totalPatients: number;
  todayAttendances: number;
  pendingTriages: number;
  completedTriages: number;
  averageTriageTime: number;
  criticalPatients: number;
  medicationsAdministered: number;
  vitalSignsRecorded: number;
  nursingCareActivities: number;
  establishmentSpecificMetrics: any;
}

export class NursingDashboardService {
  constructor(private prisma: PrismaClient) {}
  
  async getNursingDashboard(
    establishmentId: string, 
    establishmentType: EstablishmentType,
    userId: string
  ): Promise<NursingMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Métricas básicas de enfermagem
    const [
      totalPatients,
      todayAttendances,
      pendingTriages,
      completedTriages,
      medicationsAdministered,
      vitalSignsRecorded,
      criticalPatients,
      nursingCareActivities
    ] = await Promise.all([
      // Total de pacientes únicos atendidos no estabelecimento
      this.prisma.patient.count({
        where: {
          attendances: {
            some: {
              establishmentId: establishmentId
            }
          }
        }
      }),

      // Atendimentos de hoje
      this.prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Triagens pendentes (pacientes aguardando triagem)
      this.prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          status: 'scheduled',
          triage: null,
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Triagens completadas hoje
      this.prisma.triage.count({
        where: {
          attendance: {
            establishmentId: establishmentId
          },
          triageTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Medicamentos administrados hoje (simulado - seria tabela medication_administrations)
      this.prisma.prescription.count({
        where: {
          attendance: {
            establishmentId: establishmentId
          },
          status: 'active',
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Sinais vitais registrados hoje
      this.prisma.vitalSigns.count({
        where: {
          patient: {
            attendances: {
              some: {
                establishmentId: establishmentId
              }
            }
          },
          recordedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Pacientes críticos (triagem vermelha/laranja)
      this.prisma.triage.count({
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
      }),

      // Atividades de cuidados de enfermagem (simulado - seria tabela nursing_care_plans)
      this.prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          professional: {
            profile: {
              in: ['enfermeiro', 'tecnico_enfermagem']
            }
          },
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ]);

    // Calcular tempo médio de triagem
    const averageTriageTime = await this.calculateAverageTriageTime(establishmentId, today, tomorrow);

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
      pendingTriages,
      completedTriages,
      averageTriageTime,
      criticalPatients,
      medicationsAdministered,
      vitalSignsRecorded,
      nursingCareActivities,
      establishmentSpecificMetrics
    };
  }

  private async calculateAverageTriageTime(
    establishmentId: string, 
    today: Date, 
    tomorrow: Date
  ): Promise<number> {
    const triages = await this.prisma.triage.findMany({
      where: {
        attendance: {
          establishmentId: establishmentId
        },
        triageTime: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        attendance: true
      }
    });

    if (triages.length === 0) return 0;

    const totalTriageTime = triages.reduce((sum: number, triage: any) => {
      // Tempo entre chegada e triagem (em minutos)
      const triageTime = triage.triageTime.getTime() - triage.attendance.startTime.getTime();
      return sum + Math.max(0, triageTime / (1000 * 60));
    }, 0);

    return Math.round(totalTriageTime / triages.length);
  }

  private async getEstablishmentSpecificMetrics(
    establishmentId: string,
    establishmentType: EstablishmentType,
    today: Date,
    tomorrow: Date
  ): Promise<any> {
    switch (establishmentType) {
      case 'hospital':
        return this.getHospitalNursingMetrics(establishmentId, today, tomorrow);
      case 'upa':
        return this.getUPANursingMetrics(establishmentId, today, tomorrow);
      case 'ubs':
        return this.getUBSNursingMetrics(establishmentId, today, tomorrow);
      default:
        return {};
    }
  }

  private async getHospitalNursingMetrics(establishmentId: string, today: Date, tomorrow: Date) {
    const [
      patientsInCare,
      medicationSchedules,
      nursingProcedures,
      patientTransfers,
      dischargePreparations
    ] = await Promise.all([
      // Pacientes sob cuidados de enfermagem
      this.prisma.admission.count({
        where: {
          bed: {
            establishmentId: establishmentId
          },
          status: 'active'
        }
      }),

      // Horários de medicação (simulado)
      this.prisma.prescription.count({
        where: {
          attendance: {
            establishmentId: establishmentId
          },
          status: 'active'
        }
      }),

      // Procedimentos de enfermagem
      this.prisma.procedure.count({
        where: {
          attendance: {
            establishmentId: establishmentId,
            professional: {
              profile: {
                in: ['enfermeiro', 'tecnico_enfermagem']
              }
            }
          },
          performedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Transferências de pacientes (simulado)
      Promise.resolve(0), // Seria implementado com tabela específica

      // Preparações para alta
      this.prisma.admission.count({
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

    return {
      patientsInCare,
      medicationSchedules,
      nursingProcedures,
      patientTransfers,
      dischargePreparations
    };
  }

  private async getUPANursingMetrics(establishmentId: string, today: Date, tomorrow: Date) {
    const [
      triagesPerformed,
      emergencyNursingCare,
      observationPatients,
      criticalInterventions,
      patientStabilizations
    ] = await Promise.all([
      // Triagens realizadas por enfermeiros
      this.prisma.triage.count({
        where: {
          attendance: {
            establishmentId: establishmentId
          },
          triageTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Cuidados de enfermagem em emergência
      this.prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          type: 'emergency',
          professional: {
            profile: 'enfermeiro'
          },
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Pacientes em observação
      this.prisma.bed.count({
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

      // Intervenções críticas (pacientes vermelhos/laranjas)
      this.prisma.triage.count({
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
      }),

      // Estabilizações de pacientes (simulado)
      Promise.resolve(0) // Seria implementado com registros específicos
    ]);

    return {
      triagesPerformed,
      emergencyNursingCare,
      observationPatients,
      criticalInterventions,
      patientStabilizations
    };
  }

  private async getUBSNursingMetrics(establishmentId: string, today: Date, tomorrow: Date) {
    const [
      preventiveCareActivities,
      vaccinationSupport,
      chronicCarePatients,
      healthEducationActivities,
      homeVisitPreparations
    ] = await Promise.all([
      // Atividades de cuidados preventivos
      this.prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          type: 'consultation',
          professional: {
            profile: 'enfermeiro'
          },
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

      // Apoio em vacinações
      this.prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          type: 'vaccination',
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Pacientes com cuidados crônicos
      this.prisma.patient.count({
        where: {
          attendances: {
            some: {
              establishmentId: establishmentId
            }
          }
          // chronicConditions: {
          //   not: []
          // }
        }
      }),

      // Atividades de educação em saúde (simulado)
      Promise.resolve(0), // Seria implementado com tabela específica

      // Preparações para visitas domiciliares (simulado)
      Promise.resolve(0) // Seria implementado com tabela específica
    ]);

    return {
      preventiveCareActivities,
      vaccinationSupport,
      chronicCarePatients,
      healthEducationActivities,
      homeVisitPreparations
    };
  }

  async getRecentNursingActivities(establishmentId: string, limit: number = 10) {
    return this.prisma.attendance.findMany({
      where: {
        establishmentId: establishmentId,
        professional: {
          profile: {
            in: ['enfermeiro', 'tecnico_enfermagem']
          }
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

  async getPendingTriages(establishmentId: string, limit: number = 10) {
    return this.prisma.attendance.findMany({
      where: {
        establishmentId: establishmentId,
        status: 'scheduled',
        triage: null
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      },
      take: limit
    });
  }

  async getCriticalPatients(establishmentId: string, limit: number = 10) {
    return this.prisma.triage.findMany({
      where: {
        attendance: {
          establishmentId: establishmentId,
          status: {
            in: ['scheduled', 'in_progress']
          }
        },
        priority: {
          in: ['red', 'orange']
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true
          }
        },
        attendance: {
          select: {
            id: true,
            chiefComplaint: true,
            startTime: true,
            status: true
          }
        }
      },
      orderBy: [
        {
          priority: 'asc' // red primeiro, depois orange
        },
        {
          triageTime: 'asc'
        }
      ],
      take: limit
    });
  }
}