import React from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassTable from '@/components/ui/GlassTable';

interface ScheduleRow {
  id: string;
  date: string;
  time: string;
  doctor: string;
  patient: string;
}

const schedules: ScheduleRow[] = [
  { id: 's1', date: '2025-10-20', time: '09:00', doctor: 'Dr. Ana', patient: 'João' },
  { id: 's2', date: '2025-10-20', time: '10:30', doctor: 'Dr. Paulo', patient: 'Maria' },
  { id: 's3', date: '2025-10-20', time: '11:15', doctor: 'Dr. Ana', patient: 'Carlos' },
];

const LocalSchedulePage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <CalendarDays className="w-5 h-5 text-blue-400" />
          <span>Agenda</span>
        </h2>
        <p className="text-white/60 text-sm mt-1">Consultas e procedimentos agendados</p>
      </div>

      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="date" className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
          <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option>Todos médicos</option>
            <option>Dr. Ana</option>
            <option>Dr. Paulo</option>
          </select>
          <div className="flex items-center gap-2 text-white/70 text-sm"><Clock className="w-4 h-4" /> Hoje</div>
        </div>
      </GlassCard>

      <GlassTable<ScheduleRow>
        data={schedules}
        columns={[
          { key: 'date', label: 'Data', sortable: true, render: (v: string) => <span className="text-white text-sm">{v}</span>, className: 'w-36' },
          { key: 'time', label: 'Hora', sortable: true, render: (v: string) => <span className="text-white text-sm">{v}</span>, className: 'w-24' },
          { key: 'doctor', label: 'Médico', sortable: true, render: (v: string) => <span className="text-white text-sm">{v}</span> },
          { key: 'patient', label: 'Paciente', sortable: true, render: (v: string) => <span className="text-white text-sm">{v}</span> },
        ]}
        searchable={false}
        className="p-0"
      />
    </div>
  );
};

export default LocalSchedulePage;

