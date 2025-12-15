import React from 'react';
import GlassTextarea from '@/components/ui/GlassTextarea';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassButton from '@/components/ui/GlassButton';
import { Tooth, AlertTriangle, FileText, Calendar } from 'lucide-react';

interface SOAPData {
  subjective: any;
  objective: any;
  assessment: any;
  plan: any;
}

interface DentalFieldsProps {
  soapData: SOAPData;
  updateSubjective: (field: keyof SOAPData['subjective'], value: string) => void;
  updateObjective: (field: keyof SOAPData['objective'], value: string) => void;
}

const DentalFields: React.FC<DentalFieldsProps> = ({ soapData, updateSubjective, updateObjective }) => {
  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <h4 className="text-md font-semibold text-white flex items-center gap-2">
        <Tooth className="w-4 h-4" />
        Campos de Odontologia
      </h4>

      {/* Queixa Principal Odontológica */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Queixa Principal</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'dor_dental', label: 'Dor dental' },
              { value: 'sensibilidade', label: 'Sensibilidade dentinária' },
              { value: 'mobilidade_dental', label: 'Mobilidade dental' },
              { value: 'sangramento_gengival', label: 'Sangramento gengival' },
              { value: 'infeccao', label: 'Infecção/Inchaço' },
              { value: 'trauma', label: 'Trauma dentário' },
              { value: 'problema_protese', label: 'Problema com prótese' },
              { value: 'estetica', label: 'Questão estética' },
              { value: 'preventivo', label: 'Consulta preventiva' },
              { value: 'outros', label: 'Outros' }
            ]}
            placeholder="Tipo de queixa"
          />

          <GlassInput
            placeholder="Dente(s) afetado(s) - ex: 11, 46..."
          />
        </div>

        <GlassTextarea
          placeholder="Descrição detalhada da queixa, intensidade da dor, fatores desencadeantes..."
          rows={3}
        />
      </div>

      {/* Avaliação Clínica */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Avaliação Clínica</label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassSelect
            options={[
              { value: 'cariada', label: 'Cárie' },
              { value: 'restaurada', label: 'Restaurada' },
              { value: 'ausente', label: 'Ausente' },
              { value: 'fraturada', label: 'Fraturada' },
              { value: 'tratamento_endodontico', label: 'Tratamento endodôntico' },
              { value: 'implante', label: 'Implante' },
              { value: 'coroa', label: 'Coroa' },
              { value: 'ponte', label: 'Ponte' }
            ]}
            placeholder="Condição dental"
          />

          <GlassSelect
            options={[
              { value: 'saudavel', label: 'Saudável' },
              { value: 'gingivite', label: 'Gengivite' },
              { value: 'periodontite_leve', label: 'Periodontite leve' },
              { value: 'periodontite_moderada', label: 'Periodontite moderada' },
              { value: 'periodontite_grave', label: 'Periodontite grave' }
            ]}
            placeholder="Condição periodontal"
          />

          <GlassSelect
            options={[
              { value: 'oclusao_normal', label: 'Oclusão normal' },
              { value: 'mordida_aberta', label: 'Mordida aberta' },
              { value: 'mordida_cruzada', label: 'Mordida cruzada' },
              { value: 'desvio_linha_media', label: 'Desvio da linha média' },
              { value: 'bruxismo', label: 'Sinais de bruxismo' }
            ]}
            placeholder="Oclusão"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Índice de Placa Bacteriana (%)"
            type="number"
            min="0"
            max="100"
          />

          <GlassInput
            label="Índice de Sangramento Gengival (%)"
            type="number"
            min="0"
            max="100"
          />
        </div>
      </div>

      {/* Exame Radiográfico */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Exame Radiográfico</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'bitewing', label: 'Bitewing' },
              { value: 'periapical', label: 'Periapical' },
              { value: 'panoramica', label: 'Panorâmica' },
              { value: 'tomografia', label: 'Tomografia computadorizada' },
              { value: 'nao_realizado', label: 'Não realizado' }
            ]}
            placeholder="Tipo de radiografia"
          />

          <GlassSelect
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'carie', label: 'Lesão de cárie' },
              { value: 'perda_ossea', label: 'Perda óssea' },
              { value: 'lesao_endodontica', label: 'Lesão endodôntica' },
              { value: 'patologia', label: 'Patologia' },
              { value: 'anomalia', label: 'Anomalia' }
            ]}
            placeholder="Achados radiográficos"
          />
        </div>

        <GlassTextarea
          placeholder="Descrição detalhada dos achados radiográficos..."
          rows={2}
        />
      </div>

      {/* Higiene Bucal */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Higiene Bucal</label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassSelect
            options={[
              { value: 'escova_manual', label: 'Escova manual' },
              { value: 'escova_eletrica', label: 'Escova elétrica' },
              { value: 'nao_escova', label: 'Não escova' }
            ]}
            placeholder="Tipo de escovação"
          />

          <GlassSelect
            options={[
              { value: 'fio_dental', label: 'Usa fio dental' },
              { value: 'nao_usa', label: 'Não usa' }
            ]}
            placeholder="Uso de fio dental"
          />

          <GlassSelect
            options={[
              { value: 'frequente', label: 'Frequente' },
              { value: 'ocasional', label: 'Ocasional' },
              { value: 'nunca', label: 'Nunca' }
            ]}
            placeholder="Visitas odontológicas"
          />
        </div>

        <GlassTextarea
          placeholder="Hábitos de higiene bucal, frequência, técnica utilizada..."
          rows={2}
        />
      </div>

      {/* Fatores de Risco */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Fatores de Risco
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            'Tabagismo',
            'Diabetes',
            'Hipertensão',
            'Obesidade',
            'Gravidez',
            'Imunossupressão',
            'Radioterapia',
            'Quimioterapia',
            'Uso de medicações',
            'Hábitos parafuncionais',
            'Dieta cariogênica',
            'Xerostomia'
          ].map((risk) => (
            <label key={risk} className="flex items-center space-x-2 text-white/80">
              <input type="checkbox" className="rounded border-white/20 bg-white/5" />
              <span className="text-xs">{risk}</span>
            </label>
          ))}
        </div>

        <GlassTextarea
          placeholder="Outros fatores de risco identificados..."
          rows={2}
        />
      </div>

      {/* Diagnóstico Odontológico */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Diagnóstico Odontológico</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'doenca_carie', label: 'Doença cárie' },
              { value: 'doenca_periodontal', label: 'Doença periodontal' },
              { value: 'lesao_endodontica', label: 'Lesão endodôntica' },
              { value: 'anomalia_desenvolvimento', label: 'Anomalia de desenvolvimento' },
              { value: 'traumatismo', label: 'Traumatismo dentário' },
              { value: 'lesao_pre_maligna', label: 'Lesão pré-maligna' },
              { value: 'problema_protesico', label: 'Problema protésico' },
              { value: 'alteracao_mucosa', label: 'Alteração de mucosa' }
            ]}
            placeholder="Diagnóstico principal"
          />

          <GlassSelect
            options={[
              { value: 'agudo', label: 'Agudo' },
              { value: 'cronico', label: 'Crônico' },
              { value: 'recorrente', label: 'Recorrente' }
            ]}
            placeholder="Característica"
          />
        </div>

        <GlassTextarea
          placeholder="Diagnóstico odontológico detalhado, localização, extensão..."
          rows={3}
        />
      </div>

      {/* Plano de Tratamento Odontológico */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Plano de Tratamento Odontológico
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'restaurador', label: 'Tratamento restaurador' },
              { value: 'endodontico', label: 'Tratamento endodôntico' },
              { value: 'periodontal', label: 'Tratamento periodontal' },
              { value: 'cirurgico', label: 'Tratamento cirúrgico' },
              { value: 'protesico', label: 'Tratamento protético' },
              { value: 'ortodontico', label: 'Tratamento ortodôntico' },
              { value: 'preventivo', label: 'Tratamento preventivo' },
              { value: 'emergencial', label: 'Tratamento emergencial' }
            ]}
            placeholder="Tipo de tratamento"
          />

          <GlassSelect
            options={[
              { value: 'urgente', label: 'Urgente' },
              { value: 'preferencial', label: 'Preferencial' },
              { value: 'eletivo', label: 'Eletivo' }
            ]}
            placeholder="Prioridade"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Número de sessões estimadas"
            type="number"
          />

          <GlassSelect
            options={[
              { value: 'curto_prazo', label: 'Curto prazo (até 1 mês)' },
              { value: 'medio_prazo', label: 'Médio prazo (1-6 meses)' },
              { value: 'longo_prazo', label: 'Longo prazo (acima de 6 meses)' }
            ]}
            placeholder="Duração estimada"
          />
        </div>

        <GlassTextarea
          placeholder="Procedimentos específicos, materiais necessários, cuidados especiais..."
          rows={4}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          Definir Plano de Tratamento
        </GlassButton>
      </div>

      {/* Orientações e Prescrições */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Orientações e Prescrições</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            options={[
              { value: 'medicamentosa', label: 'Prescrição medicamentosa' },
              { value: 'higiene_bucal', label: 'Orientações de higiene' },
              { value: 'dieta_alimentar', label: 'Orientação dietética' },
              { value: 'habitos', label: 'Correção de hábitos' },
              { value: 'emergencia', label: 'Orientações para emergência' },
              { value: 'manutencao', label: 'Cuidados de manutenção' }
            ]}
            placeholder="Tipo de orientação"
          />

          <GlassInput
            placeholder="Medicamento prescrito (se aplicável)"
          />
        </div>

        <GlassTextarea
          placeholder="Orientações detalhadas ao paciente, posologia, cuidados especiais..."
          rows={3}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          Adicionar Orientação
        </GlassButton>
      </div>

      {/* Agendamento de Retorno */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Agendamento de Retorno
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassInput
            label="Data sugerida"
            type="date"
          />

          <GlassInput
            label="Horário sugerido"
            type="time"
          />

          <GlassSelect
            options={[
              { value: 'avaliacao', label: 'Avaliação' },
              { value: 'procedimento', label: 'Procedimento' },
              { value: 'acompanhamento', label: 'Acompanhamento' },
              { value: 'manutencao', label: 'Manutenção' }
            ]}
            placeholder="Motivo do retorno"
          />
        </div>

        <GlassTextarea
          placeholder="Observações sobre o retorno agendado..."
          rows={2}
        />

        <GlassButton variant="outline" size="sm" className="w-full">
          Agendar Retorno
        </GlassButton>
      </div>

      {/* Observações Odontológicas */}
      <GlassTextarea
        label="Observações Odontológicas"
        placeholder="Observações sobre adesão ao tratamento, evolução clínica, intercorrências..."
        rows={3}
      />
    </div>
  );
};

export default DentalFields;
