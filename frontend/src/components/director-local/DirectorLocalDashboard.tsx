import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Activity, Building2, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { KPICard } from '@/components/common/KPICard';
import { ChartContainer } from '@/components/common/ChartContainer';
import { RecentActivities } from '@/components/common/RecentActivities';
import { useAuth } from '@/contexts/AuthContext';
import { directorLocalService } from '@/services/directorLocalService';

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

interface ChartData {
  name: string;
  value: number;
}

interface Activity {
  id: string;
  type: 'patient' | 'attendance' | 'prescription' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  priority?: 'low' | 'medium' | 'high';
}

export const DirectorLocalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DirectorLocalMetrics>({
    totalEstablishments: 0,
    totalPatients: 0,
    monthlyAttendances: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    satisfactionRate: 0,
    pendingReports: 0,
    completedReports: 0,
    criticalAlerts: 0,
    resolvedAlerts: 0
  });
  const [attendanceChartData, setAttendanceChartData] = useState<ChartData[]>([]);
  const [establishmentChartData, setEstablishmentChartData] = useState<ChartData[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simular dados do dashboard
      const mockMetrics: DirectorLocalMetrics = {
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

      const mockAttendanceData: ChartData[] = [
        { name: 'Jan', value: 2800 },
        { name: 'Fev', value: 3100 },
        { name: 'Mar', value: 2950 },
        { name: 'Abr', value: 3200 },
        { name: 'Mai', value: 3350 },
        { name: 'Jun', value: 3245 }
      ];

      const mockEstablishmentData: ChartData[] = [
        { name: 'UBS', value: 8 },
        { name: 'UPA', value: 2 },
        { name: 'Hospital', value: 1 },
        { name: 'Clínica', value: 1 }
      ];

      const mockActivities: Activity[] = [
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

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMetrics(mockMetrics);
      setAttendanceChartData(mockAttendanceData);
      setEstablishmentChartData(mockEstablishmentData);
      setActivities(mockActivities);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Diretor Local</h1>
            <p className="text-blue-100 mt-1">Visão estratégica da rede de saúde local</p>
          </div>
          <Building2 className="w-12 h-12 text-blue-200" />
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Estabelecimentos"
          value={metrics.totalEstablishments}
          subtitle="unidades na rede"
          icon={Building2}
          color="blue"
        />
        <KPICard
          title="Total Pacientes"
          value={metrics.totalPatients.toLocaleString()}
          subtitle="pacientes cadastrados"
          icon={Users}
          color="green"
        />
        <KPICard
          title="Atendimentos Mês"
          value={metrics.monthlyAttendances.toLocaleString()}
          subtitle="atendimentos realizados"
          icon={Activity}
          color="purple"
        />
        <KPICard
          title="Taxa Ocupação"
          value={`${metrics.occupancyRate}%`}
          subtitle="ocupação da rede"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Evolução de Atendimentos"
          data={attendanceChartData}
          type="line"
          dataKey="value"
          xAxisKey="name"
          yAxisLabel="Atendimentos"
          height={300}
        />
        <ChartContainer
          title="Distribuição por Tipo de Estabelecimento"
          data={establishmentChartData}
          type="pie"
          dataKey="value"
          height={300}
        />
      </div>

      {/* Métricas de Qualidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Satisfação"
          value={`${metrics.satisfactionRate}%`}
          subtitle="índice de satisfação"
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Relatórios Pendentes"
          value={metrics.pendingReports}
          subtitle="relatórios pendentes"
          icon={FileText}
          color="yellow"
        />
        <KPICard
          title="Alertas Críticos"
          value={metrics.criticalAlerts}
          subtitle="alertas ativos"
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          title="Receita Mensal"
          value={`R$ ${metrics.monthlyRevenue.toLocaleString()}`}
          subtitle="faturamento mensal"
          icon={DollarSign}
          color="blue"
        />
      </div>

      {/* Atividades Recentes */}
      <RecentActivities
        activities={activities}
        title="Atividades Recentes da Rede"
        maxItems={8}
      />
    </div>
  );
};