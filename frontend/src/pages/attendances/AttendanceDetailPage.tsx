import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, CheckCircle, XCircle, Clock, User, Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AttendanceSOAPForm } from '@/components/attendances/AttendanceSOAPForm';
import { attendanceService, Attendance } from '@/services/attendanceService';

export const AttendanceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSOAPForm, setShowSOAPForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadAttendance();
    }
  }, [id]);

  const loadAttendance = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await attendanceService.getAttendanceById(id);
      setAttendance(data);
    } catch (error: any) {
      console.error('Erro ao carregar atendimento:', error);
      toast.error(error?.message || 'Erro ao carregar atendimento');
      navigate('/dev/attendances');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSOAP = async (soapData: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  }) => {
    if (!id) return;

    try {
      setSaving(true);
      
      if (attendance?.status === 'in_progress') {
        await attendanceService.completeAttendance(id, soapData);
        toast.success('Atendimento finalizado com sucesso!');
      } else {
        await attendanceService.updateAttendance(id, soapData);
        toast.success('Prontuário atualizado com sucesso!');
      }
      
      loadAttendance();
      setShowSOAPForm(false);
    } catch (error: any) {
      if (isDevMode) {
        toast.success('Prontuário salvo (modo dev - simulado)');
        loadAttendance();
        setShowSOAPForm(false);
      } else {
        toast.error(error?.message || 'Erro ao salvar prontuário');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteAttendance = async () => {
    if (!id || !attendance) return;

    if (!attendance.subjective || !attendance.objective) {
      toast.error('Preencha ao menos os campos Subjetivo e Objetivo do prontuário SOAP');
      setShowSOAPForm(true);
      return;
    }

    await handleSaveSOAP({
      subjective: attendance.subjective,
      objective: attendance.objective,
      assessment: attendance.assessment,
      plan: attendance.plan
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <p className="text-text-secondary">Atendimento não encontrado</p>
          <GlassButton variant="primary" onClick={() => navigate('/dev/attendances')} className="mt-4">
            Voltar
          </GlassButton>
        </GlassCard>
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
          <div className="flex items-center space-x-4 mb-4">
            <GlassButton
              variant="ghost"
              onClick={() => navigate('/dev/attendances')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </GlassButton>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Stethoscope className="w-8 h-8 mr-3 text-medical-blue" />
                Detalhes do Atendimento
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(attendance.status)}`}>
                  {getStatusLabel(attendance.status)}
                </div>
                <span className="text-text-secondary">{getTypeLabel(attendance.type)}</span>
              </div>
            </div>

            {attendance.status === 'in_progress' && (
              <GlassButton
                variant="primary"
                onClick={handleCompleteAttendance}
                loading={saving}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finalizar Atendimento</span>
              </GlassButton>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações do Paciente */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-medical-blue" />
                Informações do Paciente
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Nome</p>
                  <p className="text-white font-medium">{attendance.patient?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">CPF</p>
                  <p className="text-white">{attendance.patient?.cpf || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Data de Nascimento</p>
                  <p className="text-white">
                    {attendance.patient?.birthDate 
                      ? new Date(attendance.patient.birthDate).toLocaleDateString('pt-BR')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Sexo</p>
                  <p className="text-white">
                    {attendance.patient?.gender === 'male' ? 'Masculino' : 
                     attendance.patient?.gender === 'female' ? 'Feminino' : 'Outro'}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Informações do Atendimento */}
            <GlassCard className="p-6 mt-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-medical-green" />
                Informações do Atendimento
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Profissional</p>
                  <p className="text-white font-medium">{attendance.professional?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Estabelecimento</p>
                  <p className="text-white">{attendance.establishment?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Início</p>
                  <p className="text-white">
                    {new Date(attendance.startTime).toLocaleString('pt-BR')}
                  </p>
                </div>
                {attendance.endTime && (
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Fim</p>
                    <p className="text-white">
                      {new Date(attendance.endTime).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-text-secondary mb-1">Queixa Principal</p>
                  <p className="text-white">{attendance.chiefComplaint}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Prontuário SOAP */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {showSOAPForm || (!attendance.subjective && attendance.status === 'in_progress') ? (
              <AttendanceSOAPForm
                initialData={{
                  subjective: attendance.subjective,
                  objective: attendance.objective,
                  assessment: attendance.assessment,
                  plan: attendance.plan
                }}
                onSubmit={handleSaveSOAP}
                onCancel={() => setShowSOAPForm(false)}
                loading={saving}
              />
            ) : (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2 text-medical-blue" />
                    Prontuário SOAP
                  </h2>
                  
                  {attendance.status === 'in_progress' && (
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSOAPForm(true)}
                    >
                      Editar
                    </GlassButton>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Subjetivo */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      <span className="text-medical-blue font-bold">S</span> - Subjetivo
                    </label>
                    {attendance.subjective ? (
                      <p className="text-white bg-white/5 p-4 rounded-lg whitespace-pre-wrap">
                        {attendance.subjective}
                      </p>
                    ) : (
                      <p className="text-text-secondary italic">Não preenchido</p>
                    )}
                  </div>

                  {/* Objetivo */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      <span className="text-medical-green font-bold">O</span> - Objetivo
                    </label>
                    {attendance.objective ? (
                      <p className="text-white bg-white/5 p-4 rounded-lg whitespace-pre-wrap">
                        {attendance.objective}
                      </p>
                    ) : (
                      <p className="text-text-secondary italic">Não preenchido</p>
                    )}
                  </div>

                  {/* Avaliação */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      <span className="text-medical-orange font-bold">A</span> - Avaliação
                    </label>
                    {attendance.assessment ? (
                      <p className="text-white bg-white/5 p-4 rounded-lg whitespace-pre-wrap">
                        {attendance.assessment}
                      </p>
                    ) : (
                      <p className="text-text-secondary italic">Não preenchido</p>
                    )}
                  </div>

                  {/* Plano */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      <span className="text-medical-purple font-bold">P</span> - Plano
                    </label>
                    {attendance.plan ? (
                      <p className="text-white bg-white/5 p-4 rounded-lg whitespace-pre-wrap">
                        {attendance.plan}
                      </p>
                    ) : (
                      <p className="text-text-secondary italic">Não preenchido</p>
                    )}
                  </div>

                  {attendance.status === 'in_progress' && !attendance.subjective && (
                    <GlassButton
                      variant="primary"
                      onClick={() => setShowSOAPForm(true)}
                      className="w-full"
                    >
                      Preencher Prontuário SOAP
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailPage;

