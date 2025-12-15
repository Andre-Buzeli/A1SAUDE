import { PrismaClient } from '@prisma/client';
import { EstablishmentType } from '../types/auth';

interface DirectorLocalMetrics {
  totalEstablishments: number;
  totalPatients: number;
  monthlyAttendances: number;
  monthlyRevenue: number;
  occupancyRate: number;
  satisfactionRate: number;
  pendingReports: number;
  completedReports: number;
  criticalAlerts: number;
  resolvedAlerts: number;
}

interface EstablishmentSummary {
  id: string;
  name: string;
  type: string;
  totalPatients: number;
  monthlyAttendances: number;
  occupancyRate: number;
  satisfactionRate: number;
  pendingAlerts: number;
  status: string;
}

interface PerformanceData {
  month: string;
  attendances: number;
  revenue: number;
  occupancy: number;
  satisfaction: number;
}

export class DirectorLocalService {
  constructor(private prisma: PrismaClient) {}

  async getDirectorLocalMetrics(userId: string, establishmentId?: string): Promise<DirectorLocalMetrics> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Obter o usuário para verificar seus estabelecimentos de responsabilidade
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { establishmentId: true, profile: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // CORREÇÃO: Para diretor_local, filtrar apenas estabelecimentos sob sua responsabilidade
    // O establishmentId passado como parâmetro só é válido se pertencer ao diretor
    let whereClause: any = { isActive: true };
    
    if (user.profile === 'diretor_local') {
      // Diretor local só vê seu(s) estabelecimento(s)
      whereClause = { 
        id: establishmentId || user.establishmentId, 
        isActive: true 
      };
    } else if (establishmentId) {
      // Gestor geral pode filtrar por estabelecimento específico
      whereClause = { id: establishmentId, isActive: true };
    }

    // Obter estabelecimentos sob responsabilidade do diretor local
    const establishments = await this.prisma.establishment.findMany({
      where: whereClause
    });

    const establishmentIds = establishments.map(e => e.id);

    // Calcular métricas
    const [
      totalPatients,
      monthlyAttendances,
      occupancyRate,
      satisfactionRate,
      pendingReports,
      completedReports,
      criticalAlerts,
      resolvedAlerts
    ] = await Promise.all([
      // Total de pacientes únicos
      this.prisma.patient.count({
        where: {
          attendances: {
            some: {
              establishmentId: { in: establishmentIds }
            }
          }
        }
      }),

      // Atendimentos do mês
      this.prisma.attendance.count({
        where: {
          establishmentId: { in: establishmentIds },
          startTime: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        }
      }),

      // Taxa de ocupação (simplificada)
      this.calculateOccupancyRate(establishmentIds),

      // Taxa de satisfação (dados simulados)
      Promise.resolve(92), // Seria baseado em pesquisas reais

      // Relatórios pendentes (mock)
      Promise.resolve(8),

      // Relatórios concluídos (mock)
      Promise.resolve(45),

      // Alertas críticos (mock)
      Promise.resolve(3),

      // Alertas resolvidos (mock)
      Promise.resolve(127)
    ]);

    // Calcular receita mensal (simulada)
    const monthlyRevenue = monthlyAttendances * 150; // Valor médio por atendimento

    return {
      totalEstablishments: establishments.length,
      totalPatients,
      monthlyAttendances,
      monthlyRevenue,
      occupancyRate,
      satisfactionRate,
      pendingReports,
      completedReports,
      criticalAlerts,
      resolvedAlerts
    };
  }

  async getEstablishmentSummaries(userId: string): Promise<EstablishmentSummary[]> {
    // Obter o usuário para verificar seus estabelecimentos de responsabilidade
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { establishmentId: true, profile: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Para diretor_local, filtrar apenas estabelecimentos sob sua responsabilidade
    // Por enquanto, usar o establishmentId do usuário, mas futuramente
    // isso pode ser expandido para múltiplos estabelecimentos
    const whereClause = user.profile === 'diretor_local'
      ? { id: user.establishmentId, isActive: true }
      : { isActive: true }; // gestor_geral vê todos

    const establishments = await this.prisma.establishment.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            beds: true,
            attendances: true
          }
        }
      }
    });

    const summaries = await Promise.all(
      establishments.map(async (establishment) => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Pacientes únicos por estabelecimento
        const totalPatients = await this.prisma.patient.count({
          where: {
            attendances: {
              some: {
                establishmentId: establishment.id
              }
            }
          }
        });

        // Atendimentos do mês
        const monthlyAttendances = await this.prisma.attendance.count({
          where: {
            establishmentId: establishment.id,
            startTime: {
              gte: firstDayOfMonth
            }
          }
        });

        // Taxa de ocupação
        // Taxa de ocupação (usando attendances como proxy)
        const occupancyRate = establishment._count.beds > 0 
          ? Math.round((establishment._count.attendances / establishment._count.beds) * 100)
          : 0;

        // Satisfação (simulada)
        const satisfactionRate = 85 + Math.floor(Math.random() * 15);

        // Alertas pendentes (mock)
        const pendingAlerts = Math.floor(Math.random() * 10);

        return {
          id: establishment.id,
          name: establishment.name,
          type: establishment.type,
          totalPatients,
          monthlyAttendances,
          occupancyRate,
          satisfactionRate,
          pendingAlerts,
          status: 'active'
        };
      })
    );

    return summaries;
  }

  async getPerformanceData(userId: string, months: number = 6): Promise<PerformanceData[]> {
    // Obter o usuário para verificar seus estabelecimentos de responsabilidade
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { establishmentId: true, profile: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const data: PerformanceData[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });

      // Filtrar atendimentos pelos estabelecimentos do usuário
      const establishmentIds = user.profile === 'diretor_local'
        ? [user.establishmentId]
        : undefined; // gestor_geral vê todos

      const attendanceWhere = establishmentIds
        ? {
            establishmentId: { in: establishmentIds },
            startTime: {
              gte: firstDay,
              lte: lastDay
            }
          }
        : {
            startTime: {
              gte: firstDay,
              lte: lastDay
            }
          };

      const [attendances, revenue, occupancy, satisfaction] = await Promise.all([
        this.prisma.attendance.count({
          where: attendanceWhere
        }),
        Promise.resolve(Math.floor(Math.random() * 100000) + 400000), // Receita simulada
        Promise.resolve(Math.floor(Math.random() * 30) + 70), // Ocupação simulada
        Promise.resolve(Math.floor(Math.random() * 15) + 85) // Satisfação simulada
      ]);

      data.push({
        month: monthName,
        attendances,
        revenue,
        occupancy,
        satisfaction
      });
    }

    return data;
  }

  private async calculateOccupancyRate(establishmentIds: string[]): Promise<number> {
    const establishments = await this.prisma.establishment.findMany({
      where: { id: { in: establishmentIds } },
      include: {
        _count: {
          select: {
            beds: true,
            attendances: true
          }
        }
      }
    });

    const totalBeds = establishments.reduce((sum, est) => sum + est._count.beds, 0);
    const totalOccupied = establishments.reduce((sum, est) => sum + est._count.attendances, 0);

    return totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;
  }

  async getRecentAlerts(userId: string, limit: number = 10) {
    // Obter o usuário para verificar seus estabelecimentos de responsabilidade
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { establishmentId: true, profile: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Obter estabelecimentos sob responsabilidade do usuário
    const establishments = user.profile === 'diretor_local'
      ? await this.prisma.establishment.findMany({
          where: { id: user.establishmentId, isActive: true },
          select: { id: true, name: true, type: true }
        })
      : await this.prisma.establishment.findMany({
          where: { isActive: true },
          select: { id: true, name: true, type: true }
        });

    // Mock de alertas recentes filtrados por estabelecimentos
    const alerts = [];
    for (const establishment of establishments.slice(0, limit)) {
      alerts.push({
        id: `${establishment.id}-alert-${Date.now()}`,
        title: 'Leito disponível',
        description: `${establishment.name} tem leitos disponíveis`,
        priority: 'medium',
        createdAt: new Date(),
        establishment: { name: establishment.name, type: establishment.type }
      });
    }

    return alerts.slice(0, limit);
  }

  async getBudgetOverview(userId: string) {
    // Dados simulados de orçamento
    return {
      totalBudget: 5000000,
      spentBudget: 3200000,
      remainingBudget: 1800000,
      percentageUsed: 64,
      monthlyAverage: 266667,
      projectedAnnual: 6400000
    };
  }
}