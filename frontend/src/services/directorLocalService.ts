import { DirectorLocalMetrics, ChartData, Activity } from '@/types/director-local.types';

// Mock service - substituir com chamadas reais à API
export const directorLocalService = {
  async getMetrics(): Promise<DirectorLocalMetrics> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      totalEstablishments: 12,
      totalPatients: 15420,
      monthlyAttendances: 3245,
      monthlyRevenue: 485000,
      occupancyRate: 78,
      satisfactionRate: 92,
      pendingReports: 8,
      completedReports: 45,
      criticalAlerts: 3,
      resolvedAlerts: 127
    };
  },

  async getAttendanceChartData(): Promise<ChartData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { name: 'Jan', value: 2800 },
      { name: 'Fev', value: 3100 },
      { name: 'Mar', value: 2950 },
      { name: 'Abr', value: 3200 },
      { name: 'Mai', value: 3350 },
      { name: 'Jun', value: 3245 }
    ];
  },

  async getEstablishmentChartData(): Promise<ChartData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { name: 'UBS', value: 8 },
      { name: 'UPA', value: 2 },
      { name: 'Hospital', value: 1 },
      { name: 'Clínica', value: 1 }
    ];
  },

  async getRecentActivities(): Promise<Activity[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      {
        id: '1',
        type: 'alert',
        title: 'Alerta de Capacidade',
        description: 'UPA Central atingiu 95% de ocupação',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: 'Sistema',
        priority: 'high'
      },
      {
        id: '2',
        type: 'patient',
        title: 'Alta Hospitalar',
        description: 'Paciente José Silva recebeu alta do Hospital Municipal',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        user: 'Dr. João Santos',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'attendance',
        title: 'Atendimento Emergencial',
        description: 'Paciente Maria Oliveira atendida na UPA com prioridade vermelha',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        user: 'Enf. Ana Costa',
        priority: 'high'
      },
      {
        id: '4',
        type: 'prescription',
        title: 'Prescrição Médica',
        description: 'Nova prescrição emitida para paciente Pedro Souza',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        user: 'Dr. Carlos Lima',
        priority: 'low'
      },
      {
        id: '5',
        type: 'alert',
        title: 'Relatório Mensal',
        description: 'Relatório mensal de indicadores disponível para download',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        user: 'Sistema',
        priority: 'medium'
      }
    ];
  }
};