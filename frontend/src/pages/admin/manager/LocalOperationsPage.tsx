import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Settings, Wrench, FileText } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassTable from '@/components/ui/GlassTable';

interface Operation {
  id: string;
  title: string;
  status: 'running' | 'paused' | 'error' | 'completed';
  owner: string;
  lastUpdate: string;
}

const operations: Operation[] = [
  { id: 'op1', title: 'Fluxo de Atendimento', status: 'running', owner: 'Coord. Maria', lastUpdate: '2025-10-26 09:32' },
  { id: 'op2', title: 'Inventário Farmácia', status: 'paused', owner: 'Farm. Carlos', lastUpdate: '2025-10-26 08:10' },
  { id: 'op3', title: 'Manutenção Equipamentos', status: 'error', owner: 'Tec. Pedro', lastUpdate: '2025-10-25 18:24' },
  { id: 'op4', title: 'Auditoria Prontuários', status: 'completed', owner: 'Enf. Ana', lastUpdate: '2025-10-24 14:02' },
];

function getStatusBadge(status: Operation['status']) {
  switch (status) {
    case 'running': return <span className="text-medical-green">Ativo</span>;
    case 'paused': return <span className="text-yellow-400">Pausado</span>;
    case 'error': return <span className="text-medical-red">Erro</span>;
    case 'completed': return <span className="text-blue-400">Concluído</span>;
  }
}

const LocalOperationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Operações Locais</h1>
        </div>
        <div className="flex items-center space-x-2">
          <GlassButton variant="ghost">
            <Settings className="w-4 h-4" />
            Parâmetros
          </GlassButton>
          <GlassButton>
            <Wrench className="w-4 h-4" />
            Ação de Manutenção
          </GlassButton>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-5 h-5 text-medical-green" />
            <h3 className="text-white font-semibold">Operações Ativas</h3>
          </div>
          <p className="text-3xl font-bold text-white">12</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-semibold">Alertas</h3>
          </div>
          <p className="text-3xl font-bold text-white">3</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Procedimentos</h3>
          </div>
          <p className="text-3xl font-bold text-white">24</p>
        </GlassCard>
      </div>

      {/* Tabela de operações */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassTable
          data={operations}
          columns={[
            { key: 'title', label: 'Operação', sortable: true },
            { key: 'owner', label: 'Responsável', sortable: true },
            { key: 'lastUpdate', label: 'Última Atualização', sortable: true },
          ]}
          onRowClick={(item) => console.log('view op', item)}
          emptyMessage="Nenhuma operação registrada"
        />
      </motion.div>

      {/* Lista status com badges */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          {operations.map((op) => (
            <div key={op.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">{op.title}</p>
                <p className="text-white/70 text-sm">{op.owner}</p>
              </div>
              <div className="text-right">
                {getStatusBadge(op.status)}
                <p className="text-white/50 text-xs">{op.lastUpdate}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default LocalOperationsPage;

