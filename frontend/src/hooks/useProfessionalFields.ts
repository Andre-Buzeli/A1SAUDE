import { useMemo } from 'react';
import { UserProfile } from '@/types/auth';

export interface ProfessionalField {
  id: string;
  label: string;
  type: 'textarea' | 'input' | 'select' | 'checkbox' | 'radio';
  section: 'subjective' | 'objective' | 'assessment' | 'plan';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  rows?: number;
  dependsOn?: string; // ID do campo que deve estar preenchido
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface ProfessionalFieldGroup {
  id: string;
  title: string;
  description?: string;
  fields: ProfessionalField[];
}

// Campos específicos por perfil profissional
const PROFESSIONAL_FIELDS: Record<UserProfile, ProfessionalFieldGroup[]> = {
  // MÉDICO - Acesso completo ao SOAP com campos específicos
  medico: [
    {
      id: 'anamnesis',
      title: 'Anamnese Médica',
      description: 'Campos específicos para avaliação médica completa',
      fields: [
        {
          id: 'chief_complaint',
          label: 'Queixa Principal',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Descreva a queixa principal do paciente...',
          rows: 3
        },
        {
          id: 'current_illness_history',
          label: 'História da Doença Atual (HDA)',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Detalhes sobre início, evolução e características da doença...',
          rows: 4
        },
        {
          id: 'past_medical_history',
          label: 'História Médica Pregressa (HMP)',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Doenças anteriores, cirurgias, internações...',
          rows: 3
        },
        {
          id: 'family_history',
          label: 'História Familiar',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Doenças na família, hereditárias...',
          rows: 3
        },
        {
          id: 'medications_in_use',
          label: 'Medicamentos em Uso',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Liste os medicamentos que o paciente está usando...',
          rows: 2
        },
        {
          id: 'lifestyle_habits',
          label: 'Hábitos de Vida',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Fumante, etilista, atividade física, dieta...',
          rows: 3
        }
      ]
    },
    {
      id: 'physical_exam',
      title: 'Exame Físico',
      description: 'Avaliação física sistemática',
      fields: [
        {
          id: 'general_condition',
          label: 'Estado Geral',
          type: 'select',
          section: 'objective',
          options: ['Bom', 'Regular', 'Ruim', 'Grave'],
          required: true
        },
        {
          id: 'consciousness_level',
          label: 'Nível de Consciência',
          type: 'select',
          section: 'objective',
          options: ['Alerta', 'Sonolento', 'Confuso', 'Comatoso'],
          required: true
        },
        {
          id: 'hydration_status',
          label: 'Estado de Hidratação',
          type: 'select',
          section: 'objective',
          options: ['Euhidratado', 'Desidratado', 'Hiperidratado']
        },
        {
          id: 'systematic_exam',
          label: 'Exame Sistêmico',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Avaliação por sistemas (cardiovascular, respiratório, etc.)',
          rows: 6,
          required: true
        },
        {
          id: 'specific_exam',
          label: 'Exame Específico',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Exame específico relacionado à queixa principal',
          rows: 4
        }
      ]
    },
    {
      id: 'diagnostic_reasoning',
      title: 'Raciocínio Diagnóstico',
      description: 'Formulação e justificativa diagnóstica',
      fields: [
        {
          id: 'diagnostic_hypothesis',
          label: 'Hipótese Diagnóstica',
          type: 'textarea',
          section: 'assessment',
          required: true,
          placeholder: 'Formule sua hipótese diagnóstica...',
          rows: 3
        },
        {
          id: 'differential_diagnosis',
          label: 'Diagnóstico Diferencial',
          type: 'textarea',
          section: 'assessment',
          placeholder: 'Diagnósticos alternativos considerados...',
          rows: 3
        },
        {
          id: 'complementary_exams',
          label: 'Exames Complementares Necessários',
          type: 'textarea',
          section: 'assessment',
          placeholder: 'Exames laboratoriais, de imagem, etc.',
          rows: 2
        }
      ]
    },
    {
      id: 'therapeutic_plan',
      title: 'Plano Terapêutico',
      description: 'Conduta e planejamento do tratamento',
      fields: [
        {
          id: 'therapeutic_conduct',
          label: 'Conduta Terapêutica',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Descreva o plano terapêutico...',
          rows: 4
        },
        {
          id: 'prognosis',
          label: 'Prognóstico',
          type: 'select',
          section: 'plan',
          options: ['Excelente', 'Bom', 'Reservado', 'Ruim', 'Muito ruim'],
          required: true
        },
        {
          id: 'follow_up',
          label: 'Acompanhamento',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Plano de acompanhamento e retorno...',
          rows: 3
        }
      ]
    }
  ],

  // ENFERMEIRO - Foco em sinais vitais, cuidados e evolução de enfermagem
  enfermeiro: [
    {
      id: 'nursing_assessment',
      title: 'Avaliação de Enfermagem',
      description: 'Avaliação específica da enfermagem',
      fields: [
        {
          id: 'chief_complaint',
          label: 'Queixa Principal',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Queixa relatada pelo paciente ou acompanhante...',
          rows: 3
        },
        {
          id: 'pain_assessment',
          label: 'Avaliação da Dor',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Intensidade, localização, características da dor...',
          rows: 2
        },
        {
          id: 'functional_capacity',
          label: 'Capacidade Funcional',
          type: 'select',
          section: 'subjective',
          options: ['Independente', 'Semi-dependente', 'Dependente total']
        },
        {
          id: 'elimination_habits',
          label: 'Hábitos Eliminatórios',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Padrão intestinal, urinário, etc.',
          rows: 2
        }
      ]
    },
    {
      id: 'vital_signs_focus',
      title: 'Sinais Vitais e Monitorização',
      description: 'Monitorização detalhada dos sinais vitais',
      fields: [
        {
          id: 'pain_scale',
          label: 'Escala de Dor (0-10)',
          type: 'input',
          section: 'objective',
          validation: { min: 0, max: 10 }
        },
        {
          id: 'consciousness_avpu',
          label: 'Estado de Consciência (AVPU)',
          type: 'select',
          section: 'objective',
          options: ['Alert', 'Voice', 'Pain', 'Unresponsive'],
          required: true
        },
        {
          id: 'skin_condition',
          label: 'Condição da Pele',
          type: 'select',
          section: 'objective',
          options: ['Íntegra', 'Queimadura', 'Úlcera', 'Ressecamento']
        },
        {
          id: 'mobility_status',
          label: 'Estado de Mobilidade',
          type: 'select',
          section: 'objective',
          options: ['Deambula', 'Cadeira de rodas', 'Acatado', 'Imobilizado']
        },
        {
          id: 'nursing_physical_exam',
          label: 'Exame Físico de Enfermagem',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Focos em sinais de infecção, feridas, etc.',
          rows: 4
        }
      ]
    },
    {
      id: 'nursing_diagnosis',
      title: 'Diagnóstico de Enfermagem',
      description: 'Identificação de problemas de enfermagem',
      fields: [
        {
          id: 'nursing_diagnosis',
          label: 'Diagnóstico de Enfermagem',
          type: 'textarea',
          section: 'assessment',
          required: true,
          placeholder: 'Diagnósticos segundo taxonomia NANDA...',
          rows: 3
        },
        {
          id: 'risk_assessment',
          label: 'Avaliação de Riscos',
          type: 'textarea',
          section: 'assessment',
          placeholder: 'Riscos identificados (queda, infecção, etc.)',
          rows: 3
        }
      ]
    },
    {
      id: 'nursing_interventions',
      title: 'Intervenções de Enfermagem',
      description: 'Plano de cuidados e intervenções',
      fields: [
        {
          id: 'care_plan',
          label: 'Plano de Cuidados',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Intervenções prioritárias e plano de cuidados...',
          rows: 4
        },
        {
          id: 'medication_administration',
          label: 'Administração de Medicamentos',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Medicamentos a administrar, horários, vias...',
          rows: 3
        },
        {
          id: 'patient_education',
          label: 'Educação ao Paciente',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Orientações sobre cuidados, medicamentos, etc.',
          rows: 3
        },
        {
          id: 'discharge_planning',
          label: 'Planejamento de Alta',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Preparação para alta hospitalar...',
          rows: 2
        }
      ]
    }
  ],

  // FISIOTERAPEUTA - Avaliação funcional e tratamento fisioterapêutico
  fisioterapeuta: [
    {
      id: 'functional_assessment',
      title: 'Avaliação Funcional',
      description: 'Avaliação específica da capacidade funcional',
      fields: [
        {
          id: 'functional_complaint',
          label: 'Queixa Funcional',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Descreva a limitação funcional relatada...',
          rows: 3
        },
        {
          id: 'functional_history',
          label: 'História Funcional',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Evolução da condição funcional, tratamentos anteriores...',
          rows: 3
        },
        {
          id: 'daily_activities',
          label: 'Atividades de Vida Diária (AVD)',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Dificuldades em AVDs (banho, vestir, alimentação, etc.)',
          rows: 3
        }
      ]
    },
    {
      id: 'physical_assessment',
      title: 'Avaliação Física',
      description: 'Avaliação musculoesquelética e funcional',
      fields: [
        {
          id: 'postural_assessment',
          label: 'Avaliação Postural',
          type: 'textarea',
          section: 'objective',
          required: true,
          placeholder: 'Descrição da postura estática e dinâmica...',
          rows: 3
        },
        {
          id: 'joint_mobility',
          label: 'Mobilidade Articular',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Amplitude de movimento ativa/passiva...',
          rows: 3
        },
        {
          id: 'muscle_strength',
          label: 'Força Muscular',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Avaliação de força por grupos musculares...',
          rows: 3
        },
        {
          id: 'balance_coordination',
          label: 'Equilíbrio e Coordenação',
          type: 'select',
          section: 'objective',
          options: ['Normal', 'Alterado', 'Comprometido', 'Ausente']
        },
        {
          id: 'functional_tests',
          label: 'Testes Funcionais',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Resultados de testes específicos (sentar/levantar, marcha, etc.)',
          rows: 3
        }
      ]
    },
    {
      id: 'physiotherapy_diagnosis',
      title: 'Diagnóstico Fisioterapêutico',
      description: 'Identificação de disfunções e limitações',
      fields: [
        {
          id: 'physiotherapy_diagnosis',
          label: 'Diagnóstico Fisioterapêutico',
          type: 'textarea',
          section: 'assessment',
          required: true,
          placeholder: 'Identificação das disfunções encontradas...',
          rows: 3
        },
        {
          id: 'functional_goals',
          label: 'Objetivos Funcionais',
          type: 'textarea',
          section: 'assessment',
          placeholder: 'Metas funcionais a serem alcançadas...',
          rows: 3
        }
      ]
    },
    {
      id: 'physiotherapy_plan',
      title: 'Plano Fisioterapêutico',
      description: 'Tratamento e reabilitação',
      fields: [
        {
          id: 'treatment_plan',
          label: 'Plano de Tratamento',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Técnicas e exercícios prescritos...',
          rows: 4
        },
        {
          id: 'exercise_prescription',
          label: 'Prescrição de Exercícios',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Exercícios domiciliares, frequência, duração...',
          rows: 3
        },
        {
          id: 'prognosis_rehabilitation',
          label: 'Prognóstico de Reabilitação',
          type: 'select',
          section: 'plan',
          options: ['Excelente', 'Bom', 'Regular', 'Ruim'],
          required: true
        },
        {
          id: 'follow_up_physio',
          label: 'Acompanhamento Fisioterapêutico',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Frequência de sessões, reavaliações...',
          rows: 2
        }
      ]
    }
  ],

  // NUTRICIONISTA - Avaliação nutricional e prescrição dietética
  nutricionista: [
    {
      id: 'nutritional_assessment',
      title: 'Avaliação Nutricional',
      description: 'Histórico alimentar e hábitos nutricionais',
      fields: [
        {
          id: 'food_complaint',
          label: 'Queixa Alimentar',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Dificuldades alimentares, intolerâncias, restrições...',
          rows: 3
        },
        {
          id: 'dietary_history',
          label: 'Histórico Alimentar',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Hábitos alimentares atuais, preferências, aversões...',
          rows: 4
        },
        {
          id: 'weight_history',
          label: 'Histórico Ponderal',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Evolução do peso, tentativas de emagrecimento...',
          rows: 2
        },
        {
          id: 'food_intolerances',
          label: 'Intolerâncias e Alergias Alimentares',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Alergias, intolerâncias, restrições alimentares...',
          rows: 2
        }
      ]
    },
    {
      id: 'anthropometric_assessment',
      title: 'Avaliação Antropométrica',
      description: 'Medidas corporais e composição corporal',
      fields: [
        {
          id: 'bmi_calculation',
          label: 'Cálculo do IMC',
          type: 'input',
          section: 'objective',
          placeholder: 'Será calculado automaticamente',
          validation: { min: 10, max: 70 }
        },
        {
          id: 'waist_circumference',
          label: 'Circunferência da Cintura (cm)',
          type: 'input',
          section: 'objective',
          validation: { min: 50, max: 200 }
        },
        {
          id: 'hip_circumference',
          label: 'Circunferência do Quadril (cm)',
          type: 'input',
          section: 'objective',
          validation: { min: 50, max: 200 }
        },
        {
          id: 'body_composition',
          label: 'Composição Corporal',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Avaliação de gordura, massa muscular, etc.',
          rows: 3
        }
      ]
    },
    {
      id: 'nutritional_diagnosis',
      title: 'Diagnóstico Nutricional',
      description: 'Identificação de problemas nutricionais',
      fields: [
        {
          id: 'nutritional_diagnosis',
          label: 'Diagnóstico Nutricional',
          type: 'textarea',
          section: 'assessment',
          required: true,
          placeholder: 'Diagnósticos nutricionais identificados...',
          rows: 3
        },
        {
          id: 'nutritional_risks',
          label: 'Riscos Nutricionais',
          type: 'textarea',
          section: 'assessment',
          placeholder: 'Desnutrição, obesidade, déficits específicos...',
          rows: 2
        },
        {
          id: 'metabolic_assessment',
          label: 'Avaliação Metabólica',
          type: 'textarea',
          section: 'assessment',
          placeholder: 'Avaliação de exames bioquímicos relacionados...',
          rows: 3
        }
      ]
    },
    {
      id: 'nutritional_plan',
      title: 'Plano Nutricional',
      description: 'Intervenção e prescrição nutricional',
      fields: [
        {
          id: 'dietary_prescription',
          label: 'Prescrição Dietética',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Plano alimentar detalhado, macronutrientes, micronutrientes...',
          rows: 5
        },
        {
          id: 'nutritional_goals',
          label: 'Objetivos Nutricionais',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Metas de peso, adequação nutricional, etc.',
          rows: 3
        },
        {
          id: 'supplementation',
          label: 'Suplementação Necessária',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Vitaminas, minerais, outros suplementos...',
          rows: 2
        },
        {
          id: 'nutritional_monitoring',
          label: 'Acompanhamento Nutricional',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Frequência de consultas, reavaliações...',
          rows: 2
        }
      ]
    }
  ],

  // FONOAUDIÓLOGO - Avaliação da comunicação e deglutição
  fonoaudiologo: [
    {
      id: 'speech_assessment',
      title: 'Avaliação da Fala e Linguagem',
      description: 'Avaliação da comunicação verbal',
      fields: [
        {
          id: 'communication_complaint',
          label: 'Queixa de Comunicação',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Dificuldades na fala, compreensão, expressão...',
          rows: 3
        },
        {
          id: 'speech_history',
          label: 'História da Fala e Linguagem',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Desenvolvimento da linguagem, alterações observadas...',
          rows: 3
        },
        {
          id: 'swallowing_complaint',
          label: 'Queixa de Disfagia',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Dificuldades na deglutição, engasgos...',
          rows: 2
        }
      ]
    },
    {
      id: 'speech_evaluation',
      title: 'Avaliação Fonológica',
      description: 'Avaliação objetiva da fala e deglutição',
      fields: [
        {
          id: 'articulation_assessment',
          label: 'Avaliação Articulatória',
          type: 'textarea',
          section: 'objective',
          required: true,
          placeholder: 'Produção de fonemas, distorções, omissões...',
          rows: 3
        },
        {
          id: 'fluency_assessment',
          label: 'Avaliação da Fluência',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Gagueira, taquifemia, disfluências...',
          rows: 3
        },
        {
          id: 'voice_assessment',
          label: 'Avaliação Vocal',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Qualidade vocal, ressonância, projeção...',
          rows: 3
        },
        {
          id: 'swallowing_evaluation',
          label: 'Avaliação da Deglutição',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Avaliação clínica da deglutição...',
          rows: 3
        },
        {
          id: 'hearing_screening',
          label: 'Triagem Auditiva',
          type: 'select',
          section: 'objective',
          options: ['Normal', 'Alterada', 'Necessita avaliação audiológica']
        }
      ]
    },
    {
      id: 'speech_diagnosis',
      title: 'Diagnóstico Fonoaudiológico',
      description: 'Identificação de alterações',
      fields: [
        {
          id: 'speech_diagnosis',
          label: 'Diagnóstico Fonoaudiológico',
          type: 'textarea',
          section: 'assessment',
          required: true,
          placeholder: 'Alterações identificadas na fala, linguagem, voz...',
          rows: 3
        },
        {
          id: 'severity_level',
          label: 'Grau de Severidade',
          type: 'select',
          section: 'assessment',
          options: ['Leve', 'Moderado', 'Severo', 'Profundo']
        },
        {
          id: 'prognosis_speech',
          label: 'Prognóstico',
          type: 'select',
          section: 'assessment',
          options: ['Excelente', 'Bom', 'Reservado', 'Ruim']
        }
      ]
    },
    {
      id: 'speech_therapy_plan',
      title: 'Plano Terapêutico Fonoaudiológico',
      description: 'Intervenção e terapia da fala',
      fields: [
        {
          id: 'therapy_plan',
          label: 'Plano Terapêutico',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Objetivos terapêuticos, técnicas a serem utilizadas...',
          rows: 4
        },
        {
          id: 'speech_exercises',
          label: 'Exercícios e Atividades',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Exercícios domiciliares, frequência...',
          rows: 3
        },
        {
          id: 'communication_aids',
          label: 'Auxílios de Comunicação',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Próteses, auxílios alternativos de comunicação...',
          rows: 2
        },
        {
          id: 'follow_up_speech',
          label: 'Acompanhamento Fonoaudiológico',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Frequência de sessões, reavaliações...',
          rows: 2
        }
      ]
    }
  ],

  // DENTISTA - Avaliação odontológica
  dentista: [
    {
      id: 'dental_assessment',
      title: 'Avaliação Odontológica',
      description: 'Histórico e queixas dentárias',
      fields: [
        {
          id: 'dental_complaint',
          label: 'Queixa Odontológica',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Dor, sangramento, mobilidade, estética...',
          rows: 3
        },
        {
          id: 'oral_hygiene_habits',
          label: 'Hábitos de Higiene Bucal',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Frequência de escovação, uso de fio dental, enxaguantes...',
          rows: 2
        },
        {
          id: 'dental_history',
          label: 'Histórico Odontológico',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Tratamentos anteriores, extrações, próteses...',
          rows: 3
        }
      ]
    },
    {
      id: 'intraoral_exam',
      title: 'Exame Intraoral',
      description: 'Avaliação clínica da cavidade bucal',
      fields: [
        {
          id: 'teeth_condition',
          label: 'Condição dos Dentes',
          type: 'textarea',
          section: 'objective',
          required: true,
          placeholder: 'Cáries, restaurações, ausências, mobilidade...',
          rows: 3
        },
        {
          id: 'periodontal_condition',
          label: 'Condição Periodontal',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Gengivite, periodontite, sangramento, bolsas...',
          rows: 3
        },
        {
          id: 'mucosal_condition',
          label: 'Condição da Mucosa',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Lesões, inflamações, alterações de cor...',
          rows: 2
        },
        {
          id: 'occlusal_analysis',
          label: 'Análise Oclusal',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Relação de mordida, desgastes, interferências...',
          rows: 2
        },
        {
          id: 'radiographic_findings',
          label: 'Achados Radiográficos',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Lesões de furca, perdas ósseas, cistos...',
          rows: 2
        }
      ]
    },
    {
      id: 'dental_diagnosis',
      title: 'Diagnóstico Odontológico',
      description: 'Identificação de problemas bucais',
      fields: [
        {
          id: 'dental_diagnosis',
          label: 'Diagnóstico Odontológico',
          type: 'textarea',
          section: 'assessment',
          required: true,
          placeholder: 'Cáries, doenças periodontais, alterações da mucosa...',
          rows: 3
        },
        {
          id: 'treatment_urgency',
          label: 'Urgência do Tratamento',
          type: 'select',
          section: 'assessment',
          options: ['Eletiva', 'Preferencial', 'Urgente', 'Emergência']
        },
        {
          id: 'prognosis_dental',
          label: 'Prognóstico Odontológico',
          type: 'select',
          section: 'assessment',
          options: ['Excelente', 'Bom', 'Regular', 'Ruim', 'Comprometedor']
        }
      ]
    },
    {
      id: 'dental_treatment_plan',
      title: 'Plano de Tratamento Odontológico',
      description: 'Procedimentos odontológicos necessários',
      fields: [
        {
          id: 'treatment_sequence',
          label: 'Sequência de Tratamento',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Ordem dos procedimentos odontológicos necessários...',
          rows: 4
        },
        {
          id: 'preventive_measures',
          label: 'Medidas Preventivas',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Orientações de higiene, dieta cariogênica, flúor...',
          rows: 3
        },
        {
          id: 'oral_health_education',
          label: 'Educação em Saúde Bucal',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Orientações sobre prevenção e manutenção da saúde bucal...',
          rows: 3
        },
        {
          id: 'follow_up_dental',
          label: 'Acompanhamento Odontológico',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Frequência de consultas de manutenção, reavaliações...',
          rows: 2
        }
      ]
    }
  ],

  // TERAPEUTA OCUPACIONAL - Avaliação funcional e atividades de vida diária
  terapeuta_ocupacional: [
    {
      id: 'occupational_assessment',
      title: 'Avaliação Ocupacional',
      description: 'Avaliação das atividades de vida diária e ocupacionais',
      fields: [
        {
          id: 'functional_complaint',
          label: 'Queixa Funcional',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Dificuldades nas AVDs, trabalho, lazer...',
          rows: 3
        },
        {
          id: 'occupational_history',
          label: 'História Ocupacional',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Profissão atual/anterior, hobbies, rotinas diárias...',
          rows: 3
        },
        {
          id: 'environmental_barriers',
          label: 'Barreiras Ambientais',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Adaptações domiciliares necessárias, barreiras arquitetônicas...',
          rows: 2
        }
      ]
    },
    {
      id: 'functional_evaluation',
      title: 'Avaliação Funcional',
      description: 'Avaliação objetiva das capacidades funcionais',
      fields: [
        {
          id: 'adl_assessment',
          label: 'Avaliação de AVDs',
          type: 'textarea',
          section: 'objective',
          required: true,
          placeholder: 'Alimentação, higiene, vestir, locomoção, continência...',
          rows: 4
        },
        {
          id: 'iadl_assessment',
          label: 'Avaliação de AIVDs',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Compras, preparo de refeições, uso de telefone, medicamentos...',
          rows: 3
        },
        {
          id: 'cognitive_assessment',
          label: 'Avaliação Cognitiva',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Orientação, memória, atenção, resolução de problemas...',
          rows: 3
        },
        {
          id: 'motor_skills',
          label: 'Habilidades Motoras',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Coordenação, força, destreza manual, equilíbrio...',
          rows: 3
        }
      ]
    },
    {
      id: 'occupational_diagnosis',
      title: 'Diagnóstico Ocupacional',
      description: 'Identificação de disfunções ocupacionais',
      fields: [
        {
          id: 'occupational_diagnosis',
          label: 'Diagnóstico Ocupacional',
          type: 'textarea',
          section: 'assessment',
          required: true,
          placeholder: 'Disfunções ocupacionais identificadas...',
          rows: 3
        },
        {
          id: 'functional_independence',
          label: 'Grau de Independência Funcional',
          type: 'select',
          section: 'assessment',
          options: ['Independente', 'Independente com auxílios', 'Dependente parcial', 'Dependente total']
        },
        {
          id: 'occupational_prognosis',
          label: 'Prognóstico Ocupacional',
          type: 'select',
          section: 'assessment',
          options: ['Excelente', 'Bom', 'Reservado', 'Ruim']
        }
      ]
    },
    {
      id: 'occupational_plan',
      title: 'Plano Terapêutico Ocupacional',
      description: 'Intervenção e adaptações necessárias',
      fields: [
        {
          id: 'therapy_objectives',
          label: 'Objetivos Terapêuticos',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Objetivos funcionais a serem alcançados...',
          rows: 4
        },
        {
          id: 'adaptive_equipment',
          label: 'Equipamentos Adaptativos',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Órteses, próteses, auxílios técnicos necessários...',
          rows: 3
        },
        {
          id: 'environmental_adaptations',
          label: 'Adaptações Ambientais',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Modificações domiciliares, de trabalho, etc.',
          rows: 3
        },
        {
          id: 'occupational_follow_up',
          label: 'Acompanhamento Ocupacional',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Frequência de sessões, reavaliações, treinamentos...',
          rows: 2
        }
      ]
    }
  ],

  // PSICÓLOGO - Avaliação psicológica e suporte emocional
  psicologo: [
    {
      id: 'psychological_assessment',
      title: 'Avaliação Psicológica',
      description: 'Avaliação emocional e comportamental',
      fields: [
        {
          id: 'emotional_complaint',
          label: 'Queixa Emocional',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Ansiedade, depressão, estresse, conflitos emocionais...',
          rows: 3
        },
        {
          id: 'psychological_history',
          label: 'História Psicológica',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Tratamentos anteriores, medicações psicotrópicas, crises...',
          rows: 3
        },
        {
          id: 'family_dynamics',
          label: 'Dinâmica Familiar',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Relações familiares, conflitos, suporte social...',
          rows: 3
        },
        {
          id: 'social_support',
          label: 'Rede de Apoio Social',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Familiares, amigos, comunidade, isolamento social...',
          rows: 2
        }
      ]
    },
    {
      id: 'behavioral_observation',
      title: 'Observação Comportamental',
      description: 'Avaliação objetiva do comportamento',
      fields: [
        {
          id: 'behavioral_observation',
          label: 'Observação Comportamental',
          type: 'textarea',
          section: 'objective',
          required: true,
          placeholder: 'Postura, contato visual, afetividade, comunicação não-verbal...',
          rows: 4
        },
        {
          id: 'cognitive_functioning',
          label: 'Funcionamento Cognitivo',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Orientação, atenção, memória, raciocínio, insight...',
          rows: 3
        },
        {
          id: 'emotional_state',
          label: 'Estado Emocional',
          type: 'select',
          section: 'objective',
          options: ['Estável', 'Ansioso', 'Depressivo', 'Agitado', 'Agressivo', 'Apático']
        },
        {
          id: 'coping_mechanisms',
          label: 'Mecanismos de Coping',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Estratégias de enfrentamento identificadas...',
          rows: 2
        }
      ]
    },
    {
      id: 'psychological_diagnosis',
      title: 'Diagnóstico Psicológico',
      description: 'Avaliação diagnóstica segundo CID-10/11',
      fields: [
        {
          id: 'psychological_diagnosis',
          label: 'Diagnóstico Psicológico',
          type: 'textarea',
          section: 'assessment',
          required: true,
          placeholder: 'Transtornos mentais identificados (CID-10/11)...',
          rows: 3
        },
        {
          id: 'severity_assessment',
          label: 'Avaliação de Gravidade',
          type: 'select',
          section: 'assessment',
          options: ['Leve', 'Moderada', 'Grave', 'Extrema']
        },
        {
          id: 'risk_assessment',
          label: 'Avaliação de Risco',
          type: 'textarea',
          section: 'assessment',
          placeholder: 'Riscos identificados (suicídio, hetero-agressão, etc.)',
          rows: 3
        }
      ]
    },
    {
      id: 'psychological_intervention',
      title: 'Plano de Intervenção Psicológica',
      description: 'Terapia e acompanhamento psicológico',
      fields: [
        {
          id: 'therapy_plan',
          label: 'Plano Terapêutico',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Abordagem terapêutica, frequência, objetivos...',
          rows: 4
        },
        {
          id: 'crisis_intervention',
          label: 'Intervenção em Crise',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Estratégias para manejo de crises agudas...',
          rows: 3
        },
        {
          id: 'family_intervention',
          label: 'Intervenção Familiar',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Abordagem familiar quando necessário...',
          rows: 2
        },
        {
          id: 'psychological_follow_up',
          label: 'Acompanhamento Psicológico',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Frequência de sessões, reavaliações, encaminhamentos...',
          rows: 2
        }
      ]
    }
  ],

  // FARMACÊUTICO - Gestão de medicamentos e dispensação
  farmaceutico: [
    {
      id: 'medication_assessment',
      title: 'Avaliação de Medicações',
      description: 'Revisão e análise das prescrições',
      fields: [
        {
          id: 'medication_review',
          label: 'Revisão de Medicações',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Análise de todas as medicações em uso...',
          rows: 4
        },
        {
          id: 'adherence_assessment',
          label: 'Avaliação de Adesão',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Como o paciente toma os medicamentos, esquecimentos...',
          rows: 2
        },
        {
          id: 'side_effects',
          label: 'Efeitos Colaterais Relatados',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Reações adversas, intolerâncias, interações...',
          rows: 3
        }
      ]
    },
    {
      id: 'pharmaceutical_analysis',
      title: 'Análise Farmacêutica',
      description: 'Avaliação técnica das prescrições',
      fields: [
        {
          id: 'prescription_analysis',
          label: 'Análise da Prescrição',
          type: 'textarea',
          section: 'objective',
          required: true,
          placeholder: 'Correta prescrição, dosagem, via, frequência...',
          rows: 4
        },
        {
          id: 'drug_interactions',
          label: 'Interações Medicamentosas',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Interações potenciais entre medicamentos...',
          rows: 3
        },
        {
          id: 'contraindications',
          label: 'Contraindicações',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Contraindicações relativas/absolutas identificadas...',
          rows: 2
        },
        {
          id: 'stock_verification',
          label: 'Verificação de Estoque',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Disponibilidade dos medicamentos prescritos...',
          rows: 2
        }
      ]
    },
    {
      id: 'pharmaceutical_diagnosis',
      title: 'Diagnóstico Farmacêutico',
      description: 'Problemas relacionados à farmacoterapia',
      fields: [
        {
          id: 'pharmaceutical_problems',
          label: 'Problemas Relacionados à Medicamentos',
          type: 'textarea',
          section: 'assessment',
          required: true,
          placeholder: 'Problemas identificados na farmacoterapia...',
          rows: 3
        },
        {
          id: 'risk_classification',
          label: 'Classificação de Risco',
          type: 'select',
          section: 'assessment',
          options: ['Baixo', 'Moderado', 'Alto', 'Crítico']
        }
      ]
    },
    {
      id: 'pharmaceutical_plan',
      title: 'Plano Farmacêutico',
      description: 'Intervenções e orientações farmacêuticas',
      fields: [
        {
          id: 'pharmaceutical_interventions',
          label: 'Intervenções Farmacêuticas',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Sugestões de ajustes na farmacoterapia...',
          rows: 4
        },
        {
          id: 'patient_education_meds',
          label: 'Educação ao Paciente',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Orientações sobre uso correto dos medicamentos...',
          rows: 3
        },
        {
          id: 'dispensing_plan',
          label: 'Plano de Dispensação',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Como e quando dispensar os medicamentos...',
          rows: 2
        },
        {
          id: 'follow_up_pharma',
          label: 'Acompanhamento Farmacêutico',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Monitoramento de efeitos, ajustes necessários...',
          rows: 2
        }
      ]
    }
  ],

  // TÉCNICO DE ENFERMAGEM - Foco em procedimentos e cuidados básicos
  tecnico_enfermagem: [
    {
      id: 'care_assessment',
      title: 'Avaliação de Cuidados',
      description: 'Avaliação básica de necessidades de cuidado',
      fields: [
        {
          id: 'basic_needs_assessment',
          label: 'Avaliação de Necessidades Básicas',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Alimentação, higiene, eliminação, mobilidade...',
          rows: 3
        },
        {
          id: 'comfort_complaints',
          label: 'Queixas de Conforto',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Dor, ansiedade, desconforto, necessidades especiais...',
          rows: 2
        }
      ]
    },
    {
      id: 'basic_vital_signs',
      title: 'Sinais Vitais Básicos',
      description: 'Monitorização básica dos sinais vitais',
      fields: [
        {
          id: 'vital_signs_monitoring',
          label: 'Monitorização de Sinais Vitais',
          type: 'textarea',
          section: 'objective',
          required: true,
          placeholder: 'Tendências observadas, alterações identificadas...',
          rows: 3
        },
        {
          id: 'wound_assessment',
          label: 'Avaliação de Feridas',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Curativos, feridas, escaras, infecções locais...',
          rows: 2
        },
        {
          id: 'basic_physical_exam',
          label: 'Exame Físico Básico',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Estado geral, pele, mucosas, sinais de infecção...',
          rows: 3
        }
      ]
    },
    {
      id: 'care_diagnosis',
      title: 'Identificação de Necessidades',
      description: 'Problemas de cuidado identificados',
      fields: [
        {
          id: 'care_needs_identified',
          label: 'Necessidades de Cuidado Identificadas',
          type: 'textarea',
          section: 'assessment',
          required: true,
          placeholder: 'Cuidados imediatos necessários...',
          rows: 3
        },
        {
          id: 'priority_level',
          label: 'Nível de Prioridade',
          type: 'select',
          section: 'assessment',
          options: ['Baixa', 'Média', 'Alta', 'Crítica']
        }
      ]
    },
    {
      id: 'care_plan_basic',
      title: 'Plano de Cuidados Básicos',
      description: 'Procedimentos e cuidados imediatos',
      fields: [
        {
          id: 'immediate_care',
          label: 'Cuidados Imediatos',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Procedimentos a serem realizados imediatamente...',
          rows: 4
        },
        {
          id: 'medication_assistance',
          label: 'Assistência com Medicações',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Preparação e administração de medicamentos...',
          rows: 2
        },
        {
          id: 'basic_procedures',
          label: 'Procedimentos Básicos',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Curativos, higiene, alimentação assistida...',
          rows: 3
        },
        {
          id: 'monitoring_plan',
          label: 'Plano de Monitorização',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Frequência de verificação de sinais vitais, observações...',
          rows: 2
        }
      ]
    }
  ],

  // RECEPCIONISTA - Acesso limitado, foco administrativo
  recepcionista: [
    {
      id: 'administrative_assessment',
      title: 'Avaliação Administrativa',
      description: 'Dados administrativos e de agendamento',
      fields: [
        {
          id: 'scheduling_complaint',
          label: 'Motivo da Consulta',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Motivo relatado pelo paciente para a consulta...',
          rows: 2
        },
        {
          id: 'previous_appointments',
          label: 'Histórico de Agendamentos',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Consultas anteriores, faltas, reagendamentos...',
          rows: 2
        }
      ]
    },
    {
      id: 'basic_observation',
      title: 'Observação Básica',
      description: 'Observações gerais do estado do paciente',
      fields: [
        {
          id: 'general_appearance',
          label: 'Aparência Geral',
          type: 'select',
          section: 'objective',
          options: ['Boa', 'Regular', 'Ruim', 'Grave']
        },
        {
          id: 'basic_complaints',
          label: 'Queixas Básicas',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Queixas relatadas resumidamente...',
          rows: 2
        }
      ]
    },
    {
      id: 'triage_assessment',
      title: 'Avaliação para Triagem',
      description: 'Dados para classificação de risco',
      fields: [
        {
          id: 'urgency_level',
          label: 'Nível de Urgência',
          type: 'select',
          section: 'assessment',
          options: ['Não urgente', 'Pouco urgente', 'Urgente', 'Muito urgente', 'Emergência']
        }
      ]
    },
    {
      id: 'administrative_plan',
      title: 'Plano Administrativo',
      description: 'Encaminhamentos administrativos',
      fields: [
        {
          id: 'triage_routing',
          label: 'Encaminhamento para Triagem',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Encaminhar para triagem conforme protocolo...',
          rows: 2
        },
        {
          id: 'appointment_scheduling',
          label: 'Agendamento de Consulta',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Agendar consulta especializada se necessário...',
          rows: 2
        }
      ]
    }
  ],

  // SECRETÁRIO - Semelhante ao recepcionista, mas com mais responsabilidades administrativas
  secretario: [
    {
      id: 'administrative_assessment',
      title: 'Avaliação Administrativa',
      description: 'Dados administrativos e de agendamento',
      fields: [
        {
          id: 'scheduling_complaint',
          label: 'Motivo da Consulta',
          type: 'textarea',
          section: 'subjective',
          required: true,
          placeholder: 'Motivo relatado pelo paciente para a consulta...',
          rows: 2
        },
        {
          id: 'previous_appointments',
          label: 'Histórico de Agendamentos',
          type: 'textarea',
          section: 'subjective',
          placeholder: 'Consultas anteriores, faltas, reagendamentos...',
          rows: 2
        }
      ]
    },
    {
      id: 'basic_observation',
      title: 'Observação Básica',
      description: 'Observações gerais do estado do paciente',
      fields: [
        {
          id: 'general_appearance',
          label: 'Aparência Geral',
          type: 'select',
          section: 'objective',
          options: ['Boa', 'Regular', 'Ruim', 'Grave']
        },
        {
          id: 'basic_complaints',
          label: 'Queixas Básicas',
          type: 'textarea',
          section: 'objective',
          placeholder: 'Queixas relatadas resumidamente...',
          rows: 2
        }
      ]
    },
    {
      id: 'triage_assessment',
      title: 'Avaliação para Triagem',
      description: 'Dados para classificação de risco',
      fields: [
        {
          id: 'urgency_level',
          label: 'Nível de Urgência',
          type: 'select',
          section: 'assessment',
          options: ['Não urgente', 'Pouco urgente', 'Urgente', 'Muito urgente', 'Emergência']
        }
      ]
    },
    {
      id: 'administrative_plan',
      title: 'Plano Administrativo',
      description: 'Encaminhamentos administrativos',
      fields: [
        {
          id: 'triage_routing',
          label: 'Encaminhamento para Triagem',
          type: 'textarea',
          section: 'plan',
          required: true,
          placeholder: 'Encaminhar para triagem conforme protocolo...',
          rows: 2
        },
        {
          id: 'appointment_scheduling',
          label: 'Agendamento de Consulta',
          type: 'textarea',
          section: 'plan',
          placeholder: 'Agendar consulta especializada se necessário...',
          rows: 2
        }
      ]
    }
  ],

  // Perfis administrativos - Acesso limitado ao prontuário (apenas leitura)
  system_master: [],
  gestor_geral: [],
  diretor_local: [],
  gestor_local: [],
  coordenador_geral: [],
  coordenador_local: [],
  supervisor: []
};

// Hook principal para obter campos específicos por profissional
export const useProfessionalFields = (profile: UserProfile): ProfessionalFieldGroup[] => {
  return useMemo(() => {
    return PROFESSIONAL_FIELDS[profile] || [];
  }, [profile]);
};

// Hook para obter campos de uma seção específica
export const useProfessionalFieldsBySection = (profile: UserProfile, section: 'subjective' | 'objective' | 'assessment' | 'plan'): ProfessionalField[] => {
  return useMemo(() => {
    const fieldGroups = PROFESSIONAL_FIELDS[profile] || [];
    return fieldGroups.flatMap(group => group.fields.filter(field => field.section === section));
  }, [profile, section]);
};

// Hook para obter todos os campos obrigatórios de um profissional
export const useRequiredFields = (profile: UserProfile): ProfessionalField[] => {
  return useMemo(() => {
    const fieldGroups = PROFESSIONAL_FIELDS[profile] || [];
    return fieldGroups.flatMap(group => group.fields.filter(field => field.required));
  }, [profile]);
};

// Hook para verificar se um campo é obrigatório
export const useIsFieldRequired = (profile: UserProfile, fieldId: string): boolean => {
  return useMemo(() => {
    const fieldGroups = PROFESSIONAL_FIELDS[profile] || [];
    return fieldGroups.some(group =>
      group.fields.some(field => field.id === fieldId && field.required)
    );
  }, [profile, fieldId]);
};

// Hook para obter a configuração de validação de um campo
export const useFieldValidation = (profile: UserProfile, fieldId: string) => {
  return useMemo(() => {
    const fieldGroups = PROFESSIONAL_FIELDS[profile] || [];
    for (const group of fieldGroups) {
      const field = group.fields.find(f => f.id === fieldId);
      if (field?.validation) {
        return field.validation;
      }
    }
    return null;
  }, [profile, fieldId]);
};









