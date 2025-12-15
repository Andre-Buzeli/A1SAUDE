import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Pill, Plus, Search, User, Clock, CheckCircle, XCircle,
  AlertTriangle, RefreshCw, Play, Square
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { medicationRoomService, MedicationRoomRecord } from '@/services/medicationRoomService';

const MedicationRoomPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<MedicationRoomRecord[]>([]);
  const [records, setRecords] = useState<MedicationRoomRecord[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'list'>('queue');

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [establishmentId]);

  const loadData = async () => {
    if (!establishmentId) return;
    try {
      const [dashRes, queueRes, listRes] = await Promise.all([
        medicationRoomService.getDashboard(establishmentId),
        medicationRoomService.getQueue(establishmentId),
        medicationRoomService.list({ establishmentId, page: 1, limit: 50 })
      ]);

      if (dashRes.success) setDashboard(dashRes.data);
      if (queueRes.success) setQueue(queueRes.data);
      if (listRes.success) setRecords(listRes.items);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAdministration = async (id: string) => {
    try {
      await medicationRoomService.startAdministration(id, user?.id || '');
      toast.success('Administração iniciada');
      loadData();
    } catch (error) {
      toast.error('Erro ao iniciar administração');
    }
  };

  const handleCompleteAdministration = async (id: string) => {
    try {
      await medicationRoomService.completeAdministration(id, {
        administeredBy: user?.id || ''
      });
      toast.success('Administração concluída');
      loadData();
    } catch (error) {
      toast.error('Erro ao concluir administração');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-blue-500/20 text-blue-300',
      in_progress: 'bg-yellow-500/20 text-yellow-300',
      completed: 'bg-green-500/20 text-green-300',
      cancelled: 'bg-red-500/20 text-red-300',
      refused: 'bg-purple-500/20 text-purple-300'
    };
    return styles[status] || 'bg-gray-500/20 text-gray-300';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      scheduled: 'Agendado',
      in_progress: 'Em Progresso',
      completed: 'Administrado',
      cancelled: 'Cancelado',
      refused: 'Recusado'
    };
    return texts[status] || status;
  };

  const getRouteBadge = (route: string) => {
    const colors: Record<string, string> = {
      IV: 'bg-red-500/20 text-red-300',
      IM: 'bg-orange-500/20 text-orange-300',
      SC: 'bg-yellow-500/20 text-yellow-300',
      VO: 'bg-green-500/20 text-green-300',
      INH: 'bg-blue-500/20 text-blue-300',
      TOP: 'bg-purple-500/20 text-purple-300'
    };
    return colors[route] || 'bg-gray-500/20 text-gray-300';
  };

  const isOverdue = (scheduledTime: string) => {
    return new Date(scheduledTime) < new Date();
  };

  if (loading && !dashboard) {
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
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Pill className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Sala de Medicação</h1>
              <p className="text-text-secondary">Administração de medicamentos</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <GlassButton onClick={loadData} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </GlassButton>
            <GlassButton variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Nova Medicação
            </GlassButton>
          </div>
        </motion.div>

        {/* KPIs */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Agendados Hoje</p>
              <p className="text-2xl font-bold text-white">{dashboard.todayScheduled}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Administrados</p>
              <p className="text-2xl font-bold text-green-300">{dashboard.todayCompleted}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Em Progresso</p>
              <p className="text-2xl font-bold text-yellow-300">{dashboard.inProgress}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Atrasados</p>
              <p className="text-2xl font-bold text-red-300">{dashboard.overdue}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Na Fila</p>
              <p className="text-2xl font-bold text-blue-300">{queue.length}</p>
            </GlassCard>
          </div>
        )}

        {/* Routes Distribution */}
        {dashboard?.byRoute && dashboard.byRoute.length > 0 && (
          <GlassCard className="p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-white font-medium">Por Via:</span>
              {dashboard.byRoute.map((item: any) => (
                <span key={item.route} className={`px-3 py-1 rounded-full text-sm ${getRouteBadge(item.route)}`}>
                  {item.route}: {item.count}
                </span>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Tabs */}
        <GlassCard className="p-2 mb-6">
          <div className="flex space-x-1">
            <GlassButton
              onClick={() => setActiveTab('queue')}
              variant={activeTab === 'queue' ? 'primary' : 'ghost'}
              size="sm"
            >
              Fila ({queue.length})
            </GlassButton>
            <GlassButton
              onClick={() => setActiveTab('list')}
              variant={activeTab === 'list' ? 'primary' : 'ghost'}
              size="sm"
            >
              Histórico
            </GlassButton>
          </div>
        </GlassCard>

        {/* Queue */}
        {activeTab === 'queue' && (
          <GlassCard className="p-6">
            {queue.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Pill className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhuma medicação na fila</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      isOverdue(record.scheduledTime) && record.status === 'scheduled'
                        ? 'bg-red-500/10 border border-red-500/30'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center">
                        <Clock className={`w-5 h-5 ${
                          isOverdue(record.scheduledTime) ? 'text-red-400' : 'text-blue-400'
                        }`} />
                        <span className={`text-xs mt-1 ${
                          isOverdue(record.scheduledTime) ? 'text-red-300' : 'text-text-secondary'
                        }`}>
                          {new Date(record.scheduledTime).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{record.patient?.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-text-secondary">{record.medicationName}</span>
                          <span className="text-xs text-text-secondary">•</span>
                          <span className="text-sm text-text-secondary">{record.dosage}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRouteBadge(record.route)}`}>
                        {record.route}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                      {record.status === 'scheduled' && (
                        <GlassButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleStartAdministration(record.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Iniciar
                        </GlassButton>
                      )}
                      {record.status === 'in_progress' && (
                        <GlassButton
                          size="sm"
                          variant="success"
                          onClick={() => handleCompleteAdministration(record.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Concluir
                        </GlassButton>
                      )}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Horário</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Paciente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Medicação</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Dosagem</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Via</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-white">
                          {new Date(record.scheduledTime).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-text-secondary" />
                            <span className="text-sm text-white">{record.patient?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">{record.medicationName}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{record.dosage}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRouteBadge(record.route)}`}>
                            {record.route}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                            {getStatusText(record.status)}
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
      </div>
    </div>
  );
};

export default MedicationRoomPage;

