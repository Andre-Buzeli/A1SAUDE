import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign,
  Activity,
  Clock,
  Users,
  ShoppingCart,
  BarChart3,
  Filter,
  Search,
  Plus,
  Download
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { usePharmacy } from '@/hooks/usePharmacy';

const PharmacyDashboard: React.FC = () => {
  const {
    dashboardData,
    alerts,
    loading,
    error
  } = usePharmacy();

  const [selectedFilter, setSelectedFilter] = useState('all');

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue"></div>
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

  const stats = [
    {
      title: 'Total de Medicamentos',
      value: dashboardData?.totalMedicamentos || 0,
      icon: Pill,
      color: 'text-medical-blue',
      bgColor: 'bg-medical-blue/20'
    },
    {
      title: 'Medicamentos Ativos',
      value: dashboardData?.medicamentosAtivos || 0,
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Valor Total em Estoque',
      value: `R$ ${(dashboardData?.valorTotalEstoque || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      title: 'Movimentações Hoje',
      value: dashboardData?.movimentacoesHoje || 0,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'Dispensações Hoje',
      value: dashboardData?.dispensacoesHoje || 0,
      icon: Users,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20'
    },
    {
      title: 'Alertas Ativos',
      value: dashboardData?.alertasAtivos || 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    }
  ];

  const criticalAlerts = alerts.filter(alert => alert.severidade === 'critica' && !alert.resolvido);
  const warningAlerts = alerts.filter(alert => alert.severidade === 'alta' && !alert.resolvido);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Dashboard da Farmácia
              </h1>
              <p className="text-text-secondary">
                Controle completo de estoque e dispensação de medicamentos
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <GlassButton variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Relatório
              </GlassButton>
              <GlassButton variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Medicamento
              </GlassButton>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Critical Alerts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Alertas Críticos</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm">{criticalAlerts.length}</span>
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {criticalAlerts.length === 0 ? (
                  <p className="text-white/60 text-sm text-center py-4">
                    Nenhum alerta crítico
                  </p>
                ) : (
                  criticalAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-white text-sm font-medium">{alert.medicationNome}</p>
                      <p className="text-red-300 text-xs">{alert.mensagem}</p>
                      <p className="text-white/60 text-xs mt-1">
                        {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Stock Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Status do Estoque</h3>
                <BarChart3 className="w-5 h-5 text-white/60" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Estoque Baixo</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-400 text-sm font-medium">
                      {dashboardData?.medicamentosEstoqueBaixo || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Estoque Crítico</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-400 text-sm font-medium">
                      {dashboardData?.medicamentosEstoqueCritico || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Vencendo em 30 dias</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-orange-400 text-sm font-medium">
                      {dashboardData?.medicamentosVencendo || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Vencidos</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <span className="text-red-600 text-sm font-medium">
                      {dashboardData?.medicamentosVencidos || 0}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>

              <div className="space-y-3">
                <GlassButton className="w-full justify-start" variant="ghost">
                  <Package className="w-4 h-4 mr-3" />
                  Registrar Entrada
                </GlassButton>

                <GlassButton className="w-full justify-start" variant="ghost">
                  <Users className="w-4 h-4 mr-3" />
                  Dispensar Medicamento
                </GlassButton>

                <GlassButton className="w-full justify-start" variant="ghost">
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  Pedido de Compra
                </GlassButton>

                <GlassButton className="w-full justify-start" variant="ghost">
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Relatórios
                </GlassButton>

                <GlassButton className="w-full justify-start" variant="ghost">
                  <Clock className="w-4 h-4 mr-3" />
                  Inventário
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-white/60" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="entries">Entradas</option>
                  <option value="dispensation">Dispensações</option>
                  <option value="alerts">Alertas</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {/* Mock activity items */}
              <div className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Entrada de Novalgina 500mg - Lote: ABC123</p>
                  <p className="text-white/60 text-xs">João Silva • 2 horas atrás</p>
                </div>
                <span className="text-green-400 text-sm font-medium">+150 un</span>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Dispensação para Maria Santos - Cataflam 50mg</p>
                  <p className="text-white/60 text-xs">Ana Costa • 3 horas atrás</p>
                </div>
                <span className="text-blue-400 text-sm font-medium">-20 un</span>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Alerta: Estoque crítico de Rivotril 2mg</p>
                  <p className="text-white/60 text-xs">Sistema • 4 horas atrás</p>
                </div>
                <span className="text-red-400 text-sm font-medium">5 un</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;