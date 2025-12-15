\# 🏡 A1 SAÚDE --- MÓDULO UBS v3.0

\*\*Documento Técnico Oficial -- Nível Profissional Máximo (SRS + API
Blueprint + BI/IA)\*\*

\*\*Escopo:\*\* Atenção Primária à Saúde (ESF / UBS) • RBAC por unidade
• LGPD • Auditoria • IA Preditiva • WhatsApp Lembretes

\-\--

\## 📑 SUMÁRIO (clicável)

1\. \[Padrões, Perfis e Estrutura de
Dados\](#1-padrões-perfis-e-estrutura-de-dados)

2\. \[Painel Inicial / Visão da UBS\](#2-painel-inicial\--visão-da-ubs)

3\. \[Cadastro do Paciente\](#3-cadastro-do-paciente)

4\. \[Agendamento + Lembretes
WhatsApp\](#4-agendamento\--lembretes-whatsapp)

5\. \[Consulta Médica (SOAP)\](#5-consulta-médica-soap)

6\. \[Consultas Multiprofissionais\](#6-consultas-multiprofissionais)

7\. \[Populações Específicas\](#7-populações-específicas)

8\. \[Procedimentos e Exames\](#8-procedimentos-e-exames)

9\. \[Vacinação\](#9-vacinação)

10\. \[Saúde Bucal (Odontologia)\](#10-saúde-bucal-odontologia)

11\. \[Visitas Domiciliares / Território
(ACS)\](#11-visitas-domiciliares\--território-acs)

12\. \[Acolhimento e Classificação de
Risco\](#12-acolhimento-e-classificação-de-risco)

13\. \[Relatórios e Indicadores
(APS/ESF)\](#13-relatórios-e-indicadores-apsesf)

14\. \[Integrações (e-SUS PEC, CNES, SIGTAP, WhatsApp
API)\](#14-integrações-e-sus-pec-cnes-sigtap-whatsapp-api)

15\. \[Segurança, LGPD e Auditoria\](#15-segurança-lgpd-e-auditoria)

16\. \[Apêndice --- Fórmulas, Campos e Layout de
Entrada\](#16-apêndice\--fórmulas-campos-e-layout-de-entrada)

17\. \[Critérios de Aceite
(QA/Entrega)\](#17-critérios-de-aceite-qaentrega)

\-\--

\## 1) Padrões, Perfis e Estrutura de Dados

\### 🧠 Descrição Funcional

\- Autenticação \*\*JWT + MFA\*\*; o profissional escolhe \*\*Unidade
Ativa\*\* (contexto de sessão).

\- \*\*RBAC por unidade\*\* e \*\*por categoria profissional\*\*.

\- Todos os registros geram \*\*trilha de auditoria\*\* e respeitam
\*\*LGPD\*\*.

\### 👥 Perfis com acesso na UBS

\- \*\*Médico(a)\*\* • \*\*Enfermeiro(a)\*\* • \*\*Técnico(a) de
Enfermagem\*\*

\- \*\*Dentista\*\* • \*\*Nutricionista\*\* • \*\*Psicólogo(a)\*\* •
\*\*Fisioterapeuta\*\*

\- \*\*ACS (Agente Comunitário de Saúde)\*\* • \*\*Recepcionista
(Agendamento/Cadastro)\*\*

\### 💻 Estrutura de Dados (principais)

\- \`pacientes(id, nome, cpf, cns, nascimento, sexo, raça, endereço,
contatos, vulnerabilidades, ...)\`

\- \`agendamentos(id, paciente_id, profissional_id, unidade_id, data,
hora, tipo, status, canal)\`

\- \`consultas(id, paciente_id, unidade_id, profissional_id, tipo, soap,
cid10, plano, anexos, assinatura)\`

\- \`consultas_multi(id, paciente_id, profissional_id, categoria, notas,
anexos)\`

\- \`populacoes(paciente_id, crianca, mulher, gestante, puerperio,
homem, idoso, saude_mental, ...)\`

\- \`procedimentos(id, paciente_id, sigtap, data, profissional_id,
observacao, anexo)\`

\- \`exames(id, paciente_id, tipo, data_solicit, data_result, arquivo,
laudo)\`

\- \`vacinas(id, paciente_id, vacina, lote, validade, data_aplic,
profissional_id, local_aplic)\`

\- \`odontologia(id, paciente_id, tipo, procedimentos, plano, anexos)\`

\- \`visitas(id, paciente_id, data, profissional_id, motivo, situacao,
acoes, encaminh, gps)\`

\- \`acolhimento(id, paciente_id, data_hora, queixa, sinais_vitais,
risco, profissional_id)\`

\- \`audit_logs(id, user_id, unidade_id, recurso, acao, payload_hash,
timestamp, ip, ua)\`

\-\--

\## 2) Painel Inicial / Visão da UBS

\### 🧠 Descrição Funcional

Visão 360° da UBS: \*\*agenda do dia\*\*, \*\*fila de espera\*\*,
\*\*indicadores-chave\*\* (produtividade, no-show, cobertura de
crônicos, vacinação, visitas domiciliares pendentes) e \*\*alertas\*\*.

\### 🧾 Entradas / Filtros

\- \`\[Período: data_inicial -- data_final\]\` • \`\[Profissional\]\` •
\`\[Equipe/ESF\]\` • \`\[Categoria\]\`

\### 📊 Principais Cálculos

\- \*\*No-Show (NS%)\*\* = \`Faltas / Agendamentos × 100%\`

\- \*\*Produtividade do Dia (PD)\*\* = \`Atendimentos_Concluídos /
Horas_Trabalhadas\`

\- \*\*Cobertura Hipertensos (CH%)\*\* = \`Hipertensos_Acompanhados /
Hipertensos_Cadastrados × 100%\`

\- \*\*Cobertura Diabéticos (CD%)\*\* = \`Diabéticos_Acompanhados /
Diabéticos_Cadastrados × 100%\`

\- \*\*Visitas Pendentes (VP)\*\* =
\`Casos_prioritários_sem_visita_no_prazo\`

\### 🎨 UI/UX

Cards clicáveis com \*\*drill-down\*\* → leva direto para a aba
relevante (Agenda, SOAP, Populações, Visitas).

\-\--

\## 3) Cadastro do Paciente

\### 🧠 Descrição Funcional

Cadastro completo \*\*padrão PEC\*\* (identificação, endereço, contatos,
saúde, vulnerabilidades). \*\*Upload\*\* de documentos e
\*\*geolocalização\*\* (domicílio).

\### 🧾 Campos (entrada)

\- \*\*Identificação:\*\* \`\[nome\] \[nome_social\] \[nascimento\]
\[sexo\] \[raça/cor\] \[cpf\] \[cns\] \[rg\] \[estado_civil\]\`

\- \*\*Endereço/Contato:\*\* \`\[cep\] \[logradouro\] \[número\]
\[bairro\] \[município/UF\] \[tel1\] \[tel2\] \[e-mail\] \[GPS\]\`

\- \*\*Saúde:\*\* \`\[grupo_sanguíneo\] \[fator_RH\] \[alergias\]
\[condições_crônicas\] \[medicações_contínuas\]\`

\- \*\*Vulnerabilidades:\*\* \`\[situação_rua\] \[deficiência\]
\[violência\] \[acamado\] \[judicial\]\`

\- \*\*Anexos:\*\* \`\[RG.pdf/jpg\] \[Comprovante.pdf/jpg\]
\[Laudos.pdf\]\`

\### 💻 Validações

\- \`CPF\` e \`CNS\` \*\*únicos\*\*; campos mandatórios: \`nome\`,
\`nascimento\`, \`sexo\`.

\-\--

\## 4) Agendamento + Lembretes WhatsApp

\### 🧠 Descrição Funcional

Agendamento por \*\*profissional/unidade\*\* com \*\*lembretes
automáticos via WhatsApp\*\* (24h antes, confirmação, pós-consulta).

\### 🧾 Campos

\- \`\[paciente\]\` \`\[profissional\]\` \`\[data\]\` \`\[hora\]\`
\`\[tipo: 1ª consulta/retorno/urgência/preventivo\]\`
\`\[observações\]\`

\- \*\*WhatsApp:\*\* \`\[x\] enviar lembrete 24h\` \`\[x\] confirmar
presença\` \`\[x\] mensagem pós-consulta\]\`

\### 📊 Cálculos

\- \*\*NS%\*\* (no-show), \*\*Taxa de Confirmação (TC%)\*\* =
\`Confirmados / Lembretes_enviados × 100%\`

\- \*\*Efetividade do Lembrete (EL%)\*\* = \`(NS%\_sem - NS%\_com) /
NS%\_sem × 100%\`

\-\--

\## 5) Consulta Médica (SOAP)

\### 🧠 Descrição Funcional

Atendimento médico \*\*SOAP\*\* com \*\*CID-10\*\*, \*\*prescrição\*\*,
\*\*exames\*\*, \*\*atestado\*\* e \*\*encaminhamentos\*\*.
\*\*Assinatura digital\*\*.

\### 🧾 Campos

\- \*\*S (Subjetivo):\*\* \`\[texto_long\]\`

\- \*\*O (Objetivo):\*\* \`\[PA\] \[FC\] \[FR\] \[Temperatura\] \[SpO2\]
\[Peso\] \[Altura\] \[IMC auto\]\`

\- \*\*A (Avaliação):\*\* \`\[texto_long\] \[CID-10 (autocomplete)\]\`

\- \*\*P (Plano):\*\* \`\[condutas\] \[retorno\] \[orientações\]
\[exames + anexos\] \[prescrição\] \[atestados\] \[encaminhamento\]\`

\- \*\*Assinatura:\*\* \`\[✍ Assinar\]\` • \`timestamp auto\`

\### 📊 Cálculos

\- \*\*IMC\*\* = \`peso(kg) / (altura(m))²\`

\- \*\*Complexidade média por consulta (proxy)\*\* = \`f(qtd_exames,
qtd_medicamentos, CID_grupo)\`

\-\--

\## 6) Consultas Multiprofissionais

\### 🧠 Descrição Funcional

Registros estruturados por \*\*Enfermeiro\*\*, \*\*Técnico\*\*,
\*\*Dentista\*\*, \*\*Nutricionista\*\*, \*\*Psicólogo\*\*,
\*\*Fisioterapeuta\*\*.

Cada categoria tem \*\*formulário próprio\*\* + anexos e plano de
cuidado.

\### 🧾 Campos (por categoria -- exemplos)

\- \*\*Enfermagem:\*\* \`\[anamnese_enfermagem\] \[sinais_vitais\]
\[diagnóstico_enf\] \[prescrição_cuidados\] \[evolução\]\`

\- \*\*Técnico Enferm.:\*\* \`\[procedimentos_realizados\]
\[observações\]\`

\- \*\*Nutrição:\*\* \`\[peso/altura/IMC\] \[recordatório_24h\]
\[plano_alimentar\] \[metas\]\`

\- \*\*Psicologia:\*\* \`\[queixa\] \[escala_ans/depr\] \[hipótese\]
\[plano_terapêutico\]\`

\- \*\*Fisioterapia:\*\* \`\[avaliação_funcional\] \[goniometria\]
\[plano_exercícios\] \[sessões\]\`

\- \*\*Odonto:\*\* (detalhado na aba 10)

\### 📊 Cálculos

\- \*\*Adesão ao plano multiprofissional (AP%)\*\* =
\`Sessões_realizadas / Sessões_previstas × 100%\`

\- \*\*Efeito clínico proxy (ECP)\*\* = \`Δ indicadores (ex: PA, HbA1c,
IMC) / baseline\`

\-\--

\## 7) Populações Específicas

\### 🧠 Descrição Funcional

Acompanhamento longitudinal por \*\*criança, mulher, gestante,
puerpério, homem, idoso, saúde mental\*\* com \*\*checklists\*\* e
\*\*metas\*\*.

\### 🧾 Campos-chave (exemplos)

\- \*\*Criança:\*\* \`\[aleitamento\] \[peso/altura/PC\]
\[marcos_desenvolvimento\] \[vacinas\]\`

\- \*\*Mulher:\*\* \`\[Cito preventivo data + resultado\] \[planejamento
reprodutivo\]\`

\- \*\*Gestante:\*\* \`\[DUM\] \[DPP auto\] \[consultas_pré-natal\]
\[exames\] \[USG/anexos\] \[risco\]\`

\- \*\*Puerpério:\*\* \`\[data_parto\] \[tipo_parto\] \[AM\]
\[estado_emocional\]\`

\- \*\*Homem:\*\* \`\[rastreio_próstata\] \[PSA\] \[fatores_risco\]\`

\- \*\*Idoso:\*\* \`\[Katz/Lawton\] \[quedas\] \[polifarmácia\]\`

\- \*\*Saúde Mental:\*\* \`\[CID\] \[escalas\] \[psicotrópicos\]
\[CAPS\]\`

\### 📊 Cálculos

\- \*\*Cobertura por população (CP%)\*\* = \`Seguidos_no_Período /
Cadastrados × 100%\`

\- \*\*Pré-natal adequado (PNA%)\*\* = \`Gestantes_7+consultas /
Gestantes_total × 100%\`

\- \*\*Baixo Peso ao Nascer (BPN%)\*\* (via integração)

\- \*\*Controle HAS/DM (CHAS% / CDM%)\*\* = \`Acompanhados_com_metas /
Crônicos × 100%\`

\-\--

\## 8) Procedimentos e Exames

\### 🧠 Descrição Funcional

Registra \*\*procedimentos (SIGTAP)\*\*, solicitações e \*\*resultados
de exames\*\* (laboratório e imagem) com \*\*anexos\*\*.

\### 🧾 Campos

\- \`\[procedimento (SIGTAP)\] \[data_execução\] \[profissional\]
\[observações\] \[anexar_resultado\]\`

\- \*\*Exames:\*\* \`\[tipo\] \[data_solicitação\] \[data_resultado\]
\[arquivo/laudo\]\`

\### 📊 Cálculos

\- \*\*Tempo Médio Solicitação→Resultado (TMSR)\*\* = \`Σ (data_result -
data_solic) / N\`

\- \*\*Taxa de realização (TR%)\*\* = \`Exames_com_resultado /
Exames_solicitados × 100%\`

\-\--

\## 9) Vacinação

\### 🧠 Descrição Funcional

Histórico vacinal (SI-PNI), controle por \*\*lote/validade\*\*, emissão
de comprovante.

\### 🧾 Campos

\- \`\[vacina (autocomplete SI-PNI)\] \[lote\] \[fabricante\]
\[validade_lote\] \[data_aplic\] \[profissional\] \[local_aplic\]
\[obs\]\`

\### 📊 Cálculos

\- \*\*Cobertura Vacinal (CV%)\*\* por faixa/etário = \`Doses_aplicadas
/ População_alvo × 100%\`

\- \*\*Atraso Vacinal (AV%)\*\* = \`Pendentes_no_prazo / Agendados ×
100%\`

\-\--

\## 10) Saúde Bucal (Odontologia)

\### 🧠 Descrição Funcional

Atendimentos odontológicos, urgências, \*\*procedimentos SIGTAP\*\*,
\*\*plano terapêutico\*\* e \*\*exames complementares\*\*.

\### 🧾 Campos

\- \`\[tipo_atendimento\] \[procedimentos_realizados (SIGTAP)\]
\[anotações\] \[solicitação_exame_odonto\] \[plano_tratamento\]
\[anexos\]\`

\### 📊 Cálculos

\- \*\*Produtividade Odonto (PO)\*\* = \`Procedimentos_realizados /
Horas_odonto\`

\- \*\*Taxa de Conclusão de Plano (TCP%)\*\* = \`Planos_concluídos /
Planos_iniciados × 100%\`

\-\--

\## 11) Visitas Domiciliares / Território (ACS)

\### 🧠 Descrição Funcional

Agenda de \*\*visitas (ACS/enferm/med)\*\*, \*\*motivo\*\*,
\*\*condições encontradas\*\*, \*\*ações\*\*, \*\*encaminhamentos\*\* e
\*\*GPS\*\* (mapa de território).

\### 🧾 Campos

\- \`\[data_visita\] \[profissional\] \[motivos (multiselect)\]
\[situação_encontrada\] \[ações\] \[encaminhamentos\] \[assinatura\]
\[GPS\]\`

\### 📊 Cálculos

\- \*\*Cobertura de Domicílios (CD%)\*\* = \`Domicílios_visitados /
Domicílios_cadastrados × 100%\`

\- \*\*Prioridades atendidas (PA%)\*\* =
\`Visitas_prioritárias_realizadas / Visitas_prioritárias_planejadas ×
100%\`

\-\--

\## 12) Acolhimento e Classificação de Risco

\### 🧠 Descrição Funcional

\*\*Triagem\*\* (enfermagem) com queixa principal, sinais vitais e
\*\*classificação de risco\*\* (vermelho/laranja/amarelo/verde/azul).

\### 🧾 Campos

\- \`\[data_hora auto\] \[queixa_principal\] \[PA\] \[FC\] \[FR\]
\[Temp\] \[SpO2\] \[profissional\] \[classificação_risco\]\`

\### 📊 Cálculos

\- \*\*Tempo porta→atendimento (TPA)\*\* = \`consulta.início -
acolhimento.data_hora\`

\- \*\*Priorizações corretas (%)\*\* (auditoria clínica)

\-\--

\## 13) Relatórios e Indicadores (APS/ESF)

\### 🧠 Descrição Funcional

Relatórios automáticos por período/equipe/profissional. \*\*Export\*\*
(PDF/CSV/XLSX) e dashboards.

\### 📊 Indicadores-Chave (com fórmulas)

\- \*\*NS%\*\*, \*\*Produtividade\*\*, \*\*Cobertura HAS/DM\*\*,
\*\*Cobertura Vacinal\*\*,

\- \*\*Pré-natal adequado\*\*, \*\*Visitas Domiciliares\*\*,
\*\*Acolhimento (TPA)\*\*, \*\*Encaminhamentos resolvidos\*\*.

\-\--

\## 14) Integrações (e-SUS PEC, CNES, SIGTAP, WhatsApp API)

\### 🧠 Descrição Funcional

\- \*\*PEC:\*\* import/export cadastros/atendimentos.

\- \*\*CNES:\*\* vínculos profissionais/equipamentos.

\- \*\*SIGTAP:\*\* tabela de procedimentos.

\- \*\*WhatsApp API:\*\* lembretes/confirm. de consulta (somente UBS).

\### 🔌 Configurações

\- \`\[tipo_integracao: automática \| manual\]\` \`\[credenciais\]\`
\`\[cron 03:00\]\` \`\[status\]\`

\-\--

\## 15) Segurança, LGPD e Auditoria

\### 🧠 Descrição Funcional

\- \*\*TLS 1.3\*\*, criptografia \*\*AES-256\*\* em repouso,
\*\*mascaramento\*\* (\`cpf\`, \`tel\`, \`email\`).

\- \*\*Auditoria 100%\*\* (login, CRUD, export, troca de unidade).

\- \*\*Backups\*\* diários (retenção 90 dias), \*\*RBAC por unidade\*\*
e \*\*por categoria profissional\*\*.

\-\--

\## 16) APÊNDICE --- Fórmulas, Campos e Layout de Entrada

\### 🧮 Fórmulas (consolidadas -- APS)

\- \*\*NS%\*\* = \`Faltas / Agendamentos × 100%\`

\- \*\*TC%\*\* = \`Confirmados / Lembretes × 100%\`

\- \*\*EL%\*\* = \`(NS%\_sem - NS%\_com) / NS%\_sem × 100%\`

\- \*\*Produtividade\*\* = \`Atendimentos / Horas\`

\- \*\*CH%\*\* = \`HAS_acomp / HAS_total × 100%\`

\- \*\*CD%\*\* = \`DM_acomp / DM_total × 100%\`

\- \*\*PNA%\*\* = \`Gestantes_7+ / Gestantes_total × 100%\`

\- \*\*CV%\*\* = \`Doses / Pop_alvo × 100%\`

\- \*\*TPA\*\* = \`consulta.início - acolhimento.timestamp\`

\- \*\*AP%\*\* (multiprofissional) = \`Sessões_real / Sessões_prev ×
100%\`

\- \*\*TMSR\*\* = \`Σ (resultado - solicitação) / N\`

\### 🧾 Layout de Entrada --- Padrão UI

\- \*\*Texto:\*\*
\`\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]\` •
\*\*Número:\*\* \`\[ 0,00 \]\`

\- \*\*Data/Hora:\*\* \`\[ dd/mm/aaaa \] \[ hh:mm \]\`

\- \*\*Select:\*\* \`\[ v \]\` • \*\*Checkbox:\*\* \`\[ \]\` •
\*\*Assinatura:\*\* \`\[ ✍ \]\`

\- \*\*Anexo:\*\* \`\[ + PDF/JPG \]\` • \*\*Observações (long):\*\*

\-\--

\## 17) Critérios de Aceite (QA/Entrega)

1\. \*\*RBAC por unidade\*\* + \*\*categoria profissional\*\* em todas
as abas.

2\. \*\*WhatsApp lembretes\*\* operando (24h, confirmação e
pós-consulta) e métricas \*\*NS%/TC%/EL%\*\*.

3\. \*\*SOAP completo\*\* com \*\*CID-10\*\*, \*\*prescrição\*\*,
\*\*exames\*\*, \*\*atestados\*\* e \*\*assinatura digital\*\*.

4\. \*\*Multiprofissionais\*\* com formulários dedicados e \*\*AP%\*\*
calculado.

5\. \*\*Populações específicas\*\* com checklists e indicadores
(\*\*CH%/CD%/PNA%\*\*).

6\. \*\*Vacinação\*\* com \*\*SI-PNI\*\*, \*\*lote/validade\*\*,
comprovante PDF e \*\*CV%\*\*.

7\. \*\*Visitas domiciliares (ACS)\*\* com \*\*GPS\*\*, cobertura
\*\*CD%\*\* e prioridades.

8\. \*\*Acolhimento\*\* com \*\*TPA\*\* e risco Manchester.

9\. \*\*Relatórios e Export\*\* (PDF/CSV/XLSX) em todas as telas de
indicadores.

10\. \*\*Auditoria 100%\*\*, \*\*LGPD\*\* (mascaramento e
consentimento), \*\*backup diário\*\*.

\# 🔼 ALTERAÇÕES E ACRÉSCIMOS A1 SAÚDE v4.0

\-\--

\## 🏡 MÓDULO UBS --- ACRÉSCIMOS

\### 🆕 18) Teleatendimento e Telemonitoramento (TeleAPS)

\*\*Descrição Funcional\*\*

\- Registro de \*\*consultas virtuais\*\* (vídeo, áudio ou chat),
vinculadas ao prontuário.

\- Geração automática de \*\*termo de consentimento\*\* e registro de
geolocalização do paciente.

\- Upload de \*\*mídias e arquivos\*\* (fotos, resultados, mensagens).

\- Alertas automáticos de \*\*sinais vitais críticos reportados\*\*
(SpO2, PA, Glicemia).

\*\*Campos\*\*

\- \`\[canal (vídeo/voz/chat)\] \[link_acesso\] \[consentimento_paciente
(PDF)\] \[duração\] \[observações\]\`

\*\*Indicadores\*\*

\- \*\*Taxa de Adesão ao Teleatendimento (TAT%)\*\* =
\`Teleconsultas_realizadas / Teleconsultas_agendadas × 100%\`

\- \*\*Resolução Remota (RR%)\*\* =
\`Casos_resolvidos_sem_encaminhamento / Total × 100%\`

\-\--

\### 🆕 19) Educação em Saúde e Ações Coletivas

\*\*Descrição Funcional\*\*

\- Registro de \*\*grupos educativos, campanhas, palestras e atividades
comunitárias\*\*.

\- Permite anexar materiais educativos, listas de presença e fotos da
ação.

\- Vincula indicadores de \*\*cobertura populacional e impacto
comunitário\*\*.

\*\*Campos\*\*

\- \`\[tema\] \[data\] \[profissional_responsável\] \[local\]
\[público_alvo\] \[participantes\] \[material_anexo\]
\[impacto_estimado\]\`

\*\*Indicadores\*\*

\- \*\*Cobertura Educacional (CE%)\*\* = \`Participantes /
População_alvo × 100%\`

\- \*\*Taxa de Continuidade de Ações (TCA%)\*\* = \`Ações_contínuas /
Ações_totais × 100%\`

\-\--

\### 🆕 20) Registro de Eventos Adversos e Incidentes

\*\*Descrição Funcional\*\*

\- Canal interno de registro de \*\*quedas, erros de medicação, falhas
de equipamento ou estrutura\*\*.

\- Cada incidente gera \*\*número de protocolo e plano de ação\*\* com
monitoramento por prazo (SLA).

\- Integra com \*\*módulo de Gestão\*\* (Centro de Controle
Operacional).

\*\*Campos\*\*

\- \`\[tipo_incidente\] \[data_hora\] \[local\] \[descrição\]
\[profissional_responsável\] \[impacto\] \[status\] \[plano_ação\]
\[prazo\]\`

\*\*Indicadores\*\*

\- \*\*Tempo Médio de Resposta (TMR)\*\* = \`Σ (data_resposta -
data_abertura) / N\`

\- \*\*Taxa de Recorrência de Incidentes (TRI%)\*\* =
\`Incidentes_reincidentes / Total × 100%\`

\-\--
