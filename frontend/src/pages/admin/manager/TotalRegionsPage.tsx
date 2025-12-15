import React from 'react';
import { MapPin, Globe, Filter } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassTable from '@/components/ui/GlassTable';

interface RegionRow {
  id: string;
  name: string;
  establishments: number;
  patients: number;
  growth: number;
}

const regions: RegionRow[] = [
  { id: 'r1', name: 'Norte', establishments: 8, patients: 4200, growth: 4.2 },
  { id: 'r2', name: 'Sul', establishments: 12, patients: 7300, growth: 6.8 },
  { id: 'r3', name: 'Centro', establishments: 15, patients: 9100, growth: 5.1 },
];

const TotalRegionsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Globe className="w-5 h-5 text-green-400" />
            <span>Regiões</span>
          </h2>
          <p className="text-white/60 text-sm mt-1">Visão por regiões e comparativos</p>
        </div>
        <GlassButton size="sm" variant="ghost"><Filter className="w-4 h-4" />Filtros</GlassButton>
      </div>

      <GlassCard className="p-4">
        <div className="h-40 bg-white/10 rounded flex items-center justify-center text-white/60 text-sm">
          Mapa de calor por região (placeholder)
        </div>
      </GlassCard>

      <GlassTable<RegionRow>
        data={regions}
        columns={[
          { key: 'name', label: 'Região', sortable: true, render: (v: string) => (<div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-white/70" /><span className="text-white font-medium text-sm">{v}</span></div>) },
          { key: 'establishments', label: 'Estabelecimentos', sortable: true, render: (v: number) => <span className="text-white text-sm">{v}</span>, className: 'w-40' },
          { key: 'patients', label: 'Pacientes', sortable: true, render: (v: number) => <span className="text-white text-sm">{v}</span>, className: 'w-40' },
          { key: 'growth', label: 'Crescimento', sortable: true, render: (v: number) => <span className="text-white text-sm">{v}%</span>, className: 'w-32' },
        ]}
        searchable={false}
        className="p-0"
      />
    </div>
  );
};

export default TotalRegionsPage;

