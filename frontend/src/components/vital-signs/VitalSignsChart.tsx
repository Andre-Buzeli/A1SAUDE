import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Thermometer, Heart, Activity, Wind } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { VitalSignsTrends } from '@/services/vitalSignsService';

interface VitalSignsChartProps {
  trends: VitalSignsTrends;
  height?: number;
}

export const VitalSignsChart: React.FC<VitalSignsChartProps> = ({
  trends,
  height = 300
}) => {
  const hasData = Object.values(trends.metrics).some(metric => metric.length > 0);

  if (!hasData) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary">Nenhum dado disponível para gerar gráficos</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <GlassCard className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-6 h-6 text-medical-blue" />
          <h3 className="text-lg font-semibold text-white">Tendências de Sinais Vitais</h3>
        </div>

        <div className="mb-4">
          <p className="text-sm text-text-secondary">
            Período: {new Date(trends.period.start).toLocaleDateString('pt-BR')} - {new Date(trends.period.end).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div style={{ height: `${height}px` }} className="flex items-center justify-center border border-white/10 rounded-lg bg-black/20">
          <p className="text-text-secondary">Gráfico temporariamente indisponível - Chart.js não configurado</p>
        </div>

        {/* Alerts Summary */}
        {trends.alerts.length > 0 && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
            <h4 className="text-sm font-medium text-red-400 mb-2">
              Alertas no período ({trends.alerts.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {trends.alerts.slice(0, 10).map((alert, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-red-400">
                    {new Date(alert.date).toLocaleString('pt-BR')}
                  </span>
                  <div className="flex items-center space-x-2">
                    {alert.alerts.map((alertMsg, alertIndex) => (
                      <span
                        key={alertIndex}
                        className={`px-2 py-1 rounded text-xs ${
                          alert.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {alertMsg}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {trends.alerts.length > 10 && (
                <p className="text-xs text-text-secondary">
                  ... e mais {trends.alerts.length - 10} alertas
                </p>
              )}
            </div>
          </div>
        )}

        {/* Metrics Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {trends.metrics.temperature.length > 0 && (
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <Thermometer className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-xs text-text-secondary">Temperatura</p>
              <p className="text-sm font-medium text-white">
                {trends.metrics.temperature.length} medições
              </p>
            </div>
          )}

          {trends.metrics.heartRate.length > 0 && (
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-xs text-text-secondary">Frequência Cardíaca</p>
              <p className="text-sm font-medium text-white">
                {trends.metrics.heartRate.length} medições
              </p>
            </div>
          )}

          {trends.metrics.bloodPressure.length > 0 && (
            <div className="text-center p-3 bg-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-text-secondary">Pressão Arterial</p>
              <p className="text-sm font-medium text-white">
                {trends.metrics.bloodPressure.length} medições
              </p>
            </div>
          )}

          {trends.metrics.oxygenSaturation.length > 0 && (
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <Wind className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-text-secondary">Saturação O2</p>
              <p className="text-sm font-medium text-white">
                {trends.metrics.oxygenSaturation.length} medições
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default VitalSignsChart;
