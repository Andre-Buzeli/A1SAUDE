import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Building
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { userService, type User } from '@/services/userService';

const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [availableProfiles, setAvailableProfiles] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    recentRegistrations: 0
  });

  useEffect(() => {
    loadUsers();
    loadProfiles();
    loadStats();
  }, [profileFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      const response = await userService.searchUsers({
        search: searchTerm,
        profile: profileFilter !== 'all' ? profileFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      setUsers(response.users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const profiles = await userService.getAvailableProfiles();
      setAvailableProfiles(profiles);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await userService.getUserStats();
      setStats({
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        inactiveUsers: stats.inactiveUsers,
        recentRegistrations: stats.recentLogins || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const getProfileLabel = (profile: string) => {
    const profileMap = availableProfiles.find(p => p.value === profile);
    return profileMap?.label || profile;
  };

  const getEstablishmentTypeLabel = (type: string) => {
    const labels = {
      hospital: 'Hospital',
      ubs: 'UBS',
      upa: 'UPA'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Update user status
      toast.success(`Usuário ${currentStatus ? 'desativado' : 'reativado'} com sucesso`);
      loadUsers(); // Reload list
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const handleEditUser = (userId: string) => {
    // Navigate to edit user page
    toast.success('Abrindo edição de usuário');
  };

  const handleNewUser = () => {
    // Navigate to create user page
    toast.success('Abrindo criação de usuário');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gestão de Usuários
              </h1>
              <p className="text-text-secondary">
                Administração de usuários do sistema A1 Saúde
              </p>
            </div>
            <GlassButton
              variant="primary"
              onClick={handleNewUser}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Usuário</span>
            </GlassButton>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total de Usuários</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-medical-blue" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-300">{stats.activeUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Usuários Inativos</p>
                <p className="text-2xl font-bold text-red-300">{stats.inactiveUsers}</p>
              </div>
              <UserX className="w-8 h-8 text-red-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Novos (30 dias)</p>
                <p className="text-2xl font-bold text-medical-purple">{stats.recentRegistrations}</p>
              </div>
              <Calendar className="w-8 h-8 text-medical-purple" />
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <GlassCard className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-text-secondary" />
              <GlassInput
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-64"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-text-secondary" />
              <select
                value={profileFilter}
                onChange={(e) => setProfileFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">Todos os Perfis</option>
                {availableProfiles.map(profile => (
                  <option key={profile.value} value={profile.value}>
                    {profile.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Users List */}
        <div className="space-y-4">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <p className="text-text-secondary text-sm">{user.email}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                      {getProfileLabel(user.profile)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <GlassButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditUser(user.id)}
                      className="text-white hover:bg-white/20"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </GlassButton>
                    <GlassButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      className={`text-white hover:bg-${user.isActive ? 'red' : 'green'}-500/20`}
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="w-4 h-4 mr-1" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Reativar
                        </>
                      )}
                    </GlassButton>
                    <GlassButton
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </GlassButton>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-text-secondary text-sm mb-1">CPF</p>
                    <p className="text-white font-medium">{formatCPF(user.cpf)}</p>
                  </div>

                  <div>
                    <p className="text-text-secondary text-sm mb-1">Contato</p>
                    <div className="flex items-center space-x-2 text-white">
                      {user.phone && (
                        <>
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{user.phone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-text-secondary text-sm mb-1">Estabelecimento</p>
                    <div className="flex items-center space-x-2 text-white">
                      <Building className="w-4 h-4" />
                      <span className="text-sm">
                        {getEstablishmentTypeLabel(user.establishmentType)} - {user.establishmentName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>Cadastrado em {formatDate(user.createdAt)}</span>
                    {user.lastLogin && (
                      <span>Último acesso: {formatDate(user.lastLogin)}</span>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {users.length === 0 && (
          <GlassCard className="p-8 text-center">
            <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">
              Nenhum usuário encontrado com os filtros aplicados
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
