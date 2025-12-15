import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, Calendar, Download, Filter } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';

const LocalReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = React.useState('2025-10');
  const [search, setSearch] = React.useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Relatórios Locais</h1>
        </div>
        <div className="flex items-center space-x-2">
          <GlassButton variant="ghost">
            <Calendar className="w-4 h-4" />
            {dateRange}
          </GlassButton>
          <GlassButton>
            <Download className="w-4 h-4" />
            Exportar PDF
          </GlassButton>
        </div>
      </div>

      {/* Filtros */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassInput
            placeholder="Buscar relatório..."
            value={search}
            onChange={setSearch}
            icon={<Filter className="w-5 h-5" />}
          />
          <select
            defaultValue="mensal"
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
          >
            <option value="diario">Diário</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
          </select>
          <select
            defaultValue="operacional"
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
          >
            <option value="operacional">Operacional</option>
            <option value="assistencial">Assistencial</option>
            <option value="financeiro">Financeiro</option>
          </select>
        </div>
      </GlassCard>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <PieChart className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Atendimentos por setor</h3>
          </div>
          <div className="h-40 flex items-center justify-center text-white/60">
            Gráfico placeholder
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Tempo médio de espera</h3>
          </div>
          <div className="h-40 flex items-center justify-center text-white/60">
            Gráfico placeholder
          </div>
        </GlassCard>
      </div>

      {/* Ações */}
      <div className="flex items-center space-x-2">
        <GlassButton variant="ghost">
          <Download className="w-4 h-4" />
          Exportar CSV
        </GlassButton>
        <GlassButton variant="ghost">
          <Download className="w-4 h-4" />
          Exportar XLSX
        </GlassButton>
      </div>
    </div>
  );
};

export default LocalReportsPage;

