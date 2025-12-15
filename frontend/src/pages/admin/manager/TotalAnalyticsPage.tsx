import React from 'react';
import { BarChart3, PieChart, TrendingUp, Filter, Download } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';

const TotalAnalyticsPage: React.FC = () => {
  const [period, setPeriod] = React.useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <span>Análises Consolidadas</span>
          </h2>
          <p className="text-white/60 text-sm mt-1">Métricas e análises de toda a rede</p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton size="sm" variant="ghost"><Download className="w-4 h-4" />Exportar</GlassButton>
          <GlassButton size="sm" variant="ghost"><Filter className="w-4 h-4" />Filtros</GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <GlassCard key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm">Indicador #{i+1}</p>
                <p className="text-white/60 text-xs">{period === 'monthly' ? 'Mensal' : period === 'quarterly' ? 'Trimestral' : 'Anual'}</p>
              </div>
              <TrendingUp className="w-4 h-4 text-white/60" />
            </div>
            <div className="mt-3 h-16 bg-white/10 rounded" />
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default TotalAnalyticsPage;

