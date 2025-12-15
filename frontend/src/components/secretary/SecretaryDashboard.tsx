import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Users, AlertCircle, CheckCircle, XCircle, Plus, Filter } from 'lucide-react';
import { KPICard } from '@/components/common/KPICard';
import { ChartContainer } from '@/components/common/ChartContainer';
import { RecentActivities } from '@/components/common/RecentActivities';
import { secretaryService, SecretaryMetrics, Appointment, Document, Alert } from '@/services/secretaryService';

interface TabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabId: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const Tab: React.FC<TabProps> = ({ activeTab, setActiveTab, tabId, label, icon: Icon }) => (
  <button
    onClick={() => setActiveTab(tabId)}
    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
      activeTab === tabId
        ? 'bg-blue-500 text-white'
        : 'bg-white/10 text-white/70 hover:bg-white/20'
    }`}
  >
    <Icon className="w-4 h-4 mr-2" />
    {label}
  </button>
);

export const SecretaryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<SecretaryMetrics | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [documentFilter, setDocumentFilter] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, appointmentsData, documentsData, alertsData] = await Promise.all([
        secretaryService.getMetrics(),
        secretaryService.getAppointments(),
        secretaryService.getDocuments(),
        secretaryService.getAlerts()
      ]);
      
      setMetrics(metricsData);
      setAppointments(appointmentsData);
      setDocuments(documentsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      const newAppointment = await secretaryService.createAppointment(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    try {
      await secretaryService.updateAppointmentStatus(appointmentId, status);
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? { ...apt, status } : apt)
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await secretaryService.markAlertAsRead(alertId);
      setAlerts(prev => 
        prev.map(alert => alert.id === alertId ? { ...alert, isRead: true } : alert)
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (appointmentFilter === 'all') return true;
    return apt.status === appointmentFilter;
  });

  const filteredDocuments = documents.filter(doc => {
    if (documentFilter === 'all') return true;
    return doc.status === documentFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'scheduled': return 'text-blue-600';
      case 'cancelled': return 'text-red-600';
      case 'completed': return 'text-gray-600';
      case 'no_show': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'patient_registration': return 'Cadastro de Paciente';
      case 'insurance_form': return 'Formulário de Convênio';
      case 'medical_record': return 'Prontuário Médico';
      case 'report': return 'Relatório';
      case 'certificate': return 'Atestado';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Secretário</h1>
          <p className="text-white/70">Gestão administrativa e atendimento ao público</p>
        </div>
        <div className="flex space-x-2">
          <Tab activeTab={activeTab} setActiveTab={setActiveTab} tabId="overview" label="Visão Geral" icon={Calendar} />
          <Tab activeTab={activeTab} setActiveTab={setActiveTab} tabId="appointments" label="Compromissos" icon={Clock} />
          <Tab activeTab={activeTab} setActiveTab={setActiveTab} tabId="documents" label="Documentos" icon={FileText} />
          <Tab activeTab={activeTab} setActiveTab={setActiveTab} tabId="alerts" label="Alertas" icon={AlertCircle} />
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <KPICard
              title="Compromissos Hoje"
              value={metrics?.appointmentsToday || 0}
              subtitle="Total de atendimentos agendados"
              icon={Calendar}
              color="blue"
            />
            <KPICard
              title="Documentos Pendentes"
              value={metrics?.pendingDocuments || 0}
              subtitle="Aguardando processamento"
              icon={FileText}
              color="orange"
            />
            <KPICard
              title="Cadastros Realizados"
              value={metrics?.patientRegistrations || 0}
              subtitle="Neste mês"
              icon={Users}
              color="green"
            />
            <KPICard
              title="Documentos Vencidos"
              value={metrics?.overdueDocuments || 0}
              subtitle="Necessitam atenção urgente"
              icon={AlertCircle}
              color="red"
            />
            <KPICard
              title="Total de Compromissos"
              value={metrics?.totalAppointments || 0}
              subtitle="Agendados no sistema"
              icon={Calendar}
              color="purple"
            />
            <KPICard
              title="Documentos Concluídos"
              value={metrics?.completedDocuments || 0}
              subtitle="Processados com sucesso"
              icon={CheckCircle}
              color="gray"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer
              title="Compromissos por Status"
              data={[
                { name: 'Confirmados', value: 45 },
                { name: 'Agendados', value: 32 },
                { name: 'Cancelados', value: 8 },
                { name: 'Concluídos', value: 71 }
              ]}
              type="pie"
              height={300}
            />
            <ChartContainer
              title="Documentos por Tipo"
              data={[
                { name: 'Cadastros', value: 28 },
                { name: 'Convênios', value: 15 },
                { name: 'Prontuários', value: 42 },
                { name: 'Atestados', value: 23 }
              ]}
              type="bar"
              height={300}
            />
          </div>

          {/* Recent Activities */}
          <RecentActivities
            activities={alerts.map(alert => ({
              id: alert.id,
              type: alert.type === 'appointment' ? 'attendance' : 
                   alert.type === 'document' ? 'prescription' : 'alert',
              title: alert.title,
              description: alert.description,
              timestamp: alert.createdAt,
              priority: alert.priority,
              isRead: alert.isRead
            }))}
            onMarkAsRead={handleMarkAlertAsRead}
          />
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Compromissos</h2>
            <div className="flex items-center space-x-4">
              <select
                value={appointmentFilter}
                onChange={(e) => setAppointmentFilter(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="scheduled">Agendados</option>
                <option value="confirmed">Confirmados</option>
                <option value="cancelled">Cancelados</option>
                <option value="completed">Concluídos</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Novo Compromisso
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Paciente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Profissional</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Data/Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{appointment.patientName}</div>
                          <div className="text-sm text-white/70">{appointment.patientCpf}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{appointment.professionalName}</div>
                          <div className="text-sm text-white/70">{appointment.specialty}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                        {appointment.date.toLocaleDateString()} às {appointment.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                          appointment.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                          appointment.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {appointment.status === 'scheduled' ? 'Agendado' :
                           appointment.status === 'confirmed' ? 'Confirmado' :
                           appointment.status === 'cancelled' ? 'Cancelado' :
                           appointment.status === 'completed' ? 'Concluído' :
                           'Não Compareceu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleUpdateAppointmentStatus(appointment.id, 'confirmed')}
                          className="text-green-400 hover:text-green-300"
                          disabled={appointment.status === 'confirmed'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                          className="text-red-400 hover:text-red-300"
                          disabled={appointment.status === 'cancelled'}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Documentos</h2>
            <div className="flex items-center space-x-4">
              <select
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluídos</option>
                <option value="overdue">Vencidos</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Novo Documento
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    document.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                    document.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                    document.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {document.status === 'pending' ? 'Pendente' :
                     document.status === 'in_progress' ? 'Em Andamento' :
                     document.status === 'completed' ? 'Concluído' :
                     'Vencido'}
                  </span>
                  <span className={`text-xs ${getPriorityColor(document.priority)}`}>
                    {document.priority === 'urgent' ? 'Urgente' :
                     document.priority === 'high' ? 'Alta' :
                     document.priority === 'medium' ? 'Média' :
                     'Baixa'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{document.title}</h3>
                <p className="text-white/70 mb-2">Paciente: {document.patientName}</p>
                <p className="text-white/70 mb-2">Tipo: {getDocumentTypeLabel(document.type)}</p>
                <p className="text-white/70 mb-4">Criado por: {document.createdBy}</p>
                {document.dueDate && (
                  <p className="text-sm text-white/60">
                    Vencimento: {document.dueDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Alertas</h2>
            <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </button>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`bg-white/10 backdrop-blur-sm rounded-lg border p-4 ${
                alert.isRead ? 'border-white/20' : 'border-blue-400'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full mr-2 ${
                        alert.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                        alert.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                        alert.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {alert.priority === 'critical' ? 'Crítico' :
                         alert.priority === 'high' ? 'Alto' :
                         alert.priority === 'medium' ? 'Médio' :
                         'Baixo'}
                      </span>
                      <span className="text-xs text-white/60">
                        {alert.createdAt.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{alert.title}</h3>
                    <p className="text-white/70 mb-2">{alert.description}</p>
                    {alert.actionRequired && (
                      <p className="text-xs text-orange-300">Requer ação</p>
                    )}
                  </div>
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkAlertAsRead(alert.id)}
                      className="text-blue-400 hover:text-blue-300 ml-4"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};