import React from 'react';
import { Users, Filter } from 'lucide-react';
import GlassTable from '@/components/ui/GlassTable';
import GlassCard from '@/components/ui/GlassCard';
import GlassInput from '@/components/ui/GlassInput';
import GlassButton from '@/components/ui/GlassButton';

interface PatientRow {
  id: string;
  name: string;
  age: number;
  status: 'Ativo' | 'Alta' | 'Aguardando';
}

const patients: PatientRow[] = [
  { id: 'p1', name: 'João Silva', age: 34, status: 'Ativo' },
  { id: 'p2', name: 'Maria Souza', age: 28, status: 'Aguardando' },
  { id: 'p3', name: 'Carlos Pereira', age: 41, status: 'Alta' },
];

const LocalPatientsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Pacientes</span>
          </h2>
          <p className="text-white/60 text-sm mt-1">Listagem e status dos pacientes do estabelecimento</p>
        </div>
        <GlassButton size="sm" variant="ghost"><Filter className="w-4 h-4" />Filtros</GlassButton>
      </div>

      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <GlassInput placeholder="Buscar paciente" />
          <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option>Todos</option>
            <option>Ativo</option>
            <option>Alta</option>
            <option>Aguardando</option>
          </select>
          <GlassButton size="sm" variant="primary">Aplicar</GlassButton>
        </div>
      </GlassCard>

      <GlassTable<PatientRow>
        data={patients}
        columns={[
          { key: 'name', label: 'Paciente', sortable: true, render: (v: string) => <span className="text-white text-sm font-medium">{v}</span> },
          { key: 'age', label: 'Idade', sortable: true, render: (v: number) => <span className="text-white text-sm">{v}</span>, className: 'w-24' },
          { key: 'status', label: 'Status', sortable: true, render: (v: PatientRow['status']) => <span className="text-white text-sm">{v}</span>, className: 'w-32' },
        ]}
        searchable={false}
        className="p-0"
      />
    </div>
  );
};

export default LocalPatientsPage;

