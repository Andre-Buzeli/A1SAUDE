import React from 'react';
import GlassTextarea from '@/components/ui/GlassTextarea';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassButton from '@/components/ui/GlassButton';
import { Heart, Syringe, UserCheck, Activity } from 'lucide-react';

interface SOAPData {
  subjective: any;
  objective: any;
  assessment: any;
  plan: any;
}

interface NursingFieldsProps {
  soapData: SOAPData;
  updateObjective: (field: keyof SOAPData['objective'], value: string) => void;
  updatePlan: (field: keyof SOAPData['plan'], value: any) => void;
}

const NursingFields: React.FC<NursingFieldsProps> = ({ soapData, updateObjective, updatePlan }) => {
  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <h4 className="text-md font-semibold text-white flex items-center gap-2">
        <Heart className="w-4 h-4" />
        Campos de Enfermagem
      </h4>

      {/* Escala de Dor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassSelect
          label="Escala de Dor (0-10)"
          options={Array.from({ length: 11 }, (_, i) => ({
            value: i.toString(),
            label: `${i} - ${i === 0 ? 'Sem dor' : i <= 3 ? 'Dor leve' : i <= 6 ? 'Dor moderada' : i <= 8 ? 'Dor intensa' : 'Dor insuportável'}`
          }))}
          placeholder="Selecione a intensidade"
        />

        <GlassSelect
          label="Localização da Dor"
          options={[
            { value: 'cabeça', label: 'Cabeça' },
            { value: 'peito', label: 'Peito' },
            { value: 'abdome', label: 'Abdome' },
            { value: 'costas', label: 'Costas' },
            { value: 'membros', label: 'Membros' },
            { value: 'difusa', label: 'Difusa' },
            { value: 'outros', label: 'Outros' }
          ]}
          placeholder="Selecione a localização"
        />
      </div>

      {/* Avaliação Neurológica */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Avaliação Neurológica (Glasgow)</label>
        <div className="grid grid-cols-3 gap-4">
          <GlassSelect
            options={Array.from({ length: 5 }, (_, i) => ({
              value: (i + 1).toString(),
              label: `${i + 1}`
            }))}
            placeholder="Abertura ocular"
          />
          <GlassSelect
            options={Array.from({ length: 6 }, (_, i) => ({
              value: (i + 1).toString(),
              label: `${i + 1}`
            }))}
            placeholder="Resposta verbal"
          />
          <GlassSelect
            options={Array.from({ length: 7 }, (_, i) => ({
              value: (i + 1).toString(),
              label: `${i + 1}`
            }))}
            placeholder="Resposta motora"
          />
        </div>
        <GlassInput
          placeholder="Total Glasgow"
          readOnly
          className="w-32"
        />
      </div>

      {/* Cuidados de Enfermagem */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Cuidados de Enfermagem Realizados
        </label>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            'Higiene corporal',
            'Higiene oral',
            'Controle de sinais vitais',
            'Administração de medicamentos',
            'Curativos',
            'Posicionamento',
            'Mobilização',
            'Alimentação',
            'Eliminação',
            'Orientações',
            'Outros'
          ].map((care) => (
            <label key={care} className="flex items-center space-x-2 text-white/80">
              <input type="checkbox" className="rounded border-white/20 bg-white/5" />
              <span className="text-sm">{care}</span>
            </label>
          ))}
        </div>

        <GlassTextarea
          placeholder="Observações dos cuidados realizados..."
          rows={3}
        />
      </div>

      {/* Administração de Medicamentos */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Syringe className="w-4 h-4" />
          Administração de Medicamentos
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            placeholder="Medicamento administrado..."
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
                { value: 'UI', label: 'UI' },
                { value: 'amp', label: 'amp' },
                { value: 'comp', label: 'comp' }
              ]}
              placeholder="Unid."
              className="w-20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassSelect
            options={[
              { value: 'oral', label: 'Oral' },
              { value: 'iv', label: 'EV' },
              { value: 'im', label: 'IM' },
              { value: 'sc', label: 'SC' },
              { value: 'topica', label: 'Tópica' },
              { value: 'ocular', label: 'Ocular' },
              { value: 'otica', label: 'Ótica' },
              { value: 'nasal', label: 'Nasal' },
              { value: 'retal', label: 'Retal' },
              { value: 'inalatoria', label: 'Inalatória' }
            ]}
            placeholder="Via de administração"
          />

          <GlassInput
            type="datetime-local"
            placeholder="Horário"
          />

          <GlassSelect
            options={[
              { value: 'administrado', label: 'Administrado' },
              { value: 'recusado', label: 'Recusado' },
              { value: 'vomito', label: 'Vômito' },
              { value: 'reacao', label: 'Reação adversa' },
              { value: 'indisponivel', label: 'Indisponível' }
            ]}
            placeholder="Status"
          />
        </div>

        <GlassTextarea
          placeholder="Observações da administração..."
          rows={2}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          Registrar Administração
        </GlassButton>
      </div>

      {/* Plano de Cuidados */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Plano de Cuidados de Enfermagem</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'diagnostico', label: 'Diagnóstico de Enfermagem' },
              { value: 'objetivo', label: 'Objetivo' },
              { value: 'intervencao', label: 'Intervenção' },
              { value: 'avaliacao', label: 'Avaliação' }
            ]}
            placeholder="Tipo de cuidado"
          />

          <GlassInput
            placeholder="Descrição do cuidado..."
          />
        </div>

        <GlassTextarea
          placeholder="Detalhes do plano de cuidados..."
          rows={3}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          Adicionar ao Plano
        </GlassButton>
      </div>

      {/* Sinais de Alerta */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Sinais de Alerta Identificados</label>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            'Febre > 38°C',
            'PA > 180/110',
            'FC > 120 bpm',
            'FR > 24 ipm',
            'SpO2 < 95%',
            'Dor intensa',
            'Sangramento',
            'Convulsão',
            'Alteração nível consciência',
            'Dificuldade respiratória',
            'Outros'
          ].map((alert) => (
            <label key={alert} className="flex items-center space-x-2 text-white/80">
              <input type="checkbox" className="rounded border-white/20 bg-white/5" />
              <span className="text-sm">{alert}</span>
            </label>
          ))}
        </div>

        <GlassTextarea
          placeholder="Outros sinais de alerta ou observações..."
          rows={2}
        />
      </div>
    </div>
  );
};

export default NursingFields;
