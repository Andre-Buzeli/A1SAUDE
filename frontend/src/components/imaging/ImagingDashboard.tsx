import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  Clock,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Stethoscope,
  Monitor,
  Zap,
  Timer,
  FileText
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { useImaging } from '@/hooks/useImaging';

const ImagingDashboard: React.FC = () => {
  const { dashboardData, exams, equipment, loading, error } = useImaging();
  const [selectedPeriod, setSelectedPeriod] = useState('today');

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

  // Filtrar exames por período
  const periodExams = exams.filter(exam => {
    if (selectedPeriod === 'today') {
      const today = new Date().toDateString();
      return exam.scheduledDate && exam.scheduledDate.toDateString() === today;
    }
    return true;
  });

  // Estatísticas de exames
  const examStats = {
    total: periodExams.length,
    completed: periodExams.filter(e => e.status === 'completed').length,
    inProgress: periodExams.filter(e => e.status === 'in_progress').length,
    pending: periodExams.filter(e => e.status === 'scheduled').length,
    cancelled: periodExams.filter(e => e.status === 'cancelled').length
  };

  const stats = [
    {
      title: 'Exames Hoje',
      value: dashboardData?.totalExamsToday || 0,
      icon: Activity,
      color: 'text-medical-blue',
      bgColor: 'bg-medical-blue/20'
    },
    {
      title: 'Em Andamento',
      value: dashboardData?.totalExamsToday ? Math.floor(dashboardData.totalExamsToday * 0.3) : 0,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      title: 'Concluídos',
      value: dashboardData?.totalExamsToday ? Math.floor(dashboardData.totalExamsToday * 0.6) : 0,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Tempo Médio',
      value: `${dashboardData?.averageReportTime || 0}h`,
      icon: Timer,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'Utilização Equip.',
      value: `${dashboardData?.utilizationRate || 0}%`,
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Laudos Pendentes',
      value: dashboardData?.pendingReports || 0,
      icon: FileText,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    }
  ];

  const equipmentStats = [
    {
      label: 'Operacionais',
      value: dashboardData?.equipmentStatus.operational || 0,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Manutenção',
      value: dashboardData?.equipmentStatus.maintenance || 0,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      label: 'Quebrados',
      value: dashboardData?.equipmentStatus.broken || 0,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    }
  ];

  const modalityStats = dashboardData?.examsByType || {};

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
            <h2 className="text-2xl font-bold text-white">Centro de Imagem</h2>
            <p className="text-text-secondary">Gestão completa de exames de imagem</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-white/60" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
            </select>
          </div>
          <GlassButton variant="primary">
            Solicitar Exame
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
        {/* Exam Status Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Status dos Exames
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Agendados</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-400 text-sm font-medium">
                    {examStats.pending}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Em Andamento</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-400 text-sm font-medium">
                    {examStats.inProgress}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Concluídos</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm font-medium">
                    {examStats.completed}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Cancelados</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-400 text-sm font-medium">
                    {examStats.cancelled}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Equipment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Status dos Equipamentos
            </h3>

            <div className="space-y-4">
              {equipmentStats.map((stat, index) => (
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
                  <span className="text-white/80 text-sm">Total de Equipamentos</span>
                  <span className="text-white font-medium">
                    {dashboardData?.equipmentStatus.total || 0}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Modality Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Distribuição por Modalidade
            </h3>

            <div className="space-y-4">
              {Object.entries(modalityStats).map(([modality, count], index) => (
                <div key={modality} className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">{modality}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-medical-blue h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(modalityStats))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-medical-blue text-sm font-medium w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}

              {Object.keys(modalityStats).length === 0 && (
                <p className="text-white/60 text-center py-4">
                  Nenhum exame encontrado
                </p>
              )}
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
                {periodExams.length} exames agendados
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {periodExams.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Nenhum exame agendado para hoje</p>
              </div>
            ) : (
              periodExams.slice(0, 10).map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-white font-medium">
                          {exam.scheduledTime} - {exam.examName}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          exam.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                          exam.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                          exam.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {exam.status === 'scheduled' ? 'Agendado' :
                           exam.status === 'in_progress' ? 'Em Andamento' :
                           exam.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </div>
                        {exam.urgency === 'urgent' && (
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                            Urgente
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-6 mt-2 text-sm text-white/70">
                        <span>Paciente: {exam.patientName}</span>
                        <span>Sala: {exam.roomNumber}</span>
                        <span>Equipamento: {exam.equipmentName}</span>
                        <span>Técnico: {exam.technicianName}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <GlassButton size="sm" variant="ghost">
                        Ver Detalhes
                      </GlassButton>
                      {exam.status === 'scheduled' && (
                        <GlassButton size="sm" variant="primary">
                          Iniciar
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {periodExams.length > 10 && (
              <div className="text-center pt-4">
                <GlassButton variant="secondary">
                  Ver Todos os Exames ({periodExams.length})
                </GlassButton>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Critical Alerts */}
      {(dashboardData?.criticalFindings || 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="p-6 border border-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-400 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Achados Críticos
              </h3>

              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm">
                  {dashboardData.criticalFindings} achados pendentes
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Mock critical findings */}
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-white font-medium">Fratura exposta fêmur direito</p>
                <p className="text-red-300 text-sm">Paciente: Maria Silva • Raio-X • Prioridade: Emergência</p>
                <p className="text-white/60 text-xs">Há 15 minutos</p>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-white font-medium">Pneumotórax esquerdo</p>
                <p className="text-red-300 text-sm">Paciente: João Santos • Raio-X Tórax • Prioridade: Alta</p>
                <p className="text-white/60 text-xs">Há 32 minutos</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <Stethoscope className="w-6 h-6" />
              <span>Solicitar Exame</span>
            </GlassButton>

            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <Monitor className="w-6 h-6" />
              <span>Ver Equipamentos</span>
            </GlassButton>

            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <Users className="w-6 h-6" />
              <span>Agenda Técnica</span>
            </GlassButton>

            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <FileText className="w-6 h-6" />
              <span>Laudos Pendentes</span>
            </GlassButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ImagingDashboard;







