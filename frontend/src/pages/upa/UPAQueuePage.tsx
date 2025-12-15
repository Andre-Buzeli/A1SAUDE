import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck,
  Ambulance
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

interface QueueItem {
  id: string;
  patient: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    gender: string;
  };
  priority: 'immediate' | 'very_urgent' | 'urgent' | 'standard' | 'non_urgent';
  chiefComplaint: string;
  createdAt: string;
  waitingTime: number;
  status: string;
}

const UPAQueuePage: React.FC = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    immediate: 0,
    veryUrgent: 0,
    urgent: 0,
    standard: 0,
    nonUrgent: 0,
    avgWaitTime: 0
  });

  useEffect(() => {
    loadQueue();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadQueue = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockQueue: QueueItem[] = [
        {
          id: '1',
          patient: {
            id: 'p1',
            name: 'João Silva',
            cpf: '12345678901',
            birthDate: '1980-05-15',
            gender: 'male'
          },
          priority: 'immediate',
          chiefComplaint: 'Dor torácica intensa',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
          waitingTime: 10,
          status: 'waiting'
        },
        {
          id: '2',
          patient: {
            id: 'p2',
            name: 'Maria Santos',
            cpf: '98765432109',
            birthDate: '1975-08-22',
            gender: 'female'
          },
          priority: 'very_urgent',
          chiefComplaint: 'Dificuldade para respirar',
          createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
          waitingTime: 25,
          status: 'waiting'
        },
        {
          id: '3',
          patient: {
            id: 'p3',
            name: 'Pedro Oliveira',
            cpf: '11122233344',
            birthDate: '1990-03-10',
            gender: 'male'
          },
          priority: 'urgent',
          chiefComplaint: 'Fratura exposta',
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
          waitingTime: 45,
          status: 'waiting'
        }
      ];

      setQueue(mockQueue);
      setStats({
        total: mockQueue.length,
        immediate: mockQueue.filter(q => q.priority === 'immediate').length,
        veryUrgent: mockQueue.filter(q => q.priority === 'very_urgent').length,
        urgent: mockQueue.filter(q => q.priority === 'urgent').length,
        standard: mockQueue.filter(q => q.priority === 'standard').length,
        nonUrgent: mockQueue.filter(q => q.priority === 'non_urgent').length,
        avgWaitTime: Math.round(mockQueue.reduce((sum, q) => sum + q.waitingTime, 0) / mockQueue.length)
      });
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
      toast.error('Erro ao carregar fila de atendimento');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      immediate: 'from-red-500 to-red-600',
      very_urgent: 'from-orange-500 to-orange-600',
      urgent: 'from-yellow-500 to-yellow-600',
      standard: 'from-green-500 to-green-600',
      non_urgent: 'from-blue-500 to-blue-600'
    };
    return colors[priority as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      immediate: 'Imediato',
      very_urgent: 'Muito Urgente',
      urgent: 'Urgente',
      standard: 'Padrão',
      non_urgent: 'Não Urgente'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getSLATime = (priority: string) => {
    const times = {
      immediate: 0, // imediato
      very_urgent: 10, // 10 minutos
      urgent: 60, // 1 hora
      standard: 120, // 2 horas
      non_urgent: 240 // 4 horas
    };
    return times[priority as keyof typeof times] || 240;
  };

  const isSLAExceeded = (waitingTime: number, priority: string) => {
    return waitingTime > getSLATime(priority);
  };

  const handleAttendPatient = (patientId: string) => {
    // Navigate to attendance page or open modal
    toast.success('Iniciando atendimento do paciente');
  };

  const handleTransferPatient = (patientId: string) => {
    // Open transfer modal
    toast.success('Abrindo modal de transferência');
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Fila de Atendimento UPA
          </h1>
          <p className="text-text-secondary">
            {user?.establishmentName} - Sistema Manchester
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total na Fila</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-medical-blue" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Imediato</p>
                <p className="text-2xl font-bold text-white">{stats.immediate}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Muito Urgente</p>
                <p className="text-2xl font-bold text-white">{stats.veryUrgent}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Urgente</p>
                <p className="text-2xl font-bold text-white">{stats.urgent}</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Padrão</p>
                <p className="text-2xl font-bold text-white">{stats.standard}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Não Urgente</p>
                <p className="text-2xl font-bold text-white">{stats.nonUrgent}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Tempo Médio</p>
                <p className="text-2xl font-bold text-white">{stats.avgWaitTime}min</p>
              </div>
              <Clock className="w-8 h-8 text-medical-purple" />
            </div>
          </GlassCard>
        </div>

        {/* Queue List */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Fila de Atendimento</h2>

          <div className="space-y-4">
            {queue.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border backdrop-blur-sm bg-gradient-to-r ${getPriorityColor(item.priority)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                        {getPriorityLabel(item.priority)}
                      </span>
                      <span className="text-white/80 text-sm">
                        #{index + 1} na fila
                      </span>
                      {isSLAExceeded(item.waitingTime, item.priority) && (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
                          SLA Excedido
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                      <div>
                        <p className="font-medium">{item.patient.name}</p>
                        <p className="text-sm text-white/70">
                          CPF: {item.patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-white/70">Queixa Principal</p>
                        <p className="font-medium">{item.chiefComplaint}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/70">Tempo de Espera</p>
                          <p className="font-medium">{item.waitingTime} minutos</p>
                        </div>

                        <div className="flex space-x-2">
                          <GlassButton
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAttendPatient(item.patient.id)}
                            className="text-white hover:bg-white/20"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Atender
                          </GlassButton>

                          <GlassButton
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTransferPatient(item.patient.id)}
                            className="text-white hover:bg-white/20"
                          >
                            <Ambulance className="w-4 h-4 mr-1" />
                            Transferir
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {queue.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">Nenhum paciente na fila de atendimento</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default UPAQueuePage;
