import { PrismaClient } from '@prisma/client';

export class PsychologyDashboardService {
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
        activeConsultations,
        pendingEvaluations,
        completedSessions,
        monthlySessions,
        weeklySessions,
        mentalHealthAlerts,
        avgSessionDuration,
        patientSatisfaction
      ] = await Promise.all([
        this.getTotalPatients(establishmentId),
        this.getActiveConsultations(establishmentId),
        this.getPendingEvaluations(establishmentId),
        this.getCompletedSessions(establishmentId),
        this.getMonthlySessions(establishmentId),
        this.getWeeklySessions(establishmentId),
        this.getMentalHealthAlertsCount(establishmentId),
        this.getAverageSessionDuration(establishmentId),
        this.getPatientSatisfaction(establishmentId)
      ]);

      // Buscar dados específicos por tipo de estabelecimento
      const specificData = await this.getSpecificData(establishmentType, establishmentId);

      return {
        overview: {
          totalPatients,
          activeConsultations,
          pendingEvaluations,
          completedSessions,
          monthlySessions,
          weeklySessions,
          mentalHealthAlerts,
          avgSessionDuration,
          patientSatisfaction
        },
        specificData,
        recentSessions: await this.getRecentSessions(establishmentId, 5),
        alerts: await this.getActiveAlerts(establishmentId)
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard de psicologia:', error);
      throw error;
    }
  }

  // Métodos adaptados para usar tabelas existentes
  async getTotalPatients(establishmentId: string): Promise<number> {
    try {
      // Contar pacientes únicos que tiveram atendimentos psicológicos
      const attendances = await this.prisma.attendance.findMany({
        where: {
          establishmentId,
          professional: {
            profile: 'psicologo'
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

  async getActiveConsultations(establishmentId: string): Promise<number> {
    try {
      // Contar atendimentos em andamento com psicólogo
      return await this.prisma.attendance.count({
        where: {
          establishmentId,
          professional: {
            profile: 'psicologo'
          },
          status: 'in_progress'
        }
      });
    } catch (error) {
      console.error('Erro ao contar consultas ativas:', error);
      return 0;
    }
  }

  async getPendingEvaluations(establishmentId: string): Promise<number> {
    try {
      // Contar atendimentos agendados com psicólogo
      return await this.prisma.attendance.count({
        where: {
          establishmentId,
          professional: {
            profile: 'psicologo'
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
      // Contar sessões/completed attendances com psicólogo
      return await this.prisma.attendance.count({
        where: {
          establishmentId,
          professional: {
            profile: 'psicologo'
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
            profile: 'psicologo'
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
            profile: 'psicologo'
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

  async getMentalHealthAlertsCount(establishmentId: string): Promise<number> {
    try {
      // Mock: Contar atendimentos com queixas relacionadas à saúde mental
      const mentalHealthKeywords = ['ansiedade', 'depressão', 'suicídio', 'pânico', 'estresse', 'ansioso', 'deprimido'];
      
      const attendances = await this.prisma.attendance.findMany({
        where: {
          establishmentId,
          professional: {
            profile: 'psicologo'
          }
        },
        select: {
          chiefComplaint: true
        }
      });

      return attendances.filter(att => 
        mentalHealthKeywords.some(keyword => 
          att.chiefComplaint?.toLowerCase().includes(keyword)
        )
      ).length;
    } catch (error) {
      console.error('Erro ao contar alertas de saúde mental:', error);
      return 0;
    }
  }

  async getAverageSessionDuration(establishmentId: string): Promise<number> {
    try {
      // Mock: Retornar duração média fixa já que não há campo de duração
      return 50; // 50 minutos médios
    } catch (error) {
      console.error('Erro ao calcular duração média:', error);
      return 0;
    }
  }

  async getPatientSatisfaction(establishmentId: string): Promise<number> {
    try {
      // Mock: Retornar satisfação média fixa
      return 4.2; // 4.2 de 5.0
    } catch (error) {
      console.error('Erro ao calcular satisfação:', error);
      return 0;
    }
  }

  async getRecentSessions(establishmentId: string, limit: number = 10) {
    try {
      return await this.prisma.attendance.findMany({
        where: {
          establishmentId,
          professional: {
            profile: 'psicologo'
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
      const criticalKeywords = ['suicídio', 'autolesão', 'pânico', 'psicose', 'alucinação'];
      
      const recentAttendances = await this.prisma.attendance.findMany({
        where: {
          establishmentId,
          professional: {
            profile: 'psicologo'
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
      const [emergencies, crisis, consultations, sessions] = await Promise.all([
        this.prisma.attendance.count({
          where: {
            establishmentId,
            professional: { profile: 'psicologo' },
            type: 'emergency'
          }
        }),
        this.getMentalHealthAlertsCount(establishmentId), // Reutilizar como crisis
        this.prisma.attendance.count({
          where: {
            establishmentId,
            professional: { profile: 'psicologo' },
            type: 'consultation'
          }
        }),
        this.getCompletedSessions(establishmentId)
      ]);

      return {
        emergencies,
        crisis,
        consultations,
        sessions,
        inpatientPsychology: Math.floor(sessions * 0.3), // Mock: 30% são internações
        outpatientPsychology: Math.floor(sessions * 0.7) // Mock: 70% são ambulatoriais
      };
    } catch (error) {
      console.error('Erro ao buscar dados específicos de hospital:', error);
      return {};
    }
  }

  private async getUPASpecificData(establishmentId: string) {
    try {
      // Dados específicos para UPA
      const [emergencies, crisis, waitingTime] = await Promise.all([
        this.prisma.attendance.count({
          where: {
            establishmentId,
            professional: { profile: 'psicologo' },
            attendanceType: 'emergency'
          }
        }),
        this.getMentalHealthAlertsCount(establishmentId), // Reutilizar como crisis
        Promise.resolve(15) // Mock: 15 minutos de espera média
      ]);

      return {
        emergencies,
        crisis,
        avgWaitingTime: waitingTime,
        mentalHealthCases: emergencies + crisis,
        dailyPsychologicalSupport: Math.floor(emergencies * 0.8) // Mock: 80% recebem apoio
      };
    } catch (error) {
      console.error('Erro ao buscar dados específicos de UPA:', error);
      return {};
    }
  }

  private async getUBSSpecificData(establishmentId: string) {
    try {
      // Dados específicos para UBS
      const [consultations, sessions, communityPrograms] = await Promise.all([
        this.prisma.attendance.count({
          where: {
            establishmentId,
            professional: { profile: 'psicologo' },
            attendanceType: 'consultation'
          }
        }),
        this.getCompletedSessions(establishmentId),
        Promise.resolve(3) // Mock: 3 programas comunitários
      ]);

      return {
        consultations,
        sessions,
        communityPrograms,
        familyHealthSupport: Math.floor(consultations * 0.6), // Mock: 60% são apoio à saúde da família
        preventionPrograms: communityPrograms,
        groupTherapies: Math.floor(sessions * 0.2) // Mock: 20% são terapias de grupo
      };
    } catch (error) {
      console.error('Erro ao buscar dados específicos de UBS:', error);
      return {};
    }
  }
}