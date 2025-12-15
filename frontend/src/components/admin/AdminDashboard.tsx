import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  UserCheck, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Activity,
  Clock,
  Heart,
  Bed,
  UserCog
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useAuth } from '../../contexts/AuthContext';

interface AdminMetrics {
  totalEstablishments: number;
  totalUsers: number;
  totalPatients: number;
  totalAttendances: number;
  attendancesToday: number;
  activeUsers: number;
  establishmentsByType: {
    upa: number;
    ubs: number;
    hospital: number;
  };
  usersByProfile: Record<string, number>;
  attendancesByStatus: {
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
  monthlyAttendances: {
    month: string;
    count: number;
  }[];
  criticalAlerts: {
    id: string;
    type: string;
    message: string;
    severity: string;
    establishmentName: string;
    createdAt: string;
  }[];
  performanceMetrics: {
    averageWaitTime: number;
    patientSatisfaction: number;
    bedOccupancyRate: number;
    staffUtilization: number;
  };
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar dados do dashboard');
      }

      const data = await response.json();
      setMetrics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Erro ao carregar dashboard</h2>
            <p className="text-white/70 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 text-blue-100 rounded-lg hover:bg-blue-500/30 transition-all"
            >
              Tentar novamente
            </button>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 border-red-400/30';
      case 'high': return 'text-orange-400 border-orange-400/30';
      case 'medium': return 'text-yellow-400 border-yellow-400/30';
      default: return 'text-blue-400 border-blue-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Dashboard Executivo
            </h1>
            <p className="text-white/70">
              {user?.profile === 'gestor_geral' ? 'Visão geral de todos os estabelecimentos' : 
               `Estabelecimento: ${user?.establishmentName}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Última atualização</p>
            <p className="text-white font-medium">{new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Estabelecimentos</p>
                <p className="text-2xl font-bold text-white">{metrics.totalEstablishments}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Usuários Ativos</p>
                <p className="text-2xl font-bold text-white">{metrics.activeUsers}</p>
                <p className="text-xs text-white/50">de {metrics.totalUsers} total</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Pacientes</p>
                <p className="text-2xl font-bold text-white">{metrics.totalPatients.toLocaleString()}</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Atendimentos Hoje</p>
                <p className="text-2xl font-bold text-white">{metrics.attendancesToday}</p>
                <p className="text-xs text-white/50">de {metrics.totalAttendances} total</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-400" />
            </div>
          </GlassCard>
        </div>

        {/* Métricas de Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Tempo Médio de Espera</p>
                <p className="text-2xl font-bold text-white">{metrics.performanceMetrics.averageWaitTime}min</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Satisfação do Paciente</p>
                <p className="text-2xl font-bold text-white">{metrics.performanceMetrics.patientSatisfaction}%</p>
              </div>
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Ocupação de Leitos</p>
                <p className="text-2xl font-bold text-white">{metrics.performanceMetrics.bedOccupancyRate}%</p>
              </div>
              <Bed className="w-8 h-8 text-indigo-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Utilização de Pessoal</p>
                <p className="text-2xl font-bold text-white">{metrics.performanceMetrics.staffUtilization}%</p>
              </div>
              <UserCog className="w-8 h-8 text-cyan-400" />
            </div>
          </GlassCard>
        </div>    
    {/* Distribuição por Estabelecimento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Estabelecimentos por Tipo
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">UPA</span>
                <span className="text-white font-medium">{metrics.establishmentsByType.upa}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">UBS</span>
                <span className="text-white font-medium">{metrics.establishmentsByType.ubs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Hospital</span>
                <span className="text-white font-medium">{metrics.establishmentsByType.hospital}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Status dos Atendimentos
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Agendados</span>
                <span className="text-blue-400 font-medium">{metrics.attendancesByStatus.scheduled}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Em Andamento</span>
                <span className="text-yellow-400 font-medium">{metrics.attendancesByStatus.in_progress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Concluídos</span>
                <span className="text-green-400 font-medium">{metrics.attendancesByStatus.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Cancelados</span>
                <span className="text-red-400 font-medium">{metrics.attendancesByStatus.cancelled}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Alertas Críticos */}
        {metrics.criticalAlerts.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Alertas Críticos
            </h3>
            <div className="space-y-3">
              {metrics.criticalAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} bg-white/5`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium">{alert.message}</p>
                      <p className="text-white/60 text-sm mt-1">{alert.establishmentName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Usuários por Perfil */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Distribuição de Usuários por Perfil
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(metrics.usersByProfile)
              .filter(([_, count]) => count > 0)
              .map(([profile, count]) => (
                <div key={profile} className="text-center">
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-white/70 text-sm capitalize">
                    {profile.replace('_', ' ')}
                  </p>
                </div>
              ))}
          </div>
        </GlassCard>

        {/* Atendimentos Mensais */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Atendimentos dos Últimos 6 Meses
          </h3>
          <div className="space-y-3">
            {metrics.monthlyAttendances.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-white/70">{month.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-white/10 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full"
                      style={{
                        width: `${Math.min((month.count / Math.max(...metrics.monthlyAttendances.map(m => m.count))) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-white font-medium w-16 text-right">{month.count}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};