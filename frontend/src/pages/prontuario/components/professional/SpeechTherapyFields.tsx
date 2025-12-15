import React from 'react';
import GlassTextarea from '@/components/ui/GlassTextarea';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassButton from '@/components/ui/GlassButton';
import { Mic, Volume2, MessageSquare, Brain } from 'lucide-react';

interface SOAPData {
  subjective: any;
  objective: any;
  assessment: any;
  plan: any;
}

interface SpeechTherapyFieldsProps {
  soapData: SOAPData;
  updateSubjective: (field: keyof SOAPData['subjective'], value: string) => void;
  updateObjective: (field: keyof SOAPData['objective'], value: string) => void;
}

const SpeechTherapyFields: React.FC<SpeechTherapyFieldsProps> = ({ soapData, updateSubjective, updateObjective }) => {
  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <h4 className="text-md font-semibold text-white flex items-center gap-2">
        <Mic className="w-4 h-4" />
        Campos de Fonoaudiologia
      </h4>

      {/* Avaliação da Comunicação */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Avaliação da Comunicação
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'normal', label: 'Comunicação normal' },
              { value: 'disfasia', label: 'Disfasia' },
              { value: 'disartria', label: 'Disartria' },
              { value: 'afasia', label: 'Afasia' },
              { value: 'apraxia', label: 'Apraxia' },
              { value: 'dislalia', label: 'Dislalia' },
              { value: 'gagueira', label: 'Gagueira' },
              { value: 'mutismo', label: 'Mutismo' }
            ]}
            placeholder="Tipo de alteração da fala"
          />

          <GlassSelect
            options={[
              { value: 'compreensao_normal', label: 'Compreensão normal' },
              { value: 'dificuldade_leve', label: 'Dificuldade leve' },
              { value: 'dificuldade_moderada', label: 'Dificuldade moderada' },
              { value: 'dificuldade_grave', label: 'Dificuldade grave' },
              { value: 'ausente', label: 'Ausente' }
            ]}
            placeholder="Compreensão da linguagem"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'expressao_normal', label: 'Expressão normal' },
              { value: 'dificuldade_leve', label: 'Dificuldade leve' },
              { value: 'dificuldade_moderada', label: 'Dificuldade moderada' },
              { value: 'dificuldade_grave', label: 'Dificuldade grave' },
              { value: 'ausente', label: 'Ausente' }
            ]}
            placeholder="Expressão da linguagem"
          />

          <GlassSelect
            options={[
              { value: 'oral_normal', label: 'Via oral normal' },
              { value: 'disfagia_leve', label: 'Disfagia leve' },
              { value: 'disfagia_moderada', label: 'Disfagia moderada' },
              { value: 'disfagia_grave', label: 'Disfagia grave' },
              { value: 'via_alternativa', label: 'Via alternativa' }
            ]}
            placeholder="Deglutição"
          />
        </div>

        <GlassTextarea
          placeholder="Descrição detalhada da comunicação, fala, linguagem e deglutição..."
          rows={3}
        />
      </div>

      {/* Avaliação da Voz */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Avaliação da Voz
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassSelect
            options={[
              { value: 'eutonica', label: 'Eufônica' },
              { value: 'hipotona', label: 'Hipotônica' },
              { value: 'hipertensa', label: 'Hipertônica' },
              { value: 'rouca', label: 'Rouca' },
              { value: 'soprosa', label: 'Soprosa' },
              { value: 'bitonal', label: 'Bitonal' }
            ]}
            placeholder="Qualidade vocal"
          />

          <GlassInput
            placeholder="Frequência fundamental (Hz)"
            type="number"
          />

          <GlassInput
            placeholder="Intensidade (dB)"
            type="number"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'adequada', label: 'Adequada' },
              { value: 'reduzida', label: 'Reduzida' },
              { value: 'aumentada', label: 'Aumentada' }
            ]}
            placeholder="Extensão vocal"
          />

          <GlassSelect
            options={[
              { value: 'adequada', label: 'Adequada' },
              { value: 'hipernasal', label: 'Hipernasal' },
              { value: 'hiponasal', label: 'Hiponasal' },
              { value: 'cul_de_sac', label: 'Cul de sac' }
            ]}
            placeholder="Ressonância"
          />
        </div>
      </div>

      {/* Avaliação Auditiva */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Avaliação Auditiva</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'audicao_normal', label: 'Audição normal' },
              { value: 'perda_leve', label: 'Perda auditiva leve' },
              { value: 'perda_moderada', label: 'Perda auditiva moderada' },
              { value: 'perda_grave', label: 'Perda auditiva grave' },
              { value: 'surdez_profunda', label: 'Surdez profunda' }
            ]}
            placeholder="Audição"
          />

          <GlassSelect
            options={[
              { value: 'processamento_normal', label: 'Processamento normal' },
              { value: 'dificuldade_leve', label: 'Dificuldade leve' },
              { value: 'dificuldade_moderada', label: 'Dificuldade moderada' },
              { value: 'dificuldade_grave', label: 'Dificuldade grave' }
            ]}
            placeholder="Processamento auditivo"
          />
        </div>

        <GlassTextarea
          placeholder="Resultados de audiometria, imitanciometria, avaliação comportamental..."
          rows={2}
        />
      </div>

      {/* Avaliação Miofuncional */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Avaliação Miofuncional</label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            'Respiração bucal',
            'Deglutição atípica',
            'Sucção digital',
            'Interposição lingual',
            'Protrusão lingual',
            'Hipotonia labial',
            'Hipertrofia amigdala',
            'Obstrução nasal',
            'Bruxismo',
            'Onicofagia',
            'Outros'
          ].map((condition) => (
            <label key={condition} className="flex items-center space-x-2 text-white/80">
              <input type="checkbox" className="rounded border-white/20 bg-white/5" />
              <span className="text-xs">{condition}</span>
            </label>
          ))}
        </div>

        <GlassTextarea
          placeholder="Descrição da função miofuncional, hábitos orais, postura..."
          rows={2}
        />
      </div>

      {/* Diagnóstico Fonoaudiológico */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Diagnóstico Fonoaudiológico</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'linguagem', label: 'Transtorno da Linguagem' },
              { value: 'fala', label: 'Transtorno da Fala' },
              { value: 'voz', label: 'Transtorno da Voz' },
              { value: 'fluencia', label: 'Transtorno da Fluência' },
              { value: 'audição', label: 'Transtorno da Audição' },
              { value: 'deglutição', label: 'Transtorno da Deglutição' },
              { value: 'miofuncional', label: 'Transtorno Miofuncional' }
            ]}
            placeholder="Área afetada"
          />

          <GlassSelect
            options={[
              { value: 'leve', label: 'Leve' },
              { value: 'moderado', label: 'Moderado' },
              { value: 'grave', label: 'Grave' },
              { value: 'profundo', label: 'Profundo' }
            ]}
            placeholder="Grau de alteração"
          />
        </div>

        <GlassTextarea
          placeholder="Diagnóstico fonoaudiológico detalhado, fatores etiológicos..."
          rows={3}
        />
      </div>

      {/* Plano Terapêutico Fonoaudiológico */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Plano Terapêutico Fonoaudiológico
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'terapia_linguagem', label: 'Terapia da Linguagem' },
              { value: 'terapia_fala', label: 'Terapia da Fala' },
              { value: 'terapia_voz', label: 'Terapia da Voz' },
              { value: 'terapia_fluencia', label: 'Terapia da Fluência' },
              { value: 'terapia_audicao', label: 'Terapia da Audição' },
              { value: 'terapia_degluticao', label: 'Terapia da Deglutição' },
              { value: 'reabilitacao_miofuncional', label: 'Reabilitação Miofuncional' }
            ]}
            placeholder="Tipo de terapia"
          />

          <GlassSelect
            options={[
              { value: 'individual', label: 'Individual' },
              { value: 'grupo', label: 'Em grupo' },
              { value: 'familiar', label: 'Familiar' }
            ]}
            placeholder="Modalidade"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'semanal_1x', label: '1x por semana' },
              { value: 'semanal_2x', label: '2x por semana' },
              { value: 'semanal_3x', label: '3x por semana' },
              { value: 'diario', label: 'Diário' },
              { value: 'intensivo', label: 'Intensivo' }
            ]}
            placeholder="Frequência"
          />

          <GlassInput
            placeholder="Duração da sessão (minutos)"
            type="number"
          />
        </div>

        <GlassTextarea
          placeholder="Objetivos terapêuticos, técnicas a serem utilizadas, materiais necessários..."
          rows={4}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          Definir Plano Terapêutico
        </GlassButton>
      </div>

      {/* Recursos Terapêuticos */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Recursos Terapêuticos</label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            'Espelho',
            'Gravador',
            'Jogos fonéticos',
            'Cartões',
            'Sopradores',
            'Tubo de pool',
            'Pranchas de comunicação',
            'Aplicativos',
            'Instrumentos musicais',
            'Equipamentos auditivos',
            'Órteses',
            'Outros'
          ].map((resource) => (
            <label key={resource} className="flex items-center space-x-2 text-white/80">
              <input type="checkbox" className="rounded border-white/20 bg-white/5" />
              <span className="text-xs">{resource}</span>
            </label>
          ))}
        </div>

        <GlassTextarea
          placeholder="Recursos específicos necessários para a terapia..."
          rows={2}
        />
      </div>

      {/* Observações Fonoaudiológicas */}
      <GlassTextarea
        label="Observações Fonoaudiológicas"
        placeholder="Observações sobre adesão à terapia, evolução, dificuldades encontradas..."
        rows={3}
      />
    </div>
  );
};

export default SpeechTherapyFields;
