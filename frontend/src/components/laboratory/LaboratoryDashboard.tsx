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
  Flask,
  Microscope,
  Zap,
  Timer,
  FileText,
  Droplet,
  Target,
  AlertCircle
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { useLaboratory } from '@/hooks/useLaboratory';

const LaboratoryDashboard: React.FC = () => {
  const { dashboardData, orders, tests, equipment, loading, error } = useLaboratory();
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

  // Filtrar pedidos por período
  const periodOrders = orders.filter(order => {
    if (selectedPeriod === 'today') {
      const today = new Date().toDateString();
      return order.createdAt.toDateString() === today;
    }
    return true;
  });

  // Estatísticas de pedidos
  const orderStats = {
    total: periodOrders.length,
    completed: periodOrders.filter(o => o.status === 'completed').length,
    inProgress: periodOrders.filter(o => o.status === 'in_progress').length,
    pending: periodOrders.filter(o => o.status === 'ordered' || o.status === 'sample_collected').length,
    cancelled: periodOrders.filter(o => o.status === 'cancelled').length,
    rejected: periodOrders.filter(o => o.status === 'rejected').length
  };

  const stats = [
    {
      title: 'Pedidos Hoje',
      value: dashboardData?.totalOrdersToday || 0,
      icon: Activity,
      color: 'text-medical-blue',
      bgColor: 'bg-medical-blue/20'
    },
    {
      title: 'Em Processamento',
      value: dashboardData?.totalOrdersToday ? Math.floor(dashboardData.totalOrdersToday * 0.4) : 0,
      icon: Flask,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      title: 'Concluídos',
      value: dashboardData?.totalOrdersToday ? Math.floor(dashboardData.totalOrdersToday * 0.5) : 0,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Tempo Médio',
      value: `${dashboardData?.averageTurnaroundTime || 0}min`,
      icon: Timer,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'Taxa de Rejeição',
      value: `${((dashboardData?.rejectedSamples || 0) / (dashboardData?.totalOrdersToday || 1) * 100).toFixed(1)}%`,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      title: 'Resultados Críticos',
      value: dashboardData?.criticalResults || 0,
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
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
      label: 'Reparo',
      value: dashboardData?.equipmentStatus.repair || 0,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    }
  ];

  const urgencyStats = dashboardData?.ordersByUrgency || {};
  const categoryStats = dashboardData?.ordersByCategory || {};

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
            <Flask className="w-8 h-8 text-medical-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Laboratório Clínico</h2>
            <p className="text-text-secondary">Análises laboratoriais e controle de qualidade</p>
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
            Solicitar Exames
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
        {/* Order Status Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Status dos Pedidos
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Solicitados</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-400 text-sm font-medium">
                    {orderStats.pending}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Amostra Recebida</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-400 text-sm font-medium">
                    {periodOrders.filter(o => o.status === 'sample_received').length}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Em Processamento</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-400 text-sm font-medium">
                    {orderStats.inProgress}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Concluídos</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm font-medium">
                    {orderStats.completed}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Rejeitados</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-400 text-sm font-medium">
                    {orderStats.rejected}
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
              <Microscope className="w-5 h-5 mr-2" />
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

              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Taxa de Utilização</span>
                  <span className="text-medical-blue font-medium">
                    {dashboardData?.utilizationRate || 0}%
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Urgency Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Distribuição por Urgência
            </h3>

            <div className="space-y-4">
              {Object.entries(urgencyStats).map(([urgency, count], index) => (
                <div key={urgency} className="flex items-center justify-between">
                  <span className="text-white/80 text-sm capitalize">{urgency}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-white/20 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          urgency === 'emergency' ? 'bg-red-500' :
                          urgency === 'urgent' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${(count / Math.max(...Object.values(urgencyStats))) * 100}%`
                        }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      urgency === 'emergency' ? 'text-red-400' :
                      urgency === 'urgent' ? 'text-orange-400' : 'text-blue-400'
                    }`}>
                      {count}
                    </span>
                  </div>
                </div>
              ))}

              {Object.keys(urgencyStats).length === 0 && (
                <p className="text-white/60 text-center py-4">
                  Nenhum pedido encontrado
                </p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Critical Alerts */}
      {(dashboardData?.criticalResults || 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6 border border-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-400 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Valores Críticos Pendentes
              </h3>

              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm">
                  {dashboardData.criticalResults} valores críticos
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Mock critical values */}
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-white font-medium">Potássio: 7.2 mEq/L (Crítico Alto)</p>
                <p className="text-red-300 text-sm">Paciente: Maria Silva • Pedido: BIO-001 • Há 15 minutos</p>
                <p className="text-white/60 text-xs">Valor de referência: 3.5 - 5.0 mEq/L</p>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-white font-medium">Plaquetas: 15.000/mm³ (Crítico Baixo)</p>
                <p className="text-red-300 text-sm">Paciente: João Santos • Pedido: HEM-002 • Há 32 minutos</p>
                <p className="text-white/60 text-xs">Valor de referência: 150.000 - 450.000/mm³</p>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-white font-medium">INR: 8.5 (Crítico Alto)</p>
                <p className="text-red-300 text-sm">Paciente: Ana Costa • Pedido: COAG-003 • Há 45 minutos</p>
                <p className="text-white/60 text-xs">Valor de referência: 0.8 - 1.1</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Today's Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Pedidos de Hoje
            </h3>

            <div className="flex items-center space-x-2">
              <span className="text-white/60 text-sm">
                {periodOrders.length} pedidos realizados
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {periodOrders.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Nenhum pedido realizado hoje</p>
              </div>
            ) : (
              periodOrders.slice(0, 10).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-white font-medium">
                          {order.id}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          order.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                          order.status === 'sample_received' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {order.status === 'completed' ? 'Concluído' :
                           order.status === 'in_progress' ? 'Em Processamento' :
                           order.status === 'sample_received' ? 'Amostra Recebida' :
                           order.status === 'ordered' ? 'Solicitado' : 'Outro'}
                        </div>
                        {order.urgency === 'urgent' && (
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300">
                            Urgente
                          </div>
                        )}
                        {order.urgency === 'emergency' && (
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                            Emergência
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-6 mt-2 text-sm text-white/70">
                        <span>Paciente: {order.patientName}</span>
                        <span>Solicitante: {order.requestedByName}</span>
                        <span>Exames: {order.tests.length}</span>
                        <span>Amostra: {order.sampleType}</span>
                      </div>

                      {order.clinicalIndication && (
                        <p className="text-white/60 text-sm mt-1">
                          Indicação: {order.clinicalIndication}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <GlassButton size="sm" variant="ghost">
                        Ver Detalhes
                      </GlassButton>
                      {order.status === 'ordered' && (
                        <GlassButton size="sm" variant="primary">
                          Receber Amostra
                        </GlassButton>
                      )}
                      {order.status === 'sample_received' && (
                        <GlassButton size="sm" variant="primary">
                          Iniciar
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {periodOrders.length > 10 && (
              <div className="text-center pt-4">
                <GlassButton variant="secondary">
                  Ver Todos os Pedidos ({periodOrders.length})
                </GlassButton>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Quality Control Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Controle de Qualidade
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {dashboardData?.qcFailures === 0 ? '100%' : '99.8%'}
              </div>
              <p className="text-white/60 text-sm">Controles Passando</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {dashboardData?.costPerTest || 0}€
              </div>
              <p className="text-white/60 text-sm">Custo Médio/Teste</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {dashboardData?.technicianWorkload || 0}%
              </div>
              <p className="text-white/60 text-sm">Carga dos Técnicos</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {dashboardData?.rejectedSamples || 0}
              </div>
              <p className="text-white/60 text-sm">Amostras Rejeitadas</p>
            </div>
          </div>

          {(dashboardData?.qcFailures || 0) > 0 && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">
                  {dashboardData.qcFailures} falhas de controle de qualidade detectadas hoje
                </span>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <Flask className="w-6 h-6" />
              <span>Solicitar Exames</span>
            </GlassButton>

            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <Droplet className="w-6 h-6" />
              <span>Receber Amostras</span>
            </GlassButton>

            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <Microscope className="w-6 h-6" />
              <span>Processar Exames</span>
            </GlassButton>

            <GlassButton className="h-20 flex-col space-y-2" variant="secondary">
              <FileText className="w-6 h-6" />
              <span>Validar Resultados</span>
            </GlassButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default LaboratoryDashboard;







