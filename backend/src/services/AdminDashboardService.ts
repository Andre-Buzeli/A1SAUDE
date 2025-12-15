import { PrismaClient } from '@prisma/client';
import { UserProfile } from '../types/auth';

export interface AdminMetrics {
  totalEstablishments: number;
  totalUsers: number;
  totalPatients: number;
  totalAttendances: number;
  attendancesToday: number;
  activeUsers: number;
  establishmentsByType: {
    upa: number;
    ubs: number;
    hospital: number;
  };
  usersByProfile: Record<UserProfile, number>;
  attendancesByStatus: {
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
  monthlyAttendances: {
    month: string;
    count: number;
  }[];
  criticalAlerts: {
    id: string;
    type: 'bed_capacity' | 'staff_shortage' | 'equipment_failure' | 'system_alert';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    establishmentId: string;
    establishmentName: string;
    createdAt: Date;
  }[];
  performanceMetrics: {
    averageWaitTime: number;
    patientSatisfaction: number;
    bedOccupancyRate: number;
    staffUtilization: number;
  };
}

export class AdminDashboardService {
  constructor(private prisma: PrismaClient) {}

  async getExecutiveDashboard(userProfile: UserProfile, establishmentId?: string): Promise<AdminMetrics> {
    // Gestor geral tem acesso a todos os dados, outros perfis têm dados filtrados
    const isGestorGeral = userProfile === 'gestor_geral' || userProfile === 'system_master';
    const establishmentFilter = isGestorGeral ? {} : { establishmentId };

    // Métricas básicas
    const [
      totalEstablishments,
      totalUsers,
      totalPatients,
      totalAttendances,
      attendancesToday,
      activeUsers
    ] = await Promise.all([
      this.getTotalEstablishments(isGestorGeral, establishmentId),
      this.getTotalUsers(establishmentFilter),
      this.getTotalPatients(),
      this.getTotalAttendances(establishmentFilter),
      this.getAttendancesToday(establishmentFilter),
      this.getActiveUsers(establishmentFilter)
    ]);

    // Distribuições
    const [
      establishmentsByType,
      usersByProfile,
      attendancesByStatus,
      monthlyAttendances
    ] = await Promise.all([
      this.getEstablishmentsByType(isGestorGeral, establishmentId),
      this.getUsersByProfile(establishmentFilter),
      this.getAttendancesByStatus(establishmentFilter),
      this.getMonthlyAttendances(establishmentFilter)
    ]);

    // Alertas críticos
    const criticalAlerts = await this.getCriticalAlerts(isGestorGeral, establishmentId);

    // Métricas de performance
    const performanceMetrics = await this.getPerformanceMetrics(establishmentFilter);

    return {
      totalEstablishments,
      totalUsers,
      totalPatients,
      totalAttendances,
      attendancesToday,
      activeUsers,
      establishmentsByType,
      usersByProfile,
      attendancesByStatus,
      monthlyAttendances,
      criticalAlerts,
      performanceMetrics
    };
  }

  private async getTotalEstablishments(isGestorGeral: boolean, establishmentId?: string): Promise<number> {
    if (!isGestorGeral && establishmentId) {
      return 1; // Diretor local só vê seu estabelecimento
    }
    
    return await this.prisma.establishment.count({
      where: { isActive: true }
    });
  }

  private async getTotalUsers(establishmentFilter: any): Promise<number> {
    return await this.prisma.user.count({
      where: {
        isActive: true,
        ...establishmentFilter
      }
    });
  }

  private async getTotalPatients(): Promise<number> {
    return await this.prisma.patient.count({
      where: { isActive: true }
    });
  }

  private async getTotalAttendances(establishmentFilter: any): Promise<number> {
    return await this.prisma.attendance.count({
      where: establishmentFilter
    });
  }

  private async getAttendancesToday(establishmentFilter: any): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.prisma.attendance.count({
      where: {
        startTime: {
          gte: today,
          lt: tomorrow
        },
        ...establishmentFilter
      }
    });
  }

  private async getActiveUsers(establishmentFilter: any): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.prisma.user.count({
      where: {
        isActive: true,
        lastLogin: {
          gte: thirtyDaysAgo
        },
        ...establishmentFilter
      }
    });
  }

  private async getEstablishmentsByType(isGestorGeral: boolean, establishmentId?: string) {
    if (!isGestorGeral && establishmentId) {
      const establishment = await this.prisma.establishment.findUnique({
        where: { id: establishmentId },
        select: { type: true }
      });
      
      return {
        upa: establishment?.type === 'upa' ? 1 : 0,
        ubs: establishment?.type === 'ubs' ? 1 : 0,
        hospital: establishment?.type === 'hospital' ? 1 : 0
      };
    }

    const establishments = await this.prisma.establishment.groupBy({
      by: ['type'],
      _count: { type: true },
      where: { isActive: true }
    });

    return {
      upa: establishments.find(e => e.type === 'upa')?._count.type || 0,
      ubs: establishments.find(e => e.type === 'ubs')?._count.type || 0,
      hospital: establishments.find(e => e.type === 'hospital')?._count.type || 0
    };
  }

  private async getUsersByProfile(establishmentFilter: any): Promise<Record<UserProfile, number>> {
    const users = await this.prisma.user.groupBy({
      by: ['profile'],
      _count: { profile: true },
      where: {
        isActive: true,
        ...establishmentFilter
      }
    });

    const result: Record<UserProfile, number> = {
      gestor_geral: 0,
      diretor_local: 0,
      gestor_local: 0,
      coordenador_geral: 0,
      coordenador_local: 0,
      supervisor: 0,
      secretario: 0,
      recepcionista: 0,
      medico: 0,
      enfermeiro: 0,
      tecnico_enfermagem: 0,
      farmaceutico: 0,
      psicologo: 0,
      fisioterapeuta: 0,
      system_master: 0
    };

    users.forEach(user => {
      result[user.profile] = user._count.profile;
    });

    return result;
  }

  private async getAttendancesByStatus(establishmentFilter: any) {
    const attendances = await this.prisma.attendance.groupBy({
      by: ['status'],
      _count: { status: true },
      where: establishmentFilter
    });

    return {
      scheduled: attendances.find(a => a.status === 'scheduled')?._count.status || 0,
      in_progress: attendances.find(a => a.status === 'in_progress')?._count.status || 0,
      completed: attendances.find(a => a.status === 'completed')?._count.status || 0,
      cancelled: attendances.find(a => a.status === 'cancelled')?._count.status || 0,
      no_show: attendances.find(a => a.status === 'no_show')?._count.status || 0
    };
  }

  private async getMonthlyAttendances(establishmentFilter: any) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const attendances = await this.prisma.$queryRaw<{month: string, count: bigint}[]>`
      SELECT 
        TO_CHAR(start_time, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM attendances 
      WHERE start_time >= ${sixMonthsAgo}
      ${establishmentFilter.establishmentId ? 
        this.prisma.$queryRaw`AND establishment_id = ${establishmentFilter.establishmentId}` : 
        this.prisma.$queryRaw``
      }
      GROUP BY TO_CHAR(start_time, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 6
    `;

    return attendances.map(a => ({
      month: a.month,
      count: Number(a.count)
    }));
  }

  private async getCriticalAlerts(isGestorGeral: boolean, establishmentId?: string) {
    // Simulação de alertas críticos - em produção viria de um sistema de monitoramento
    const alerts = [];

    // Verificar ocupação de leitos
    const bedOccupancy = await this.checkBedOccupancy(isGestorGeral, establishmentId);
    alerts.push(...bedOccupancy);

    // Verificar falta de pessoal
    const staffShortage = await this.checkStaffShortage(isGestorGeral, establishmentId);
    alerts.push(...staffShortage);

    return alerts.slice(0, 10); // Limitar a 10 alertas mais críticos
  }

  private async checkBedOccupancy(isGestorGeral: boolean, establishmentId?: string) {
    const alerts = [];
    const establishmentFilter = isGestorGeral ? {} : { id: establishmentId };

    const establishments = await this.prisma.establishment.findMany({
      where: {
        isActive: true,
        type: 'hospital',
        ...establishmentFilter
      },
      include: {
        beds: {
          include: {
            admissions: {
              where: {
                status: 'active'
              }
            }
          }
        }
      }
    });

    for (const establishment of establishments) {
      const totalBeds = establishment.beds.length;
      const occupiedBeds = establishment.beds.filter(bed => bed.admissions.length > 0).length;
      const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

      if (occupancyRate > 90) {
        alerts.push({
          id: `bed_${establishment.id}`,
          type: 'bed_capacity' as const,
          message: `Taxa de ocupação crítica: ${occupancyRate.toFixed(1)}% (${occupiedBeds}/${totalBeds} leitos)`,
          severity: occupancyRate > 95 ? 'critical' as const : 'high' as const,
          establishmentId: establishment.id,
          establishmentName: establishment.name,
          createdAt: new Date()
        });
      }
    }

    return alerts;
  }

  private async checkStaffShortage(isGestorGeral: boolean, establishmentId?: string) {
    const alerts = [];
    const establishmentFilter = isGestorGeral ? {} : { establishmentId };

    // Verificar médicos ativos nos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeMedics = await this.prisma.user.count({
      where: {
        profile: 'medico',
        isActive: true,
        lastLogin: {
          gte: sevenDaysAgo
        },
        ...establishmentFilter
      }
    });

    const totalMedics = await this.prisma.user.count({
      where: {
        profile: 'medico',
        isActive: true,
        ...establishmentFilter
      }
    });

    if (totalMedics > 0 && (activeMedics / totalMedics) < 0.7) {
      const establishments = isGestorGeral ? 
        await this.prisma.establishment.findMany({ where: { isActive: true } }) :
        await this.prisma.establishment.findMany({ where: { id: establishmentId } });

      for (const establishment of establishments) {
        alerts.push({
          id: `staff_${establishment.id}`,
          type: 'staff_shortage' as const,
          message: `Baixa atividade médica: ${activeMedics}/${totalMedics} médicos ativos nos últimos 7 dias`,
          severity: 'medium' as const,
          establishmentId: establishment.id,
          establishmentName: establishment.name,
          createdAt: new Date()
        });
      }
    }

    return alerts;
  }

  private async getPerformanceMetrics(establishmentFilter: any) {
    // Tempo médio de espera (simulado - em produção viria de métricas reais)
    const averageWaitTime = Math.floor(Math.random() * 60) + 15; // 15-75 minutos

    // Satisfação do paciente (simulado)
    const patientSatisfaction = Math.floor(Math.random() * 20) + 80; // 80-100%

    // Taxa de ocupação de leitos
    const bedOccupancyRate = await this.calculateBedOccupancyRate(establishmentFilter);

    // Utilização de pessoal (simulado)
    const staffUtilization = Math.floor(Math.random() * 30) + 70; // 70-100%

    return {
      averageWaitTime,
      patientSatisfaction,
      bedOccupancyRate,
      staffUtilization
    };
  }

  private async calculateBedOccupancyRate(establishmentFilter: any): Promise<number> {
    const establishments = await this.prisma.establishment.findMany({
      where: {
        isActive: true,
        type: 'hospital',
        ...(establishmentFilter.establishmentId ? { id: establishmentFilter.establishmentId } : {})
      },
      include: {
        beds: {
          include: {
            admissions: {
              where: {
                status: 'active'
              }
            }
          }
        }
      }
    });

    let totalBeds = 0;
    let occupiedBeds = 0;

    for (const establishment of establishments) {
      totalBeds += establishment.beds.length;
      occupiedBeds += establishment.beds.filter(bed => bed.admissions.length > 0).length;
    }

    return totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  }
}