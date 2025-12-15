import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Stethoscope,
  Bed,
  UserCheck,
  Timer,
  BarChart3
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { useSurgery } from '@/hooks/useSurgery';

const SurgeryDashboard: React.FC = () => {
  const { dashboardData, rooms, surgeries, loading, error } = useSurgery();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white/80">{error}</p>
        </GlassCard>
      </div>
    );
  }

  // Filtrar cirurgias do dia selecionado
  const todaySurgeries = surgeries.filter(surgery =>
    surgery.scheduledDate.toISOString().split('T')[0] === selectedDate
  );

  // Agrupar cirurgias por status
  const surgeryStats = {
    scheduled: todaySurgeries.filter(s => s.status === 'scheduled').length,
    inProgress: todaySurgeries.filter(s => s.status === 'in_progress').length,
    completed: todaySurgeries.filter(s => s.status === 'completed').length,
    cancelled: todaySurgeries.filter(s => s.status === 'cancelled').length
  };

  const stats = [
    {
      title: 'Cirurgias Hoje',
      value: dashboardData?.totalSurgeriesToday || 0,
      icon: Calendar,
      color: 'text-medical-blue',
      bgColor: 'bg-medical-blue/20'
    },
    {
      title: 'Em Andamento',
      value: dashboardData?.surgeriesInProgress || 0,
      icon: Activity,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      title: 'Concluídas',
      value: dashboardData?.surgeriesCompleted || 0,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Tempo Médio',
      value: `${dashboardData?.averageDuration || 0}min`,
      icon: Timer,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'Utilização Salas',
      value: `${dashboardData?.roomUtilization || 0}%`,
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Emergências',
      value: dashboardData?.emergencySurgeries || 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    }
  ];

  const roomStats = [
    {
      label: 'Disponíveis',
      value: dashboardData?.rooms.available || 0,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Ocupadas',
      value: dashboardData?.rooms.occupied || 0,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      label: 'Manutenção',
      value: dashboardData?.rooms.maintenance || 0,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-medical-blue/20 rounded-lg">
            <Stethoscope className="w-8 h-8 text-medical-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Centro Cirúrgico</h2>
            <p className="text-text-secondary">Controle completo de cirurgias e salas</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-white/60" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
            />
          </div>
          <GlassButton variant="primary">
            Agendar Cirurgia
          </GlassButton>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Surgery Status Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Status das Cirurgias
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Agendadas</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-400 text-sm font-medium">
                    {surgeryStats.scheduled}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Em Andamento</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-400 text-sm font-medium">
                    {surgeryStats.inProgress}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Concluídas</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm font-medium">
                    {surgeryStats.completed}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Canceladas</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-400 text-sm font-medium">
                    {surgeryStats.cancelled}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Room Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Bed className="w-5 h-5 mr-2" />
              Status das Salas
            </h3>

            <div className="space-y-4">
              {roomStats.map((stat, index) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">{stat.label}</span>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${stat.bgColor}`}>
                    <span className={`${stat.color} text-sm font-medium`}>
                      {stat.value}
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Total de Salas</span>
                  <span className="text-white font-medium">
                    {dashboardData?.rooms.total || 0}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Team Availability */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Equipe Disponível
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Cirurgiões</span>
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">
                    {dashboardData?.team.availableSurgeons || 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Anestesistas</span>
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    {dashboardData?.team.availableAnesthetists || 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Enfermeiros</span>
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">
                    {dashboardData?.team.availableNurses || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <GlassButton className="w-full" variant="secondary" size="sm">
                Ver Escala Completa
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Agenda de Hoje
            </h3>

            <div className="flex items-center space-x-2">
              <span className="text-white/60 text-sm">
                {todaySurgeries.length} cirurgias agendadas
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todaySurgeries.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Nenhuma cirurgia agendada para hoje</p>
              </div>
            ) : (
              todaySurgeries.map((surgery, index) => (
                <motion.div
                  key={surgery.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-white font-medium">
                          {surgery.scheduledTime} - {surgery.procedureName}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          surgery.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                          surgery.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                          surgery.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {surgery.status === 'scheduled' ? 'Agendada' :
                           surgery.status === 'in_progress' ? 'Em Andamento' :
                           surgery.status === 'completed' ? 'Concluída' : 'Cancelada'}
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 mt-2 text-sm text-white/70">
                        <span>Paciente: {surgery.patientName}</span>
                        <span>Sala: {surgery.roomNumber}</span>
                        <span>Duração: {surgery.estimatedDuration}min</span>
                        <span>Cirurgião: {surgery.team.surgeon?.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <GlassButton size="sm" variant="ghost">
                        Ver Detalhes
                      </GlassButton>
                      {surgery.status === 'scheduled' && (
                        <GlassButton size="sm" variant="primary">
                          Iniciar
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <Stethoscope className="w-6 h-6" />
              <span>Agendar Cirurgia</span>
            </GlassButton>

            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <Bed className="w-6 h-6" />
              <span>Ver Salas</span>
            </GlassButton>

            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <Users className="w-6 h-6" />
              <span>Equipe</span>
            </GlassButton>

            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <BarChart3 className="w-6 h-6" />
              <span>Relatórios</span>
            </GlassButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default SurgeryDashboard;







