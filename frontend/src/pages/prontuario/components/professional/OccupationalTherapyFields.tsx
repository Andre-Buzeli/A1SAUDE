import React from 'react';
import GlassTextarea from '@/components/ui/GlassTextarea';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassButton from '@/components/ui/GlassButton';
import { Hand, Target, Users, Home } from 'lucide-react';

interface SOAPData {
  subjective: any;
  objective: any;
  assessment: any;
  plan: any;
}

interface OccupationalTherapyFieldsProps {
  soapData: SOAPData;
  updateSubjective: (field: keyof SOAPData['subjective'], value: string) => void;
  updateObjective: (field: keyof SOAPData['objective'], value: string) => void;
}

const OccupationalTherapyFields: React.FC<OccupationalTherapyFieldsProps> = ({ soapData, updateSubjective, updateObjective }) => {
  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <h4 className="text-md font-semibold text-white flex items-center gap-2">
        <Hand className="w-4 h-4" />
        Campos de Terapia Ocupacional
      </h4>

      {/* Avaliação das Atividades de Vida Diária (AVD) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Atividades de Vida Diária (AVD)</label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            'Alimentação independente',
            'Higiene pessoal',
            'Vestuário',
            'Banho',
            'Controle de esfíncteres',
            'Mobilidade',
            'Locomoção',
            'Transferências',
            'Comunicação',
            'Cognição',
            'Interação social',
            'Lazer'
          ].map((activity) => (
            <label key={activity} className="flex items-center space-x-2 text-white/80">
              <input type="checkbox" className="rounded border-white/20 bg-white/5" />
              <span className="text-xs">{activity}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'independente', label: 'Independente' },
              { value: 'assistido_minimo', label: 'Assistido mínimo' },
              { value: 'assistido_moderado', label: 'Assistido moderado' },
              { value: 'assistido_maximo', label: 'Assistido máximo' },
              { value: 'dependente', label: 'Dependente' }
            ]}
            placeholder="Nível de independência"
          />

          <GlassSelect
            options={[
              { value: 'sem_dificuldade', label: 'Sem dificuldade' },
              { value: 'dificuldade_leve', label: 'Dificuldade leve' },
              { value: 'dificuldade_moderada', label: 'Dificuldade moderada' },
              { value: 'dificuldade_grave', label: 'Dificuldade grave' },
              { value: 'incapaz', label: 'Incapaz' }
            ]}
            placeholder="Dificuldade nas AVD"
          />
        </div>

        <GlassTextarea
          placeholder="Descrição detalhada das atividades realizadas, dificuldades encontradas..."
          rows={3}
        />
      </div>

      {/* Avaliação Sensorial e Perceptiva */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Avaliação Sensorial e Perceptiva</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'tato_normal', label: 'Tato normal' },
              { value: 'hipoestesia', label: 'Hipoestesia' },
              { value: 'hiperestesia', label: 'Hiperestesia' },
              { value: 'parestesia', label: 'Parestesia' },
              { value: 'alodinia', label: 'Alodinia' }
            ]}
            placeholder="Sensibilidade tátil"
          />

          <GlassSelect
            options={[
              { value: 'propriocepcao_normal', label: 'Propriocepção normal' },
              { value: 'alterada', label: 'Propriocepção alterada' },
              { value: 'ausente', label: 'Propriocepção ausente' }
            ]}
            placeholder="Propriocepção"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'percepcao_normal', label: 'Percepção normal' },
              { value: 'agnosia_visual', label: 'Agnosia visual' },
              { value: 'heminegligencia', label: 'Heminegligência' },
              { value: 'apraxia', label: 'Apraxia' }
            ]}
            placeholder="Percepção visual/espacial"
          />

          <GlassSelect
            options={[
              { value: 'equilibrio_normal', label: 'Equilíbrio normal' },
              { value: 'alterado', label: 'Equilíbrio alterado' },
              { value: 'instavel', label: 'Instável' },
              { value: 'dependente', label: 'Dependente de suporte' }
            ]}
            placeholder="Equilíbrio e coordenação"
          />
        </div>
      </div>

      {/* Avaliação Motora */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Avaliação Motora</label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassSelect
            options={[
              { value: 'forca_normal', label: 'Força normal' },
              { value: 'leve', label: 'Fraqueza leve' },
              { value: 'moderada', label: 'Fraqueza moderada' },
              { value: 'grave', label: 'Fraqueza grave' },
              { value: 'plegia', label: 'Plegia' }
            ]}
            placeholder="Força muscular"
          />

          <GlassSelect
            options={[
              { value: 'tonus_normal', label: 'Tônus normal' },
              { value: 'hipertonia', label: 'Hipertonia' },
              { value: 'hipotonia', label: 'Hipotonia' },
              { value: 'flacidez', label: 'Flacidez' },
              { value: 'espasticidade', label: 'Espasticidade' }
            ]}
            placeholder="Tônus muscular"
          />

          <GlassSelect
            options={[
              { value: 'amplitude_normal', label: 'Amplitude normal' },
              { value: 'limitacao_leve', label: 'Limitação leve' },
              { value: 'limitacao_moderada', label: 'Limitação moderada' },
              { value: 'limitacao_grave', label: 'Limitação grave' },
              { value: 'anquilose', label: 'Anquilose' }
            ]}
            placeholder="Amplitude articular"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'destreza_normal', label: 'Destreza normal' },
              { value: 'alterada', label: 'Destreza alterada' },
              { value: 'apraxia', label: 'Apraxia' }
            ]}
            placeholder="Destreza manual"
          />

          <GlassSelect
            options={[
              { value: 'coordenação_normal', label: 'Coordenação normal' },
              { value: 'ataxia', label: 'Ataxia' },
              { value: 'tremor', label: 'Tremor' },
              { value: 'distonia', label: 'Distonia' }
            ]}
            placeholder="Coordenação motora"
          />
        </div>
      </div>

      {/* Avaliação Cognitiva para TO */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Avaliação Cognitiva Funcional</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'orientacao_normal', label: 'Orientação normal' },
              { value: 'desorientado_tempo', label: 'Desorientado no tempo' },
              { value: 'desorientado_espaco', label: 'Desorientado no espaço' },
              { value: 'desorientado_pessoa', label: 'Desorientado quanto à pessoa' }
            ]}
            placeholder="Orientação"
          />

          <GlassSelect
            options={[
              { value: 'memoria_normal', label: 'Memória normal' },
              { value: 'comprometida', label: 'Memória comprometida' },
              { value: 'amnesia', label: 'Amnésia' }
            ]}
            placeholder="Memória funcional"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'sequenciamento_normal', label: 'Sequenciamento normal' },
              { value: 'dificuldade', label: 'Dificuldade no sequenciamento' },
              { value: 'incapaz', label: 'Incapaz de sequenciar' }
            ]}
            placeholder="Sequenciamento de tarefas"
          />

          <GlassSelect
            options={[
              { value: 'resolucao_normal', label: 'Resolução normal' },
              { value: 'dificuldade', label: 'Dificuldade na resolução' },
              { value: 'dependente', label: 'Dependente de orientação' }
            ]}
            placeholder="Resolução de problemas"
          />
        </div>
      </div>

      {/* Ambiente e Adaptações */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Home className="w-4 h-4" />
          Ambiente e Adaptações
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'domicilio', label: 'Domicílio' },
              { value: 'instituicao', label: 'Instituição' },
              { value: 'escola', label: 'Escola' },
              { value: 'trabalho', label: 'Trabalho' }
            ]}
            placeholder="Ambiente avaliado"
          />

          <GlassSelect
            options={[
              { value: 'adaptado', label: 'Adequadamente adaptado' },
              { value: 'parcialmente_adaptado', label: 'Parcialmente adaptado' },
              { value: 'nao_adaptado', label: 'Não adaptado' },
              { value: 'prejudicial', label: 'Prejudicial à funcionalidade' }
            ]}
            placeholder="Adaptação do ambiente"
          />
        </div>

        <GlassTextarea
          placeholder="Descrição das barreiras ambientais, adaptações necessárias, dispositivos auxiliares..."
          rows={3}
        />
      </div>

      {/* Diagnóstico em Terapia Ocupacional */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Diagnóstico em Terapia Ocupacional</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'limitacao_fisica', label: 'Limitação física' },
              { value: 'limitacao_cognitiva', label: 'Limitação cognitiva' },
              { value: 'limitacao_sensorial', label: 'Limitação sensorial' },
              { value: 'limitacao_psicossocial', label: 'Limitação psicossocial' },
              { value: 'deficiencia_ambiental', label: 'Deficiência ambiental' }
            ]}
            placeholder="Tipo de limitação"
          />

          <GlassSelect
            options={[
              { value: 'leve', label: 'Leve' },
              { value: 'moderada', label: 'Moderada' },
              { value: 'grave', label: 'Grave' },
              { value: 'total', label: 'Total' }
            ]}
            placeholder="Grau de limitação"
          />
        </div>

        <GlassTextarea
          placeholder="Diagnóstico ocupacional detalhado, impacto nas atividades de vida diária..."
          rows={3}
        />
      </div>

      {/* Plano Terapêutico Ocupacional */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Plano Terapêutico Ocupacional
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'treinamento_avd', label: 'Treinamento em AVD' },
              { value: 'adaptacao_ambiental', label: 'Adaptação ambiental' },
              { value: 'treinamento_orteses', label: 'Treinamento com órteses' },
              { value: 'reabilitacao_motora', label: 'Reabilitação motora' },
              { value: 'reabilitacao_cognitiva', label: 'Reabilitação cognitiva' },
              { value: 'terapia_grupo', label: 'Terapia em grupo' },
              { value: 'orientacao_familiar', label: 'Orientação familiar' }
            ]}
            placeholder="Tipo de intervenção"
          />

          <GlassSelect
            options={[
              { value: 'individual', label: 'Individual' },
              { value: 'grupo', label: 'Em grupo' },
              { value: 'familiar', label: 'Familiar' },
              { value: 'domiciliar', label: 'Domiciliar' }
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
          placeholder="Objetivos terapêuticos, estratégias de intervenção, materiais e equipamentos..."
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
            'Órteses e próteses',
            'Dispositivos auxiliares',
            'Equipamentos adaptados',
            'Tecnologia assistiva',
            'Materiais terapêuticos',
            'Ferramentas de avaliação',
            'Adaptações domiciliares',
            'Equipamentos de exercício',
            'Jogos terapêuticos',
            'Materiais sensoriais',
            'Ferramentas cognitivas',
            'Outros'
          ].map((resource) => (
            <label key={resource} className="flex items-center space-x-2 text-white/80">
              <input type="checkbox" className="rounded border-white/20 bg-white/5" />
              <span className="text-xs">{resource}</span>
            </label>
          ))}
        </div>

        <GlassTextarea
          placeholder="Recursos específicos necessários para a terapia ocupacional..."
          rows={2}
        />
      </div>

      {/* Observações em Terapia Ocupacional */}
      <GlassTextarea
        label="Observações em Terapia Ocupacional"
        placeholder="Observações sobre adesão à terapia, evolução funcional, barreiras identificadas..."
        rows={3}
      />
    </div>
  );
};

export default OccupationalTherapyFields;
