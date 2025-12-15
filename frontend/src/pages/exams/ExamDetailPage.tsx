import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Play,
  CheckCircle,
  XCircle,
  FileText,
  User,
  TestTube,
  Clock,
  AlertTriangle,
  Save,
  Edit
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import GlassTextarea from '@/components/ui/GlassTextarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { examService, ExamRequest, ExamResult } from '@/services/examService';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const ExamDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isDevMode } = useDevMode();

  const [examRequest, setExamRequest] = useState<ExamRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Schedule exam
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');

  // Complete exam
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [observations, setObservations] = useState('');
  const [reportedBy, setReportedBy] = useState('');

  // Cancel exam
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (id) {
      loadExamRequest();
    }
  }, [id]);

  const loadExamRequest = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await examService.getExamRequestById(id);
      setExamRequest(data);
    } catch (error: any) {
      console.error('Erro ao carregar solicitação de exame:', error);
      toast.error(error?.message || 'Erro ao carregar solicitação de exame');
      navigate('/dev/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleExam = async () => {
    if (!scheduledFor || !examRequest) return;

    try {
      setActionLoading(true);
      const updatedExam = await examService.scheduleExam(examRequest.id, scheduledFor);
      setExamRequest(updatedExam);
      setShowScheduleForm(false);
      setScheduledFor('');
      toast.success('Exame agendado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao agendar exame:', error);
      toast.error(error?.message || 'Erro ao agendar exame');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!examRequest) return;

    try {
      setActionLoading(true);
      const updatedExam = await examService.startExam(examRequest.id);
      setExamRequest(updatedExam);
      toast.success('Exame iniciado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao iniciar exame:', error);
      toast.error(error?.message || 'Erro ao iniciar exame');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteExam = async () => {
    if (!examRequest || results.length === 0) return;

    try {
      setActionLoading(true);
      const updatedExam = await examService.completeExam(examRequest.id, results, observations, reportedBy);
      setExamRequest(updatedExam);
      setShowCompleteForm(false);
      setResults([]);
      setObservations('');
      setReportedBy('');
      toast.success('Exame concluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao completar exame:', error);
      toast.error(error?.message || 'Erro ao completar exame');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelExam = async () => {
    if (!examRequest || !cancelReason.trim()) return;

    try {
      setActionLoading(true);
      const updatedExam = await examService.cancelExam(examRequest.id, cancelReason);
      setExamRequest(updatedExam);
      setShowCancelForm(false);
      setCancelReason('');
      toast.success('Exame cancelado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao cancelar exame:', error);
      toast.error(error?.message || 'Erro ao cancelar exame');
    } finally {
      setActionLoading(false);
    }
  };

  const addResult = () => {
    setResults([...results, {
      parameter: '',
      value: '',
      unit: '',
      referenceRange: '',
      status: 'normal',
      notes: ''
    }]);
  };

  const updateResult = (index: number, field: keyof ExamResult, value: string) => {
    const newResults = [...results];
    newResults[index] = { ...newResults[index], [field]: value };
    setResults(newResults);
  };

  const removeResult = (index: number) => {
    setResults(results.filter((_, i) => i !== index));
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

  if (loading || !examRequest) {
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
          <div className="flex items-center justify-between">
            <GlassButton
              variant="ghost"
              onClick={() => navigate('/dev/exams')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </GlassButton>

            <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(examRequest.status)}`}>
              {examRequest.status === 'requested' && 'Solicitado'}
              {examRequest.status === 'scheduled' && 'Agendado'}
              {examRequest.status === 'in_progress' && 'Em Andamento'}
              {examRequest.status === 'completed' && 'Concluído'}
              {examRequest.status === 'cancelled' && 'Cancelado'}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <TestTube className="w-8 h-8 mr-3 text-medical-blue" />
              Detalhes do Exame
            </h1>
            <p className="text-text-secondary">
              Solicitação #{examRequest.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Informações do Exame</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Tipo de Exame</p>
                  <p className="text-white font-medium">{examRequest.examType}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Urgência</p>
                  <p className={`font-medium ${
                    examRequest.urgency === 'emergency' ? 'text-red-400' :
                    examRequest.urgency === 'urgent' ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    {examRequest.urgency === 'emergency' && 'Emergência'}
                    {examRequest.urgency === 'urgent' && 'Urgente'}
                    {examRequest.urgency === 'routine' && 'Rotina'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Solicitado em</p>
                  <p className="text-white">{new Date(examRequest.requestedAt).toLocaleString('pt-BR')}</p>
                </div>
                {examRequest.scheduledFor && (
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Agendado para</p>
                    <p className="text-white">{new Date(examRequest.scheduledFor).toLocaleString('pt-BR')}</p>
                  </div>
                )}
                {examRequest.completedAt && (
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Concluído em</p>
                    <p className="text-white">{new Date(examRequest.completedAt).toLocaleString('pt-BR')}</p>
                  </div>
                )}
                {examRequest.technician && (
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Técnico Responsável</p>
                    <p className="text-white">{examRequest.technician}</p>
                  </div>
                )}
                {examRequest.reportedBy && (
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Laudado por</p>
                    <p className="text-white">{examRequest.reportedBy}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-text-secondary mb-2">Descrição/Justificativa</p>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{examRequest.description}</p>
                </div>

                {examRequest.clinicalData && (
                  <div>
                    <p className="text-sm text-text-secondary mb-2">Dados Clínicos</p>
                    <p className="text-white bg-white/5 p-3 rounded-lg">{examRequest.clinicalData}</p>
                  </div>
                )}

                {examRequest.instructions && (
                  <div>
                    <p className="text-sm text-text-secondary mb-2">Orientações</p>
                    <p className="text-white bg-white/5 p-3 rounded-lg">{examRequest.instructions}</p>
                  </div>
                )}

                {examRequest.observations && (
                  <div>
                    <p className="text-sm text-text-secondary mb-2">Observações do Laudo</p>
                    <p className="text-white bg-white/5 p-3 rounded-lg">{examRequest.observations}</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Results */}
            {examRequest.results && examRequest.results.length > 0 && (
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Resultados</h2>

                <div className="space-y-4">
                  {examRequest.results.map((result, index) => (
                    <div key={index} className="bg-white/5 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-text-secondary mb-1">Parâmetro</p>
                          <p className="text-white font-medium">{result.parameter}</p>
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary mb-1">Valor</p>
                          <p className="text-white font-medium">
                            {result.value} {result.unit}
                            {result.referenceRange && (
                              <span className="text-text-secondary ml-2">
                                (Ref: {result.referenceRange})
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-text-secondary mb-1">Status</p>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getResultStatusColor(result.status)}`}>
                              {result.status === 'normal' && 'Normal'}
                              {result.status === 'abnormal' && 'Alterado'}
                              {result.status === 'critical' && 'Crítico'}
                            </span>
                            {result.status === 'critical' && (
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        </div>
                        {result.notes && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-text-secondary mb-1">Observações</p>
                            <p className="text-white">{result.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Info */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Paciente
              </h3>

              {examRequest.patient && (
                <div>
                  <p className="text-white font-medium">{examRequest.patient.name}</p>
                  <p className="text-text-secondary text-sm">CPF: {examRequest.patient.cpf}</p>
                  <p className="text-text-secondary text-sm">
                    Nascimento: {new Date(examRequest.patient.birthDate).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-text-secondary text-sm capitalize">
                    Sexo: {examRequest.patient.gender}
                  </p>
                </div>
              )}

              {examRequest.attendance && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-white mb-2">Atendimento Relacionado</h4>
                  <p className="text-text-secondary text-sm">{examRequest.attendance.chiefComplaint}</p>
                  <p className="text-text-secondary text-xs mt-1">
                    Profissional: {examRequest.attendance.professional.name}
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Actions */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Ações</h3>

              <div className="space-y-3">
                {examRequest.status === 'requested' && (
                  <>
                    <GlassButton
                      variant="primary"
                      onClick={() => setShowScheduleForm(true)}
                      className="w-full flex items-center justify-center space-x-2"
                      disabled={actionLoading}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Agendar Exame</span>
                    </GlassButton>

                    <GlassButton
                      variant="secondary"
                      onClick={handleStartExam}
                      className="w-full flex items-center justify-center space-x-2"
                      disabled={actionLoading}
                    >
                      {actionLoading ? <LoadingSpinner size="sm" /> : <Play className="w-4 h-4" />}
                      <span>Iniciar Exame</span>
                    </GlassButton>
                  </>
                )}

                {examRequest.status === 'scheduled' && (
                  <GlassButton
                    variant="secondary"
                    onClick={handleStartExam}
                    className="w-full flex items-center justify-center space-x-2"
                    disabled={actionLoading}
                  >
                    {actionLoading ? <LoadingSpinner size="sm" /> : <Play className="w-4 h-4" />}
                    <span>Iniciar Exame</span>
                  </GlassButton>
                )}

                {examRequest.status === 'in_progress' && (
                  <GlassButton
                    variant="primary"
                    onClick={() => setShowCompleteForm(true)}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Completar Exame</span>
                  </GlassButton>
                )}

                {(examRequest.status === 'requested' || examRequest.status === 'scheduled') && (
                  <GlassButton
                    variant="danger"
                    onClick={() => setShowCancelForm(true)}
                    className="w-full flex items-center justify-center space-x-2"
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancelar Exame</span>
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Schedule Form Modal */}
        {showScheduleForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Agendar Exame</h3>

              <div className="space-y-4">
                <GlassInput
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={setScheduledFor}
                  label="Data e hora do agendamento"
                  required
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <GlassButton
                  variant="ghost"
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={handleScheduleExam}
                  className="flex-1"
                  disabled={!scheduledFor || actionLoading}
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : <Calendar className="w-4 h-4 mr-2" />}
                  Agendar
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Complete Form Modal */}
        {showCompleteForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <GlassCard className="w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Completar Exame - Resultados</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-medium">Resultados</h4>
                  <GlassButton variant="secondary" size="sm" onClick={addResult}>
                    Adicionar Resultado
                  </GlassButton>
                </div>

                {results.map((result, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-white font-medium">Resultado {index + 1}</h5>
                      <GlassButton
                        variant="danger"
                        size="sm"
                        onClick={() => removeResult(index)}
                      >
                        Remover
                      </GlassButton>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <GlassInput
                        placeholder="Parâmetro (ex: Hemoglobina)"
                        value={result.parameter}
                        onChange={(value) => updateResult(index, 'parameter', value)}
                        label="Parâmetro"
                      />
                      <GlassInput
                        placeholder="Valor (ex: 14.2)"
                        value={result.value}
                        onChange={(value) => updateResult(index, 'value', value)}
                        label="Valor"
                      />
                      <GlassInput
                        placeholder="Unidade (ex: g/dL)"
                        value={result.unit || ''}
                        onChange={(value) => updateResult(index, 'unit', value)}
                        label="Unidade"
                      />
                      <GlassInput
                        placeholder="Valores de referência (ex: 12-16 g/dL)"
                        value={result.referenceRange || ''}
                        onChange={(value) => updateResult(index, 'referenceRange', value)}
                        label="Referência"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Status</label>
                        <select
                          value={result.status || 'normal'}
                          onChange={(e) => updateResult(index, 'status', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-medical-blue"
                        >
                          <option value="normal">Normal</option>
                          <option value="abnormal">Alterado</option>
                          <option value="critical">Crítico</option>
                        </select>
                      </div>
                      <GlassInput
                        placeholder="Observações específicas"
                        value={result.notes || ''}
                        onChange={(value) => updateResult(index, 'notes', value)}
                        label="Observações"
                      />
                    </div>
                  </div>
                ))}

                <GlassTextarea
                  label="Observações Gerais do Laudo"
                  placeholder="Observações gerais sobre o exame..."
                  value={observations}
                  onChange={setObservations}
                  rows={3}
                />

                <GlassInput
                  label="Laudado por"
                  placeholder="Nome do profissional responsável pelo laudo"
                  value={reportedBy}
                  onChange={setReportedBy}
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <GlassButton
                  variant="ghost"
                  onClick={() => setShowCompleteForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={handleCompleteExam}
                  className="flex-1"
                  disabled={results.length === 0 || actionLoading}
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Completar Exame
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Cancel Form Modal */}
        {showCancelForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Cancelar Exame</h3>

              <div className="space-y-4">
                <GlassTextarea
                  label="Motivo do cancelamento"
                  placeholder="Explique o motivo do cancelamento..."
                  value={cancelReason}
                  onChange={setCancelReason}
                  rows={3}
                  required
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <GlassButton
                  variant="ghost"
                  onClick={() => setShowCancelForm(false)}
                  className="flex-1"
                >
                  Voltar
                </GlassButton>
                <GlassButton
                  variant="danger"
                  onClick={handleCancelExam}
                  className="flex-1"
                  disabled={!cancelReason.trim() || actionLoading}
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Cancelar Exame
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDetailPage;


