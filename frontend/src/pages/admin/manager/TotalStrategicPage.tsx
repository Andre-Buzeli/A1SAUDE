import React from 'react';
import { Target, Lightbulb, CalendarCheck } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';

const TotalStrategicPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-green-400" />
            <span>Planejamento Estratégico</span>
          </h2>
          <p className="text-white/60 text-sm mt-1">OKRs, iniciativas e acompanhamento</p>
        </div>
        <GlassButton size="sm" variant="primary">Nova Iniciativa</GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Reduzir tempo de espera', status: 'Em curso', icon: Lightbulb },
          { title: 'Expandir rede Norte', status: 'Planejado', icon: CalendarCheck },
          { title: 'Digitalizar prontuários', status: 'Em curso', icon: Lightbulb },
        ].map((item, i) => (
          <GlassCard key={i} className="p-4">
            <div className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-white/70" />
              <p className="text-white font-medium text-sm">{item.title}</p>
            </div>
            <p className="mt-2 text-white/60 text-xs">Status: {item.status}</p>
            <div className="mt-3 h-14 bg-white/10 rounded" />
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default TotalStrategicPage;

