import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Users,
  Bed,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { establishmentService, type Establishment } from '@/services/establishmentService';

const EstablishmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [availableTypes, setAvailableTypes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEstablishments: 0,
    activeEstablishments: 0,
    inactiveEstablishments: 0,
    totalBeds: 0
  });

  useEffect(() => {
    loadEstablishments();
    loadTypes();
    loadStats();
  }, []);

  useEffect(() => {
    loadEstablishments();
  }, [searchTerm, typeFilter, statusFilter]);

  const loadEstablishments = async () => {
    try {
      const response = await establishmentService.searchEstablishments({
        search: searchTerm,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      setEstablishments(response.establishments);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
      toast.error('Erro ao carregar estabelecimentos');
    } finally {
      setLoading(false);
    }
  };

  const loadTypes = async () => {
    try {
      const types = await establishmentService.getEstablishmentTypes();
      setAvailableTypes(types);
    } catch (error) {
      console.error('Erro ao carregar tipos:', error);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await establishmentService.getEstablishmentStats();
      setStats({
        totalEstablishments: stats.totalEstablishments,
        activeEstablishments: stats.activeEstablishments,
        inactiveEstablishments: stats.inactiveEstablishments,
        totalBeds: stats.totalBeds
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hospital: 'Hospital',
      upa: 'UPA 24h',
      ubs: 'UBS',
      centro_cirurgico: 'Centro Cirúrgico',
      laboratorio: 'Laboratório'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'upa':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'ubs':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'centro_cirurgico':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'laboratorio':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Estabelecimentos</h1>
          <p className="text-gray-400">Gerencie os estabelecimentos de saúde</p>
        </div>
        <GlassButton
          onClick={() => toast.success('Funcionalidade em desenvolvimento')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Estabelecimento
        </GlassButton>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.totalEstablishments}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ativos</p>
              <p className="text-2xl font-bold text-green-400">{stats.activeEstablishments}</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Inativos</p>
              <p className="text-2xl font-bold text-red-400">{stats.inactiveEstablishments}</p>
            </div>
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Leitos</p>
              <p className="text-2xl font-bold text-purple-400">{stats.totalBeds}</p>
            </div>
            <Bed className="w-8 h-8 text-purple-400" />
          </div>
        </GlassCard>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1">
          <GlassInput
            placeholder="Buscar estabelecimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Tipos</option>
            {availableTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </motion.div>

      {/* Establishments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {establishments.map((establishment) => (
          <GlassCard key={establishment.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{establishment.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(establishment.type)}`}>
                        {getTypeLabel(establishment.type)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        establishment.isActive
                          ? 'bg-green-500/20 text-green-300 border-green-400/30'
                          : 'bg-red-500/20 text-red-300 border-red-400/30'
                      }`}>
                        {establishment.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {establishment.address.city}, {establishment.address.state}
                    </span>
                  </div>

                  {establishment.phone && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{establishment.phone}</span>
                    </div>
                  )}

                  {establishment.email && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{establishment.email}</span>
                    </div>
                  )}

                  {establishment.capacity?.beds && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Bed className="w-4 h-4" />
                      <span className="text-sm">{establishment.capacity.beds} leitos</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {establishment._count && (
                    <>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{establishment._count.users} usuários</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        <span>{establishment._count.attendances} atendimentos</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {establishment.services.map((service) => (
                    <span
                      key={service}
                      className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <GlassButton
                  size="sm"
                  variant="secondary"
                  onClick={() => toast.success('Editar em desenvolvimento')}
                >
                  <Edit className="w-4 h-4" />
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="danger"
                  onClick={() => toast.success('Excluir em desenvolvimento')}
                >
                  <Trash2 className="w-4 h-4" />
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {establishments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum estabelecimento encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando o primeiro estabelecimento'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default EstablishmentsPage;



