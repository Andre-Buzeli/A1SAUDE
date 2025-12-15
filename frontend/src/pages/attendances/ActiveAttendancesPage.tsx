import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Stethoscope, Clock, User, AlertCircle, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { attendanceService, Attendance } from '@/services/attendanceService';

export const ActiveAttendancesPage: React.FC = () => {
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'in_progress'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAttendances();
  }, [filterStatus]);

  const loadAttendances = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getActiveAttendances();
      setAttendances(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar atendimentos:', error);
      toast.error(error?.message || 'Erro ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAttendance = async (id: string) => {
    try {
      await attendanceService.startAttendance(id);
      toast.success('Atendimento iniciado');
      loadAttendances();
    } catch (error: any) {
      console.error('Erro ao iniciar atendimento:', error);
      toast.error(error?.message || 'Erro ao iniciar atendimento');
    }
  };

  const handleViewAttendance = (id: string) => {
    navigate(`/dev/attendances/${id}`);
  };

  const handleNewAttendance = () => {
    navigate('/dev/attendances/new');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-medical-blue/20 text-medical-blue border-medical-blue/30';
      case 'scheduled':
        return 'bg-medical-orange/20 text-medical-orange border-medical-orange/30';
      case 'completed':
        return 'bg-medical-green/20 text-medical-green border-medical-green/30';
      case 'cancelled':
        return 'bg-medical-red/20 text-medical-red border-medical-red/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Agendado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Não Compareceu'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      consultation: 'Consulta',
      emergency: 'Emergência',
      procedure: 'Procedimento',
      surgery: 'Cirurgia',
      exam: 'Exame',
      vaccination: 'Vacinação'
    };
    return labels[type] || type;
  };

  const filteredAttendances = attendances.filter(attendance => {
    if (filterStatus === 'all') return true;
    return attendance.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
                <Stethoscope className="w-8 h-8 mr-3 text-medical-blue" />
                Atendimentos Ativos
              </h1>
              <p className="text-text-secondary">
                {filteredAttendances.length} atendimento{filteredAttendances.length !== 1 ? 's' : ''} ativo{filteredAttendances.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <GlassButton
              variant="primary"
              onClick={handleNewAttendance}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Atendimento</span>
            </GlassButton>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <GlassButton
                  variant={filterStatus === 'all' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Todos
                </GlassButton>
                <GlassButton
                  variant={filterStatus === 'scheduled' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('scheduled')}
                >
                  Agendados
                </GlassButton>
                <GlassButton
                  variant={filterStatus === 'in_progress' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('in_progress')}
                >
                  Em Andamento
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Attendances List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <GlassCard className="p-12">
              <div className="flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            </GlassCard>
          ) : filteredAttendances.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Stethoscope className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary text-lg">Nenhum atendimento ativo encontrado</p>
              <GlassButton
                variant="primary"
                onClick={handleNewAttendance}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Atendimento
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAttendances.map((attendance, index) => (
                <motion.div
                  key={attendance.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard 
                    variant="interactive"
                    className="p-6 cursor-pointer hover:bg-white/15"
                    onClick={() => handleViewAttendance(attendance.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 bg-medical-blue/20 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-medical-blue" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {attendance.patient?.name || 'Paciente não identificado'}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              CPF: {attendance.patient?.cpf || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Queixa Principal</p>
                            <p className="text-white text-sm">{attendance.chiefComplaint}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Tipo</p>
                            <p className="text-white text-sm">{getTypeLabel(attendance.type)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Profissional</p>
                            <p className="text-white text-sm">{attendance.professional?.name || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(attendance.status)}`}>
                            {getStatusLabel(attendance.status)}
                          </div>
                          <div className="flex items-center space-x-1 text-text-secondary text-sm">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(attendance.startTime).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {attendance.status === 'scheduled' && (
                          <GlassButton
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartAttendance(attendance.id);
                            }}
                          >
                            Iniciar
                          </GlassButton>
                        )}
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAttendance(attendance.id);
                          }}
                        >
                          Ver Detalhes
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ActiveAttendancesPage;

