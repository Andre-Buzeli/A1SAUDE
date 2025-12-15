import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  UserCheck,
  UserX,
  Bell,
  Plus,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { KPICard } from '@/components/common/KPICard';
import { ChartContainer } from '@/components/common/ChartContainer';
import { RecentActivities } from '@/components/common/RecentActivities';
import { receptionistService, ReceptionistMetrics, AppointmentData, QueueItem, ReceptionistAlert } from '@/services/receptionistService';

interface ReceptionistDashboardProps {
  userRole: string;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ userRole }) => {
  const [metrics, setMetrics] = useState<ReceptionistMetrics | null>(null);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [alerts, setAlerts] = useState<ReceptionistAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'appointments' | 'queue' | 'alerts'>('appointments');
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    specialty: '',
    priority: 'medium',
    reason: ''
  });

  const specialties = [
    'Clínico Geral',
    'Pediatria', 
    'Ortopedia',
    'Ginecologia',
    'Cardiologia',
    'Dermatologia',
    'Oftalmologia',
    'Otorrinolaringologia'
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, appointmentsData, queueData, alertsData] = await Promise.all([
        receptionistService.getDashboardMetrics(),
        receptionistService.getTodayAppointments(),
        receptionistService.getCurrentQueue(),
        receptionistService.getActiveAlerts()
      ]);

      setMetrics(metricsData);
      setAppointments(appointmentsData);
      setQueue(queueData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await receptionistService.checkInPatient(appointmentId);
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error checking in patient:', error);
    }
  };

  const handleCheckOut = async (appointmentId: string) => {
    try {
      await receptionistService.checkOutPatient(appointmentId);
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error checking out patient:', error);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    try {
      await receptionistService.updateAppointmentStatus(appointmentId, status);
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await receptionistService.registerWalkInPatient(walkInForm);
      setShowWalkInForm(false);
      setWalkInForm({ name: '', cpf: '', phone: '', specialty: '', priority: 'medium', reason: '' });
      loadDashboardData();
    } catch (error) {
      console.error('Error registering walk-in patient:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'scheduled': return 'blue';
      case 'in-progress': return 'orange';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'no-show': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      case 'urgent': return 'text-red-600 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue-appointment': return Clock;
      case 'urgent-patient': return AlertTriangle;
      case 'cancellation': return XCircle;
      default: return Bell;
    }
  };

  const appointmentChartData = appointments.reduce((acc, appointment) => {
    const existing = acc.find(item => item.name === appointment.specialty);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: appointment.specialty, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const statusChartData = appointments.reduce((acc, appointment) => {
    const existing = acc.find(item => item.name === appointment.status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: appointment.status, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Recepcionista</h1>
          <p className="text-gray-600 mt-1">Gestão de atendimento e agendamentos</p>
        </div>
        <button
          onClick={() => setShowWalkInForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Paciente sem Horário
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Consultas"
          value={metrics?.totalAppointments || 0}
          subtitle="Hoje"
          icon={Calendar}
          color="blue"
        />
        <KPICard
          title="Confirmadas"
          value={metrics?.confirmedAppointments || 0}
          subtitle={`${((metrics?.confirmedAppointments || 0) / (metrics?.totalAppointments || 1) * 100).toFixed(1)}%`}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Tempo Médio de Espera"
          value={`${metrics?.averageWaitTime || 0} min`}
          subtitle="Últimas 24h"
          icon={Clock}
          color="orange"
        />
        <KPICard
          title="Satisfação"
          value={`${(metrics?.patientSatisfaction || 0).toFixed(1)}/5.0`}
          subtitle="Avaliação"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Consultas por Especialidade"
          data={appointmentChartData}
          type="pie"
          height={300}
        />
        <ChartContainer
          title="Status dos Agendamentos"
          data={statusChartData}
          type="bar"
          height={300}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'appointments', label: 'Agendamentos', count: appointments.length },
              { id: 'queue', label: 'Fila de Espera', count: queue.length },
              { id: 'alerts', label: 'Alertas', count: alerts.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'appointments' && (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(appointment.priority)}`}>
                          {appointment.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{appointment.specialty}</p>
                      <p className="text-gray-600 text-sm mb-1">{appointment.professionalName}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{appointment.date} às {appointment.time}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium bg-${getStatusColor(appointment.status)}-100 text-${getStatusColor(appointment.status)}-800`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleCheckIn(appointment.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <UserCheck className="h-3 w-3" />
                          Check-in
                        </button>
                      )}
                      {appointment.status === 'in-progress' && (
                        <button
                          onClick={() => handleCheckOut(appointment.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <UserX className="h-3 w-3" />
                          Check-out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'queue' && (
            <div className="space-y-4">
              {queue.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                        {item.position}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.patientName}</h3>
                        <p className="text-gray-600 text-sm">{item.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Tempo estimado</p>
                        <p className="font-semibold">{item.estimatedWaitTime} min</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'alerts' && (
            <div className="space-y-4">
              {alerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.type);
                return (
                  <div key={alert.id} className={`border rounded-lg p-4 ${
                    alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                    alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                    alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <AlertIcon className={`h-5 w-5 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'high' ? 'text-orange-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
                        {alert.patientName && (
                          <p className="text-gray-500 text-xs mt-1">Paciente: {alert.patientName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Walk-in Patient Form Modal */}
      {showWalkInForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Registrar Paciente sem Horário</h2>
            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={walkInForm.name}
                  onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input
                  type="text"
                  value={walkInForm.cpf}
                  onChange={(e) => setWalkInForm({ ...walkInForm, cpf: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={walkInForm.phone}
                  onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                <select
                  value={walkInForm.specialty}
                  onChange={(e) => setWalkInForm({ ...walkInForm, specialty: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Selecione uma especialidade</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select
                  value={walkInForm.priority}
                  onChange={(e) => setWalkInForm({ ...walkInForm, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Consulta</label>
                <textarea
                  value={walkInForm.reason}
                  onChange={(e) => setWalkInForm({ ...walkInForm, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrar
                </button>
                <button
                  type="button"
                  onClick={() => setShowWalkInForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};