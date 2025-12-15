import React from 'react';
import { FileBarChart, Calendar, Download, Filter } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';

const GeralReportsPage: React.FC = () => {
  const [type, setType] = React.useState<'executivo' | 'financeiro' | 'operacional'>('executivo');
  const [period, setPeriod] = React.useState<'7d' | '30d' | '90d' | '1y'>('30d');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <FileBarChart className="w-5 h-5 text-yellow-400" />
            <span>Relatórios Executivos</span>
          </h2>
          <p className="text-white/60 text-sm mt-1">Relatórios consolidados e KPIs por período</p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton size="sm" variant="ghost"><Download className="w-4 h-4" />Exportar</GlassButton>
          <GlassButton size="sm" variant="ghost"><Filter className="w-4 h-4" />Filtros</GlassButton>
        </div>
      </div>

      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select value={type} onChange={e => setType(e.target.value as any)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option value="executivo">Executivo</option>
            <option value="financeiro">Financeiro</option>
            <option value="operacional">Operacional</option>
          </select>
          <select value={period} onChange={e => setPeriod(e.target.value as any)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
            <option value="1y">1 ano</option>
          </select>
          <GlassInput placeholder="Buscar relatório" />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <GlassCard key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm">{type === 'executivo' ? 'Executivo' : type === 'financeiro' ? 'Financeiro' : 'Operacional'} #{i+1}</p>
                <p className="text-white/60 text-xs">{period === '7d' ? 'Últimos 7 dias' : period === '30d' ? 'Últimos 30 dias' : period === '90d' ? 'Últimos 90 dias' : 'Último ano'}</p>
              </div>
              <Calendar className="w-4 h-4 text-white/60" />
            </div>
            <div className="mt-3 h-16 bg-white/10 rounded" />
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default GeralReportsPage;

