import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  LayoutGrid,
  List
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarScheduler, CalendarEvent } from '@/components/calendar';

interface Appointment {
  id: string;
  patient: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    gender: string;
  };
  professional: {
    id: string;
    name: string;
    profile: string;
  };
  scheduledDate: string;
  duration: number;
  type: 'consultation' | 'procedure' | 'vaccination' | 'exam';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  priority: 'normal' | 'urgent' | 'return';
  notes?: string;
}

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'consultation' | 'procedure' | 'vaccination' | 'exam'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

  useEffect(() => {
    loadAppointments();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAppointments, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedDate, statusFilter, typeFilter]);

  const loadAppointments = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          patient: {
            id: 'p1',
            name: 'João Silva',
            cpf: '12345678901',
            birthDate: '1980-05-15',
            gender: 'male'
          },
          professional: {
            id: 'prof1',
            name: 'Dra. Ana Costa',
            profile: 'medico'
          },
          scheduledDate: `${selectedDate}T09:00:00Z`,
          duration: 30,
          type: 'consultation',
          status: 'scheduled',
          priority: 'normal',
          notes: 'Consulta de rotina'
        },
        {
          id: '2',
          patient: {
            id: 'p2',
            name: 'Maria Santos',
            cpf: '98765432109',
            birthDate: '1975-08-22',
            gender: 'female'
          },
          professional: {
            id: 'prof2',
            name: 'Enf. Roberto Alves',
            profile: 'enfermeiro'
          },
          scheduledDate: `${selectedDate}T10:30:00Z`,
          duration: 15,
          type: 'vaccination',
          status: 'completed',
          priority: 'normal',
          notes: 'Vacina COVID-19 - 3ª dose'
        },
        {
          id: '3',
          patient: {
            id: 'p3',
            name: 'Pedro Oliveira',
            cpf: '11122233344',
            birthDate: '1990-03-10',
            gender: 'male'
          },
          professional: {
            id: 'prof1',
            name: 'Dra. Ana Costa',
            profile: 'medico'
          },
          scheduledDate: `${selectedDate}T14:00:00Z`,
          duration: 45,
          type: 'consultation',
          status: 'scheduled',
          priority: 'urgent',
          notes: 'Retorno - dor abdominal'
        }
      ];

      let filteredAppointments = mockAppointments;

      // Apply status filter
      if (statusFilter !== 'all') {
        filteredAppointments = filteredAppointments.filter(a => a.status === statusFilter);
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        filteredAppointments = filteredAppointments.filter(a => a.type === typeFilter);
      }

      // Apply search filter
      if (searchTerm) {
        filteredAppointments = filteredAppointments.filter(a =>
          a.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.patient.cpf.includes(searchTerm) ||
          a.professional.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setAppointments(filteredAppointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      confirmed: 'bg-green-500/20 text-green-300 border-green-500/50',
      in_progress: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/50',
      no_show: 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Faltou'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      consultation: 'Consulta',
      procedure: 'Procedimento',
      vaccination: 'Vacinação',
      exam: 'Exame'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      normal: 'text-blue-300',
      urgent: 'text-red-300',
      return: 'text-yellow-300'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-300';
  };

  const handleStatusUpdate = (appointmentId: string, newStatus: string) => {
    // Update appointment status
    toast.success(`Status atualizado para ${getStatusLabel(newStatus)}`);
  };

  const handleNewAppointment = () => {
    // Navigate to new appointment form
    toast.success('Abrindo formulário de novo agendamento');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Stats calculations
  const totalAppointments = appointments.length;
  const completedToday = appointments.filter(a => a.status === 'completed').length;
  const scheduledToday = appointments.filter(a => a.status === 'scheduled').length;
  const urgentAppointments = appointments.filter(a => a.priority === 'urgent').length;

  // Convert to CalendarEvents for the calendar component
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return appointments.map(apt => ({
      id: apt.id,
      title: `${apt.patient.name} - ${getTypeLabel(apt.type)}`,
      patient: apt.patient,
      professional: apt.professional,
      start: new Date(apt.scheduledDate),
      end: new Date(new Date(apt.scheduledDate).getTime() + apt.duration * 60000),
      type: apt.type,
      status: apt.status,
      notes: apt.notes
    }));
  }, [appointments]);

  const handleEventClick = (event: CalendarEvent) => {
    toast.success(`Agendamento: ${event.patient.name}`);
    // Aqui pode abrir um modal com detalhes
  };

  const handleSlotClick = (date: Date, hour?: number) => {
    const timeStr = hour ? ` às ${hour}:00` : '';
    toast.success(`Agendar para ${date.toLocaleDateString('pt-BR')}${timeStr}`);
    // Aqui pode abrir modal de novo agendamento
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Agendamentos UBS
              </h1>
              <p className="text-text-secondary">
                {user?.establishmentName} - Gestão de consultas e procedimentos
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'calendar' ? 'bg-medical-blue text-white' : 'text-text-secondary hover:text-white'
                  }`}
                  title="Visualizar Calendário"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-medical-blue text-white' : 'text-text-secondary hover:text-white'
                  }`}
                  title="Visualizar Lista"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <GlassButton
                variant="primary"
                onClick={handleNewAppointment}
                className="flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Agendamento</span>
              </GlassButton>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total Hoje</p>
                <p className="text-2xl font-bold text-white">{totalAppointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-medical-blue" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Agendados</p>
                <p className="text-2xl font-bold text-blue-300">{scheduledToday}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Concluídos</p>
                <p className="text-2xl font-bold text-green-300">{completedToday}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Urgentes</p>
                <p className="text-2xl font-bold text-red-300">{urgentAppointments}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </GlassCard>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <CalendarScheduler
            events={calendarEvents}
            onEventClick={handleEventClick}
            onSlotClick={handleSlotClick}
            onAddEvent={handleNewAppointment}
          />
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {/* Filters */}
            <GlassCard className="p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-text-secondary" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-text-secondary" />
                  <GlassInput
                    placeholder="Buscar por nome, CPF ou profissional..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    className="w-64"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-text-secondary" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="scheduled">Agendados</option>
                    <option value="completed">Concluídos</option>
                    <option value="cancelled">Cancelados</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="all">Todos os Tipos</option>
                    <option value="consultation">Consulta</option>
                    <option value="procedure">Procedimento</option>
                    <option value="vaccination">Vacinação</option>
                    <option value="exam">Exame</option>
                  </select>
                </div>
              </div>
            </GlassCard>

            {/* Appointments List */}
            <div className="space-y-4">
          {appointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className={`p-6 ${getStatusColor(appointment.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-text-secondary" />
                      <span className="text-white font-medium">
                        {formatTime(appointment.scheduledDate)}
                      </span>
                      <span className="text-text-secondary">
                        ({appointment.duration}min)
                      </span>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.priority === 'urgent'
                        ? 'bg-red-500/20 text-red-300'
                        : appointment.priority === 'return'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {appointment.priority === 'urgent' ? 'Urgente' :
                       appointment.priority === 'return' ? 'Retorno' : 'Normal'}
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </div>
                  </div>

                  {appointment.status === 'scheduled' && (
                    <div className="flex space-x-2">
                      <GlassButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                        className="text-white hover:bg-green-500/20"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirmar
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                        className="text-white hover:bg-red-500/20"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancelar
                      </GlassButton>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-text-secondary text-sm mb-1">Paciente</p>
                    <p className="text-white font-medium">{appointment.patient.name}</p>
                    <p className="text-text-secondary text-sm">
                      CPF: {formatCPF(appointment.patient.cpf)}
                    </p>
                  </div>

                  <div>
                    <p className="text-text-secondary text-sm mb-1">Profissional</p>
                    <p className="text-white font-medium">{appointment.professional.name}</p>
                    <p className="text-text-secondary text-sm capitalize">
                      {appointment.professional.profile}
                    </p>
                  </div>

                  <div>
                    <p className="text-text-secondary text-sm mb-1">Tipo</p>
                    <p className="text-white font-medium">{getTypeLabel(appointment.type)}</p>
                    {appointment.notes && (
                      <p className="text-text-secondary text-sm mt-1">{appointment.notes}</p>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
            </div>

            {appointments.length === 0 && (
              <GlassCard className="p-8 text-center">
                <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">
                  Nenhum agendamento encontrado para a data selecionada
                </p>
              </GlassCard>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
