import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Plus,
  AlertTriangle,
  TrendingUp,
  Users,
  Thermometer,
  Heart,
  Wind,
  Eye,
  Clock,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { vitalSignsService, VitalSigns, VitalSignsStats } from '@/services/vitalSignsService';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const VitalSignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDevMode } = useDevMode();
  const [stats, setStats] = useState<VitalSignsStats | null>(null);
  const [alerts, setAlerts] = useState<VitalSigns[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAlerts, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStats(), loadAlerts()]);
    } catch (error) {
      console.error('Erro ao carregar dados de sinais vitais:', error);
      toast.error('Erro ao carregar dados de sinais vitais');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const statsData = await vitalSignsService.getVitalSignsStats(today.toISOString());
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const alertsData = await vitalSignsService.getVitalSignsWithAlerts(10);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  const handleNewVitalSigns = () => {
    navigate('/dev/vital-signs/new');
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/dev/patients/${patientId}`);
  };

  const handleViewTrends = (patientId: string) => {
    navigate(`/dev/vital-signs/trends/${patientId}`);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      alert.patient?.name.toLowerCase().includes(query) ||
      alert.patient?.cpf.includes(query) ||
      (alert.alerts && alert.alerts.some(a => a.toLowerCase().includes(query)))
    );
  });

  const criticalAlerts = filteredAlerts.filter(vs => vitalSignsService.hasCriticalAlerts(vs));
  const moderateAlerts = filteredAlerts.filter(vs => !vitalSignsService.hasCriticalAlerts(vs));

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {isDevMode && <DevModeBanner />}
        <div className="container mx-auto px-4 py-8 pt-20">
          <GlassCard className="p-12">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {isDevMode && <DevModeBanner />}

      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Activity className="w-8 h-8 mr-3 text-medical-blue" />
                Sinais Vitais
              </h1>
              <p className="text-text-secondary">
                Monitoramento e análise de sinais vitais dos pacientes
              </p>
            </div>

            <GlassButton
              variant="primary"
              onClick={handleNewVitalSigns}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Sinais Vitais</span>
            </GlassButton>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6"
          >
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-medical-blue" />
                <div>
                  <p className="text-sm text-text-secondary">Total Hoje</p>
                  <p className="text-2xl font-bold text-white">{stats.measurementsToday}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-medical-green" />
                <div>
                  <p className="text-sm text-text-secondary">Pacientes</p>
                  <p className="text-2xl font-bold text-white">{stats.patientsWithAlerts}</p>
                  <p className="text-xs text-text-secondary">com alertas</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-sm text-text-secondary">Críticos</p>
                  <p className="text-2xl font-bold text-white">{stats.criticalAlerts}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <Thermometer className="w-6 h-6 text-medical-purple" />
                <div>
                  <p className="text-sm text-text-secondary">Temp. Média</p>
                  <p className="text-2xl font-bold text-white">{stats.averageValues.temperature.toFixed(1)}°C</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-sm text-text-secondary">FC Média</p>
                  <p className="text-2xl font-bold text-white">{Math.round(stats.averageValues.heartRate)} bpm</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <Wind className="w-6 h-6 text-medical-green" />
                <div>
                  <p className="text-sm text-text-secondary">SpO2 Média</p>
                  <p className="text-2xl font-bold text-white">{Math.round(stats.averageValues.oxygenSaturation)}%</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <GlassCard className="p-4">
            <GlassInput
              placeholder="Buscar por paciente, CPF ou tipo de alerta..."
              value={searchQuery}
              onChange={setSearchQuery}
              icon={<Filter className="w-4 h-4" />}
            />
          </GlassCard>
        </motion.div>

        {/* Alerts Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Alerts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-red-400" />
                Alertas Críticos
                {criticalAlerts.length > 0 && (
                  <span className="ml-2 bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm">
                    {criticalAlerts.length}
                  </span>
                )}
              </h2>

              {criticalAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
                  <p className="text-text-secondary">Nenhum alerta crítico encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {criticalAlerts.slice(0, 5).map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-red-500/10 border border-red-400/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">{alert.patient?.name}</p>
                          <p className="text-sm text-text-secondary">CPF: {alert.patient?.cpf}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-secondary">
                            {new Date(alert.measuredAt).toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {alert.alerts?.map((alertMsg, alertIndex) => (
                          <div key={alertIndex} className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{alertMsg}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-2 mt-3">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPatient(alert.patientId)}
                        >
                          Ver Paciente
                        </GlassButton>
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTrends(alert.patientId)}
                        >
                          Ver Tendências
                        </GlassButton>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Moderate Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-orange-400" />
                Alertas Moderados
                {moderateAlerts.length > 0 && (
                  <span className="ml-2 bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-sm">
                    {moderateAlerts.length}
                  </span>
                )}
              </h2>

              {moderateAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
                  <p className="text-text-secondary">Nenhum alerta moderado encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {moderateAlerts.slice(0, 5).map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-orange-500/10 border border-orange-400/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">{alert.patient?.name}</p>
                          <p className="text-sm text-text-secondary">CPF: {alert.patient?.cpf}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-secondary">
                            {new Date(alert.measuredAt).toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {alert.alerts?.map((alertMsg, alertIndex) => (
                          <div key={alertIndex} className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                            <p className="text-orange-400 text-sm">{alertMsg}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-2 mt-3">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPatient(alert.patientId)}
                        >
                          Ver Paciente
                        </GlassButton>
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTrends(alert.patientId)}
                        >
                          Ver Tendências
                        </GlassButton>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassButton
                variant="secondary"
                onClick={() => navigate('/dev/vital-signs/history')}
                className="flex items-center justify-center space-x-2 p-4"
              >
                <Clock className="w-5 h-5" />
                <span>Histórico Completo</span>
              </GlassButton>

              <GlassButton
                variant="secondary"
                onClick={() => navigate('/dev/vital-signs/analytics')}
                className="flex items-center justify-center space-x-2 p-4"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Análises e Relatórios</span>
              </GlassButton>

              <GlassButton
                variant="secondary"
                onClick={() => navigate('/dev/vital-signs/templates')}
                className="flex items-center justify-center space-x-2 p-4"
              >
                <Eye className="w-5 h-5" />
                <span>Modelos de Avaliação</span>
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default VitalSignsPage;


