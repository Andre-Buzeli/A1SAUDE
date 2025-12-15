import React from 'react';
import { Settings, Save } from 'lucide-react';
import GlassForm from '@/components/ui/GlassForm';
import GlassInput from '@/components/ui/GlassInput';
import GlassCard from '@/components/ui/GlassCard';

const GeralSettingsPage: React.FC = () => {
  const [orgName, setOrgName] = React.useState('A1 Saúde');
  const [contactEmail, setContactEmail] = React.useState('contato@a1saude.com');
  const [timezone, setTimezone] = React.useState('America/Sao_Paulo');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrar com backend
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          <Settings className="w-5 h-5 text-yellow-400" />
          <span>Configurações</span>
        </h2>
        <p className="text-white/60 text-sm mt-1">Preferências e parâmetros gerais da rede</p>
      </div>

      <GlassForm onSubmit={onSubmit} title="Parâmetros Gerais" submitText="Salvar" buttonAlignment="right">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput label="Nome da Organização" value={orgName} onChange={setOrgName} />
          <GlassInput label="Email de Contato" value={contactEmail} onChange={setContactEmail} />
          <div>
            <label className="block text-white/80 text-sm mb-2">Fuso Horário</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
              <option value="America/Sao_Paulo">America/Sao_Paulo</option>
              <option value="America/Manaus">America/Manaus</option>
              <option value="America/Fortaleza">America/Fortaleza</option>
            </select>
          </div>
        </div>
      </GlassForm>

      <GlassCard className="p-4">
        <p className="text-white/70 text-sm">Outras configurações globais podem ser adicionadas aqui.</p>
      </GlassCard>
    </div>
  );
};

export default GeralSettingsPage;

