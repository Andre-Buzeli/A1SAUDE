import { PrismaClient } from '@prisma/client';

export interface AttendanceReport {
  totalAttendances: number;
  completedAttendances: number;
  cancelledAttendances: number;
  avgWaitTime: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  timeline: Array<{
    date: string;
    count: number;
  }>;
}

export interface PatientReport {
  totalPatients: number;
  activePatients: number;
  byAgeGroup: Record<string, number>;
  byGender: Record<string, number>;
  topConditions: Array<{
    condition: string;
    count: number;
  }>;
  patients: Array<{
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    gender: string;
    lastAttendance: string;
  }>;
}

export interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netResult: number;
  byCategory: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
}

export interface EpidemiologyReport {
  totalCases: number;
  byDisease: Record<string, number>;
  byMonth: Array<{
    month: string;
    cases: number;
  }>;
  incidenceRate: number;
  mortalityRate: number;
}

export interface DashboardMetrics {
  attendanceMetrics: {
    today: number;
    week: number;
    month: number;
    avgWaitTime: number;
  };
  patientMetrics: {
    total: number;
    newThisMonth: number;
    returning: number;
  };
  bedMetrics: {
    total: number;
    occupied: number;
    available: number;
    occupancyRate: number;
  };
  financialMetrics: {
    revenue: number;
    expenses: number;
    budgetVariance: number;
  };
}

export class ReportsService {
  constructor(private prisma: PrismaClient) {}

  async generateAttendanceReport(
    establishmentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceReport> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Get attendance data
    const attendances = await this.prisma.attendance.findMany({
      where: {
        establishmentId,
        startTime: dateFilter
      },
      select: {
        id: true,
        type: true,
        status: true,
        startTime: true,
        endTime: true,
        triage: {
          select: {
            priority: true
          }
        },
        // Add wait time calculation if available
      }
    });

    const totalAttendances = attendances.length;
    const completedAttendances = attendances.filter(a => a.status === 'completed').length;
    const cancelledAttendances = attendances.filter(a => a.status === 'cancelled').length;

    // Calculate average wait time (mock for now)
    const avgWaitTime = 15; // minutes

    // Group by type
    const byType = attendances.reduce((acc, att) => {
      acc[att.type] = (acc[att.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by priority
    const byPriority = attendances.reduce((acc, att) => {
      const priority = att.triage?.priority || 'unknown';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Timeline data (group by date)
    const timeline = this.groupByDate(attendances, 'startTime');

    return {
      totalAttendances,
      completedAttendances,
      cancelledAttendances,
      avgWaitTime,
      byType,
      byPriority,
      timeline
    };
  }

  async generatePatientReport(establishmentId: string): Promise<PatientReport> {
    // Get patient data with attendance history
    const patients = await this.prisma.patient.findMany({
      where: {
        // Filter by establishment if needed
        isActive: true
      },
      include: {
        attendances: {
          select: {
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        _count: {
          select: {
            attendances: true
          }
        }
      }
    });

    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.attendances.length > 0).length;

    // Group by age
    const byAgeGroup = patients.reduce((acc, patient) => {
      const age = this.calculateAge(patient.birthDate);
      const group = age < 18 ? '0-17' :
                   age < 30 ? '18-29' :
                   age < 50 ? '30-49' :
                   age < 65 ? '50-64' : '65+';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by gender
    const byGender = patients.reduce((acc, patient) => {
      acc[patient.gender] = (acc[patient.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top conditions (mock data)
    const topConditions = [
      { condition: 'Hipertensão', count: 45 },
      { condition: 'Diabetes', count: 32 },
      { condition: 'Asma', count: 28 },
      { condition: 'Depressão', count: 25 },
      { condition: 'Ansiedade', count: 22 }
    ];

    // Patient list
    const patientList = patients.slice(0, 100).map(patient => ({
      id: patient.id,
      name: patient.name,
      cpf: patient.cpf,
      birthDate: patient.birthDate.toISOString().split('T')[0],
      gender: patient.gender,
      lastAttendance: patient.attendances[0]?.createdAt?.toISOString() || 'Nunca'
    }));

    return {
      totalPatients,
      activePatients,
      byAgeGroup,
      byGender,
      topConditions,
      patients: patientList
    };
  }

  async generateFinancialReport(
    establishmentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<FinancialReport> {
    // Mock financial data - would integrate with actual financial tables
    const totalRevenue = 150000;
    const totalExpenses = 120000;
    const netResult = totalRevenue - totalExpenses;

    const byCategory = {
      'Consultas': 45000,
      'Exames': 35000,
      'Procedimentos': 25000,
      'Medicamentos': 20000,
      'Outros': 25000
    };

    const monthlyTrend = [
      { month: 'Jan', revenue: 14000, expenses: 11000 },
      { month: 'Fev', revenue: 15000, expenses: 12000 },
      { month: 'Mar', revenue: 16000, expenses: 13000 },
      { month: 'Abr', revenue: 15500, expenses: 12500 },
      { month: 'Mai', revenue: 17000, expenses: 13500 },
      { month: 'Jun', revenue: 16500, expenses: 13200 }
    ];

    return {
      totalRevenue,
      totalExpenses,
      netResult,
      byCategory,
      monthlyTrend
    };
  }

  async generateEpidemiologyReport(
    establishmentId: string,
    startDate?: string,
    endDate?: string,
    disease?: string
  ): Promise<EpidemiologyReport> {
    // Mock epidemiology data
    const totalCases = 127;
    const byDisease = {
      'COVID-19': 45,
      'Influenza': 28,
      'Dengue': 22,
      'Zika': 15,
      'Chikungunya': 17
    };

    const byMonth = [
      { month: 'Jan', cases: 12 },
      { month: 'Fev', cases: 18 },
      { month: 'Mar', cases: 25 },
      { month: 'Abr', cases: 22 },
      { month: 'Mai', cases: 28 },
      { month: 'Jun', cases: 22 }
    ];

    const incidenceRate = 45.2; // per 100,000 inhabitants
    const mortalityRate = 1.8; // per 100,000 inhabitants

    return {
      totalCases,
      byDisease,
      byMonth,
      incidenceRate,
      mortalityRate
    };
  }

  async getDashboardMetrics(establishmentId: string, period: string = 'today'): Promise<DashboardMetrics> {
    // Mock dashboard metrics
    return {
      attendanceMetrics: {
        today: 45,
        week: 312,
        month: 1247,
        avgWaitTime: 15
      },
      patientMetrics: {
        total: 2847,
        newThisMonth: 89,
        returning: 2758
      },
      bedMetrics: {
        total: 50,
        occupied: 38,
        available: 12,
        occupancyRate: 76
      },
      financialMetrics: {
        revenue: 45000,
        expenses: 38000,
        budgetVariance: 7000
      }
    };
  }

  // PDF and Excel generation (placeholder - would use libraries like pdfkit, exceljs)
  async generatePDFReport(data: any, title: string): Promise<Buffer> {
    // Placeholder - would implement PDF generation
    const mockPDF = Buffer.from(`PDF Report: ${title}\n${JSON.stringify(data, null, 2)}`);
    return mockPDF;
  }

  async generateExcelReport(data: any, sheetName: string): Promise<Buffer> {
    // Placeholder - would implement Excel generation
    const mockExcel = Buffer.from(`Excel Report: ${sheetName}\n${JSON.stringify(data, null, 2)}`);
    return mockExcel;
  }

  private buildDateFilter(startDate?: string, endDate?: string) {
    const filter: any = {};
    if (startDate) filter.gte = new Date(startDate);
    if (endDate) filter.lte = new Date(endDate);
    return filter;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  private groupByDate(items: any[], dateField: string): Array<{ date: string; count: number }> {
    const grouped = items.reduce((acc, item) => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, count]) => ({ date, count: count as number }));
  }
}
