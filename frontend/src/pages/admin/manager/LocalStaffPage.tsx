import React from 'react';
import { motion } from 'framer-motion';
import { Search, Users, UserCheck, UserX, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import GlassTable from '@/components/ui/GlassTable';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'break';
  shift: 'Manhã' | 'Tarde' | 'Noite';
}

const sampleStaff: StaffMember[] = [
  { id: '1', name: 'Dr. João Silva', role: 'Médico', department: 'Clínica Geral', status: 'online', shift: 'Manhã' },
  { id: '2', name: 'Enf. Maria Santos', role: 'Enfermeira', department: 'Emergência', status: 'online', shift: 'Manhã' },
  { id: '3', name: 'Téc. Pedro Costa', role: 'Técnico', department: 'Laboratório', status: 'break', shift: 'Manhã' },
  { id: '4', name: 'Dr. Ana Souza', role: 'Médico', department: 'Pediatria', status: 'offline', shift: 'Tarde' },
  { id: '5', name: 'Enf. Carlos Lima', role: 'Enfermeiro', department: 'Ambulatório', status: 'online', shift: 'Noite' },
];

export const LocalStaffPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'all' | StaffMember['status']>('all');
  const [filterShift, setFilterShift] = React.useState<'all' | StaffMember['shift']>('all');
  const [filterRole, setFilterRole] = React.useState<'all' | string>('all');

  const filtered = React.useMemo(() => {
    return sampleStaff.filter((s) => {
      const matchesSearch = !searchTerm || (
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      const matchesShift = filterShift === 'all' || s.shift === filterShift;
      const matchesRole = filterRole === 'all' || s.role === filterRole;
      return matchesSearch && matchesStatus && matchesShift && matchesRole;
    });
  }, [searchTerm, filterStatus, filterShift, filterRole]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Equipe Local</h1>
        </div>
        <div className="flex items-center space-x-2">
          <GlassButton variant="ghost">
            <Clock className="w-4 h-4" />
            Escalas
          </GlassButton>
          <GlassButton>
            <UserCheck className="w-4 h-4" />
            Alocar Profissional
          </GlassButton>
        </div>
      </div>

      {/* Filtros */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <GlassInput
              placeholder="Buscar por nome, função ou setor..."
              value={searchTerm}
              onChange={setSearchTerm}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">Status: Todos</option>
            <option value="online">Online</option>
            <option value="break">Em Pausa</option>
            <option value="offline">Offline</option>
          </select>
          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">Turno: Todos</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
          </select>
        </div>
      </GlassCard>

      {/* Tabela */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassTable
          data={filtered}
          columns={[
            { key: 'name', label: 'Nome', sortable: true },
            { key: 'role', label: 'Função', sortable: true },
            { key: 'department', label: 'Setor', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'shift', label: 'Turno', sortable: true },
          ]}
          onRowClick={(item) => console.log('view', item)}
          emptyMessage="Nenhum profissional encontrado"
        />
      </motion.div>

      {/* Ações rápidas */}
      <div className="flex items-center space-x-2">
        <GlassButton variant="ghost">
          <UserX className="w-4 h-4" />
          Ausências
        </GlassButton>
        <GlassButton variant="ghost">
          <Clock className="w-4 h-4" />
          Trocas de turno
        </GlassButton>
      </div>
    </div>
  );
};

export default LocalStaffPage;

