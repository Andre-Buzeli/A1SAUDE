import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Target, 
  TrendingUp, 
  FileText,
  Calendar,
  UserCheck,
  Award,
  BarChart3
} from 'lucide-react';
import { KPICard } from '@/components/common/KPICard';
import { ChartContainer } from '@/components/common/ChartContainer';
import { RecentActivities } from '@/components/common/RecentActivities';
import { coordinatorService } from '@/services/coordinatorService';
import { useAuth } from '@/contexts/AuthContext';

interface CoordinatorDashboardProps {
  establishmentType: 'UBS' | 'UPA' | 'HOSPITAL';
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({ establishmentType }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        metricsData,
        teamMembersData,
        teamPerformanceData,
        alertsData,
        reportsData,
        tasksData
      ] = await Promise.all([
        coordinatorService.getCoordinatorMetrics(),
        coordinatorService.getTeamMembers(),
        coordinatorService.getTeamPerformance(selectedPeriod),
        coordinatorService.getCoordinatorAlerts(),
        coordinatorService.getCoordinatorReports(),
        coordinatorService.getCoordinatorTasks()
      ]);

      setMetrics(metricsData);
      setTeamMembers(teamMembersData);
      setTeamPerformance(teamPerformanceData);
      setAlerts(alertsData);
      setReports(reportsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileIcon = (profile: string) => {
    switch (profile) {
      case 'doctor': return '👨‍⚕️';
      case 'nurse': return '👩‍⚕️';
      case 'nurse_technician': return '🏥';
      case 'receptionist': return '📞';
      case 'secretary': return '📝';
      default: return '👤';
    }
  };

  const getProfileLabel = (profile: string) => {
    const labels: Record<string, string> = {
      'doctor': 'Médico',
      'nurse': 'Enfermeiro',
      'nurse_technician': 'Téc. Enfermagem',
      'receptionist': 'Recepcionista',
      'secretary': 'Secretário'
    };
    return labels[profile] || profile;
  };

  const performanceChartData = teamPerformance.map(member => ({
    name: member.memberName.split(' ')[0],
    performance: member.performance,
    attendances: member.attendances
  }));

  const monthlyProgressData = [
    { name: 'Semana 1', progress: 15 },
    { name: 'Semana 2', progress: 35 },
    { name: 'Semana 3', progress: 58 },
    { name: 'Semana 4', progress: 78 }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'patient' as const,
      title: 'Novo paciente registrado',
      description: 'Maria Silva - Consulta agendada para amanhã',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: 'Recepção',
      priority: 'low' as const
    },
    {
      id: '2',
      type: 'attendance' as const,
      title: 'Atendimento crítico finalizado',
      description: 'João Santos - Alta hospitalar concedida',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      user: 'Dr. João Silva',
      priority: 'high' as const
    },
    {
      id: '3',
      type: 'alert' as const,
      title: 'Alerta de estoque',
      description: 'Medicamento X com estoque baixo',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      priority: 'medium' as const
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard Coordenador
              </h1>
              <p className="text-gray-600">
                Bem-vindo, {user?.name} | {establishmentType} | {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Nova Tarefa
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total de Pacientes"
            value={metrics?.totalPatients || 0}
            subtitle="Este mês"
            icon={Users}
            color="blue"
          />
          <KPICard
            title="Atendimentos Ativos"
            value={metrics?.activeAttendances || 0}
            subtitle="Em andamento"
            icon={Activity}
            color="orange"
          />
          <KPICard
            title="Atendimentos Completados"
            value={metrics?.completedAttendances || 0}
            subtitle="Este mês"
            icon={CheckCircle}
            color="green"
          />
          <KPICard
            title="Membros da Equipe"
            value={metrics?.teamMembers || 0}
            subtitle="Ativos"
            icon={UserCheck}
            color="purple"
          />
        </div>

        {/* Progress and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Progress */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Progresso Mensal
              </h3>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Meta: {metrics?.monthlyGoal || 0}</span>
                <span>{metrics?.monthlyProgress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(metrics?.monthlyProgress || 0, 100)}%` }}
                ></div>
              </div>
            </div>
            <ChartContainer
              title="Progresso Semanal"
              data={monthlyProgressData}
              type="line"
              dataKey="progress"
              height={200}
              colors={['#3B82F6']}
            />
          </div>

          {/* Team Performance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Performance da Equipe
              </h3>
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <ChartContainer
              title="Desempenho por Membro"
              data={performanceChartData}
              type="bar"
              dataKey="performance"
              height={250}
              colors={['#10B981', '#3B82F6', '#F59E0B', '#EF4444']}
            />
          </div>
        </div>

        {/* Team Members and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Team Members */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Equipe
              </h3>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getProfileIcon(member.profile)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{getProfileLabel(member.profile)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{member.performance}%</p>
                    <p className="text-xs text-gray-500">{member.totalAttendances} atend.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Tarefas
              </h3>
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Vencimento: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                    <span className={`px-2 py-1 rounded ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'completed' ? 'Concluída' : 
                       task.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts and Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Alertas
              </h3>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'urgent' ? 'bg-red-50 border-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    {!alert.isRead && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(alert.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reports */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Relatórios
              </h3>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{report.title}</h4>
                    <p className="text-sm text-gray-600">{report.period}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'completed' ? 'bg-green-100 text-green-800' :
                      report.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status === 'completed' ? 'Concluído' : 
                       report.status === 'submitted' ? 'Enviado' : 'Rascunho'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};