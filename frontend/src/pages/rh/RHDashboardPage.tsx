/**
 * Dashboard de Gestão de RH / Pessoas
 * Sistema A1 Saúde
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  DollarSign,
  Building2,
  AlertTriangle,
  TrendingUp,
  FileText,
  Briefcase,
  CalendarDays,
  UserMinus,
  ChevronRight
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { rhService, RHDashboardData } from '@/services/rhService';

export const RHDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<RHDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rhService.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erro ao carregar</h2>
          <p className="text-white/60 mb-4">{error}</p>
          <GlassButton onClick={loadDashboardData}>Tentar novamente</GlassButton>
        </GlassCard>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const alerts = dashboardData?.alerts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Gestão de Pessoas</h1>
            <p className="text-white/60 mt-1">Dashboard de Recursos Humanos</p>
          </div>
          <div className="flex items-center space-x-3">
            <GlassButton
              variant="secondary"
              onClick={() => navigate('/dev/rh/employees/new')}
              className="flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Funcionário</span>
            </GlassButton>
            <GlassButton onClick={loadDashboardData}>
              Atualizar
            </GlassButton>
          </div>
        </motion.div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Funcionários Ativos</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats?.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">CLT</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats?.byCLT || 0}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Briefcase className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">PJ</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats?.byPJ || 0}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Folha Mensal</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact'
                    }).format(stats?.totalPayroll || 0)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <DollarSign className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Salário Médio</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(stats?.averageSalary || 0)}
                  </p>
                </div>
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Alertas e Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alertas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <GlassCard className="p-6 h-full">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                Alertas
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center space-x-3">
                    <CalendarDays className="w-5 h-5 text-yellow-400" />
                    <span className="text-white/80">Férias pendentes</span>
                  </div>
                  <span className="text-yellow-400 font-bold">{alerts?.pendingVacations || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center space-x-3">
                    <UserMinus className="w-5 h-5 text-orange-400" />
                    <span className="text-white/80">Afastados</span>
                  </div>
                  <span className="text-orange-400 font-bold">{alerts?.activeLeaves || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-red-400" />
                    <span className="text-white/80">Ausentes hoje</span>
                  </div>
                  <span className="text-red-400 font-bold">{alerts?.todayAbsent || 0}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Menu de Navegação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6 h-full">
              <h3 className="text-lg font-semibold text-white mb-4">Módulos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => navigate('/dev/rh/employees')}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left group"
                >
                  <Users className="w-8 h-8 text-blue-400 mb-2" />
                  <p className="text-white font-medium">Funcionários</p>
                  <p className="text-white/50 text-sm">Cadastro e gestão</p>
                  <ChevronRight className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => navigate('/dev/rh/schedules')}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left group"
                >
                  <Calendar className="w-8 h-8 text-green-400 mb-2" />
                  <p className="text-white font-medium">Escalas</p>
                  <p className="text-white/50 text-sm">Escala de trabalho</p>
                </button>

                <button
                  onClick={() => navigate('/dev/rh/time-records')}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left group"
                >
                  <Clock className="w-8 h-8 text-purple-400 mb-2" />
                  <p className="text-white font-medium">Ponto</p>
                  <p className="text-white/50 text-sm">Registro de ponto</p>
                </button>

                <button
                  onClick={() => navigate('/dev/rh/vacations')}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left group"
                >
                  <CalendarDays className="w-8 h-8 text-yellow-400 mb-2" />
                  <p className="text-white font-medium">Férias</p>
                  <p className="text-white/50 text-sm">Gestão de férias</p>
                </button>

                <button
                  onClick={() => navigate('/dev/rh/leaves')}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left group"
                >
                  <UserMinus className="w-8 h-8 text-orange-400 mb-2" />
                  <p className="text-white font-medium">Afastamentos</p>
                  <p className="text-white/50 text-sm">Licenças e atestados</p>
                </button>

                <button
                  onClick={() => navigate('/dev/rh/payroll')}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left group"
                >
                  <DollarSign className="w-8 h-8 text-cyan-400 mb-2" />
                  <p className="text-white font-medium">Folha</p>
                  <p className="text-white/50 text-sm">Folha de pagamento</p>
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Contratações Recentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-green-400" />
                Contratações Recentes
              </h3>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dev/rh/employees')}
              >
                Ver todos
              </GlassButton>
            </div>
            
            {dashboardData?.recentHires && dashboardData.recentHires.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentHires.map((hire) => (
                  <div
                    key={hire.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dev/rh/employees/${hire.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                        {hire.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{hire.name}</p>
                        <p className="text-white/50 text-sm">{hire.position} - {hire.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 text-sm">
                        {new Date(hire.admissionDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/50">
                <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma contratação recente</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Distribuição por Setor e Cargo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-400" />
                Funcionários por Setor
              </h3>
              <div className="space-y-3">
                {stats?.byDepartment && Object.entries(stats.byDepartment).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-white/70">{dept}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${(count / (stats?.total || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-purple-400" />
                Funcionários por Cargo
              </h3>
              <div className="space-y-3">
                {stats?.byPosition && Object.entries(stats.byPosition).slice(0, 6).map(([position, count]) => (
                  <div key={position} className="flex items-center justify-between">
                    <span className="text-white/70 truncate max-w-[200px]">{position}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${(count / (stats?.total || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Estatísticas de Atendimento por Profissional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
              Estatísticas de Atendimento por Profissional
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Médicos */}
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 font-medium">Médicos</span>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Atendimentos/dia</span>
                    <span className="text-white font-medium">12.3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Tempo médio</span>
                    <span className="text-white font-medium">28min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Taxa de retorno</span>
                    <span className="text-emerald-400 font-medium">87%</span>
                  </div>
                </div>
              </div>

              {/* Enfermeiros */}
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 font-medium">Enfermeiros</span>
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Procedimentos/dia</span>
                    <span className="text-white font-medium">18.5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Tempo médio</span>
                    <span className="text-white font-medium">15min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Satisfação</span>
                    <span className="text-emerald-400 font-medium">92%</span>
                  </div>
                </div>
              </div>

              {/* Fisioterapeutas */}
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 font-medium">Fisioterapeutas</span>
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Sessões/dia</span>
                    <span className="text-white font-medium">8.2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Duração média</span>
                    <span className="text-white font-medium">45min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Melhora média</span>
                    <span className="text-emerald-400 font-medium">78%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Top Profissionais */}
            <div className="mt-6">
              <h4 className="text-md font-semibold text-white mb-3">Top Profissionais do Mês</h4>
              <div className="space-y-2">
                {[
                  { name: 'Dra. Ana Paula', specialty: 'Medicina', attendances: 145, rating: 4.8 },
                  { name: 'Dr. Carlos Santos', specialty: 'Medicina', attendances: 138, rating: 4.7 },
                  { name: 'Enf. Roberta Lima', specialty: 'Enfermagem', attendances: 156, rating: 4.9 },
                  { name: 'Fisiot. João Silva', specialty: 'Fisioterapia', attendances: 89, rating: 4.6 },
                  { name: 'Dra. Maria Clara', specialty: 'Medicina', attendances: 132, rating: 4.8 }
                ].map((professional, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">{professional.name}</div>
                        <div className="text-white/60 text-sm">{professional.specialty}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="text-white font-medium">{professional.attendances}</div>
                        <div className="text-white/60">atendimentos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-400 font-medium">★ {professional.rating}</div>
                        <div className="text-white/60">avaliação</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default RHDashboardPage;

