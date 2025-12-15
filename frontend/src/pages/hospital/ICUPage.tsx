import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  HeartPulse, Plus, User, Clock, Activity, Bed,
  AlertTriangle, RefreshCw, Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { icuService, ICUAdmission } from '@/services/icuService';

const ICUPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [admissions, setAdmissions] = useState<ICUAdmission[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [establishmentId]);

  const loadData = async () => {
    if (!establishmentId) return;
    try {
      const [dashRes, admissionsRes] = await Promise.all([
        icuService.getDashboard(establishmentId),
        icuService.getActiveAdmissions(establishmentId)
      ]);

      if (dashRes.success) setDashboard(dashRes.data);
      if (admissionsRes.success) setAdmissions(admissionsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVentilationBadge = (mode: string | undefined) => {
    if (!mode) return 'bg-gray-500/20 text-gray-300';
    if (mode === 'invasive') return 'bg-red-500/20 text-red-300';
    if (mode === 'niv' || mode === 'cpap' || mode === 'bipap') return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-green-500/20 text-green-300';
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <HeartPulse className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">UTI</h1>
              <p className="text-text-secondary">Unidade de Terapia Intensiva</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <GlassButton onClick={loadData} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </GlassButton>
            <GlassButton variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Nova Admissão
            </GlassButton>
          </div>
        </motion.div>

        {/* KPIs */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Leitos Ocupados</p>
              <p className="text-2xl font-bold text-white">{dashboard.activeCount}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Admissões Hoje</p>
              <p className="text-2xl font-bold text-blue-300">{dashboard.todayAdmissions}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Altas Hoje</p>
              <p className="text-2xl font-bold text-green-300">{dashboard.todayDischarges}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Admissões Mês</p>
              <p className="text-2xl font-bold text-purple-300">{dashboard.monthAdmissions}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Média Permanência</p>
              <p className="text-2xl font-bold text-white">{dashboard.avgLengthOfStay?.toFixed(1)} dias</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Mortalidade</p>
              <p className="text-2xl font-bold text-red-300">{dashboard.mortalityRate}%</p>
            </GlassCard>
          </div>
        )}

        {/* Ventilation Stats */}
        {dashboard?.byVentilation && (
          <GlassCard className="p-4 mb-6">
            <h3 className="text-white font-medium mb-3">Suporte Ventilatório</h3>
            <div className="flex flex-wrap gap-4">
              {dashboard.byVentilation.map((item: any) => (
                <div key={item.mode} className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${getVentilationBadge(item.mode)}`}>
                    {item.mode || 'Espontâneo'}: {item.count}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Patients Grid */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Pacientes Internados</h3>
          {admissions.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Bed className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum paciente internado na UTI</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admissions.map((admission) => (
                <motion.div
                  key={admission.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Bed className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Leito {admission.bedId}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getVentilationBadge(admission.ventilationMode)}`}>
                      {admission.ventilationMode || 'Espontâneo'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-white font-medium">{admission.patient?.name}</p>
                    <p className="text-sm text-text-secondary truncate">{admission.admissionDiagnosis}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {admission.apacheScore && (
                      <div className="text-center p-2 bg-white/5 rounded">
                        <p className="text-xs text-text-secondary">APACHE</p>
                        <p className="text-white font-bold">{admission.apacheScore}</p>
                      </div>
                    )}
                    {admission.sofaScore && (
                      <div className="text-center p-2 bg-white/5 rounded">
                        <p className="text-xs text-text-secondary">SOFA</p>
                        <p className="text-white font-bold">{admission.sofaScore}</p>
                      </div>
                    )}
                    {admission.sedationLevel && (
                      <div className="text-center p-2 bg-white/5 rounded">
                        <p className="text-xs text-text-secondary">RASS</p>
                        <p className="text-white font-bold">{admission.sedationLevel}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>
                      Admissão: {new Date(admission.admissionDate).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex space-x-1">
                      <GlassButton size="sm" variant="ghost">
                        <Activity className="w-4 h-4" />
                      </GlassButton>
                      <GlassButton size="sm" variant="ghost">
                        <Settings className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default ICUPage;

