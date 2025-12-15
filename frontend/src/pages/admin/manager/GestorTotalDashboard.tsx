import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  DollarSign,
  Activity,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Calendar,
  Download,
  Filter,
  Globe,
  PieChart
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import GlassButton from '../../../components/ui/GlassButton';

interface ConsolidatedMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  target?: string;
  progress?: number;
}

interface RegionData {
  id: string;
  name: string;
  establishments: number;
  revenue: number;
  patients: number;
  efficiency: number;
  growth: number;
}

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'above' | 'on-track' | 'below';
}

const GestorTotalDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('quarterly');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);

  // Dados simulados para demonstração
  useEffect(() => {
    setRegions([
      {
        id: '1',
        name: 'Região Norte',
        establishments: 8,
        revenue: 4200000,
        patients: 12500,
        efficiency: 87,
        growth: 12.5
      },
      {
        id: '2',
        name: 'Região Sul',
        establishments: 6,
        revenue: 3800000,
        patients: 9800,
        efficiency: 92,
        growth: 8.3
      },
      {
        id: '3',
        name: 'Região Centro',
        establishments: 10,
        revenue: 5600000,
        patients: 15200,
        efficiency: 85,
        growth: 15.2
      }
    ]);

    setKpis([
      {
        id: '1',
        name: 'Satisfação do Paciente',
        value: 4.7,
        target: 4.5,
        unit: '/5',
        status: 'above'
      },
      {
        id: '2',
        name: 'Tempo Médio de Atendimento',
        value: 22,
        target: 25,
        unit: 'min',
        status: 'above'
      },
      {
        id: '3',
        name: 'Taxa de Ocupação',
        value: 78,
        target: 80,
        unit: '%',
        status: 'on-track'
      },
      {
        id: '4',
        name: 'Margem Operacional',
        value: 12.5,
        target: 15,
        unit: '%',
        status: 'below'
      }
    ]);
  }, []);

  const consolidatedMetrics: ConsolidatedMetric[] = [
    {
      title: 'Receita Total da Rede',
      value: 'R$ 45.2M',
      change: '+18.5% vs trimestre anterior',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-green-400',
      target: 'R$ 50M',
      progress: 90.4
    },
    {
      title: 'Pacientes Atendidos',
      value: '127.5K',
      change: '+22.1% vs trimestre anterior',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-400',
      target: '140K',
      progress: 91.1
    },
    {
      title: 'Eficiência Operacional',
      value: '88.2%',
      change: '+3.2% vs trimestre anterior',
      trend: 'up',
      icon: <Target className="w-6 h-6" />,
      color: 'text-purple-400',
      target: '90%',
      progress: 98.0
    },
    {
      title: 'ROI da Rede',
      value: '24.7%',
      change: '+1.8% vs trimestre anterior',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-yellow-400',
      target: '25%',
      progress: 98.8
    }
  ];

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'above': return 'text-green-400';
      case 'on-track': return 'text-yellow-400';
      case 'below': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getKPIStatusIcon = (status: string) => {
    switch (status) {
      case 'above': return <CheckCircle className="w-4 h-4" />;
      case 'on-track': return <Activity className="w-4 h-4" />;
      case 'below': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-green-400" />
            <span>Dashboard Gestor Total</span>
          </h1>
          <p className="text-white/70 mt-1 text-sm">
            Visão consolidada e análise estratégica de toda a rede A1 Saúde
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-md"
          >
            <option value="all">Todas as Regiões</option>
            <option value="north">Região Norte</option>
            <option value="south">Região Sul</option>
            <option value="center">Região Centro</option>
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-md"
          >
            <option value="monthly">Mensal</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
          </select>
          
          <GlassButton>
            Relatório Executivo
          </GlassButton>
        </div>
      </div>

      {/* Métricas Consolidadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {consolidatedMetrics.map((metric, index) => (
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
                
                {metric.target && metric.progress && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-white/50 mb-1">
                      <span>Meta: {metric.target}</span>
                      <span>{metric.progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${metric.color.replace('text-', 'bg-')}`}
                        style={{ width: `${Math.min(metric.progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* KPIs e Performance por Região */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPIs Estratégicos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span>KPIs Estratégicos</span>
              </h3>
              <GlassButton variant="ghost" size="sm">
                Filtros
              </GlassButton>
            </div>
            
            <div className="space-y-4">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{kpi.name}</span>
                    <div className={`flex items-center space-x-1 ${getKPIStatusColor(kpi.status)}`}>
                      {getKPIStatusIcon(kpi.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-white">
                      {kpi.value}{kpi.unit}
                    </span>
                    <span className="text-white/50 text-sm">
                      Meta: {kpi.target}{kpi.unit}
                    </span>
                  </div>
                  
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        kpi.status === 'above' ? 'bg-green-400' :
                        kpi.status === 'on-track' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Performance por Região */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <span>Performance por Região</span>
              </h3>
              <GlassButton variant="ghost" size="sm">
                Ver Mapa
              </GlassButton>
            </div>
            
            <div className="space-y-4">
              {regions.map((region) => (
                <div key={region.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{region.name}</h4>
                    <span className={`text-sm font-medium ${
                      region.growth > 10 ? 'text-green-400' : 
                      region.growth > 5 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      +{region.growth}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/50">Estabelecimentos</p>
                      <p className="text-white font-medium">{region.establishments}</p>
                    </div>
                    <div>
                      <p className="text-white/50">Pacientes</p>
                      <p className="text-white font-medium">{region.patients.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/50">Receita</p>
                      <p className="text-white font-medium">
                        R$ {(region.revenue / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50">Eficiência</p>
                      <p className="text-white font-medium">{region.efficiency}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full" 
                        style={{ width: `${region.efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Análises Estratégicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tendências de Crescimento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span>Tendências</span>
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-white font-medium">Crescimento Acelerado</span>
                </div>
                <p className="text-white/70 text-sm">
                  Região Centro apresenta crescimento de 15.2% no trimestre
                </p>
              </div>
              
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium">Meta Superada</span>
                </div>
                <p className="text-white/70 text-sm">
                  Satisfação do paciente acima da meta em todas as regiões
                </p>
              </div>
              
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">Atenção Necessária</span>
                </div>
                <p className="text-white/70 text-sm">
                  Margem operacional abaixo da meta em 2 regiões
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Próximas Ações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span>Próximas Ações</span>
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium text-sm">Revisão Orçamentária</p>
                  <p className="text-white/50 text-xs">Amanhã, 14:00</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium text-sm">Reunião Diretoria</p>
                  <p className="text-white/50 text-xs">Sexta, 09:00</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium text-sm">Análise Trimestral</p>
                  <p className="text-white/50 text-xs">Próxima semana</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Ações Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Ações Rápidas</h3>
            
            <div className="space-y-3">
              <GlassButton className="w-full justify-start">
                <PieChart className="w-4 h-4 mr-3" />
                Análise Financeira
              </GlassButton>
              
              <GlassButton className="w-full justify-start">
                <Building2 className="w-4 h-4 mr-3" />
                Comparar Regiões
              </GlassButton>
              
              <GlassButton className="w-full justify-start">
                <Target className="w-4 h-4 mr-3" />
                Definir Metas
              </GlassButton>
              
              <GlassButton className="w-full justify-start">
                <Download className="w-4 h-4 mr-3" />
                Exportar Dados
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default GestorTotalDashboard;
