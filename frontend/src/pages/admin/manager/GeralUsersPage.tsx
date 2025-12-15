import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Shield, Search, Filter, Plus, Edit, Ban, CheckCircle, Eye, EyeOff } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import GlassTable from '@/components/ui/GlassTable';
import GlassModal from '@/components/ui/GlassModal';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassTextarea from '@/components/ui/GlassTextarea';
import { UserProfile } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserItem {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  profile: UserProfile;
  establishmentType: 'ubs' | 'upa' | 'hospital';
  establishmentName: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface CreateUserForm {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  profile: UserProfile;
  establishmentType: 'ubs' | 'upa' | 'hospital';
  establishmentId: string;
  password: string;
  autoPassword: boolean;
  sendEmail: boolean;
  isActive: boolean;
}

interface ProfileOption {
  value: UserProfile;
  label: string;
  description: string;
}

interface Establishment {
  id: string;
  name: string;
  type: 'ubs' | 'upa' | 'hospital';
}

const statusBadge = (isActive: boolean) => {
  const status = isActive ? 'active' : 'inactive';
  const map = {
    active: 'text-green-400 bg-green-400/10 border-green-400/20',
    inactive: 'text-red-400 bg-red-400/10 border-red-400/20'
  } as const;
  return <span className={`px-2 py-0.5 rounded border text-xs ${map[status]}`}>{status.toUpperCase()}</span>;
};

const profileLabels: Record<UserProfile, string> = {
  system_master: 'Admin Sistema',
  gestor_geral: 'Gestor Geral',
  diretor_local: 'Diretor Local',
  gestor_local: 'Gestor Local',
  coordenador_geral: 'Coord. Geral',
  coordenador_local: 'Coord. Local',
  supervisor: 'Supervisor',
  secretario: 'Secretário',
  recepcionista: 'Recepcionista',
  medico: 'Médico',
  enfermeiro: 'Enfermeiro',
  tecnico_enfermagem: 'Téc. Enfermagem',
  farmaceutico: 'Farmacêutico',
  psicologo: 'Psicólogo',
  fisioterapeuta: 'Fisioterapeuta',
  nutricionista: 'Nutricionista',
  fonoaudiologo: 'Fonoaudiólogo',
  terapeuta_ocupacional: 'Terapeuta Ocup.',
  dentista: 'Dentista'
};

const GeralUsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState<'ALL' | UserProfile>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateUserForm>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    profile: 'recepcionista',
    establishmentType: 'ubs',
    establishmentId: '',
    password: '',
    autoPassword: true,
    sendEmail: false,
    isActive: true
  });

  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<ProfileOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadUsers();
    loadEstablishments();
    loadAvailableProfiles();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/v1/admin/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data.users);
      }
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadEstablishments = async () => {
    try {
      const response = await fetch('/api/v1/admin/establishments');
      const result = await response.json();
      if (result.success) {
        setEstablishments(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
    }
  };

  const loadAvailableProfiles = async () => {
    try {
      const response = await fetch('/api/v1/admin/users/profiles');
      const result = await response.json();
      if (result.success) {
        setAvailableProfiles(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    }
  };

  const handleCreateUser = async () => {
    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove formatting
        password: formData.autoPassword ? undefined : formData.password
      };

      const response = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Usuário criado com sucesso!');
        setShowCreateModal(false);
        loadUsers();

        // Reset form
        setFormData({
          name: '',
          email: '',
          cpf: '',
          phone: '',
          profile: 'recepcionista',
          establishmentType: 'ubs',
          establishmentId: '',
          password: '',
          autoPassword: true,
          sendEmail: false,
          isActive: true
        });
      } else {
        toast.error(result.error?.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      toast.error('Erro ao criar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users
    .filter(u => (profileFilter === 'ALL' ? true : u.profile === profileFilter))
    .filter(u => (statusFilter === 'ALL' ? true : (u.isActive ? 'active' : 'inactive') === statusFilter))
    .filter(u =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.cpf.includes(search.replace(/\D/g, ''))
    );

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-yellow-400" />
            <span>Usuários e Profissionais</span>
          </h2>
          <p className="text-white/60 text-sm mt-1">Gestão centralizada de usuários da rede</p>
        </div>
        <GlassButton size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />Novo Usuário
        </GlassButton>
      </div>

      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <GlassInput
            placeholder="Buscar por nome, email ou CPF"
            value={search}
            onChange={setSearch}
            icon={<Search className="w-5 h-5" />}
          />
          <select
            value={profileFilter}
            onChange={e => setProfileFilter(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="ALL">Todos os Perfis</option>
            {availableProfiles.map(profile => (
              <option key={profile.value} value={profile.value}>
                {profile.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="ALL">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
          <GlassButton size="sm" variant="ghost">
            <Filter className="w-4 h-4" />Filtros
          </GlassButton>
        </div>
      </GlassCard>

      <GlassTable<UserItem>
        data={filteredUsers}
        columns={[
          {
            key: 'name',
            label: 'Nome',
            sortable: true,
            render: (v: string) => (
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-white/70" />
                <span className="text-white font-medium text-sm">{v}</span>
              </div>
            )
          },
          {
            key: 'email',
            label: 'Email',
            sortable: true,
            render: (v: string) => <span className="text-white/80 text-sm">{v}</span>
          },
          {
            key: 'profile',
            label: 'Perfil',
            sortable: true,
            render: (v: UserProfile) => (
              <span className="text-white/80 text-sm">{profileLabels[v] || v}</span>
            ),
            className: 'w-32'
          },
          {
            key: 'establishmentName',
            label: 'Estabelecimento',
            sortable: true,
            render: (v: string) => <span className="text-white/80 text-sm">{v}</span>
          },
          {
            key: 'isActive',
            label: 'Status',
            sortable: true,
            render: (v: boolean) => statusBadge(v),
            className: 'w-24'
          },
          {
            key: 'actions',
            label: 'Ações',
            render: (_, user) => (
              <div className="flex gap-2">
                <button className="text-white/60 hover:text-white">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-white/60 hover:text-white">
                  {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                </button>
              </div>
            ),
            className: 'w-20'
          }
        ]}
        searchable={false}
        className="p-0"
      />

      {/* Create User Modal */}
      <GlassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Novo Usuário"
        size="lg"
      >
        <div className="space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassInput
                label="Nome Completo *"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                placeholder="Digite o nome completo"
              />
              <GlassInput
                label="CPF *"
                value={formData.cpf}
                onChange={(value) => setFormData({
                  ...formData,
                  cpf: value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                })}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              <GlassInput
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                placeholder="usuario@exemplo.com"
              />
              <GlassInput
                label="Telefone"
                value={formData.phone}
                onChange={(value) => setFormData({
                  ...formData,
                  phone: value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                })}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
          </div>

          {/* Acesso ao Sistema */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Acesso ao Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassSelect
                label="Perfil *"
                value={formData.profile}
                onChange={(value) => setFormData({ ...formData, profile: value as UserProfile })}
                options={availableProfiles.map(p => ({ value: p.value, label: p.label }))}
              />
              <GlassSelect
                label="Tipo de Estabelecimento *"
                value={formData.establishmentType}
                onChange={(value) => setFormData({ ...formData, establishmentType: value as 'ubs' | 'upa' | 'hospital' })}
                options={[
                  { value: 'ubs', label: 'UBS (Unidade Básica de Saúde)' },
                  { value: 'upa', label: 'UPA (Unidade de Pronto Atendimento)' },
                  { value: 'hospital', label: 'Hospital' }
                ]}
              />
              <GlassSelect
                label="Estabelecimento *"
                value={formData.establishmentId}
                onChange={(value) => setFormData({ ...formData, establishmentId: value })}
                options={establishments
                  .filter(e => e.type === formData.establishmentType)
                  .map(e => ({ value: e.id, label: e.name }))
                }
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Configurações de Acesso</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoPassword"
                  checked={formData.autoPassword}
                  onChange={(e) => setFormData({ ...formData, autoPassword: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="autoPassword" className="text-white text-sm">
                  Gerar senha automática
                </label>
              </div>

              {!formData.autoPassword && (
                <GlassInput
                  label="Senha *"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(value) => setFormData({ ...formData, password: value })}
                  placeholder="Digite a senha"
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="sendEmail" className="text-white text-sm">
                  Enviar email de boas-vindas
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-white text-sm">
                  Usuário ativo
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
            <GlassButton
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </GlassButton>
            <GlassButton
              onClick={handleCreateUser}
              disabled={submitting || !formData.name || !formData.email || !formData.cpf || !formData.establishmentId}
            >
              {submitting ? 'Criando...' : 'Salvar Usuário'}
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};

export default GeralUsersPage;

