import React from 'react';
import GlassTextarea from '@/components/ui/GlassTextarea';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassButton from '@/components/ui/GlassButton';
import { Brain, Heart, Users, AlertTriangle } from 'lucide-react';

interface SOAPData {
  subjective: any;
  objective: any;
  assessment: any;
  plan: any;
}

interface PsychologyFieldsProps {
  soapData: SOAPData;
  updateSubjective: (field: keyof SOAPData['subjective'], value: string) => void;
  updateAssessment: (field: keyof SOAPData['assessment'], value: string | string[]) => void;
}

const PsychologyFields: React.FC<PsychologyFieldsProps> = ({ soapData, updateSubjective, updateAssessment }) => {
  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <h4 className="text-md font-semibold text-white flex items-center gap-2">
        <Brain className="w-4 h-4" />
        Campos de Psicologia
      </h4>

      {/* Estado Emocional */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Estado Emocional
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'ansioso', label: 'Ansioso' },
              { value: 'deprimido', label: 'Deprimido' },
              { value: 'irritado', label: 'Irritado' },
              { value: 'triste', label: 'Triste' },
              { value: 'eufórico', label: 'Eufórico' },
              { value: 'apático', label: 'Apático' },
              { value: 'confuso', label: 'Confuso' },
              { value: 'calmo', label: 'Calmo' },
              { value: 'alegre', label: 'Alegre' },
              { value: 'outros', label: 'Outros' }
            ]}
            placeholder="Humor predominante"
          />

          <GlassSelect
            options={[
              { value: 'adequado', label: 'Adequado à situação' },
              { value: 'inadequado', label: 'Inadequado à situação' },
              { value: 'embotado', label: 'Embotado' },
              { value: 'labial', label: 'Lábil' },
              { value: 'aplanado', label: 'Aplanado' },
              { value: 'euphorico', label: 'Eufórico' }
            ]}
            placeholder="Afecto"
          />
        </div>

        <GlassTextarea
          placeholder="Descrição do estado emocional e afetivo..."
          rows={3}
        />
      </div>

      {/* Avaliação Cognitiva */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Avaliação Cognitiva</label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassSelect
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'leve', label: 'Leve alteração' },
              { value: 'moderada', label: 'Moderada alteração' },
              { value: 'grave', label: 'Grave alteração' }
            ]}
            placeholder="Orientação"
          />

          <GlassSelect
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'leve', label: 'Leve alteração' },
              { value: 'moderada', label: 'Moderada alteração' },
              { value: 'grave', label: 'Grave alteração' }
            ]}
            placeholder="Memória"
          />

          <GlassSelect
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'leve', label: 'Leve alteração' },
              { value: 'moderada', label: 'Moderada alteração' },
              { value: 'grave', label: 'Grave alteração' }
            ]}
            placeholder="Atenção"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'coerente', label: 'Coerente' },
              { value: 'incoerente', label: 'Incoerente' },
              { value: 'tangencial', label: 'Tangencial' },
              { value: 'circunstancial', label: 'Circunstancial' }
            ]}
            placeholder="Pensamento"
          />

          <GlassSelect
            options={[
              { value: 'ausentes', label: 'Ausentes' },
              { value: 'presentes', label: 'Presentes' }
            ]}
            placeholder="Ideias delirantes"
          />
        </div>

        <GlassTextarea
          placeholder="Observações sobre funções cognitivas, pensamento, percepção..."
          rows={3}
        />
      </div>

      {/* História Psiquiátrica */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">História Psiquiátrica Pregressa</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'primeiro_episodio', label: 'Primeiro episódio' },
              { value: 'recorrente', label: 'Recorrente' },
              { value: 'cronico', label: 'Crônico' }
            ]}
            placeholder="Características do quadro"
          />

          <GlassInput
            placeholder="Diagnóstico prévio (CID)"
          />
        </div>

        <GlassTextarea
          label="Tratamentos anteriores"
          placeholder="Medicamentos, psicoterapias, internações..."
          rows={3}
        />

        <GlassTextarea
          label="História familiar"
          placeholder="Antecedentes familiares psiquiátricos..."
          rows={2}
        />
      </div>

      {/* Fatores Psicossociais */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Fatores Psicossociais
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'solteiro', label: 'Solteiro' },
              { value: 'casado', label: 'Casado/União estável' },
              { value: 'divorciado', label: 'Divorciado/Separado' },
              { value: 'viuvo', label: 'Viúvo' }
            ]}
            placeholder="Estado civil"
          />

          <GlassSelect
            options={[
              { value: 'fundamental', label: 'Fundamental' },
              { value: 'medio', label: 'Médio' },
              { value: 'superior', label: 'Superior' },
              { value: 'pos_graduacao', label: 'Pós-graduação' },
              { value: 'analfabeto', label: 'Analfabeto' }
            ]}
            placeholder="Escolaridade"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassInput
            label="Profissão/Ocupação"
            placeholder="Profissão atual"
          />

          <GlassSelect
            options={[
              { value: 'empregado', label: 'Empregado' },
              { value: 'desempregado', label: 'Desempregado' },
              { value: 'autonomo', label: 'Autônomo' },
              { value: 'aposentado', label: 'Aposentado' },
              { value: 'estudante', label: 'Estudante' },
              { value: 'domestico', label: 'Trabalho doméstico' }
            ]}
            placeholder="Situação ocupacional"
          />

          <GlassSelect
            options={[
              { value: 'propria', label: 'Casa própria' },
              { value: 'alugada', label: 'Alugada' },
              { value: 'cedida', label: 'Cedida' },
              { value: 'financiada', label: 'Financiada' },
              { value: 'situação_rua', label: 'Situação de rua' }
            ]}
            placeholder="Situação habitacional"
          />
        </div>

        <GlassTextarea
          placeholder="Rede de apoio social, dinâmica familiar, condições socioeconômicas..."
          rows={3}
        />
      </div>

      {/* Avaliação de Risco */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Avaliação de Risco
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            'Ideação suicida',
            'Plano suicida',
            'Tentativa prévia',
            'Autoagressão',
            'Heteroagressão',
            'Abuso de substâncias',
            'Negligência pessoal',
            'Isolamento social',
            'Delírios',
            'Alucinações',
            'Agitação psicomotora',
            'Retardo psicomotor'
          ].map((risk) => (
            <label key={risk} className="flex items-center space-x-2 text-white/80">
              <input type="checkbox" className="rounded border-white/20 bg-white/5" />
              <span className="text-xs">{risk}</span>
            </label>
          ))}
        </div>

        <GlassTextarea
          placeholder="Detalhes da avaliação de risco e medidas de proteção..."
          rows={2}
        />
      </div>

      {/* Plano Psicoterapêutico */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Plano Psicoterapêutico</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'psicoterapia_individual', label: 'Psicoterapia Individual' },
              { value: 'psicoterapia_grupo', label: 'Psicoterapia em Grupo' },
              { value: 'psicoterapia_familiar', label: 'Psicoterapia Familiar' },
              { value: 'terapia_cognitivo_comportamental', label: 'TCC' },
              { value: 'psicanalise', label: 'Psicanálise' },
              { value: 'terapia_humanista', label: 'Terapia Humanista' },
              { value: 'intervencao_crises', label: 'Intervenção em Crises' },
              { value: 'orientacao_psicologica', label: 'Orientação Psicológica' }
            ]}
            placeholder="Tipo de intervenção"
          />

          <GlassSelect
            options={[
              { value: 'semanal', label: 'Semanal' },
              { value: 'quinzenal', label: 'Quinzenal' },
              { value: 'mensal', label: 'Mensal' },
              { value: 'intensivo', label: 'Intensivo' },
              { value: 'sob_demanda', label: 'Sob demanda' }
            ]}
            placeholder="Frequência"
          />
        </div>

        <GlassTextarea
          placeholder="Objetivos terapêuticos, estratégias de intervenção..."
          rows={4}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          Definir Plano Terapêutico
        </GlassButton>
      </div>

      {/* Observações Clínicas */}
      <GlassTextarea
        label="Observações Clínicas Psicológicas"
        placeholder="Impressões clínicas, hipóteses diagnósticas, evolução do quadro..."
        rows={4}
      />
    </div>
  );
};

export default PsychologyFields;
