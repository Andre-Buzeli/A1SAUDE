import React from 'react';
import { Building2, MapPin, Users, Activity, Search, Plus, Download } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import GlassTable from '@/components/ui/GlassTable';

interface Establishment {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'UBS' | 'UPA';
  status: 'active' | 'maintenance' | 'inactive';
  occupancy: number;
  staff: number;
  location: string;
}

const mockEstablishments: Establishment[] = [
  { id: '1', name: 'Hospital Central', type: 'HOSPITAL', status: 'active', occupancy: 82, staff: 240, location: 'Centro' },
  { id: '2', name: 'UBS Vila Nova', type: 'UBS', status: 'maintenance', occupancy: 45, staff: 32, location: 'Vila Nova' },
  { id: '3', name: 'UPA Jardim', type: 'UPA', status: 'active', occupancy: 67, staff: 78, location: 'Jardim' },
  { id: '4', name: 'UBS Horizonte', type: 'UBS', status: 'inactive', occupancy: 0, staff: 0, location: 'Horizonte' },
];

const statusBadge = (status: Establishment['status']) => {
  const map = {
    active: 'text-green-400 bg-green-400/10 border-green-400/20',
    maintenance: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    inactive: 'text-red-400 bg-red-400/10 border-red-400/20'
  } as const;
  return <span className={`px-2 py-0.5 rounded border text-xs ${map[status]}`}>{status.toUpperCase()}</span>;
};

const GeralEstablishmentsPage: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState<'ALL' | Establishment['type']>('ALL');
  const [status, setStatus] = React.useState<'ALL' | Establishment['status']>('ALL');

  const data = mockEstablishments
    .filter(e => (type === 'ALL' ? true : e.type === type))
    .filter(e => (status === 'ALL' ? true : e.status === status))
    .filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-yellow-400" />
            <span>Estabelecimentos</span>
          </h2>
          <p className="text-white/60 text-sm mt-1">Gestão de todos os estabelecimentos da rede</p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton size="sm" variant="ghost"><Download className="w-4 h-4" />Exportar</GlassButton>
          <GlassButton size="sm"><Plus className="w-4 h-4" />Novo</GlassButton>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <GlassInput placeholder="Buscar estabelecimento" value={search} onChange={setSearch} icon={<Search className="w-5 h-5" />} />
          <select value={type} onChange={e => setType(e.target.value as any)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option value="ALL">Todos os Tipos</option>
            <option value="HOSPITAL">Hospital</option>
            <option value="UBS">UBS</option>
            <option value="UPA">UPA</option>
          </select>
          <select value={status} onChange={e => setStatus(e.target.value as any)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
            <option value="ALL">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="maintenance">Manutenção</option>
            <option value="inactive">Inativo</option>
          </select>
          <GlassButton size="sm" variant="ghost"><MapPin className="w-4 h-4" />Mapa</GlassButton>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassTable<Establishment>
        data={data}
        columns={[
          { key: 'name', label: 'Nome', sortable: true, render: (v: string) => (<div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-white/70" /><span className="text-white font-medium text-sm">{v}</span></div>) },
          { key: 'type', label: 'Tipo', sortable: true, render: (v: Establishment['type']) => <span className="text-white/80 text-sm">{v}</span>, className: 'w-32' },
          { key: 'status', label: 'Status', sortable: true, render: (v: Establishment['status']) => statusBadge(v), className: 'w-32' },
          { key: 'occupancy', label: 'Ocupação', sortable: true, render: (v: number) => <span className="text-white text-sm">{v}%</span>, className: 'w-28' },
          { key: 'staff', label: 'Equipe', sortable: true, render: (v: number) => <span className="text-white text-sm">{v}</span>, className: 'w-24' },
          { key: 'location', label: 'Localização', sortable: true, render: (v: string) => <span className="text-white/80 text-sm">{v}</span> }
        ]}
        searchable={false}
        className="p-0"
      />
    </div>
  );
};

export default GeralEstablishmentsPage;

