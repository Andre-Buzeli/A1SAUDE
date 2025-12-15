import React from 'react';
import GlassTextarea from '@/components/ui/GlassTextarea';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassButton from '@/components/ui/GlassButton';
import { Apple, Target, TrendingUp, Calculator } from 'lucide-react';

interface SOAPData {
  subjective: any;
  objective: any;
  assessment: any;
  plan: any;
}

interface NutritionFieldsProps {
  soapData: SOAPData;
  updateSubjective: (field: keyof SOAPData['subjective'], value: string) => void;
  updatePlan: (field: keyof SOAPData['plan'], value: any) => void;
}

const NutritionFields: React.FC<NutritionFieldsProps> = ({ soapData, updateSubjective, updatePlan }) => {
  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <h4 className="text-md font-semibold text-white flex items-center gap-2">
        <Apple className="w-4 h-4" />
        Campos de Nutrição
      </h4>

      {/* Hábitos Alimentares */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Hábitos Alimentares</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'regular', label: 'Refeições regulares' },
              { value: 'irregular', label: 'Refeições irregulares' },
              { value: 'pula_refeicoes', label: 'Pula refeições' },
              { value: 'belisca', label: 'Belisca entre refeições' },
              { value: 'restricao', label: 'Restrição alimentar' },
              { value: 'excesso', label: 'Excesso alimentar' }
            ]}
            placeholder="Padrão alimentar"
          />

          <GlassSelect
            options={[
              { value: 'casa', label: 'Refeições em casa' },
              { value: 'restaurante', label: 'Restaurante' },
              { value: 'fast_food', label: 'Fast food' },
              { value: 'misto', label: 'Misto' },
              { value: 'cantina', label: 'Cantina' }
            ]}
            placeholder="Local das refeições"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassSelect
            options={[
              { value: 'adequada', label: 'Adequada' },
              { value: 'insuficiente', label: 'Insuficiente' },
              { value: 'excesso', label: 'Excesso' }
            ]}
            placeholder="Ingestão hídrica"
          />

          <GlassSelect
            options={[
              { value: 'mastiga_bem', label: 'Mastiga bem' },
              { value: 'mastiga_mal', label: 'Mastiga mal' },
              { value: 'dentes_protese', label: 'Dentes/Prótese' },
              { value: 'dificuldade', label: 'Dificuldade mastigação' }
            ]}
            placeholder="Mastigação"
          />

          <GlassSelect
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'disfagia', label: 'Disfagia' },
              { value: 'odinofagia', label: 'Odinofagia' },
              { value: 'nauseas', label: 'Náuseas/Vômitos' }
            ]}
            placeholder="Deglutição"
          />
        </div>

        <GlassTextarea
          placeholder="Descrição detalhada dos hábitos alimentares, preferências, restrições..."
          rows={3}
        />
      </div>

      {/* Avaliação Antropométrica */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Avaliação Antropométrica
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassInput
            label="Peso (kg)"
            type="number"
            step="0.1"
          />
          <GlassInput
            label="Altura (cm)"
            type="number"
            step="0.1"
          />
          <GlassInput
            label="IMC"
            type="number"
            step="0.1"
            readOnly
          />
          <GlassSelect
            options={[
              { value: 'baixo_peso', label: 'Baixo peso' },
              { value: 'eutrofico', label: 'Eutrófico' },
              { value: 'sobrepeso', label: 'Sobrepeso' },
              { value: 'obesidade_grau1', label: 'Obesidade I' },
              { value: 'obesidade_grau2', label: 'Obesidade II' },
              { value: 'obesidade_grau3', label: 'Obesidade III' }
            ]}
            placeholder="Classificação IMC"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassInput
            label="Circunferência abdominal (cm)"
            type="number"
            step="0.1"
          />
          <GlassInput
            label="Circunferência do braço (cm)"
            type="number"
            step="0.1"
          />
          <GlassInput
            label="% Gordura corporal"
            type="number"
            step="0.1"
          />
        </div>
      </div>

      {/* Avaliação Bioquímica */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Avaliação Bioquímica</label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassInput
            label="Glicemia (mg/dL)"
            type="number"
          />
          <GlassInput
            label="Hemoglobina (g/dL)"
            type="number"
            step="0.1"
          />
          <GlassInput
            label="Colesterol total (mg/dL)"
            type="number"
          />
          <GlassInput
            label="Triglicerídeos (mg/dL)"
            type="number"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassInput
            label="Proteína C-reativa (mg/L)"
            type="number"
            step="0.1"
          />
          <GlassInput
            label="Albumina (g/dL)"
            type="number"
            step="0.1"
          />
          <GlassInput
            label="Hematócrito (%)"
            type="number"
            step="0.1"
          />
        </div>
      </div>

      {/* Diagnóstico Nutricional */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Diagnóstico Nutricional</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'desnutricao', label: 'Desnutrição' },
              { value: 'risco_desnutricao', label: 'Risco de desnutrição' },
              { value: 'eutrofico', label: 'Eutrófico' },
              { value: 'sobrepeso', label: 'Sobrepeso' },
              { value: 'obesidade', label: 'Obesidade' },
              { value: 'obesidade_morbida', label: 'Obesidade mórbida' }
            ]}
            placeholder="Estado nutricional"
          />

          <GlassSelect
            options={[
              { value: 'primaria', label: 'Deficiência primária' },
              { value: 'secundaria', label: 'Deficiência secundária' },
              { value: 'mista', label: 'Deficiência mista' },
              { value: 'excesso', label: 'Excesso nutricional' }
            ]}
            placeholder="Tipo de alteração"
          />
        </div>

        <GlassTextarea
          placeholder="Diagnóstico nutricional detalhado, fatores etiológicos..."
          rows={3}
        />
      </div>

      {/* Necessidades Nutricionais */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Necessidades Nutricionais</label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassInput
            label="Calorias/dia"
            type="number"
          />
          <GlassInput
            label="Proteínas (g/dia)"
            type="number"
          />
          <GlassInput
            label="Carboidratos (g/dia)"
            type="number"
          />
          <GlassInput
            label="Lipídios (g/dia)"
            type="number"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Fibras (g/dia)"
            type="number"
          />
          <GlassInput
            label="Líquidos (ml/dia)"
            type="number"
          />
        </div>
      </div>

      {/* Intervenção Nutricional */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Intervenção Nutricional
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'orientacao_alimentar', label: 'Orientação Alimentar' },
              { value: 'suplementacao', label: 'Suplementação Nutricional' },
              { value: 'nutricao_enteral', label: 'Nutrição Enteral' },
              { value: 'nutricao_parenteral', label: 'Nutrição Parenteral' },
              { value: 'modulacao_intestinal', label: 'Modulação Intestinal' },
              { value: 'terapia_nutricional', label: 'Terapia Nutricional' }
            ]}
            placeholder="Tipo de intervenção"
          />

          <GlassSelect
            options={[
              { value: 'curto_prazo', label: 'Curto prazo' },
              { value: 'medio_prazo', label: 'Médio prazo' },
              { value: 'longo_prazo', label: 'Longo prazo' }
            ]}
            placeholder="Duração da intervenção"
          />
        </div>

        <GlassTextarea
          placeholder="Plano alimentar detalhado, suplementos, orientações específicas..."
          rows={4}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          Definir Plano Nutricional
        </GlassButton>
      </div>

      {/* Monitoramento e Acompanhamento */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Monitoramento e Acompanhamento
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'semanal', label: 'Semanal' },
              { value: 'quinzenal', label: 'Quinzenal' },
              { value: 'mensal', label: 'Mensal' },
              { value: 'bimestral', label: 'Bimestral' }
            ]}
            placeholder="Frequência de acompanhamento"
          />

          <GlassSelect
            options={[
              { value: 'peso', label: 'Peso' },
              { value: 'circunferencias', label: 'Circunferências' },
              { value: 'bioquimicos', label: 'Exames bioquímicos' },
              { value: 'habitos', label: 'Hábitos alimentares' },
              { value: 'sintomas', label: 'Sintomas gastrointestinais' }
            ]}
            placeholder="Parâmetros a monitorar"
          />
        </div>

        <GlassTextarea
          placeholder="Critérios de avaliação, metas nutricionais, ajustes necessários..."
          rows={3}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          Agendar Acompanhamento
        </GlassButton>
      </div>

      {/* Observações Nutricionais */}
      <GlassTextarea
        label="Observações Nutricionais"
        placeholder="Observações sobre adesão ao tratamento, dificuldades encontradas, evolução nutricional..."
        rows={3}
      />
    </div>
  );
};

export default NutritionFields;
