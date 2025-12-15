import React from 'react';
import GlassTextarea from '@/components/ui/GlassTextarea';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassButton from '@/components/ui/GlassButton';
import { Plus, Pill, FileText, Activity } from 'lucide-react';

interface SOAPData {
  subjective: any;
  objective: any;
  assessment: any;
  plan: any;
}

interface MedicalFieldsProps {
  soapData: SOAPData;
  updateAssessment: (field: keyof SOAPData['assessment'], value: string | string[]) => void;
  updatePlan: (field: keyof SOAPData['plan'], value: any) => void;
}

const MedicalFields: React.FC<MedicalFieldsProps> = ({ soapData, updateAssessment, updatePlan }) => {
  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <h4 className="text-md font-semibold text-white flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Campos Médicos Específicos
      </h4>

      {/* Prognóstico */}
      <GlassTextarea
        label="Prognóstico"
        value={soapData.assessment.prognosis || ''}
        onChange={(e) => updateAssessment('prognosis' as any, e.target.value)}
        placeholder="Prognóstico da doença, expectativa de recuperação..."
        rows={2}
      />

      {/* Intercorrências */}
      <GlassTextarea
        label="Intercorrências"
        value={soapData.assessment.complications || ''}
        onChange={(e) => updateAssessment('complications' as any, e.target.value)}
        placeholder="Complicações, intercorrências ou eventos adversos..."
        rows={2}
      />

      {/* Prescrição Médica */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Pill className="w-4 h-4" />
          Prescrição Médica
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            placeholder="Medicamento..."
            className="flex-1"
          />
          <div className="flex gap-2">
            <GlassInput
              placeholder="Dose"
              className="flex-1"
            />
            <GlassSelect
              options={[
                { value: 'mg', label: 'mg' },
                { value: 'g', label: 'g' },
                { value: 'ml', label: 'ml' },
                { value: 'mcg', label: 'mcg' },
                { value: 'UI', label: 'UI' }
              ]}
              placeholder="Unidade"
              className="w-20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassInput
            placeholder="Via (oral, IV, IM...)"
          />
          <GlassInput
            placeholder="Frequência (6/6h, 8/8h...)"
          />
          <GlassInput
            placeholder="Duração (dias)"
          />
        </div>

        <GlassTextarea
          placeholder="Observações da prescrição..."
          rows={2}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Medicamento
        </GlassButton>
      </div>

      {/* Solicitações de Exames */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Solicitações de Exames
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'laboratorial', label: 'Laboratorial' },
              { value: 'imagem', label: 'Imagem' },
              { value: 'endoscopia', label: 'Endoscopia' },
              { value: 'biopsia', label: 'Biopsia' },
              { value: 'outros', label: 'Outros' }
            ]}
            placeholder="Tipo de exame"
          />

          <GlassInput
            placeholder="Nome específico do exame..."
          />
        </div>

        <GlassTextarea
          placeholder="Indicação clínica, urgência..."
          rows={2}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Solicitar Exame
        </GlassButton>
      </div>

      {/* Encaminhamentos */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Encaminhamentos</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'especialista', label: 'Consulta Especializada' },
              { value: 'emergencia', label: 'Pronto Socorro' },
              { value: 'internacao', label: 'Internação Hospitalar' },
              { value: 'cirurgia', label: 'Centro Cirúrgico' },
              { value: 'reabilitacao', label: 'Reabilitação' },
              { value: 'outros', label: 'Outros' }
            ]}
            placeholder="Tipo de encaminhamento"
          />

          <GlassInput
            placeholder="Especialidade/destino..."
          />
        </div>

        <GlassTextarea
          placeholder="Razão do encaminhamento, prioridade..."
          rows={2}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Encaminhamento
        </GlassButton>
      </div>

      {/* Atestados e Documentos */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Atestados e Documentos</label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassSelect
            options={[
              { value: 'atestado', label: 'Atestado Médico' },
              { value: 'declaracao', label: 'Declaração' },
              { value: 'laudo', label: 'Laudo Médico' },
              { value: 'relatorio', label: 'Relatório Médico' },
              { value: 'outros', label: 'Outros' }
            ]}
            placeholder="Tipo de documento"
          />

          <GlassInput
            type="number"
            placeholder="Dias (para atestado)"
          />

          <GlassInput
            placeholder="CID (se aplicável)"
          />
        </div>

        <GlassTextarea
          placeholder="Observações do documento..."
          rows={2}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Gerar Documento
        </GlassButton>
      </div>
    </div>
  );
};

export default MedicalFields;
