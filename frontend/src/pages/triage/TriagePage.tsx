import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Activity,
  TrendingUp,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { triageService, TriageRecord } from '@/services/triageService';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const TriagePage: React.FC = () => {
  const navigate = useNavigate();
  const { isDevMode } = useDevMode();
  const [waitingQueue, setWaitingQueue] = useState<TriageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTriageData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadWaitingQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTriageData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadWaitingQueue(), loadStats()]);
    } catch (error) {
      console.error('Erro ao carregar dados de triagem:', error);
      toast.error('Erro ao carregar dados de triagem');
    } finally {
      setLoading(false);
    }
  };

  const loadWaitingQueue = async () => {
    try {
      const queue = await triageService.getWaitingQueue();
      setWaitingQueue(queue);
    } catch (error) {
      console.error('Erro ao carregar fila de espera:', error);
    }
  };

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const statsData = await triageService.getTriageStats(today.toISOString());
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleNewTriage = () => {
    navigate('/dev/triage/new');
  };

  const handleViewTriage = (id: string) => {
    navigate(`/dev/triage/${id}`);
  };

  const handleUpdateStatus = async (id: string, status: 'waiting' | 'in_progress' | 'completed' | 'transferred') => {
    try {
      await triageService.updateTriageStatus(id, status);
      toast.success('Status atualizado com sucesso');
      loadWaitingQueue();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error(error?.message || 'Erro ao atualizar status');
    }
  };

  const filteredQueue = waitingQueue.filter(triage => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      triage.patient?.name.toLowerCase().includes(query) ||
      triage.patient?.cpf.includes(query) ||
      triage.chiefComplaint.toLowerCase().includes(query)
    );
  });

  // Group by priority
  const groupedByPriority = filteredQueue.reduce((acc, triage) => {
    const priority = triage.finalPriority || 'non_urgent';
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(triage);
    return acc;
  }, {} as Record<string, TriageRecord[]>);

  const priorityOrder = ['immediate', 'very_urgent', 'urgent', 'standard', 'non_urgent'];

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {isDevMode && <DevModeBanner />}
        <div className="container mx-auto px-4 py-8 pt-20">
          <GlassCard className="p-12">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {isDevMode && <DevModeBanner />}

      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Activity className="w-8 h-8 mr-3 text-medical-green" />
                Triagem Manchester
              </h1>
              <p className="text-text-secondary">
                {filteredQueue.length} paciente{filteredQueue.length !== 1 ? 's' : ''} na fila de espera
              </p>
            </div>

            <GlassButton
              variant="primary"
              onClick={handleNewTriage}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Triagem</span>
            </GlassButton>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-medical-blue" />
                <div>
                  <p className="text-sm text-text-secondary">Total Hoje</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-medical-green" />
                <div>
                  <p className="text-sm text-text-secondary">Tempo Médio</p>
                  <p className="text-2xl font-bold text-white">{stats.averageWaitingTime}min</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-sm text-text-secondary">Imediatos</p>
                  <p className="text-2xl font-bold text-white">{stats.byPriority.immediate || 0}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-medical-purple" />
                <div>
                  <p className="text-sm text-text-secondary">Em Andamento</p>
                  <p className="text-2xl font-bold text-white">{stats.byStatus.in_progress || 0}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <GlassCard className="p-4">
            <div className="flex items-center space-x-4">
              <GlassInput
                placeholder="Buscar por nome, CPF ou queixa..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="flex-1"
                icon={<Filter className="w-4 h-4" />}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Priority Queues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {priorityOrder.map(priority => {
            const patients = groupedByPriority[priority] || [];
            if (patients.length === 0) return null;

            return (
              <GlassCard key={priority} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${triageService.getPriorityColor(priority).split(' ')[0]}`} />
                    <h2 className="text-xl font-semibold text-white">
                      {triageService.getPriorityLabel(priority)}
                    </h2>
                    <span className="text-text-secondary">
                      ({patients.length} paciente{patients.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    Tempo recomendado: {triageService.getRecommendedTime(priority)}
                  </div>
                </div>

                <div className="space-y-3">
                  {patients.map((triage, index) => (
                    <motion.div
                      key={triage.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border cursor-pointer hover:bg-white/10 transition-colors ${
                        triage.status === 'waiting' ? 'bg-white/5 border-white/20' :
                        triage.status === 'in_progress' ? 'bg-blue-500/10 border-blue-400/30' :
                        'bg-white/5 border-white/20'
                      }`}
                      onClick={() => handleViewTriage(triage.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <User className="w-5 h-5 text-medical-blue" />
                            <div>
                              <p className="text-white font-medium">
                                {triage.patient?.name || 'Paciente não identificado'}
                              </p>
                              <p className="text-sm text-text-secondary">
                                CPF: {triage.patient?.cpf || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <p className="text-white text-sm mb-3">
                            <strong>Queixa:</strong> {triage.chiefComplaint}
                          </p>

                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-text-secondary" />
                              <span className="text-text-secondary">
                                {new Date(triage.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>

                            {triage.waitingTime && (
                              <div className="text-yellow-400">
                                Espera: {triage.waitingTime}min
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <div className={`inline-block px-2 py-1 rounded text-xs font-medium border ${triageService.getStatusColor(triage.status)}`}>
                            {triageService.getStatusLabel(triage.status)}
                          </div>

                          <div className="flex space-x-2">
                            {triage.status === 'waiting' && (
                              <GlassButton
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(triage.id, 'in_progress');
                                }}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Iniciar
                              </GlassButton>
                            )}

                            {triage.status === 'in_progress' && (
                              <GlassButton
                                variant="primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(triage.id, 'completed');
                                }}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Concluir
                              </GlassButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredQueue.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-12 text-center">
              <Users className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary text-lg mb-4">
                {searchQuery ? 'Nenhum paciente encontrado com os filtros aplicados' : 'Nenhum paciente aguardando triagem'}
              </p>
              <GlassButton
                variant="primary"
                onClick={handleNewTriage}
              >
                <Plus className="w-4 h-4 mr-2" />
                Iniciar Nova Triagem
              </GlassButton>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TriagePage;


