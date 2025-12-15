import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';

interface SOAPData {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

interface AttendanceSOAPFormProps {
  initialData?: SOAPData;
  onSubmit: (data: SOAPData) => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export const AttendanceSOAPForm: React.FC<AttendanceSOAPFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  className = ''
}) => {
  const [soapData, setSoapData] = useState<SOAPData>({
    subjective: initialData?.subjective || '',
    objective: initialData?.objective || '',
    assessment: initialData?.assessment || '',
    plan: initialData?.plan || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(soapData);
  };

  return (
    <div className={className}>
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-medical-blue" />
          <h3 className="text-xl font-semibold text-white">Prontuário SOAP</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subjetivo */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <span className="text-medical-blue font-bold">S</span> - Subjetivo
            </label>
            <p className="text-xs text-text-secondary mb-2">
              Queixa do paciente, sintomas relatados, histórico
            </p>
            <GlassInput
              placeholder="Descreva os sintomas e queixas relatados pelo paciente..."
              value={soapData.subjective || ''}
              onChange={(value) => setSoapData(prev => ({ ...prev, subjective: value }))}
              multiline
              rows={5}
            />
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <span className="text-medical-green font-bold">O</span> - Objetivo
            </label>
            <p className="text-xs text-text-secondary mb-2">
              Sinais vitais, exames físicos, achados objetivos
            </p>
            <GlassInput
              placeholder="Descreva os achados objetivos do exame físico, sinais vitais, resultados de exames..."
              value={soapData.objective || ''}
              onChange={(value) => setSoapData(prev => ({ ...prev, objective: value }))}
              multiline
              rows={5}
            />
          </div>

          {/* Avaliação */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <span className="text-medical-orange font-bold">A</span> - Avaliação
            </label>
            <p className="text-xs text-text-secondary mb-2">
              Diagnóstico, impressão diagnóstica, avaliação clínica
            </p>
            <GlassInput
              placeholder="Diagnóstico ou impressão diagnóstica baseada em S e O..."
              value={soapData.assessment || ''}
              onChange={(value) => setSoapData(prev => ({ ...prev, assessment: value }))}
              multiline
              rows={4}
            />
          </div>

          {/* Plano */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <span className="text-medical-purple font-bold">P</span> - Plano
            </label>
            <p className="text-xs text-text-secondary mb-2">
              Plano de tratamento, prescrições, orientações, próximos passos
            </p>
            <GlassInput
              placeholder="Plano de tratamento, prescrições, orientações ao paciente, próximos passos..."
              value={soapData.plan || ''}
              onChange={(value) => setSoapData(prev => ({ ...prev, plan: value }))}
              multiline
              rows={5}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            {onCancel && (
              <GlassButton
                type="button"
                variant="ghost"
                onClick={onCancel}
              >
                Cancelar
              </GlassButton>
            )}
            
            <GlassButton
              type="submit"
              variant="primary"
              loading={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Prontuário
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};


