import React, { useState, useEffect } from 'react';
import { Users, Activity, CheckCircle, AlertTriangle, Clock, TrendingUp, UserCheck, Task } from 'lucide-react';
import { KPICard } from '@/components/common/KPICard';
import { ChartContainer } from '@/components/common/ChartContainer';
import { RecentActivities } from '@/components/common/RecentActivities';
import { supervisorService } from '@/services/supervisorService';

interface TeamMember {
  id: string;
  name: string;
  profile: string;
  status: 'active' | 'inactive' | 'busy';
  currentPatients: number;
  performance: number;
  lastActivity: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  assignedBy: string;
  dueDate: Date;
  createdAt: Date;
}

interface Alert {
  id: string;
  type: 'performance' | 'attendance' | 'task' | 'system';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  isRead: boolean;
}

export const SupervisorDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'tasks' | 'alerts'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        metricsData,
        teamData,
        tasksData,
        alertsData,
        performance
      ] = await Promise.all([
        supervisorService.getDashboardMetrics(),
        supervisorService.getTeamMembers(),
        supervisorService.getTasks(),
        supervisorService.getAlerts(),
        supervisorService.getPerformanceData('month')
      ]);

      setMetrics(metricsData);
      setTeamMembers(teamData);
      setTasks(tasksData);
      setAlerts(alertsData);
      setPerformanceData(performance);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, status: Task['status']) => {
    try {
      await supervisorService.updateTaskStatus(taskId, status);
      // Refresh tasks
      const updatedTasks = await supervisorService.getTasks();
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await supervisorService.markAlertAsRead(alertId);
      // Refresh alerts
      const updatedAlerts = await supervisorService.getAlerts();
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'busy':
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'inactive':
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Supervisor</h1>
          <p className="text-gray-600">Gerenciamento de equipe e supervisão de atividades</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Visão Geral', icon: Activity },
            { id: 'team', name: 'Equipe', icon: Users },
            { id: 'tasks', name: 'Tarefas', icon: Task },
            { id: 'alerts', name: 'Alertas', icon: AlertTriangle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Equipe"
              value={metrics?.totalTeamMembers || 0}
              subtitle="membros"
              icon={Users}
              color="blue"
            />
            <KPICard
              title="Atendimentos Ativos"
              value={metrics?.activeAttendances || 0}
              subtitle="em andamento"
              icon={UserCheck}
              color="green"
            />
            <KPICard
              title="Tarefas Pendentes"
              value={metrics?.pendingTasks || 0}
              subtitle="aguardando"
              icon={Task}
              color="orange"
            />
            <KPICard
              title="Performance Geral"
              value={`${metrics?.performanceScore || 0}%`}
              subtitle="desempenho"
              icon={TrendingUp}
              color="purple"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {performanceData && (
              <ChartContainer
                title="Performance da Equipe"
                data={performanceData}
                type="line"
                height={300}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              />
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Tarefas</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pendentes</span>
                  <span className="font-semibold">{metrics?.pendingTasks || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Em Progresso</span>
                  <span className="font-semibold">{metrics?.activeAttendances || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completadas</span>
                  <span className="font-semibold">{metrics?.completedTasks || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Atrasadas</span>
                  <span className="font-semibold text-red-600">{metrics?.overdueTasks || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
            </div>
            <div className="p-6">
              <RecentActivities
                activities={alerts.map(alert => ({
                  id: alert.id,
                  type: alert.type === 'performance' ? 'alert' : 'attendance',
                  title: alert.title,
                  description: alert.description,
                  timestamp: alert.createdAt,
                  priority: alert.priority === 'critical' ? 'high' : alert.priority
                }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Membros da Equipe</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perfil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pacientes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Atividade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.profile}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                          {member.status === 'active' ? 'Ativo' :
                           member.status === 'busy' ? 'Ocupado' :
                           member.status === 'inactive' ? 'Inativo' : member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.currentPatients}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.performance}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.lastActivity).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tarefas da Equipe</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <div key={task.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'urgent' ? 'Urgente' :
                           task.priority === 'high' ? 'Alta' :
                           task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status === 'completed' ? 'Concluída' :
                           task.status === 'in_progress' ? 'Em Progresso' :
                           task.status === 'pending' ? 'Pendente' :
                           task.status === 'overdue' ? 'Atrasada' : task.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Responsável: {task.assignedTo}</span>
                        <span>Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Concluir
                        </button>
                      )}
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleTaskStatusUpdate(task.id, 'in_progress')}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Iniciar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Alertas do Sistema</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(alert.priority)}`}>
                          {alert.priority === 'critical' ? 'Crítico' :
                           alert.priority === 'high' ? 'Alto' :
                           alert.priority === 'medium' ? 'Médio' : 'Baixo'}
                        </span>
                        {!alert.isRead && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
                            Novo
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{alert.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleDateString('pt-BR')} às {new Date(alert.createdAt).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkAlertAsRead(alert.id)}
                        className="ml-4 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Marcar como Lida
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};