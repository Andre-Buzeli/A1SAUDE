import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, TestTube, Clock, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { examService, ExamRequest, ExamRequestFilters } from '@/services/examService';
import { patientService, Patient } from '@/services/patientService';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const ExamRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDevMode } = useDevMode();
  const [examRequests, setExamRequests] = useState<ExamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadExamRequests();
  }, [filterStatus, page]);

  const loadExamRequests = async () => {
    try {
      setLoading(true);
      const filters: ExamRequestFilters = {
        page,
        limit: 20,
        sortBy: 'requestedAt',
        sortOrder: 'desc'
      };

      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const data = await examService.searchExamRequests(filters);
      setExamRequests(data.examRequests || []);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      console.error('Erro ao carregar solicitações de exame:', error);
      toast.error(error?.message || 'Erro ao carregar solicitações de exame');
    } finally {
      setLoading(false);
    }
  };

  const handleNewExamRequest = () => {
    navigate('/dev/exams/new');
  };

  const handleViewExamRequest = (id: string) => {
    navigate(`/dev/exams/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'in_progress':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      requested: 'Solicitado',
      scheduled: 'Agendado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'text-red-400';
      case 'urgent':
        return 'text-orange-400';
      case 'routine':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    const labels: Record<string, string> = {
      emergency: 'Emergência',
      urgent: 'Urgente',
      routine: 'Rotina'
    };
    return labels[urgency] || urgency;
  };

  const filteredExamRequests = examRequests.filter(examRequest => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      examRequest.patient?.name.toLowerCase().includes(query) ||
      examRequest.patient?.cpf.includes(query) ||
      examRequest.examType.toLowerCase().includes(query) ||
      examRequest.description.toLowerCase().includes(query)
    );
  });

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
                <TestTube className="w-8 h-8 mr-3 text-medical-blue" />
                Solicitações de Exames
              </h1>
              <p className="text-text-secondary">
                {filteredExamRequests.length} solicitaç{filteredExamRequests.length !== 1 ? 'ões' : 'ão'} de exame encontrada{filteredExamRequests.length !== 1 ? 's' : ''}
              </p>
            </div>

            <GlassButton
              variant="primary"
              onClick={handleNewExamRequest}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Solicitar Exame</span>
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
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <GlassInput
                placeholder="Buscar por paciente, CPF ou tipo de exame..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="flex-1"
                icon={<Search className="w-4 h-4" />}
              />

              <div className="flex space-x-2">
                <GlassButton
                  variant={filterStatus === 'all' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Todos
                </GlassButton>
                <GlassButton
                  variant={filterStatus === 'requested' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('requested')}
                >
                  Solicitados
                </GlassButton>
                <GlassButton
                  variant={filterStatus === 'scheduled' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('scheduled')}
                >
                  Agendados
                </GlassButton>
                <GlassButton
                  variant={filterStatus === 'completed' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('completed')}
                >
                  Concluídos
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Exam Requests List */}
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
          ) : filteredExamRequests.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <TestTube className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary text-lg">Nenhuma solicitação de exame encontrada</p>
              <GlassButton
                variant="primary"
                onClick={handleNewExamRequest}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Solicitar Primeiro Exame
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredExamRequests.map((examRequest, index) => (
                <motion.div
                  key={examRequest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    variant="interactive"
                    className="p-6 cursor-pointer hover:bg-white/15"
                    onClick={() => handleViewExamRequest(examRequest.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 bg-medical-blue/20 rounded-full flex items-center justify-center">
                            <TestTube className="w-6 h-6 text-medical-blue" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {examRequest.patient?.name || 'Paciente não identificado'}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              CPF: {examRequest.patient?.cpf || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Tipo de Exame</p>
                            <p className="text-white text-sm font-medium">{examRequest.examType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Urgência</p>
                            <p className={`text-sm font-medium ${getUrgencyColor(examRequest.urgency)}`}>
                              {getUrgencyLabel(examRequest.urgency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Status</p>
                            <div className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(examRequest.status)}`}>
                              {getStatusLabel(examRequest.status)}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Solicitado em</p>
                            <p className="text-white text-sm">
                              {new Date(examRequest.requestedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {examRequest.scheduledFor && (
                            <div className="flex items-center space-x-1 text-text-secondary text-sm">
                              <Clock className="w-4 h-4" />
                              <span>
                                Agendado: {new Date(examRequest.scheduledFor).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewExamRequest(examRequest.id);
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </GlassButton>
              <span className="text-white px-4">
                Página {page} de {totalPages}
              </span>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </GlassButton>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ExamRequestPage;


