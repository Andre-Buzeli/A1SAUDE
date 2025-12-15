import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Smile, Plus, Search, Filter, Calendar, User, Clock,
  CheckCircle, AlertTriangle, FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { dentalService, DentalAttendance } from '@/services/dentalService';

const DentalPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState<DentalAttendance[]>([]);
  const [queue, setQueue] = useState<DentalAttendance[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [activeTab, setActiveTab] = useState<'queue' | 'list'>('queue');

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadData();
  }, [establishmentId]);

  const loadData = async () => {
    if (!establishmentId) return;
    try {
      setLoading(true);
      const [dashRes, queueRes, listRes] = await Promise.all([
        dentalService.getDashboard(establishmentId),
        dentalService.getQueue(establishmentId),
        dentalService.list({ establishmentId, page: 1, limit: 20 })
      ]);

      if (dashRes.success) setDashboard(dashRes.data);
      if (queueRes.success) setQueue(queueRes.data);
      if (listRes.success) {
        setAttendances(listRes.items);
        setPagination(prev => ({ ...prev, ...listRes.pagination }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de odontologia');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgency':
        return 'bg-red-500/20 text-red-300';
      case 'priority':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-green-500/20 text-green-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300';
      case 'scheduled':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading && attendances.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <Smile className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Odontologia</h1>
              <p className="text-text-secondary">Atendimentos odontológicos</p>
            </div>
          </div>
          <GlassButton variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Novo Atendimento
          </GlassButton>
        </motion.div>

        {/* KPIs */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Hoje</p>
                  <p className="text-2xl font-bold text-white">{dashboard.todayCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Este Mês</p>
                  <p className="text-2xl font-bold text-white">{dashboard.monthCount}</p>
                </div>
                <Smile className="w-8 h-8 text-cyan-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Retornos Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-300">{dashboard.pendingReturns}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Urgências</p>
                  <p className="text-2xl font-bold text-red-300">{dashboard.urgentCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Na Fila</p>
                  <p className="text-2xl font-bold text-purple-300">{queue.length}</p>
                </div>
                <User className="w-8 h-8 text-purple-400" />
              </div>
            </GlassCard>
          </div>
        )}

        {/* Tabs */}
        <GlassCard className="p-2 mb-6">
          <div className="flex space-x-1">
            <GlassButton
              onClick={() => setActiveTab('queue')}
              variant={activeTab === 'queue' ? 'primary' : 'ghost'}
              size="sm"
            >
              Fila de Atendimento
            </GlassButton>
            <GlassButton
              onClick={() => setActiveTab('list')}
              variant={activeTab === 'list' ? 'primary' : 'ghost'}
              size="sm"
            >
              Todos os Atendimentos
            </GlassButton>
          </div>
        </GlassCard>

        {/* Queue */}
        {activeTab === 'queue' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Fila de Atendimento</h3>
            {queue.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Smile className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum paciente na fila</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((attendance, index) => (
                  <motion.div
                    key={attendance.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{attendance.patient?.name}</p>
                        <p className="text-sm text-text-secondary">{attendance.chiefComplaint}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(attendance.urgency)}`}>
                        {attendance.urgency === 'urgency' ? 'Urgência' :
                         attendance.urgency === 'priority' ? 'Prioridade' : 'Rotina'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(attendance.status)}`}>
                        {attendance.status === 'in_progress' ? 'Em Atendimento' :
                         attendance.status === 'scheduled' ? 'Aguardando' : attendance.status}
                      </span>
                      <GlassButton size="sm" variant="primary">
                        Atender
                      </GlassButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* List */}
        {activeTab === 'list' && (
          <GlassCard className="overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-medical-blue"
                  />
                </div>
                <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none">
                  <option value="">Todos os Tipos</option>
                  <option value="first_visit">Primeira Consulta</option>
                  <option value="return">Retorno</option>
                  <option value="urgency">Urgência</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Paciente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Queixa</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Urgência</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {attendances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                        Nenhum atendimento encontrado
                      </td>
                    </tr>
                  ) : (
                    attendances.map((attendance) => (
                      <tr key={attendance.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                        <td className="px-4 py-3 text-sm text-white">
                          {new Date(attendance.createdAt || '').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-text-secondary" />
                            <span className="text-sm text-white">{attendance.patient?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white capitalize">
                          {attendance.attendanceType.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary truncate max-w-[200px]">
                          {attendance.chiefComplaint}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(attendance.urgency)}`}>
                            {attendance.urgency === 'urgency' ? 'Urgência' :
                             attendance.urgency === 'priority' ? 'Prioridade' : 'Rotina'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(attendance.status)}`}>
                            {attendance.status === 'completed' ? 'Concluído' :
                             attendance.status === 'in_progress' ? 'Em Andamento' : 'Agendado'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Types Distribution */}
        {dashboard?.byType && dashboard.byType.length > 0 && (
          <GlassCard className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Atendimentos por Tipo (Este Mês)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dashboard.byType.map((item: any, index: number) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg text-center">
                  <p className="text-white font-medium capitalize">{item.type.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-cyan-400">{item.count}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default DentalPage;

