import { PrismaClient } from '@prisma/client';

export class PhysiotherapistDashboardService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getDashboardData(userId: string, establishmentType: 'hospital' | 'upa' | 'ubs') {
    try {
      // Buscar informações do usuário e estabelecimento
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { establishment: true }
      });

      if (!user || !user.establishmentId) {
        throw new Error('Usuário ou estabelecimento não encontrado');
      }

      const establishmentId = user.establishmentId;

      // Buscar dados principais usando tabelas existentes
      const [
        totalPatients,
        activeSessions,
        pendingEvaluations,
        completedSessions,
        monthlySessions,
        weeklySessions,
        rehabilitationAlerts,
        avgSessionDuration,
        patientImprovement
      ] = await Promise.all([
        this.getTotalPatients(establishmentId),
        this.getActiveSessions(establishmentId),
        this.getPendingEvaluations(establishmentId),
        this.getCompletedSessions(establishmentId),
        this.getMonthlySessions(establishmentId),
        this.getWeeklySessions(establishmentId),
        this.getRehabilitationAlertsCount(establishmentId),
        this.getAverageSessionDuration(establishmentId),
        this.getPatientImprovement(establishmentId)
      ]);

      // Buscar dados específicos por tipo de estabelecimento
      const specificData = await this.getSpecificData(establishmentType, establishmentId);

      return {
        overview: {
          totalPatients,
          activeSessions,
          pendingEvaluations,
          completedSessions,
          monthlySessions,
          weeklySessions,
          rehabilitationAlerts,
          avgSessionDuration,
          patientImprovement
        },
        specificData,
        recentSessions: await this.getRecentSessions(establishmentId, 5),
        alerts: await this.getActiveAlerts(establishmentId)
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard de fisioterapia:', error);
      throw error;
    }
  }

  // Métodos adaptados para usar tabelas existentes
  async getTotalPatients(establishmentId: string): Promise<number> {
    try {
      // Contar pacientes únicos que tiveram atendimentos de fisioterapia
      const attendances = await this.prisma.attendance.findMany({
        where: {
          establishmentId,
          professional: {
            profile: 'fisioterapeuta'
          }
        },
        select: {
          patientId: true
        },
        distinct: ['patientId']
      });
      return attendances.length;
    } catch (error) {
      console.error('Erro ao contar pacientes:', error);
      return 0;
    }
  }

  async getActiveSessions(establishmentId: string): Promise<number> {
    try {
      // Contar atendimentos em andamento com fisioterapeuta
      return await this.prisma.attendance.count({
        where: {
          establishmentId,
          professional: {
            profile: 'fisioterapeuta'
          },
          status: 'in_progress'
        }
      });
    } catch (error) {
      console.error('Erro ao contar sessões ativas:', error);
      return 0;
    }
  }

  async getPendingEvaluations(establishmentId: string): Promise<number> {
    try {
      // Contar atendimentos agendados com fisioterapeuta
      return await this.prisma.attendance.count({
        where: {
          establishmentId,
          professional: {
            profile: 'fisioterapeuta'
          },
          status: 'scheduled'
        }
      });
    } catch (error) {
      console.error('Erro ao contar avaliações pendentes:', error);
      return 0;
    }
  }

  async getCompletedSessions(establishmentId: string): Promise<number> {
    try {
      // Contar sessões/completed attendances com fisioterapeuta
      return await this.prisma.attendance.count({
        where: {
          establishmentId,
          professional: {
            profile: 'fisioterapeuta'
          },
          status: 'completed'
        }
      });
    } catch (error) {
      console.error('Erro ao contar sessões completadas:', error);
      return 0;
    }
  }

  async getMonthlySessions(establishmentId: string): Promise<number> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      return await this.prisma.attendance.count({
        where: {
          establishmentId,
          professional: {
            profile: 'fisioterapeuta'
          },
          createdAt: {
            gte: startOfMonth
          }
        }
      });
    } catch (error) {
      console.error('Erro ao contar sessões mensais:', error);
      return 0;
    }
  }

  async getWeeklySessions(establishmentId: string): Promise<number> {
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      return await this.prisma.attendance.count({
        where: {
          establishmentId,
          professional: {
            profile: 'fisioterapeuta'
          },
          createdAt: {
            gte: startOfWeek
          }
        }
      });
    } catch (error) {
      console.error('Erro ao contar sessões semanais:', error);
      return 0;
    }
  }

  async getRehabilitationAlertsCount(establishmentId: string): Promise<number> {
    try {
      // Mock: Contar atendimentos com queixas relacionadas à reabilitação
      const rehabilitationKeywords = [
        'fratura', 'lesão', 'trauma', 'reabilitação', 'fisioterapia', 
        'dor muscular', 'limitação de movimento', 'mobilidade', 'amputação'
      ];
      
      const attendances = await this.prisma.attendance.findMany({
        where: {
          establishmentId,
          professional: {
            profile: 'fisioterapeuta'
          }
        },
        select: {
          chiefComplaint: true
        }
      });

      return attendances.filter(att => 
        rehabilitationKeywords.some(keyword => 
          att.chiefComplaint?.toLowerCase().includes(keyword)
        )
      ).length;
    } catch (error) {
      console.error('Erro ao contar alertas de reabilitação:', error);
      return 0;
    }
  }

  async getAverageSessionDuration(establishmentId: string): Promise<number> {
    try {
      // Mock: Retornar duração média fixa já que não há campo de duração
      return 45; // 45 minutos médios
    } catch (error) {
      console.error('Erro ao calcular duração média:', error);
      return 0;
    }
  }

  async getPatientImprovement(establishmentId: string): Promise<number> {
    try {
      // Mock: Retornar percentual de melhora médio
      return 78; // 78% de melhora
    } catch (error) {
      console.error('Erro ao calcular melhora dos pacientes:', error);
      return 0;
    }
  }

  async getRecentSessions(establishmentId: string, limit: number = 10) {
    try {
      return await this.prisma.attendance.findMany({
        where: {
          establishmentId,
          professional: {
            profile: 'fisioterapeuta'
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
          createdAt: 'desc'
        },
        take: limit
      });
    } catch (error) {
      console.error('Erro ao buscar sessões recentes:', error);
      return [];
    }
  }

  async getActiveAlerts(establishmentId: string) {
    try {
      // Mock: Buscar atendimentos recentes com sintomas críticos
      const criticalKeywords = [
        'fratura exposta', 'amputação', 'trauma grave', 'lesão medular', 
        'paralisia', 'perda de movimento', 'dor intensa', 'inflamação severa'
      ];
      
      const recentAttendances = await this.prisma.attendance.findMany({
        where: {
          establishmentId,
          professional: {
            profile: 'fisioterapeuta'
          },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
          }
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              cpf: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return recentAttendances.filter(att => 
        criticalKeywords.some(keyword => 
          att.chiefComplaint?.toLowerCase().includes(keyword)
        )
      );
    } catch (error) {
      console.error('Erro ao buscar alertas ativos:', error);
      return [];
    }
  }

  async getSpecificData(establishmentType: 'hospital' | 'upa' | 'ubs', establishmentId: string) {
    switch (establishmentType) {
      case 'hospital':
        return await this.getHospitalSpecificData(establishmentId);
      case 'upa':
        return await this.getUPASpecificData(establishmentId);
      case 'ubs':
        return await this.getUBSSpecificData(establishmentId);
      default:
        return {};
    }
  }

  private async getHospitalSpecificData(establishmentId: string) {
    try {
      // Dados específicos para hospital
      const [emergencies, orthopedic, neurological, cardiopulmonary] = await Promise.all([
        this.prisma.attendance.count({
          where: {
            establishmentId,
            professional: { profile: 'fisioterapeuta' },
            type: 'emergency'
          }
        }),
        Promise.resolve(25), // Mock: 25 casos ortopédicos
        Promise.resolve(18), // Mock: 18 casos neurológicos  
        Promise.resolve(12)  // Mock: 12 casos cardiopulmonares
      ]);

      return {
        emergencies,
        orthopedic,
        neurological,
        cardiopulmonary,
        inpatientRehabilitation: Math.floor(emergencies * 0.4), // Mock: 40% são internações
        outpatientRehabilitation: Math.floor(emergencies * 0.6) // Mock: 60% são ambulatoriais
      };
    } catch (error) {
      console.error('Erro ao buscar dados específicos de hospital:', error);
      return {};
    }
  }

  private async getUPASpecificData(establishmentId: string) {
    try {
      // Dados específicos para UPA
      const [emergencies, trauma, painManagement] = await Promise.all([
        this.prisma.attendance.count({
          where: {
            establishmentId,
            professional: { profile: 'fisioterapeuta' },
            type: 'emergency'
          }
        }),
        Promise.resolve(15), // Mock: 15 casos de trauma
        Promise.resolve(20)  // Mock: 20 casos de controle de dor
      ]);

      return {
        emergencies,
        trauma,
        painManagement,
        rehabilitationCases: emergencies,
        immediateCare: Math.floor(emergencies * 0.7), // Mock: 70% recebem cuidado imediato
        followUpScheduled: Math.floor(emergencies * 0.3) // Mock: 30% agendados para seguimento
      };
    } catch (error) {
      console.error('Erro ao buscar dados específicos de UPA:', error);
      return {};
    }
  }

  private async getUBSSpecificData(establishmentId: string) {
    try {
      // Dados específicos para UBS
      const [consultations, preventivePrograms, communitySupport] = await Promise.all([
        this.prisma.attendance.count({
          where: {
            establishmentId,
            professional: { profile: 'fisioterapeuta' },
            type: 'consultation'
          }
        }),
        Promise.resolve(4), // Mock: 4 programas preventivos
        Promise.resolve(8)  // Mock: 8 ações de apoio comunitário
      ]);

      return {
        consultations,
        preventivePrograms,
        communitySupport,
        chronicPainManagement: Math.floor(consultations * 0.5), // Mock: 50% são gerenciamento de dor crônica
        mobilitySupport: Math.floor(consultations * 0.3), // Mock: 30% são apoio à mobilidade
        groupTherapies: Math.floor(consultations * 0.2) // Mock: 20% são terapias de grupo
      };
    } catch (error) {
      console.error('Erro ao buscar dados específicos de UBS:', error);
      return {};
    }
  }
}