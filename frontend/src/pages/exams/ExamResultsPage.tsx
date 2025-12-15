import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, TestTube, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { examService, ExamRequest, ExamResult } from '@/services/examService';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const ExamResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDevMode } = useDevMode();
  const [examRequests, setExamRequests] = useState<ExamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  useEffect(() => {
    loadExamResults();
  }, [page, showCriticalOnly]);

  const loadExamResults = async () => {
    try {
      setLoading(true);

      if (showCriticalOnly) {
        const criticalResults = await examService.getCriticalResults();
        setExamRequests(criticalResults || []);
        setTotalPages(1);
      } else {
        const data = await examService.searchExamRequests({
          status: 'completed',
          page,
          limit: 20,
          sortBy: 'completedAt',
          sortOrder: 'desc'
        });
        setExamRequests(data.examRequests || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error: any) {
      console.error('Erro ao carregar resultados de exame:', error);
      toast.error(error?.message || 'Erro ao carregar resultados de exame');
    } finally {
      setLoading(false);
    }
  };

  const handleViewExamDetail = (id: string) => {
    navigate(`/dev/exams/${id}`);
  };

  const getResultStatusColor = (status?: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-400';
      case 'abnormal':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getResultStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      normal: 'Normal',
      abnormal: 'Alterado',
      critical: 'Crítico'
    };
    return labels[status || ''] || 'Não informado';
  };

  const getResultStatusIcon = (status?: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4" />;
      case 'abnormal':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredExamRequests = examRequests.filter(examRequest => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      examRequest.patient?.name.toLowerCase().includes(query) ||
      examRequest.patient?.cpf.includes(query) ||
      examRequest.examType.toLowerCase().includes(query) ||
      (examRequest.results && examRequest.results.some(result =>
        result.parameter.toLowerCase().includes(query)
      ))
    );
  });

  const hasCriticalResults = (results?: ExamResult[]) => {
    return results?.some(result => result.status === 'critical') || false;
  };

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
                <FileText className="w-8 h-8 mr-3 text-medical-green" />
                Resultados de Exames
              </h1>
              <p className="text-text-secondary">
                {filteredExamRequests.length} resultado{filteredExamRequests.length !== 1 ? 's' : ''} de exame encontrado{filteredExamRequests.length !== 1 ? 's' : ''}
                {showCriticalOnly && ' (apenas críticos)'}
              </p>
            </div>
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
                placeholder="Buscar por paciente, CPF, exame ou parâmetro..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="flex-1"
                icon={<Search className="w-4 h-4" />}
              />

              <div className="flex space-x-2">
                <GlassButton
                  variant={!showCriticalOnly ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setShowCriticalOnly(false);
                    setPage(1);
                  }}
                >
                  Todos os Resultados
                </GlassButton>
                <GlassButton
                  variant={showCriticalOnly ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setShowCriticalOnly(true);
                    setPage(1);
                  }}
                >
                  Apenas Críticos
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Results List */}
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
              <FileText className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary text-lg">
                {showCriticalOnly ? 'Nenhum resultado crítico encontrado' : 'Nenhum resultado de exame encontrado'}
              </p>
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
                    className={`p-6 cursor-pointer hover:bg-white/15 ${
                      hasCriticalResults(examRequest.results) ? 'ring-2 ring-red-400/50' : ''
                    }`}
                    onClick={() => handleViewExamDetail(examRequest.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            hasCriticalResults(examRequest.results)
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-medical-green/20 text-medical-green'
                          }`}>
                            <TestTube className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {examRequest.patient?.name || 'Paciente não identificado'}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              CPF: {examRequest.patient?.cpf || 'N/A'}
                            </p>
                          </div>
                          {hasCriticalResults(examRequest.results) && (
                            <div className="bg-red-500/20 border border-red-400/50 rounded-lg px-3 py-1">
                              <p className="text-red-400 text-sm font-medium">RESULTADO CRÍTICO</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Tipo de Exame</p>
                            <p className="text-white text-sm font-medium">{examRequest.examType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Realizado em</p>
                            <p className="text-white text-sm">
                              {examRequest.completedAt ? new Date(examRequest.completedAt).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Técnico</p>
                            <p className="text-white text-sm">{examRequest.technician || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Results Preview */}
                        {examRequest.results && examRequest.results.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-text-secondary mb-2">Principais Resultados:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {examRequest.results.slice(0, 4).map((result, resultIndex) => (
                                <div key={resultIndex} className="flex items-center space-x-2">
                                  {getResultStatusIcon(result.status)}
                                  <div className="flex-1">
                                    <p className="text-white text-sm font-medium">{result.parameter}</p>
                                    <p className="text-text-secondary text-xs">
                                      {result.value} {result.unit} {result.referenceRange && `(${result.referenceRange})`}
                                    </p>
                                  </div>
                                  <span className={`text-xs font-medium ${getResultStatusColor(result.status)}`}>
                                    {getResultStatusLabel(result.status)}
                                  </span>
                                </div>
                              ))}
                              {examRequest.results.length > 4 && (
                                <p className="text-text-secondary text-sm">
                                  +{examRequest.results.length - 4} resultado{examRequest.results.length - 4 !== 1 ? 's' : ''} adicional{examRequest.results.length - 4 !== 1 ? 'is' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-text-secondary text-sm">
                            <Clock className="w-4 h-4" />
                            <span>
                              Concluído: {examRequest.completedAt ? new Date(examRequest.completedAt).toLocaleString('pt-BR') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewExamDetail(examRequest.id);
                          }}
                        >
                          Ver Detalhes Completos
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!showCriticalOnly && totalPages > 1 && (
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

export default ExamResultsPage;


