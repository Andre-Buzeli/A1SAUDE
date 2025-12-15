import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassInput from '@/components/ui/GlassInput';
import GlassButton from '@/components/ui/GlassButton';
import GlassTextarea from '@/components/ui/GlassTextarea';
import GlassSelect from '@/components/ui/GlassSelect';
import { Plus, Save, X } from 'lucide-react';
import { UserProfile } from '@/types/auth';

// Importações dos campos específicos por profissional
import MedicalFields from './professional/MedicalFields';
import NursingFields from './professional/NursingFields';
import PhysiotherapyFields from './professional/PhysiotherapyFields';
import PsychologyFields from './professional/PsychologyFields';
import NutritionFields from './professional/NutritionFields';
import SpeechTherapyFields from './professional/SpeechTherapyFields';
import OccupationalTherapyFields from './professional/OccupationalTherapyFields';
import DentalFields from './professional/DentalFields';

interface EvolutionFormProps {
  patientId: string;
}

interface SOAPData {
  subjective: {
    chiefComplaint: string;
    hpi: string; // History of Present Illness
    ros: string; // Review of Systems
    allergies: string;
    medications: string;
    socialHistory: string;
  };
  objective: {
    vitals: {
      bp: string;
      hr: string;
      rr: string;
      temp: string;
      spo2: string;
      weight: string;
      height: string;
      bmi: string;
    };
    physicalExam: string;
    diagnosticTests: string;
  };
  assessment: {
    diagnosis: string;
    cid10: string[];
    differentialDiagnosis: string;
  };
  plan: {
    treatment: string;
    medications: any[];
    followUp: string;
    education: string;
  };
}

const EvolutionForm: React.FC<EvolutionFormProps> = ({ patientId }) => {
  const { user } = useAuth();
  const [soapData, setSoapData] = useState<SOAPData>({
    subjective: {
      chiefComplaint: '',
      hpi: '',
      ros: '',
      allergies: '',
      medications: '',
      socialHistory: ''
    },
    objective: {
      vitals: {
        bp: '',
        hr: '',
        rr: '',
        temp: '',
        spo2: '',
        weight: '',
        height: '',
        bmi: ''
      },
      physicalExam: '',
      diagnosticTests: ''
    },
    assessment: {
      diagnosis: '',
      cid10: [],
      differentialDiagnosis: ''
    },
    plan: {
      treatment: '',
      medications: [],
      followUp: '',
      education: ''
    }
  });

  const updateSubjective = (field: keyof SOAPData['subjective'], value: string) => {
    setSoapData(prev => ({
      ...prev,
      subjective: {
        ...prev.subjective,
        [field]: value
      }
    }));
  };

  const updateObjective = (field: keyof SOAPData['objective'], value: string) => {
    if (field === 'vitals') return; // Handled separately
    setSoapData(prev => ({
      ...prev,
      objective: {
        ...prev.objective,
        [field]: value
      }
    }));
  };

  const updateVitals = (field: keyof SOAPData['objective']['vitals'], value: string) => {
    setSoapData(prev => ({
      ...prev,
      objective: {
        ...prev.objective,
        vitals: {
          ...prev.objective.vitals,
          [field]: value
        }
      }
    }));
  };

  const updateAssessment = (field: keyof SOAPData['assessment'], value: string | string[]) => {
    setSoapData(prev => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        [field]: value
      }
    }));
  };

  const updatePlan = (field: keyof SOAPData['plan'], value: any) => {
    setSoapData(prev => ({
      ...prev,
      plan: {
        ...prev.plan,
        [field]: value
      }
    }));
  };

  const renderProfessionalFields = () => {
    switch (user?.profile) {
      case 'medico':
        return <MedicalFields soapData={soapData} updateAssessment={updateAssessment} updatePlan={updatePlan} />;
      case 'enfermeiro':
        return <NursingFields soapData={soapData} updateObjective={updateObjective} updatePlan={updatePlan} />;
      case 'fisioterapeuta':
        return <PhysiotherapyFields soapData={soapData} updateObjective={updateObjective} updatePlan={updatePlan} />;
      case 'psicologo':
        return <PsychologyFields soapData={soapData} updateSubjective={updateSubjective} updateAssessment={updateAssessment} />;
      case 'nutricionista':
        return <NutritionFields soapData={soapData} updateSubjective={updateSubjective} updatePlan={updatePlan} />;
      case 'fonoaudiologo':
        return <SpeechTherapyFields soapData={soapData} updateSubjective={updateSubjective} updateObjective={updateObjective} />;
      case 'terapeuta_ocupacional':
        return <OccupationalTherapyFields soapData={soapData} updateSubjective={updateSubjective} updateObjective={updateObjective} />;
      case 'dentista':
        return <DentalFields soapData={soapData} updateSubjective={updateSubjective} updateObjective={updateObjective} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* S - SUBJETIVO */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">S - Subjetivo</h3>
        <div className="space-y-4">
          <GlassTextarea
            label="Queixa Principal"
            value={soapData.subjective.chiefComplaint}
            onChange={(e) => updateSubjective('chiefComplaint', e.target.value)}
            placeholder="Descreva a queixa principal do paciente..."
            required
          />

          <GlassTextarea
            label="HDA (História da Doença Atual)"
            value={soapData.subjective.hpi}
            onChange={(e) => updateSubjective('hpi', e.target.value)}
            placeholder="História detalhada da doença atual..."
            rows={4}
          />

          <GlassTextarea
            label="Revisão de Sistemas (ROS)"
            value={soapData.subjective.ros}
            onChange={(e) => updateSubjective('ros', e.target.value)}
            placeholder="Revisão por sistemas (cardiovascular, respiratório, etc.)..."
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassInput
              label="Alergias"
              value={soapData.subjective.allergies}
              onChange={(e) => updateSubjective('allergies', e.target.value)}
              placeholder="Medicamentos, alimentos..."
            />

            <GlassInput
              label="Medicamentos em Uso"
              value={soapData.subjective.medications}
              onChange={(e) => updateSubjective('medications', e.target.value)}
              placeholder="Lista de medicamentos atuais..."
            />

            <GlassInput
              label="História Social"
              value={soapData.subjective.socialHistory}
              onChange={(e) => updateSubjective('socialHistory', e.target.value)}
              placeholder="Fumante, etilista, ocupação..."
            />
          </div>
        </div>
      </GlassCard>

      {/* O - OBJETIVO */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">O - Objetivo</h3>
        <div className="space-y-4">
          {/* Sinais Vitais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassInput
              label="PA (mmHg)"
              value={soapData.objective.vitals.bp}
              onChange={(e) => updateVitals('bp', e.target.value)}
              placeholder="120/80"
            />
            <GlassInput
              label="FC (bpm)"
              value={soapData.objective.vitals.hr}
              onChange={(e) => updateVitals('hr', e.target.value)}
              placeholder="72"
            />
            <GlassInput
              label="FR (rpm)"
              value={soapData.objective.vitals.rr}
              onChange={(e) => updateVitals('rr', e.target.value)}
              placeholder="16"
            />
            <GlassInput
              label="Temp (°C)"
              value={soapData.objective.vitals.temp}
              onChange={(e) => updateVitals('temp', e.target.value)}
              placeholder="36.5"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassInput
              label="SpO2 (%)"
              value={soapData.objective.vitals.spo2}
              onChange={(e) => updateVitals('spo2', e.target.value)}
              placeholder="98"
            />
            <GlassInput
              label="Peso (kg)"
              value={soapData.objective.vitals.weight}
              onChange={(e) => updateVitals('weight', e.target.value)}
              placeholder="70"
            />
            <GlassInput
              label="Altura (cm)"
              value={soapData.objective.vitals.height}
              onChange={(e) => updateVitals('height', e.target.value)}
              placeholder="170"
            />
            <GlassInput
              label="IMC"
              value={soapData.objective.vitals.bmi}
              onChange={(e) => updateVitals('bmi', e.target.value)}
              placeholder="24.2"
              readOnly
            />
          </div>

          <GlassTextarea
            label="Exame Físico"
            value={soapData.objective.physicalExam}
            onChange={(e) => updateObjective('physicalExam', e.target.value)}
            placeholder="Descrição detalhada do exame físico por sistemas..."
            rows={6}
            required
          />

          <GlassTextarea
            label="Exames Complementares"
            value={soapData.objective.diagnosticTests}
            onChange={(e) => updateObjective('diagnosticTests', e.target.value)}
            placeholder="Resultados de exames laboratoriais, de imagem, etc..."
            rows={4}
          />
        </div>
      </GlassCard>

      {/* A - AVALIAÇÃO */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">A - Avaliação</h3>
        <div className="space-y-4">
          <GlassTextarea
            label="Hipótese Diagnóstica"
            value={soapData.assessment.diagnosis}
            onChange={(e) => updateAssessment('diagnosis', e.target.value)}
            placeholder="Diagnóstico principal e comorbidades..."
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">CID-10</label>
            <div className="flex gap-2">
              <GlassInput
                placeholder="Buscar CID-10..."
                className="flex-1"
              />
              <GlassButton variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </GlassButton>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {soapData.assessment.cid10.map((cid, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                >
                  {cid}
                  <button className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <GlassTextarea
            label="Diagnóstico Diferencial"
            value={soapData.assessment.differentialDiagnosis}
            onChange={(e) => updateAssessment('differentialDiagnosis', e.target.value)}
            placeholder="Outras possibilidades diagnósticas consideradas..."
            rows={3}
          />
        </div>
      </GlassCard>

      {/* P - PLANO */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">P - Plano</h3>
        <div className="space-y-4">
          <GlassTextarea
            label="Conduta/Procedimentos"
            value={soapData.plan.treatment}
            onChange={(e) => updatePlan('treatment', e.target.value)}
            placeholder="Tratamentos, procedimentos, cirurgias planejadas..."
            rows={4}
            required
          />

          {/* Campo específico do profissional */}
          {renderProfessionalFields()}

          <GlassTextarea
            label="Plano de Seguimento"
            value={soapData.plan.followUp}
            onChange={(e) => updatePlan('followUp', e.target.value)}
            placeholder="Retorno agendado, exames de controle, etc..."
            rows={3}
          />

          <GlassTextarea
            label="Orientações ao Paciente"
            value={soapData.plan.education}
            onChange={(e) => updatePlan('education', e.target.value)}
            placeholder="Educação em saúde, cuidados domiciliares, etc..."
            rows={3}
          />
        </div>
      </GlassCard>

      {/* Botões de ação */}
      <div className="flex justify-end gap-4">
        <GlassButton variant="outline">
          <Save className="w-4 h-4 mr-2" />
          Salvar Rascunho
        </GlassButton>
        <GlassButton>
          Finalizar Atendimento
        </GlassButton>
      </div>
    </div>
  );
};

export default EvolutionForm;
