import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Search, User, TestTube, AlertTriangle, FileText, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassTextarea from '@/components/ui/GlassTextarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { examService, ExamCreateData } from '@/services/examService';
import { patientService, Patient } from '@/services/patientService';

interface ExamRequestFormProps {
  attendanceId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ExamRequestForm: React.FC<ExamRequestFormProps> = ({
  attendanceId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Patient selection
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Exam data
  const [examData, setExamData] = useState<ExamCreateData>({
    patientId: '',
    attendanceId,
    examType: '',
    description: '',
    urgency: 'routine',
    clinicalData: '',
    instructions: ''
  });

  // Available exam types
  const [examTypes] = useState([
    { value: 'hemograma', label: 'Hemograma Completo' },
    { value: 'glicemia', label: 'Glicemia' },
    { value: 'colesterol', label: 'Colesterol Total' },
    { value: 'triglicerides', label: 'Triglicerídeos' },
    { value: 'hdl', label: 'HDL (Colesterol Bom)' },
    { value: 'ldl', label: 'LDL (Colesterol Ruim)' },
    { value: 'creatinina', label: 'Creatinina' },
    { value: 'ureia', label: 'Ureia' },
    { value: 'tsg', label: 'TSG (Taxa de Sedimentação Globular)' },
    { value: 'pcr', label: 'PCR (Proteína C Reativa)' },
    { value: 'tgo', label: 'TGO (Transaminase Glutâmico Oxalacética)' },
    { value: 'tgp', label: 'TGP (Transaminase Glutâmico Pirúvica)' },
    { value: 'urina', label: 'Urina Tipo I' },
    { value: 'eas', label: 'EAS (Elementos Anômalos do Sedimento)' },
    { value: 'ecg', label: 'Eletrocardiograma (ECG)' },
    { value: 'rx_torax', label: 'Raio-X de Tórax' },
    { value: 'ultrassom_abdominal', label: 'Ultrassom Abdominal' },
    { value: 'mamografia', label: 'Mamografia' },
    { value: 'doppler_arterial', label: 'Doppler Arterial de MMII' },
    { value: 'eco_cardiograma', label: 'Ecocardiograma' },
    { value: 'endoscopia', label: 'Endoscopia Digestiva' },
    { value: 'colonoscopia', label: 'Colonoscopia' },
    { value: 'teste_ergo', label: 'Teste Ergométrico' },
    { value: 'holter', label: 'Monitorização Holter' },
    { value: 'mapa', label: 'MAPA (Monitorização Ambulatorial da Pressão Arterial)' },
    { value: 'densitometria', label: 'Densitometria Óssea' },
    { value: 'papanicolau', label: 'Exame Citopatológico (Papanicolau)' },
    { value: 'cultura', label: 'Cultura e Antibiograma' },
    { value: 'teste_gravidez', label: 'Teste de Gravidez' },
    { value: 'vdrl', label: 'VDRL' },
    { value: 'hiv', label: 'HIV' },
    { value: 'hepatite_b', label: 'Hepatite B' },
    { value: 'hepatite_c', label: 'Hepatite C' },
    // Modalidades de imagem adicionais
    { value: 'rx_abdomen', label: 'Raio-X de Abdome' },
    { value: 'rx_coluna_lombar', label: 'Raio-X de Coluna Lombar' },
    { value: 'rx_membros_superiores', label: 'Raio-X de Membros Superiores' },
    { value: 'rx_membros_inferiores', label: 'Raio-X de Membros Inferiores' },
    { value: 'tomografia_cranio', label: 'Tomografia Computadorizada de Crânio' },
    { value: 'tomografia_torax', label: 'Tomografia Computadorizada de Tórax' },
    { value: 'tomografia_abdome_pelve', label: 'Tomografia Computadorizada de Abdome/Pelve' },
    { value: 'ressonancia_cranio', label: 'Ressonância Magnética de Crânio' },
    { value: 'ressonancia_coluna', label: 'Ressonância Magnética de Coluna' },
    { value: 'ressonancia_joelho', label: 'Ressonância Magnética de Joelho' },
    { value: 'ultrassom_pelve', label: 'Ultrassom de Pelve' },
    { value: 'ultrassom_tireoide', label: 'Ultrassom de Tireoide' },
    { value: 'ultrassom_obstetrico', label: 'Ultrassom Obstétrico' },
    { value: 'doppler_venoso_mmii', label: 'Doppler Venoso de MMII' },
    { value: 'doppler_carotidas', label: 'Doppler de Carótidas' },
    { value: 'outros', label: 'Outros (especificar na descrição)' }
  ]);

  // Search patients when typing
  useEffect(() => {
    if (patientSearch.length >= 3) {
      searchPatients();
    } else {
      setPatients([]);
    }
  }, [patientSearch]);

  const searchPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await patientService.searchPatients({
        query: patientSearch,
        limit: 10
      });
      setPatients(response.patients || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setExamData(prev => ({ ...prev, patientId: patient.id }));
    setPatientSearch(patient.name);
    setPatients([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!examData.patientId) {
      toast.error('Selecione um paciente');
      return;
    }

    if (!examData.examType) {
      toast.error('Selecione o tipo de exame');
      return;
    }

    if (!examData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    try {
      setLoading(true);
      await examService.createExamRequest(examData);

      toast.success('Solicitação de exame criada com sucesso!');

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dev/exams');
      }
    } catch (error: any) {
      console.error('Erro ao criar solicitação de exame:', error);
      toast.error(error?.message || 'Erro ao criar solicitação de exame');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/dev/exams');
    }
  };

  const selectedExamTypeLabel = examTypes.find(type => type.value === examData.examType)?.label || examData.examType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <TestTube className="w-6 h-6 mr-3 text-medical-blue" />
              Solicitar Exame
            </h2>
            <GlassButton
              variant="ghost"
              onClick={handleCancel}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </GlassButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Selection */}
            <div className="lg:col-span-2">
              <div className="relative">
                <label className="block text-sm font-medium text-white mb-2">
                  Paciente *
                </label>
                <GlassInput
                  placeholder="Digite o nome ou CPF do paciente..."
                  value={patientSearch}
                  onChange={setPatientSearch}
                  icon={<Search className="w-4 h-4" />}
                  className="mb-2"
                />

                {/* Patient dropdown */}
                {patients.length > 0 && (
                  <GlassCard className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 text-medical-blue" />
                          <div>
                            <p className="text-white font-medium">{patient.name}</p>
                            <p className="text-text-secondary text-sm">
                              CPF: {patient.cpf} | {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </GlassCard>
                )}

                {/* Selected patient info */}
                {selectedPatient && (
                  <GlassCard className="mt-2 p-4 bg-medical-blue/10 border-medical-blue/30">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-medical-blue" />
                      <div>
                        <p className="text-white font-medium">{selectedPatient.name}</p>
                        <p className="text-text-secondary text-sm">
                          CPF: {selectedPatient.cpf} | Nascimento: {selectedPatient.birthDate ? new Date(selectedPatient.birthDate).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                )}

                {loadingPatients && (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner size="sm" />
                    <span className="text-text-secondary ml-2">Buscando pacientes...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tipo de Exame *
              </label>
              <GlassSelect
                value={examData.examType}
                onChange={(value) => setExamData(prev => ({ ...prev, examType: value }))}
                options={examTypes}
                placeholder="Selecione o tipo de exame"
              />
              {examData.examType === 'outros' && (
                <GlassInput
                  placeholder="Especifique o tipo de exame"
                  value={selectedExamTypeLabel}
                  onChange={(value) => setExamData(prev => ({ ...prev, examType: value }))}
                  className="mt-2"
                />
              )}
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Urgência *
              </label>
              <GlassSelect
                value={examData.urgency}
                onChange={(value) => setExamData(prev => ({ ...prev, urgency: value }))}
                options={[
                  { value: 'routine', label: 'Rotina' },
                  { value: 'urgent', label: 'Urgente' },
                  { value: 'emergency', label: 'Emergência' }
                ]}
              />
              {examData.urgency === 'emergency' && (
                <div className="mt-2 p-3 bg-red-500/20 border border-red-400/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <p className="text-red-400 text-sm font-medium">
                      Exame de emergência - será priorizado no laboratório
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Descrição/Justificativa *
              </label>
              <GlassTextarea
                placeholder="Descreva o motivo da solicitação do exame, sintomas, diagnóstico suspeito..."
                value={examData.description}
                onChange={(value) => setExamData(prev => ({ ...prev, description: value }))}
                rows={4}
              />
            </div>

            {/* Clinical Data */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Dados Clínicos Relevantes
              </label>
              <GlassTextarea
                placeholder="Informações clínicas adicionais, medicações em uso, histórico relevante..."
                value={examData.clinicalData}
                onChange={(value) => setExamData(prev => ({ ...prev, clinicalData: value }))}
                rows={3}
              />
            </div>

            {/* Instructions */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Orientações Especiais
              </label>
              <GlassTextarea
                placeholder="Orientações especiais para o paciente ou laboratório (jejum, horário específico, etc.)"
                value={examData.instructions}
                onChange={(value) => setExamData(prev => ({ ...prev, instructions: value }))}
                rows={3}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-white/10">
            <GlassButton
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </GlassButton>
            <GlassButton
              variant="primary"
              type="submit"
              disabled={loading || !examData.patientId || !examData.examType || !examData.description.trim()}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Solicitar Exame</span>
            </GlassButton>
          </div>
        </GlassCard>
      </form>
    </motion.div>
  );
};

export default ExamRequestForm;

