import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  AlertCircle, Plus, Search, User, Clock, Activity,
  ChevronRight, RefreshCw, Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { emergencyService, EmergencyAttendance } from '@/services/emergencyService';

const manchesterColors: Record<string, { bg: string; text: string; name: string }> = {
  red: { bg: 'bg-red-500', text: 'text-red-500', name: 'Vermelho - Emergência' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-500', name: 'Laranja - Muito Urgente' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', name: 'Amarelo - Urgente' },
  green: { bg: 'bg-green-500', text: 'text-green-500', name: 'Verde - Pouco Urgente' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-500', name: 'Azul - Não Urgente' }
};

const EmergencyPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<EmergencyAttendance[]>([]);
  const [waitingByPriority, setWaitingByPriority] = useState<Record<string, EmergencyAttendance[]>>({});
  const [observation, setObservation] = useState<EmergencyAttendance[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activeView, setActiveView] = useState<'queue' | 'priority' | 'observation'>('queue');

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [establishmentId]);

  const loadData = async () => {
    if (!establishmentId) return;
    try {
      const [dashRes, queueRes, priorityRes, obsRes] = await Promise.all([
        emergencyService.getDashboard(establishmentId),
        emergencyService.getQueue(establishmentId),
        emergencyService.getWaitingByPriority(establishmentId),
        emergencyService.getObservation(establishmentId)
      ]);

      if (dashRes.success) setDashboard(dashRes.data);
      if (queueRes.success) setQueue(queueRes.data);
      if (priorityRes.success) setWaitingByPriority(priorityRes.data);
      if (obsRes.success) setObservation(obsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      waiting: 'Aguardando',
      in_triage: 'Em Triagem',
      waiting_medical: 'Aguardando Médico',
      in_attendance: 'Em Atendimento',
      observation: 'Observação',
      completed: 'Alta'
    };
    return statusMap[status] || status;
  };

  const calculateWaitTime = (arrivalTime: string) => {
    const arrival = new Date(arrivalTime);
    const now = new Date();
    const diffMs = now.getTime() - arrival.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h${mins}min`;
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
            <div className="p-3 bg-red-500/20 rounded-lg animate-pulse">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Pronto Socorro</h1>
              <p className="text-text-secondary">Atendimentos de emergência</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <GlassButton onClick={loadData} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </GlassButton>
            <GlassButton variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Nova Chegada
            </GlassButton>
          </div>
        </motion.div>

        {/* KPIs */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Total Hoje</p>
              <p className="text-2xl font-bold text-white">{dashboard.totalToday}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Aguardando</p>
              <p className="text-2xl font-bold text-yellow-300">{dashboard.waiting}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Em Atendimento</p>
              <p className="text-2xl font-bold text-blue-300">{dashboard.inAttendance}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Observação</p>
              <p className="text-2xl font-bold text-purple-300">{dashboard.observation}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Altas</p>
              <p className="text-2xl font-bold text-green-300">{dashboard.completed}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Tempo Médio</p>
              <p className="text-2xl font-bold text-white">{dashboard.avgWaitTime}min</p>
            </GlassCard>
          </div>
        )}

        {/* Manchester Colors Summary */}
        {dashboard?.byColor && (
          <GlassCard className="p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {Object.entries(manchesterColors).map(([color, config]) => {
                const count = dashboard.byColor.find((c: any) => c.color === color)?.count || 0;
                return (
                  <div key={color} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${config.bg}`} />
                    <span className="text-white font-medium">{count}</span>
                    <span className="text-text-secondary text-sm hidden md:inline">{config.name}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        {/* Tabs */}
        <GlassCard className="p-2 mb-6">
          <div className="flex space-x-1">
            <GlassButton
              onClick={() => setActiveView('queue')}
              variant={activeView === 'queue' ? 'primary' : 'ghost'}
              size="sm"
            >
              Fila Geral ({queue.length})
            </GlassButton>
            <GlassButton
              onClick={() => setActiveView('priority')}
              variant={activeView === 'priority' ? 'primary' : 'ghost'}
              size="sm"
            >
              Por Prioridade
            </GlassButton>
            <GlassButton
              onClick={() => setActiveView('observation')}
              variant={activeView === 'observation' ? 'primary' : 'ghost'}
              size="sm"
            >
              Observação ({observation.length})
            </GlassButton>
          </div>
        </GlassCard>

        {/* Queue View */}
        {activeView === 'queue' && (
          <GlassCard className="p-6">
            {queue.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum paciente na fila</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((attendance, index) => (
                  <motion.div
                    key={attendance.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${manchesterColors[attendance.manchesterColor]?.bg || 'bg-gray-500'}`} />
                      <div>
                        <p className="text-white font-medium">{attendance.patient?.name}</p>
                        <p className="text-sm text-text-secondary">{attendance.chiefComplaint}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">Espera</p>
                        <p className="text-white font-medium">{calculateWaitTime(attendance.arrivalTime)}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white">
                        {getStatusText(attendance.status)}
                      </span>
                      <GlassButton size="sm" variant="primary">
                        <ChevronRight className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* Priority View */}
        {activeView === 'priority' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(manchesterColors).map(([color, config]) => (
              <GlassCard key={color} className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`w-4 h-4 rounded-full ${config.bg}`} />
                  <h3 className="text-white font-medium">{color.charAt(0).toUpperCase() + color.slice(1)}</h3>
                </div>
                <div className="space-y-2">
                  {(waitingByPriority[color] || []).length === 0 ? (
                    <p className="text-text-secondary text-sm text-center py-4">Nenhum</p>
                  ) : (
                    (waitingByPriority[color] || []).map((attendance) => (
                      <div key={attendance.id} className="p-2 bg-white/5 rounded-lg">
                        <p className="text-white text-sm font-medium truncate">{attendance.patient?.name}</p>
                        <p className="text-xs text-text-secondary">{calculateWaitTime(attendance.arrivalTime)}</p>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Observation View */}
        {activeView === 'observation' && (
          <GlassCard className="p-6">
            {observation.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum paciente em observação</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {observation.map((attendance) => (
                  <div key={attendance.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-3 h-3 rounded-full ${manchesterColors[attendance.manchesterColor]?.bg || 'bg-gray-500'}`} />
                      <span className="text-xs text-text-secondary">
                        Leito: {attendance.observationBedId || 'N/A'}
                      </span>
                    </div>
                    <p className="text-white font-medium">{attendance.patient?.name}</p>
                    <p className="text-sm text-text-secondary mb-2">{attendance.chiefComplaint}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">
                        Entrada: {attendance.observationStartTime && new Date(attendance.observationStartTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <GlassButton size="sm" variant="ghost">Ver</GlassButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default EmergencyPage;

