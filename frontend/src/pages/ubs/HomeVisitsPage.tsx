/**
 * Visitas Domiciliares - UBS
 * Sistema A1 Saúde
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Calendar,
  MapPin,
  User,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

// Mock data - será substituído pela API real
const mockVisits = [
  {
    id: '1',
    patientName: 'Maria da Silva Santos',
    patientAge: 72,
    address: 'Rua das Flores, 123 - Centro',
    scheduledDate: '2024-11-27',
    scheduledTime: '09:00',
    visitType: 'routine',
    priority: 'normal',
    status: 'scheduled',
    professionalName: 'ACS Joana Pereira',
    reason: 'Acompanhamento de hipertensão'
  },
  {
    id: '2',
    patientName: 'José Carlos Oliveira',
    patientAge: 85,
    address: 'Av. Brasil, 456 - Vila Nova',
    scheduledDate: '2024-11-27',
    scheduledTime: '10:30',
    visitType: 'bedridden',
    priority: 'high',
    status: 'in_progress',
    professionalName: 'Enf. Carlos Silva',
    reason: 'Paciente acamado - curativo'
  },
  {
    id: '3',
    patientName: 'Ana Paula Costa',
    patientAge: 28,
    address: 'Rua do Sol, 789 - Jardim',
    scheduledDate: '2024-11-27',
    scheduledTime: '14:00',
    visitType: 'prenatal',
    priority: 'normal',
    status: 'completed',
    professionalName: 'ACS Joana Pereira',
    reason: 'Acompanhamento pré-natal - 32 semanas'
  },
  {
    id: '4',
    patientName: 'Antônio Ferreira Lima',
    patientAge: 65,
    address: 'Travessa das Acácias, 45 - Centro',
    scheduledDate: '2024-11-28',
    scheduledTime: '08:30',
    visitType: 'post_discharge',
    priority: 'urgent',
    status: 'scheduled',
    professionalName: 'Enf. Maria Santos',
    reason: 'Pós-alta hospitalar - acompanhamento pós-cirúrgico'
  }
];

export const HomeVisitsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState(mockVisits);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      not_found: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      rescheduled: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return colors[status] || colors.scheduled;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Agendada',
      in_progress: 'Em andamento',
      completed: 'Realizada',
      cancelled: 'Cancelada',
      not_found: 'Não encontrado',
      rescheduled: 'Reagendada'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      routine: 'Rotina',
      followup: 'Acompanhamento',
      active_search: 'Busca Ativa',
      bedridden: 'Acamado',
      post_discharge: 'Pós-alta',
      newborn: 'Recém-nascido',
      prenatal: 'Pré-natal'
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-400',
      normal: 'text-blue-400',
      high: 'text-orange-400',
      urgent: 'text-red-400'
    };
    return colors[priority] || colors.normal;
  };

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         visit.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || visit.status === statusFilter;
    const matchesType = !typeFilter || visit.visitType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'scheduled', label: 'Agendada' },
    { value: 'in_progress', label: 'Em andamento' },
    { value: 'completed', label: 'Realizada' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'not_found', label: 'Não encontrado' }
  ];

  const typeOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'routine', label: 'Rotina' },
    { value: 'followup', label: 'Acompanhamento' },
    { value: 'active_search', label: 'Busca Ativa' },
    { value: 'bedridden', label: 'Acamado' },
    { value: 'post_discharge', label: 'Pós-alta' },
    { value: 'newborn', label: 'Recém-nascido' },
    { value: 'prenatal', label: 'Pré-natal' }
  ];

  // Estatísticas
  const stats = {
    total: visits.length,
    scheduled: visits.filter(v => v.status === 'scheduled').length,
    inProgress: visits.filter(v => v.status === 'in_progress').length,
    completed: visits.filter(v => v.status === 'completed').length,
    todayVisits: visits.filter(v => v.scheduledDate === '2024-11-27').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <GlassButton
              variant="ghost"
              onClick={() => navigate('/dev')}
              className="p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </GlassButton>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Home className="w-8 h-8 mr-3 text-green-400" />
                Visitas Domiciliares
              </h1>
              <p className="text-white/60 mt-1">Gestão de visitas domiciliares da UBS</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <GlassButton
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </GlassButton>
            <GlassButton
              onClick={() => navigate('/dev/ubs/home-visits/new')}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Visita</span>
            </GlassButton>
          </div>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Home className="w-8 h-8 text-green-400/50" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Hoje</p>
                  <p className="text-2xl font-bold text-white">{stats.todayVisits}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400/50" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Agendadas</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.scheduled}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400/50" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Em andamento</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400/50" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Realizadas</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400/50" />
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Busca e Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <GlassInput
                  placeholder="Buscar por paciente ou endereço..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <GlassSelect
                  label="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={statusOptions}
                />
                <GlassSelect
                  label="Tipo de Visita"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={typeOptions}
                />
              </motion.div>
            )}
          </GlassCard>
        </motion.div>

        {/* Lista de Visitas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {filteredVisits.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-white/30" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma visita encontrada</h3>
              <p className="text-white/50 mb-4">Tente ajustar os filtros ou agende uma nova visita</p>
              <GlassButton onClick={() => navigate('/dev/ubs/home-visits/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Agendar Visita
              </GlassButton>
            </GlassCard>
          ) : (
            filteredVisits.map((visit, index) => (
              <motion.div
                key={visit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <GlassCard className="p-5 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Info do Paciente */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-xl ${
                        visit.priority === 'urgent' ? 'bg-red-500/20' :
                        visit.priority === 'high' ? 'bg-orange-500/20' :
                        'bg-green-500/20'
                      }`}>
                        <Home className={`w-6 h-6 ${getPriorityColor(visit.priority)}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{visit.patientName}</h3>
                          <span className="text-white/50">({visit.patientAge} anos)</span>
                        </div>
                        <div className="flex items-center text-white/60 text-sm mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {visit.address}
                        </div>
                        <p className="text-white/70 text-sm">{visit.reason}</p>
                      </div>
                    </div>

                    {/* Info da Visita */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                      <div className="text-sm">
                        <div className="flex items-center text-white/60 mb-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(visit.scheduledDate).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center text-white/60">
                          <Clock className="w-4 h-4 mr-1" />
                          {visit.scheduledTime}
                        </div>
                      </div>

                      <div className="flex flex-col items-start lg:items-end gap-2">
                        <span className={`inline-flex px-3 py-1 text-xs rounded-full border ${getStatusColor(visit.status)}`}>
                          {getStatusLabel(visit.status)}
                        </span>
                        <span className="text-white/50 text-xs">
                          {getTypeLabel(visit.visitType)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* Ver detalhes */}}
                        >
                          <Eye className="w-4 h-4" />
                        </GlassButton>
                        {visit.status === 'scheduled' && (
                          <>
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* Editar */}}
                            >
                              <Edit className="w-4 h-4" />
                            </GlassButton>
                            <GlassButton
                              variant="secondary"
                              size="sm"
                              onClick={() => {/* Iniciar visita */}}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Iniciar
                            </GlassButton>
                          </>
                        )}
                        {visit.status === 'in_progress' && (
                          <GlassButton
                            size="sm"
                            onClick={() => {/* Finalizar visita */}}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Finalizar
                          </GlassButton>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profissional */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center text-white/50 text-sm">
                      <User className="w-4 h-4 mr-2" />
                      {visit.professionalName}
                    </div>
                    {visit.status === 'scheduled' && (
                      <div className="flex items-center space-x-2">
                        <button className="text-white/50 hover:text-white text-sm flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          Contato
                        </button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HomeVisitsPage;

