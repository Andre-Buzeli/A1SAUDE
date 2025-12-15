import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassSelect from '@/components/ui/GlassSelect';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import VitalSignsChart from '@/components/vital-signs/VitalSignsChart';
import { vitalSignsService, VitalSignsTrends } from '@/services/vitalSignsService';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const VitalSignsTrendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { isDevMode } = useDevMode();

  const [trends, setTrends] = useState<VitalSignsTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (patientId) {
      loadTrends();
    }
  }, [patientId, days]);

  const loadTrends = async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      const trendsData = await vitalSignsService.getVitalSignsTrends(patientId, days);
      setTrends(trendsData);
    } catch (error) {
      console.error('Erro ao carregar tendências:', error);
      toast.error('Erro ao carregar tendências de sinais vitais');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dev/vital-signs');
  };

  const handleViewPatient = () => {
    navigate(`/dev/patients/${patientId}`);
  };

  const handleExport = () => {
    if (!trends) return;

    try {
      // Create CSV content
      const csvContent = generateCSV(trends);

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sinais-vitais-${patientId}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  const generateCSV = (trends: VitalSignsTrends): string => {
    const headers = ['Data', 'Temperatura (°C)', 'FC (bpm)', 'PA Sistólica', 'PA Diastólica', 'FR (rpm)', 'SpO2 (%)', 'Peso (kg)', 'Alertas'];
    const rows = [headers.join(',')];

    // Get all unique dates
    const allDates = new Set<string>();
    Object.values(trends.metrics).forEach(metric => {
      metric.forEach(point => {
        allDates.add(new Date(point.date).toISOString().split('T')[0]);
      });
    });

    // Sort dates
    const sortedDates = Array.from(allDates).sort();

    sortedDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const temp = trends.metrics.temperature.find(t => new Date(t.date).toDateString() === date.toDateString())?.value || '';
      const hr = trends.metrics.heartRate.find(h => new Date(h.date).toDateString() === date.toDateString())?.value || '';
      const bp = trends.metrics.bloodPressure.find(b => new Date(b.date).toDateString() === date.toDateString());
      const resp = trends.metrics.respiratoryRate.find(r => new Date(r.date).toDateString() === date.toDateString())?.value || '';
      const o2 = trends.metrics.oxygenSaturation.find(o => new Date(o.date).toDateString() === date.toDateString())?.value || '';
      const weight = trends.metrics.weight.find(w => new Date(w.date).toDateString() === date.toDateString())?.value || '';

      const dayAlerts = trends.alerts
        .filter(a => new Date(a.date).toDateString() === date.toDateString())
        .flatMap(a => a.alerts)
        .join('; ');

      const row = [
        date.toLocaleDateString('pt-BR'),
        temp,
        hr,
        bp?.systolic || '',
        bp?.diastolic || '',
        resp,
        o2,
        weight,
        dayAlerts
      ];

      rows.push(row.map(cell => `"${cell}"`).join(','));
    });

    return rows.join('\n');
  };

  const periodOptions = [
    { value: '7', label: 'Últimos 7 dias' },
    { value: '30', label: 'Últimos 30 dias' },
    { value: '90', label: 'Últimos 90 dias' },
    { value: '180', label: 'Últimos 6 meses' },
    { value: '365', label: 'Último ano' }
  ];

  if (loading && !trends) {
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

  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {isDevMode && <DevModeBanner />}
        <div className="container mx-auto px-4 py-8 pt-20">
          <GlassCard className="p-12">
            <div className="text-center">
              <p className="text-red-400">ID do paciente não fornecido</p>
              <GlassButton variant="primary" onClick={handleBack} className="mt-4">
                Voltar
              </GlassButton>
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
            <div className="flex items-center space-x-4">
              <GlassButton
                variant="ghost"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </GlassButton>

              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Tendências de Sinais Vitais
                </h1>
                <p className="text-text-secondary">
                  Análise histórica dos sinais vitais do paciente
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <GlassButton
                variant="secondary"
                onClick={handleViewPatient}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Ver Paciente</span>
              </GlassButton>

              <GlassButton
                variant="secondary"
                onClick={handleExport}
                className="flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Exportar</span>
              </GlassButton>
            </div>
          </div>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard className="p-4">
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Período:</span>
              <GlassSelect
                value={days.toString()}
                onChange={(value) => setDays(parseInt(value))}
                options={periodOptions}
                className="w-48"
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Chart */}
        {trends && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <VitalSignsChart trends={trends} height={500} />
          </motion.div>
        )}

        {/* Summary Stats */}
        {trends && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Resumo Estatístico</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Measurements Count */}
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-2">Total de Medições</h4>
                  <div className="space-y-2">
                    {Object.entries(trends.metrics).map(([metric, data]) => (
                      data.length > 0 && (
                        <div key={metric} className="flex justify-between text-sm">
                          <span className="text-white capitalize">
                            {metric === 'temperature' && 'Temperatura'}
                            {metric === 'heartRate' && 'Frequência Cardíaca'}
                            {metric === 'bloodPressure' && 'Pressão Arterial'}
                            {metric === 'respiratoryRate' && 'Frequência Respiratória'}
                            {metric === 'oxygenSaturation' && 'Saturação O2'}
                            {metric === 'weight' && 'Peso'}
                          </span>
                          <span className="text-medical-blue font-medium">{data.length}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Alerts Summary */}
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-2">Alertas no Período</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Total de Alertas</span>
                      <span className="text-red-400 font-medium">{trends.alerts.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Críticos</span>
                      <span className="text-red-600 font-medium">
                        {trends.alerts.filter(a => a.severity === 'critical').length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Moderados</span>
                      <span className="text-orange-400 font-medium">
                        {trends.alerts.filter(a => a.severity === 'severe').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Period Info */}
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-2">Informações do Período</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Início:</span>
                      <span className="text-white">
                        {new Date(trends.period.start).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Fim:</span>
                      <span className="text-white">
                        {new Date(trends.period.end).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Dias:</span>
                      <span className="text-white">
                        {Math.ceil((new Date(trends.period.end).getTime() - new Date(trends.period.start).getTime()) / (1000 * 60 * 60 * 24))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VitalSignsTrendsPage;


