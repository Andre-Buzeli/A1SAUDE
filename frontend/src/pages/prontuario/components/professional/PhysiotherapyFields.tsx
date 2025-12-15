import React from 'react';
import GlassTextarea from '@/components/ui/GlassTextarea';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassButton from '@/components/ui/GlassButton';
import { Move, Target, TrendingUp, Users } from 'lucide-react';

interface SOAPData {
  subjective: any;
  objective: any;
  assessment: any;
  plan: any;
}

interface PhysiotherapyFieldsProps {
  soapData: SOAPData;
  updateObjective: (field: keyof SOAPData['objective'], value: string) => void;
  updatePlan: (field: keyof SOAPData['plan'], value: any) => void;
}

const PhysiotherapyFields: React.FC<PhysiotherapyFieldsProps> = ({ soapData, updateObjective, updatePlan }) => {
  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <h4 className="text-md font-semibold text-white flex items-center gap-2">
        <Move className="w-4 h-4" />
        Campos de Fisioterapia
      </h4>

      {/* Avaliação Funcional */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Avaliação Funcional</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'marcha', label: 'Marcha' },
              { value: 'equilibrio', label: 'Equilíbrio' },
              { value: 'forca', label: 'Força Muscular' },
              { value: 'mobilidade', label: 'Mobilidade Articular' },
              { value: 'flexibilidade', label: 'Flexibilidade' },
              { value: 'coordenação', label: 'Coordenação' },
              { value: 'resistencia', label: 'Resistência' },
              { value: 'dor', label: 'Avaliação da Dor' },
              { value: 'postura', label: 'Análise Postural' },
              { value: 'funcional', label: 'Independência Funcional' }
            ]}
            placeholder="Tipo de avaliação"
          />

          <GlassSelect
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'leve', label: 'Leve alteração' },
              { value: 'moderada', label: 'Moderada alteração' },
              { value: 'grave', label: 'Grave alteração' },
              { value: 'ausente', label: 'Função ausente' }
            ]}
            placeholder="Resultado"
          />
        </div>

        <GlassTextarea
          placeholder="Descrição detalhada da avaliação funcional..."
          rows={3}
        />
      </div>

      {/* Escalas Funcionais */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Escalas Funcionais</label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-white/60">Barthel (0-100)</label>
            <GlassInput
              type="number"
              min="0"
              max="100"
              placeholder="Pontuação"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/60">Rankin (0-5)</label>
            <GlassInput
              type="number"
              min="0"
              max="5"
              placeholder="Pontuação"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/60">Fugl-Meyer (0-226)</label>
            <GlassInput
              type="number"
              min="0"
              max="226"
              placeholder="Pontuação"
            />
          </div>
        </div>
      </div>

      {/* Medidas Antropométricas */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Medidas Antropométricas</label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassInput
            label="Circunferência braquial (cm)"
            type="number"
            step="0.1"
          />
          <GlassInput
            label="Circunferência da panturrilha (cm)"
            type="number"
            step="0.1"
          />
          <GlassInput
            label="Perímetro de marcha (cm)"
            type="number"
            step="0.1"
          />
          <GlassInput
            label="Amplitude articular"
            placeholder="Graus"
          />
        </div>
      </div>

      {/* Plano Terapêutico */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Plano Terapêutico Fisioterapêutico
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'cinesioterapia', label: 'Cinesioterapia' },
              { value: 'fisioterapia_respiratoria', label: 'Fisioterapia Respiratória' },
              { value: 'fisioterapia_aquatica', label: 'Fisioterapia Aquática' },
              { value: 'eletroterapia', label: 'Eletroterapia' },
              { value: 'termoterapia', label: 'Termoterapia' },
              { value: 'crioterapia', label: 'Crioterapia' },
              { value: 'massoterapia', label: 'Massoterapia' },
              { value: 'kinesiologia', label: 'Kinesiologia' },
              { value: 'exercicios_terapeuticos', label: 'Exercícios Terapêuticos' },
              { value: 'treinamento_funcional', label: 'Treinamento Funcional' },
              { value: 'orteses', label: 'Adaptação de Órteses' },
              { value: 'educacao_postural', label: 'Educação Postural' }
            ]}
            placeholder="Tipo de tratamento"
          />

          <div className="flex gap-2">
            <GlassInput
              placeholder="Frequência"
              className="flex-1"
            />
            <GlassSelect
              options={[
                { value: 'diaria', label: 'diária' },
                { value: 'semanal', label: 'semanal' },
                { value: 'quinzenal', label: 'quinzenal' },
                { value: 'mensal', label: 'mensal' }
              ]}
              placeholder="Periodicidade"
              className="w-32"
            />
          </div>
        </div>

        <GlassTextarea
          placeholder="Descrição detalhada do plano terapêutico..."
          rows={4}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          Adicionar Tratamento
        </GlassButton>
      </div>

      {/* Objetivos e Metas */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Objetivos e Metas
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'curto_prazo', label: 'Curto Prazo (1-4 semanas)' },
              { value: 'medio_prazo', label: 'Médio Prazo (1-3 meses)' },
              { value: 'longo_prazo', label: 'Longo Prazo (3-6 meses)' }
            ]}
            placeholder="Prazo do objetivo"
          />

          <GlassSelect
            options={[
              { value: 'melhoria_mobilidade', label: 'Melhoria da mobilidade' },
              { value: 'reducao_dor', label: 'Redução da dor' },
              { value: 'aumento_forca', label: 'Aumento da força' },
              { value: 'melhoria_equilibrio', label: 'Melhoria do equilíbrio' },
              { value: 'recuperacao_funcional', label: 'Recuperação funcional' },
              { value: 'prevencao_complicacoes', label: 'Prevenção de complicações' },
              { value: 'adaptacao_ortese', label: 'Adaptação a órteses' },
              { value: 'independencia_atividades', label: 'Independência em atividades' }
            ]}
            placeholder="Tipo de objetivo"
          />
        </div>

        <GlassTextarea
          placeholder="Descrição específica do objetivo e critérios de avaliação..."
          rows={3}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          Definir Objetivo
        </GlassButton>
      </div>

      {/* Recursos Terapêuticos */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Recursos Terapêuticos Utilizados</label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            'Bola suíça',
            'Bandas elásticas',
            'Pesos',
            'Tábua proprioceptiva',
            'Cadeira de rodas',
            'Andador',
            'Muletas',
            'Bengala',
            'Tala',
            'Colete ortopédico',
            'Aparelhos eletroterápicos',
            'Equipamentos aquáticos',
            'Outros'
          ].map((resource) => (
            <label key={resource} className="flex items-center space-x-2 text-white/80">
              <input type="checkbox" className="rounded border-white/20 bg-white/5" />
              <span className="text-sm">{resource}</span>
            </label>
          ))}
        </div>

        <GlassTextarea
          placeholder="Outros recursos ou observações sobre o tratamento..."
          rows={2}
        />
      </div>

      {/* Evolução e Progresso */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Evolução e Progresso</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'melhora_significativa', label: 'Melhora significativa' },
              { value: 'melhora_discreta', label: 'Melhora discreta' },
              { value: 'estabilidade', label: 'Estabilidade' },
              { value: 'piora_discreta', label: 'Piora discreta' },
              { value: 'piora_significativa', label: 'Piora significativa' },
              { value: 'sem_alteracao', label: 'Sem alteração significativa' }
            ]}
            placeholder="Evolução geral"
          />

          <GlassInput
            placeholder="Próxima avaliação em..."
            type="date"
          />
        </div>

        <GlassTextarea
          placeholder="Observações sobre a evolução do tratamento..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default PhysiotherapyFields;
