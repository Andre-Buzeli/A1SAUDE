import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, FileText, Pill, TestTube, FileCheck, ArrowLeft, Save, Play } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import GlassTextarea from '@/components/ui/GlassTextarea';
import GlassModal from '@/components/ui/GlassModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProfessionalFields, useRequiredFields } from '@/hooks/useProfessionalFields';
import ProfessionalFieldsRenderer from '@/components/prontuario/ProfessionalFieldsRenderer';
import CID10Select from '@/components/medical/CID10Select';
import MedicationSelect from '@/components/medical/MedicationSelect';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  gender: string;
  bloodType?: string;
  allergies?: string;
  phone?: string;
}

interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

interface SOAPForm {
  subjective: {
    chiefComplaint: string;
    currentIllnessHistory: string;
    pastMedicalHistory: string;
    medicationsInUse: string;
  };
  objective: {
    vitalSigns: VitalSigns;
    physicalExam: string;
  };
  assessment: {
    diagnosticHypothesis: string;
    cidCodes: string[];
  };
  plan: {
    conduct: string;
    prescriptions: Prescription[];
    requestedExams: ExamRequest[];
    referrals: string[];
  };
  professionalFields: Record<string, any>; // Campos específicos por profissional
}

interface Prescription {
  id: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  observations: string;
}

interface ExamRequest {
  id: string;
  examType: string;
  region: string;
  urgency: string;
  clinicalIndication: string;
}

const tabs = [
  { id: 'history', label: 'Histórico', icon: FileText },
  { id: 'evolution', label: 'Evolução', icon: User },
  { id: 'prescription', label: 'Prescrição', icon: Pill },
  { id: 'exams', label: 'Exames', icon: TestTube },
  { id: 'documents', label: 'Documentos', icon: FileCheck }
];

const ProntuarioPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('evolution');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // SOAP Form State
  const [soapForm, setSoapForm] = useState<SOAPForm>({
    subjective: {
      chiefComplaint: '',
      currentIllnessHistory: '',
      pastMedicalHistory: '',
      medicationsInUse: ''
    },
    objective: {
      vitalSigns: {},
      physicalExam: ''
    },
    assessment: {
      diagnosticHypothesis: '',
      cidCodes: []
    },
    plan: {
      conduct: '',
      prescriptions: [],
      requestedExams: [],
      referrals: []
    },
    professionalFields: {}
  });

  // Modal states
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      const response = await fetch(`/api/v1/patients/${patientId}`);
      const result = await response.json();
      if (result.success) {
        setPatient(result.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do paciente');
    } finally {
      setLoading(false);
    }
  };

  const validateRequiredFields = () => {
    if (!user?.profile) return true;

    const requiredFields = useRequiredFields(user.profile);
    const errors: string[] = [];

    for (const field of requiredFields) {
      const fieldId = `${field.id.split('_')[0]}_${field.id}`; // groupId_fieldId
      const value = soapForm.professionalFields[fieldId];

      if (!value || value.toString().trim() === '') {
        errors.push(field.label);
      }
    }

    if (errors.length > 0) {
      toast.error(`Campos obrigatórios não preenchidos: ${errors.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSaveEvolution = async () => {
    // Validar campos obrigatórios específicos do profissional
    if (!validateRequiredFields()) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/v1/medical-records/evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          ...soapForm,
          professionalId: user?.id,
          professionalName: user?.name,
          professionalProfile: user?.profile
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Evolução salva com sucesso!');
        // Reset form for new evolution
        setSoapForm({
          subjective: {
            chiefComplaint: '',
            currentIllnessHistory: '',
            pastMedicalHistory: '',
            medicationsInUse: ''
          },
          objective: {
            vitalSigns: {},
            physicalExam: ''
          },
          assessment: {
            diagnosticHypothesis: '',
            cidCodes: []
          },
          plan: {
            conduct: '',
            prescriptions: [],
            requestedExams: [],
            referrals: []
          },
          professionalFields: {}
        });
      } else {
        toast.error(result.error?.message || 'Erro ao salvar evolução');
      }
    } catch (error) {
      toast.error('Erro ao salvar evolução');
    } finally {
      setSaving(false);
    }
  };

  const updateSOAPField = (section: keyof SOAPForm, field: string, value: any) => {
    setSoapForm(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  const updateVitalSigns = (field: keyof VitalSigns, value: any) => {
    setSoapForm(prev => ({
      ...prev,
      objective: {
        ...prev.objective,
        vitalSigns: {
          ...prev.objective.vitalSigns,
          [field]: value
        }
      }
    }));
  };

  const handleProfessionalFieldChange = (fieldId: string, value: any) => {
    setSoapForm(prev => ({
      ...prev,
      professionalFields: {
        ...prev.professionalFields,
        [fieldId]: value
      }
    }));
  };

  const handleFieldValidationError = (fieldId: string, error: string | null) => {
    setSoapForm(prev => ({
      ...prev,
      professionalFields: {
        ...prev.professionalFields,
        [`${fieldId}_error`]: error
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60">Paciente não encontrado</p>
        <GlassButton onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </GlassButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <GlassButton variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </GlassButton>
          <div>
            <h1 className="text-2xl font-bold text-white">Prontuário Eletrônico</h1>
            <p className="text-white/60">Registro médico unificado</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <GlassButton variant="ghost">
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </GlassButton>
          <GlassButton onClick={handleSaveEvolution} disabled={saving}>
            <Play className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Finalizar Atendimento'}
          </GlassButton>
        </div>
      </div>

      {/* Patient Header */}
      <GlassCard className="p-6">
        <div className="flex items-start space-x-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white/60" />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{patient.name}</h3>
              <p className="text-white/60">CPF: {patient.cpf}</p>
              <p className="text-white/60">Idade: {new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} anos</p>
            </div>
            <div>
              <p className="text-white/60">Sexo: {patient.gender}</p>
              {patient.bloodType && <p className="text-white/60">Tipo Sanguíneo: {patient.bloodType}</p>}
              {patient.phone && <p className="text-white/60">Telefone: {patient.phone}</p>}
            </div>
            <div>
              {patient.allergies && (
                <p className="text-white/60">
                  <span className="text-red-400 font-medium">Alergias:</span> {patient.allergies}
                </p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Navigation Tabs */}
      <GlassCard className="p-0">
        <div className="flex border-b border-white/10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-medical-blue text-medical-blue'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'evolution' && (
            <div className="space-y-8">
              {/* S - Subjetivo */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded mr-3">S</span>
                  Subjetivo
                </h3>
                <div className="space-y-4">
                  <GlassTextarea
                    label="Queixa Principal"
                    value={soapForm.subjective.chiefComplaint}
                    onChange={(value) => updateSOAPField('subjective', 'chiefComplaint', value)}
                    placeholder="Descreva a queixa principal do paciente..."
                    rows={3}
                  />
                  <GlassTextarea
                    label="História da Doença Atual (HDA)"
                    value={soapForm.subjective.currentIllnessHistory}
                    onChange={(value) => updateSOAPField('subjective', 'currentIllnessHistory', value)}
                    placeholder="Detalhes sobre o início, evolução e características da doença..."
                    rows={4}
                  />
                  <GlassTextarea
                    label="História Médica Pregressa (HMP)"
                    value={soapForm.subjective.pastMedicalHistory}
                    onChange={(value) => updateSOAPField('subjective', 'pastMedicalHistory', value)}
                    placeholder="Doenças anteriores, cirurgias, internações..."
                    rows={3}
                  />
                  <GlassTextarea
                    label="Medicamentos em Uso"
                    value={soapForm.subjective.medicationsInUse}
                    onChange={(value) => updateSOAPField('subjective', 'medicationsInUse', value)}
                    placeholder="Liste os medicamentos que o paciente está usando..."
                    rows={2}
                  />
                </div>
              </div>

              {/* O - Objetivo */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="bg-green-500 text-white text-sm px-2 py-1 rounded mr-3">O</span>
                  Objetivo
                </h3>
                <div className="space-y-4">
                  {/* Sinais Vitais */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Sinais Vitais</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <GlassInput
                        label="Pressão Arterial"
                        value={soapForm.objective.vitalSigns.bloodPressure || ''}
                        onChange={(value) => updateVitalSigns('bloodPressure', value)}
                        placeholder="120/80"
                      />
                      <GlassInput
                        label="Frequência Cardíaca"
                        type="number"
                        value={soapForm.objective.vitalSigns.heartRate || ''}
                        onChange={(value) => updateVitalSigns('heartRate', Number(value))}
                        placeholder="72"
                      />
                      <GlassInput
                        label="Frequência Respiratória"
                        type="number"
                        value={soapForm.objective.vitalSigns.respiratoryRate || ''}
                        onChange={(value) => updateVitalSigns('respiratoryRate', Number(value))}
                        placeholder="16"
                      />
                      <GlassInput
                        label="Temperatura (°C)"
                        type="number"
                        step="0.1"
                        value={soapForm.objective.vitalSigns.temperature || ''}
                        onChange={(value) => updateVitalSigns('temperature', Number(value))}
                        placeholder="36.5"
                      />
                      <GlassInput
                        label="Saturação O2 (%)"
                        type="number"
                        value={soapForm.objective.vitalSigns.oxygenSaturation || ''}
                        onChange={(value) => updateVitalSigns('oxygenSaturation', Number(value))}
                        placeholder="98"
                      />
                      <GlassInput
                        label="Peso (kg)"
                        type="number"
                        step="0.1"
                        value={soapForm.objective.vitalSigns.weight || ''}
                        onChange={(value) => updateVitalSigns('weight', Number(value))}
                        placeholder="70.5"
                      />
                      <GlassInput
                        label="Altura (cm)"
                        type="number"
                        value={soapForm.objective.vitalSigns.height || ''}
                        onChange={(value) => updateVitalSigns('height', Number(value))}
                        placeholder="170"
                      />
                    </div>
                  </div>

                  <GlassTextarea
                    label="Exame Físico"
                    value={soapForm.objective.physicalExam}
                    onChange={(value) => updateSOAPField('objective', 'physicalExam', value)}
                    placeholder="Descreva os achados do exame físico..."
                    rows={6}
                  />
                </div>
              </div>

              {/* A - Avaliação */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="bg-yellow-500 text-white text-sm px-2 py-1 rounded mr-3">A</span>
                  Avaliação
                </h3>
                <div className="space-y-4">
                  <GlassTextarea
                    label="Hipótese Diagnóstica"
                    value={soapForm.assessment.diagnosticHypothesis}
                    onChange={(value) => updateSOAPField('assessment', 'diagnosticHypothesis', value)}
                    placeholder="Formule sua hipótese diagnóstica..."
                    rows={3}
                  />
                  <CID10Select
                    value={soapForm.assessment.cidCodes}
                    onChange={(codes) => setSoapForm(prev => ({
                      ...prev,
                      assessment: { ...prev.assessment, cidCodes: codes }
                    }))}
                    label="Códigos CID-10"
                    placeholder="Buscar CID-10 por código ou descrição..."
                    maxItems={5}
                    required
                  />
                </div>
              </div>

              {/* P - Plano */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="bg-purple-500 text-white text-sm px-2 py-1 rounded mr-3">P</span>
                  Plano
                </h3>
                <div className="space-y-4">
                  <GlassTextarea
                    label="Conduta"
                    value={soapForm.plan.conduct}
                    onChange={(value) => updateSOAPField('plan', 'conduct', value)}
                    placeholder="Descreva o plano terapêutico..."
                    rows={4}
                  />

                  <div className="flex space-x-3">
                    <GlassButton
                      variant="outline"
                      onClick={() => setShowPrescriptionModal(true)}
                    >
                      <Pill className="w-4 h-4 mr-2" />
                      Adicionar Prescrição
                    </GlassButton>
                    <GlassButton
                      variant="outline"
                      onClick={() => setShowExamModal(true)}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Solicitar Exame
                    </GlassButton>
                  </div>
                </div>
              </div>

              {/* Campos Específicos por Profissional */}
              {user?.profile && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded mr-3">ESP</span>
                    Campos Específicos - {user.profile.replace('_', ' ').toUpperCase()}
                  </h3>
                  <ProfessionalFieldsRenderer
                    profile={user.profile}
                    formData={soapForm.professionalFields}
                    onFieldChange={handleProfessionalFieldChange}
                    onValidationError={handleFieldValidationError}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Histórico de atendimentos em desenvolvimento</p>
            </div>
          )}

          {activeTab === 'prescription' && (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Histórico de prescrições em desenvolvimento</p>
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="text-center py-8">
              <TestTube className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Solicitações e resultados de exames em desenvolvimento</p>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="text-center py-8">
              <FileCheck className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Documentos e anexos em desenvolvimento</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Prescription Modal */}
      <GlassModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        title="Adicionar Prescrição"
        size="lg"
      >
        <MedicationSelect
          value={soapForm.plan.prescriptions.map(p => ({
            medication: {
              id: p.id,
              name: p.medication,
              genericName: undefined,
              presentation: undefined,
              concentration: undefined
            },
            dose: p.dose,
            unit: 'mg',
            route: p.route,
            frequency: p.frequency,
            duration: p.duration,
            durationUnit: 'dias',
            instructions: p.observations
          }))}
          onChange={(meds) => {
            const prescriptions = meds.map((m, idx) => ({
              id: m.medication.id || `presc-${idx}`,
              medication: m.medication.name,
              dose: m.dose,
              route: m.route,
              frequency: m.frequency,
              duration: m.duration,
              observations: m.instructions || ''
            }));
            setSoapForm(prev => ({
              ...prev,
              plan: { ...prev.plan, prescriptions }
            }));
          }}
          label="Medicamentos"
          placeholder="Buscar medicamento..."
        />
        <div className="flex justify-end mt-4">
          <GlassButton onClick={() => setShowPrescriptionModal(false)}>
            Concluir
          </GlassButton>
        </div>
      </GlassModal>

      {/* Exam Modal - Placeholder for now */}
      <GlassModal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        title="Solicitar Exame"
      >
        <div className="text-center py-8">
          <TestTube className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">Funcionalidade de solicitação de exames em desenvolvimento</p>
        </div>
      </GlassModal>
    </div>
  );
};

export default ProntuarioPage;
