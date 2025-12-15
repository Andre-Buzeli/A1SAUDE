import { PrismaClient } from '@prisma/client';

export interface CoordinatorMetrics {
  totalPatients: number;
  activeAttendances: number;
  completedAttendances: number;
  pendingTasks: number;
  teamMembers: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

export interface TeamMember {
  id: string;
  name: string;
  profile: string;
  email: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  totalAttendances: number;
  completedTasks: number;
  performance: number;
}

export interface TeamPerformance {
  memberId: string;
  memberName: string;
  profile: string;
  attendances: number;
  completedTasks: number;
  performance: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CoordinatorAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  createdAt: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface CoordinatorReport {
  id: string;
  title: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  period: string;
  status: 'draft' | 'completed' | 'submitted';
  createdAt: Date;
  submittedAt: Date | null;
}

export class CoordinatorService {
  constructor(private prisma: PrismaClient) {}

  async getCoordinatorMetrics(coordinatorId: string, establishmentId: string): Promise<CoordinatorMetrics> {
    try {
      // Obter total de pacientes
      const totalPatients = await this.prisma.patient.count({
        where: {
          attendances: {
            some: {
              establishmentId,
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          }
        }
      });

      // Obter atendimentos ativos
      const activeAttendances = await this.prisma.attendance.count({
        where: {
          establishmentId,
          status: 'in_progress'
        }
      });

      // Obter atendimentos completados no mês
      const completedAttendances = await this.prisma.attendance.count({
        where: {
          establishmentId,
          status: 'completed',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      });

      // Obter tarefas pendentes (mock)
      const pendingTasks = Math.floor(Math.random() * 15) + 5;

      // Obter membros da equipe
      const teamMembers = await this.prisma.user.count({
        where: {
          establishmentId,
          isActive: true,
          profile: {
            in: ['medico', 'enfermeiro', 'tecnico_enfermagem', 'recepcionista', 'secretario']
          }
        }
      });

      // Metas e progresso mensal (mock)
      const monthlyGoal = 200;
      const monthlyProgress = Math.floor((completedAttendances / monthlyGoal) * 100);

      return {
        totalPatients,
        activeAttendances,
        completedAttendances,
        pendingTasks,
        teamMembers,
        monthlyGoal,
        monthlyProgress
      };
    } catch (error) {
      console.error('Erro ao obter métricas do coordenador:', error);
      throw error;
    }
  }

  async getTeamMembers(coordinatorId: string, establishmentId: string): Promise<TeamMember[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          establishmentId,
          isActive: true,
          profile: {
            in: ['medico', 'enfermeiro', 'tecnico_enfermagem', 'recepcionista', 'secretario']
          }
        },
        select: {
          id: true,
          name: true,
          profile: true,
          email: true,
          isActive: true,
          lastLogin: true
        }
      });

      // Obter estatísticas de atendimentos para cada membro
      const teamMembers = await Promise.all(
        users.map(async (user) => {
          const totalAttendances = await this.prisma.attendance.count({
            where: {
              establishmentId,
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              },
              professionalId: user.id
            }
          });

          const completedTasks = Math.floor(Math.random() * 50) + 10; // Mock
          const performance = Math.floor(Math.random() * 40) + 60; // Mock: 60-100%

          return {
            id: user.id,
            name: user.name,
            profile: user.profile,
            email: user.email,
            isActive: user.isActive,
            lastLoginAt: user.lastLogin,
            totalAttendances,
            completedTasks,
            performance
          };
        })
      );

      return teamMembers;
    } catch (error) {
      console.error('Erro ao obter membros da equipe:', error);
      throw error;
    }
  }

  async getTeamPerformance(coordinatorId: string, establishmentId: string, period: 'week' | 'month' = 'month'): Promise<TeamPerformance[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          establishmentId,
          isActive: true,
          profile: {
            in: ['medico', 'enfermeiro', 'tecnico_enfermagem']
          }
        },
        select: {
          id: true,
          name: true,
          profile: true
        }
      });

      const dateFilter = period === 'week' 
        ? { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        : { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) };

      const performance = await Promise.all(
        users.map(async (user) => {
          const attendances = await this.prisma.attendance.count({
            where: {
              establishmentId,
              createdAt: dateFilter,
              professionalId: user.id
            }
          });

          const completedTasks = Math.floor(Math.random() * 30) + 10; // Mock
          const performance = Math.floor(Math.random() * 40) + 60; // Mock: 60-100%
          const trends = ['up', 'down', 'stable'] as const;
          const trend = trends[Math.floor(Math.random() * trends.length)];

          return {
            memberId: user.id,
            memberName: user.name,
            profile: user.profile,
            attendances,
            completedTasks,
            performance,
            trend
          };
        })
      );

      return performance.sort((a, b) => b.performance - a.performance);
    } catch (error) {
      console.error('Erro ao obter performance da equipe:', error);
      throw error;
    }
  }

  async getCoordinatorAlerts(coordinatorId: string, establishmentId: string): Promise<CoordinatorAlert[]> {
    try {
      // Criar alertas mock baseados em dados reais
      const alerts: CoordinatorAlert[] = [];

      // Verificar atendimentos críticos
      const criticalAttendances = await this.prisma.attendance.count({
        where: {
          establishmentId,
          priority: 'CRITICAL',
          status: 'in_progress'
        }
      });

      if (criticalAttendances > 0) {
        alerts.push({
          id: 'critical-' + Date.now(),
          type: 'urgent',
          title: 'Atendimentos Críticos',
          description: `${criticalAttendances} atendimento(s) crítico(s) em andamento`,
          createdAt: new Date(),
          isRead: false,
          priority: 'high'
        });
      }

      // Verificar atendimentos atrasados
      const delayedAttendances = await this.prisma.attendance.count({
        where: {
          establishmentId,
          status: 'scheduled',
          createdAt: {
            lt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas
          }
        }
      });

      if (delayedAttendances > 0) {
        alerts.push({
          id: 'delayed-' + Date.now(),
          type: 'warning',
          title: 'Atendimentos Atrasados',
          description: `${delayedAttendances} atendimento(s) aguardando há mais de 2 horas`,
          createdAt: new Date(),
          isRead: false,
          priority: 'medium'
        });
      }

      // Adicionar alertas mock adicionais
      const mockAlerts: CoordinatorAlert[] = [
        {
          id: 'task-' + Date.now(),
          type: 'info',
          title: 'Tarefas Pendentes',
          description: 'Relatório mensal pendente de revisão',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isRead: false,
          priority: 'low'
        },
        {
          id: 'meeting-' + Date.now(),
          type: 'info',
          title: 'Reunião de Equipe',
          description: 'Reunião semanal agendada para amanhã às 14h',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          isRead: true,
          priority: 'medium'
        }
      ];

      return [...alerts, ...mockAlerts].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Erro ao obter alertas do coordenador:', error);
      throw error;
    }
  }

  async getCoordinatorReports(coordinatorId: string, establishmentId: string): Promise<CoordinatorReport[]> {
    try {
      // Criar relatórios mock
      const reports: CoordinatorReport[] = [
        {
          id: 'report-1',
          title: 'Relatório Semanal - Atendimentos',
          type: 'weekly',
          period: 'Semana 45/2024',
          status: 'completed',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'report-2',
          title: 'Relatório Mensal - Performance da Equipe',
          type: 'monthly',
          period: 'Outubro 2024',
          status: 'completed',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'report-3',
          title: 'Relatório Mensal - Novembro 2024',
          type: 'monthly',
          period: 'Novembro 2024',
          status: 'draft',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          submittedAt: null
        }
      ];

      return reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Erro ao obter relatórios do coordenador:', error);
      throw error;
    }
  }

  async getCoordinatorTasks(coordinatorId: string, establishmentId: string): Promise<any[]> {
    try {
      // Criar tarefas mock baseadas em atividades reais
      const tasks = [
        {
          id: 'task-1',
          title: 'Revisar escalas da semana',
          description: 'Verificar e ajustar escalas de plantão',
          priority: 'high',
          status: 'pending',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignee: 'Você',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'task-2',
          title: 'Avaliar performance da equipe',
          description: 'Analisar indicadores de desempenho mensal',
          priority: 'medium',
          status: 'in_progress',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          assignee: 'Você',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'task-3',
          title: 'Atualizar protocolos',
          description: 'Revisar protocolos de atendimento',
          priority: 'low',
          status: 'completed',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          assignee: 'Você',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      ];

      return tasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Erro ao obter tarefas do coordenador:', error);
      throw error;
    }
  }
}