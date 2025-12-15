import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  MapPin
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import GlassButton from '../../../components/ui/GlassButton';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface EstablishmentData {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'UBS' | 'UPA';
  status: 'active' | 'maintenance' | 'inactive';
  occupancy: number;
  staff: number;
  revenue: number;
  location: string;
}

const GestorGeralDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [establishments, setEstablishments] = useState<EstablishmentData[]>([]);

  // Dados simulados para demonstração
  useEffect(() => {
    setEstablishments([
      {
        id: '1',
        name: 'Hospital Central',
        type: 'HOSPITAL',
        status: 'active',
        occupancy: 85,
        staff: 450,
        revenue: 2500000,
        location: 'Centro'
      },
      {
        id: '2',
        name: 'UBS Vila Nova',
        type: 'UBS',
        status: 'active',
        occupancy: 65,
        staff: 35,
        revenue: 180000,
        location: 'Vila Nova'
      },
      {
        id: '3',
        name: 'UPA Norte',
        type: 'UPA',
        status: 'maintenance',
        occupancy: 45,
        staff: 85,
        revenue: 420000,
        location: 'Zona Norte'
      }
    ]);
  }, []);

  const metrics: MetricCard[] = [
    {
      title: 'Total de Estabelecimentos',
      value: '24',
      change: '+2 este mês',
      trend: 'up',
      icon: <Building2 className="w-6 h-6" />,
      color: 'text-blue-400'
    },
    {
      title: 'Profissionais Ativos',
      value: '1,247',
      change: '+45 este mês',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'text-green-400'
    },
    {
      title: 'Receita Total',
      value: 'R$ 12,5M',
      change: '+8.2% vs mês anterior',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-yellow-400'
    },
    {
      title: 'Taxa de Ocupação Média',
      value: '78%',
      change: '-2.1% vs mês anterior',
      trend: 'down',
      icon: <Activity className="w-6 h-6" />,
      color: 'text-purple-400'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'maintenance': return 'text-yellow-400';
      case 'inactive': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'maintenance': return 'Manutenção';
      case 'inactive': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'HOSPITAL': return 'Hospital';
      case 'UBS': return 'UBS';
      case 'UPA': return 'UPA';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <span>Dashboard Gestor Geral</span>
          </h1>
          <p className="text-white/70 mt-1 text-sm">
            Visão completa de todos os estabelecimentos da rede A1 Saúde
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-md"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          
          <GlassButton onClick={() => navigate('/dev/gestor-geral/reports')}>            
            Relatório Executivo
          </GlassButton>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className={metric.color}>
                  {metric.icon}
                </div>
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  ) : (
                    <Activity className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {metric.value}
                </h3>
                <p className="text-sm text-white/70 mb-2">
                  {metric.title}
                </p>
                <p className={`text-xs ${
                  metric.trend === 'up' ? 'text-green-400' : 
                  metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {metric.change}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Performance por Tipo</span>
              </h3>
              <GlassButton variant="ghost" size="sm" onClick={() => navigate('/dev/gestor-geral/reports')}>
                Ver Detalhes
              </GlassButton>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Hospitais</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-white/10 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-white text-sm">85%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">UPAs</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-white/10 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <span className="text-white text-sm">72%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">UBS</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-white/10 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <span className="text-white text-sm">68%</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Alertas e Notificações */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span>Alertas Importantes</span>
              </h3>
              <GlassButton variant="ghost" size="sm" onClick={() => navigate('/dev/gestor-geral/reports')}>
                Ver Todos
              </GlassButton>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">UPA Norte em Manutenção</p>
                  <p className="text-white/70 text-sm">Equipamento de raio-x necessita reparo urgente</p>
                  <p className="text-white/50 text-xs mt-1">Há 2 horas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Alta Ocupação - Hospital Central</p>
                  <p className="text-white/70 text-sm">Taxa de ocupação em 95% - considerar transferências</p>
                  <p className="text-white/50 text-xs mt-1">Há 30 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Meta Mensal Atingida</p>
                  <p className="text-white/70 text-sm">UBS Vila Nova superou meta de atendimentos</p>
                  <p className="text-white/50 text-xs mt-1">Ontem</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Lista de Estabelecimentos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>Estabelecimentos</span>
            </h3>
            <GlassButton onClick={() => navigate('/dev/gestor-geral/establishments')}>
              Novo Estabelecimento
            </GlassButton>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/70 font-medium py-3">Nome</th>
                  <th className="text-left text-white/70 font-medium py-3">Tipo</th>
                  <th className="text-left text-white/70 font-medium py-3">Status</th>
                  <th className="text-left text-white/70 font-medium py-3">Ocupação</th>
                  <th className="text-left text-white/70 font-medium py-3">Equipe</th>
                  <th className="text-left text-white/70 font-medium py-3">Receita</th>
                  <th className="text-left text-white/70 font-medium py-3">Localização</th>
                  <th className="text-left text-white/70 font-medium py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {establishments.map((establishment) => (
                  <tr key={establishment.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4">
                      <div className="text-white font-medium">{establishment.name}</div>
                    </td>
                    <td className="py-4">
                      <span className="text-white/70">{getTypeLabel(establishment.type)}</span>
                    </td>
                    <td className="py-4">
                      <span className={`${getStatusColor(establishment.status)} font-medium`}>
                        {getStatusLabel(establishment.status)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full" 
                            style={{ width: `${establishment.occupancy}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm">{establishment.occupancy}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-white/70">{establishment.staff}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-white/70">
                        R$ {(establishment.revenue / 1000).toFixed(0)}k
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-1 text-white/70">
                        <MapPin className="w-4 h-4" />
                        <span>{establishment.location}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <GlassButton variant="ghost" size="sm" onClick={() => navigate('/dev/gestor-geral/establishments')}>
                        Ver Detalhes
                      </GlassButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default GestorGeralDashboard;
