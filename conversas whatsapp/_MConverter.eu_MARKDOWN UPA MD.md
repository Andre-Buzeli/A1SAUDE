\# 🚑 A1 SAÚDE --- MÓDULO UPA v3.0

\*\*Documento Técnico Oficial -- Nível Profissional Máximo (SRS + API
Blueprint + BI/IA)\*\*

\*\*Escopo:\*\* Urgência e Emergência (UPA 24h) • RBAC • LGPD •
Auditoria • Suporte Clínico • IA Operacional

\-\--

\## 📑 SUMÁRIO (clicável)

1\. \[Padrões, Perfis e Estrutura de
Dados\](#1-padrões-perfis-e-estrutura-de-dados)

2\. \[Painel Operacional da UPA
(Dashboard)\](#2-painel-operacional-da-upa-dashboard)

3\. \[Acolhimento e Classificação de
Risco\](#3-acolhimento-e-classificação-de-risco)

4\. \[Atendimento Médico (SOAP
Emergencial)\](#4-atendimento-médico-soap-emergencial)

5\. \[Atendimento de Enfermagem e
Procedimentos\](#5-atendimento-de-enfermagem-e-procedimentos)

6\. \[Prescrição Médica e Interações
Medicamentosas\](#6-prescrição-médica-e-interações-medicamentosas)

7\. \[Solicitação e Resultado de Exames (Laboratório e
Imagem)\](#7-solicitação-e-resultado-de-exames-laboratório-e-imagem)

8\. \[Evolução Profissional e
Pareceres\](#8-evolução-profissional-e-pareceres)

9\. \[Encaminhamento / Regulação /
Transferência\](#9-encaminhamento\--regulação\--transferência)

10\. \[Observação Clínica e Sala
Amarela\](#10-observação-clínica-e-sala-amarela)

11\. \[Alta Médica e Atestado\](#11-alta-médica-e-atestado)

12\. \[Gestão de Leitos / Ocupação
UPA\](#12-gestão-de-leitos\--ocupação-upa)

13\. \[Relatórios e Indicadores UPA\](#13-relatórios-e-indicadores-upa)

14\. \[Centro de Controle e Alertas Clínicos
(IA)\](#14-centro-de-controle-e-alertas-clínicos-ia)

15\. \[Integrações (e-SUS PEC, SISREG, GAL,
CNES)\](#15-integrações-e-sus-pec-sisreg-gal-cnes)

16\. \[Segurança, LGPD e Auditoria\](#16-segurança-lgpd-e-auditoria)

17\. \[Apêndice --- Fórmulas, Campos e Layout de
Entrada\](#17-apêndice\--fórmulas-campos-e-layout-de-entrada)

18\. \[Critérios de Aceite
(QA/Entrega)\](#18-critérios-de-aceite-qaentrega)

\-\--

\## 1) Padrões, Perfis e Estrutura de Dados

\### 🧠 Descrição Funcional

\- Acesso via autenticação \*\*JWT + MFA\*\*, vinculado à unidade UPA.

\- RBAC por categoria profissional e turno (Médico, Enfermeiro, Técnico,
Farmacêutico, Administrativo).

\- Todos os atendimentos e prescrições possuem \*\*trilha de
auditoria\*\* e \*\*assinatura digital\*\*.

\### 💻 Estrutura de Dados (principais)

\- \`pacientes(id, nome, idade, cpf, cns, sexo, endereço, contato,
acompanhante, ...)\`

\- \`acolhimentos(id, paciente_id, risco, sinais_vitais, queixa,
prioridade, data_hora, profissional_id)\`

\- \`consultas(id, paciente_id, medico_id, soap, cid10, conduta,
prescricao, exames, status)\`

\- \`evolucoes(id, paciente_id, profissional_id, tipo, notas, anexos,
timestamp)\`

\- \`exames(id, paciente_id, tipo, status, resultado, anexo, data_solic,
data_result)\`

\- \`observacoes(id, paciente_id, data_inicio, data_fim, setor, tempo,
leito, profissional_id)\`

\- \`transferencias(id, paciente_id, destino, status, regulacao_num,
data_envio, data_saida)\`

\- \`atendimentos(id, paciente_id, tipo, data_hora_ini, data_hora_fim,
tempo_total, profissional_id)\`

\- \`leitos(id, numero, setor, status, paciente_id, tempo_ocupacao)\`

\- \`audit_logs(id, user_id, acao, recurso, unidade, timestamp, hash)\`

\-\--

\## 2) Painel Operacional da UPA (Dashboard)

\### 🧠 Descrição Funcional

Visão em tempo real dos atendimentos, leitos, tempo médio de espera e
sobrecarga das equipes.

\### 📊 Indicadores-Chave

\- \*\*Tempo Médio de Espera (TME):\*\* \`Σ (início_atendimento -
chegada) / N\`

\- \*\*Tempo Médio de Permanência (TMP):\*\* \`Σ (alta - admissão) / N\`

\- \*\*Taxa de Ocupação (TO):\*\* \`Leitos_ocupados / Leitos_totais ×
100%\`

\- \*\*Satisfação (SP):\*\* \`Σ notas / N\`

\- \*\*Atendimentos 24h:\*\* contador + taxa de crescimento 7d

\- \*\*Alertas:\*\* sobrecarga de fluxo, falta de leito, exames
pendentes, pacientes sem alta \>12h

\-\--

\## 3) Acolhimento e Classificação de Risco

\### 🧠 Descrição Funcional

Triagem inicial com \*\*classificação de risco Manchester\*\*, definindo
prioridade e fluxo do paciente.

\### 🧾 Campos

\- \`\[paciente\] \[data_hora\] \[queixa_principal\] \[PA\] \[FC\]
\[FR\] \[Temp\] \[SpO2\] \[profissional\] \[risco (vermelho--azul)\]\`

\- \`\[observações\] \[encaminhamento_imediato\]\`

\### 📊 Cálculos

\- \*\*Tempo Porta--Atendimento (TPA):\*\* \`Atendimento_início -
acolhimento\`

\- \*\*Distribuição por Risco:\*\* \`% por categoria (Vermelho, Laranja,
Amarelo, Verde, Azul)\`

\- \*\*Média de Espera por Risco:\*\* cálculo automático via logs

\-\--

\## 4) Atendimento Médico (SOAP Emergencial)

\### 🧠 Descrição Funcional

Atendimento clínico estruturado, com \*\*CID-10\*\*, prescrição e
exames, em formato SOAP adaptado à urgência.

\### 🧾 Campos

\- \*\*S (Subjetivo):\*\* \`\[texto livre\]\`

\- \*\*O (Objetivo):\*\* \`\[exame_físico\] \[sinais_vitais\]
\[exames_solicitados\]\`

\- \*\*A (Avaliação):\*\* \`\[CID-10\] \[hipóteses\]\`

\- \*\*P (Plano):\*\* \`\[condutas\] \[prescrição\] \[observação\]
\[alta\] \[encaminhamento\]\`

\### 📊 Cálculos

\- \*\*Tempo de Atendimento:\*\* \`hora_fim - hora_inicio\`

\- \*\*Consultas Concluídas (%):\*\* \`Finalizadas / Iniciadas × 100%\`

\-\--

\## 5) Atendimento de Enfermagem e Procedimentos

\### 🧠 Descrição Funcional

Execução de procedimentos e administração de medicamentos conforme
prescrição médica.

\### 🧾 Campos

\- \`\[procedimento\] \[data_hora\] \[responsável\] \[dose\] \[via\]
\[observação\] \[assinatura digital\]\`

\- \`\[checagem dupla de medicação\]\`

\### 📊 Cálculos

\- \*\*Cumprimento de Prescrição:\*\* \`Administrações /
Itens_prescritos × 100%\`

\- \*\*Tempo Médio de Administração:\*\* \`Σ (execução - prescrição) /
N\`

\-\--

\## 6) Prescrição Médica e Interações Medicamentosas

\### 🧠 Descrição Funcional

Prescrição digital com \*\*checagem automática de interações\*\* (base
AI/Anvisa) e alerta de duplicidade.

\### 🧾 Campos

\- \`\[medicamento\] \[dose\] \[frequência\] \[via\]
\[tempo_tratamento\] \[observações\]\`

\- \`\[x\] verificar interações\`

\### ⚙️ Funções Automáticas

\- \*\*IA:\*\* busca interações (ex.: "dipirona + ibuprofeno = ok /
risco leve").

\- \*\*Sugestão de Ajuste:\*\* IA propõe substitutos conforme protocolo
da unidade.

\-\--

\## 7) Solicitação e Resultado de Exames (Laboratório e Imagem)

\### 🧠 Descrição Funcional

Solicitação eletrônica com \*\*integração GAL\*\*, \*\*upload de
laudos\*\* e \*\*alerta de resultados críticos\*\*.

\### 🧾 Campos

\- \`\[exame\] \[motivo\] \[prioridade (rotina/urgente)\]
\[profissional\] \[status\] \[resultado\] \[anexo_pdf\]\`

\### 📊 Cálculos

\- \*\*Tempo Solicitação→Resultado (TSR):\*\* \`Σ (resultado -
solicitação) / N\`

\- \*\*Taxa de Resultado Crítico (TRC%):\*\* \`Críticos / Total × 100%\`

\-\--

\## 8) Evolução Profissional e Pareceres

\### 🧠 Descrição Funcional

Anotações de \*\*médicos, enfermeiros, psicólogos e assistentes
sociais\*\*, integradas ao histórico do paciente.

\### 🧾 Campos

\- \`\[profissional\] \[data_hora\] \[tipo\] \[texto_long\] \[anexos\]
\[assinatura\]\`

\-\--

\## 9) Encaminhamento / Regulação / Transferência

\### 🧠 Descrição Funcional

Envio para \*\*regulação (SISREG)\*\*, com campos automáticos e geração
de protocolo.

\### 🧾 Campos

\- \`\[paciente\] \[destino\] \[motivo\] \[prioridade\]
\[documentos_anexos\] \[nº_regulação\] \[status\]\`

\### 📊 Cálculos

\- \*\*Tempo de Transferência:\*\* \`saída - envio\`

\- \*\*Índice de Transferências Evitáveis (ITE%):\*\* \`Casos_ev_itáveis
/ Total × 100%\`

\-\--

\## 10) Observação Clínica e Sala Amarela

\### 🧠 Descrição Funcional

Registro da \*\*permanência temporária\*\*, monitoramento de sinais
vitais e tempo em observação.

\### 🧾 Campos

\- \`\[paciente\] \[leito\] \[entrada\] \[sinais_vitais_periodicos\]
\[evoluções\] \[alta/transferência\]\`

\### 📊 Cálculos

\- \*\*Tempo Médio de Observação (TMO):\*\* \`Σ (alta - entrada) / N\`

\- \*\*Lotação da Sala (%):\*\* \`Ocupados / Total × 100%\`

\-\--

\## 11) Alta Médica e Atestado

\### 🧠 Descrição Funcional

Conclusão de atendimento, \*\*motivo de alta\*\*, \*\*orientações\*\*,
\*\*receita\*\*, \*\*atestados\*\* e \*\*assinatura digital\*\*.

\### 🧾 Campos

\- \`\[motivo_alta\] \[orientações\] \[receita\] \[dias_afastamento\]
\[assinatura\]\`

\-\--

\## 12) Gestão de Leitos / Ocupação UPA

\### 🧠 Descrição Funcional

Controle de \*\*leitos clínicos e observação\*\*, com mapa dinâmico e
histórico de uso.

\### 📊 Cálculos

\- \*\*Taxa de Ocupação (TO%):\*\* \`Leitos_ocupados / Leitos_totais ×
100%\`

\- \*\*Tempo Médio de Ocupação (TMO):\*\* \`Σ (alta - admissão) / N\`

\-\--

\## 13) Relatórios e Indicadores UPA

\### 🧠 Descrição Funcional

Geração automática de relatórios operacionais e clínicos. \*\*Export
(PDF/CSV/XLSX)\*\*.

\### 📊 Indicadores-Chave

\- \*\*TME\*\*, \*\*TMP\*\*, \*\*TO%\*\*, \*\*TPA\*\*, \*\*TRC%\*\*,
\*\*ITE%\*\*, \*\*NS% (abandono)\*\*

\- \*\*Custo por Atendimento (CPA)\*\* = \`Custos_Totais /
Atendimentos\`

\- \*\*Produtividade Profissional (PP)\*\* = \`Atendimentos / Horas\`

\-\--

\## 14) Centro de Controle e Alertas Clínicos (IA)

\### 🧠 Descrição Funcional

Módulo de \*\*IA\*\* que detecta:

\- Padrões de \*\*superlotação\*\*

\- \*\*Risco clínico\*\* (vital alterado + atraso atendimento)

\- \*\*Alertas de pacientes críticos sem alta \>12h\*\*

\### 📊 Outputs IA

\- \*\*Score de Risco (0--1):\*\* \`f(SV, TPA, tempo_obs, CID)\`

\- \*\*Alerta automático:\*\* push + email para gestor local e
enfermeiro responsável

\-\--

\## 15) Integrações (e-SUS PEC, SISREG, GAL, CNES)

\- \*\*PEC:\*\* cadastro e histórico clínico.

\- \*\*SISREG:\*\* encaminhamentos e regulação.

\- \*\*GAL:\*\* exames laboratoriais.

\- \*\*CNES:\*\* vínculo profissional e estrutura.

\-\--

\## 16) Segurança, LGPD e Auditoria

\- \*\*Criptografia AES-256\*\*, \*\*TLS 1.3\*\*, \*\*hash logs\*\*.

\- \*\*Mascaramento:\*\* CPF, telefone, e-mail.

\- \*\*Logs:\*\* toda ação CRUD e prescrição.

\- \*\*Backups diários (retenção 90 dias)\*\*.

\- \*\*RBAC por perfil\*\* e \*\*auditoria por recurso\*\*.

\-\--

\## 17) Apêndice --- Fórmulas, Campos e Layout de Entrada

\### 🧮 Fórmulas

\- \*\*TME\*\* = \`(Σ início_atendimento - chegada) / N\`

\- \*\*TMP\*\* = \`(Σ alta - admissão) / N\`

\- \*\*TO%\*\* = \`Leitos_ocupados / Leitos_totais × 100%\`

\- \*\*TRC%\*\* = \`Críticos / Total × 100%\`

\- \*\*ITE%\*\* = \`Ev_itáveis / Total × 100%\`

\- \*\*TMO\*\* = \`(Σ alta - entrada) / N\`

\- \*\*CPA\*\* = \`Custos / Atendimentos\`

\- \*\*PP\*\* = \`Atendimentos / Horas\`

\### 🧾 Layout de Entrada

\- \`\[texto_long\]\` • \`\[data_hora\]\` • \`\[checkbox\]\` •
\`\[dropdown\]\` • \`\[assinatura\]\`

\- Campos de entrada seguem padrão \*\*Material Design\*\* com foco
clínico.

\-\--

\## 18) Critérios de Aceite (QA/Entrega)

1\. \*\*RBAC\*\* aplicado por função e unidade.

2\. \*\*Painel Operacional\*\* com atualização automática (refresh 30s).

3\. \*\*Classificação de Risco\*\* funcional + cores Manchester.

4\. \*\*Prescrição digital\*\* com verificação de interação
medicamentosa.

5\. \*\*Integração com GAL e SISREG\*\*.

6\. \*\*Alertas IA\*\* funcionando (superlotação e risco).

7\. \*\*Export\*\* (PDF/CSV/XLSX) ativo.

8\. \*\*Auditoria + LGPD\*\* completas e testadas.

\## 🚑 MÓDULO UPA --- ACRÉSCIMOS

\### 🆕 19) Protocolos de Emergência (SAV / SBV)

\*\*Descrição Funcional\*\*

\- Implementa protocolos de \*\*parada cardiorrespiratória, AVC, IAM e
trauma\*\*.

\- Registra \*\*tempos críticos (Porta-ECG, Porta-Agulha,
Porta-Tomografia)\*\* e \*\*checklists\*\* automáticos.

\*\*Campos\*\*

\- \`\[protocolo\] \[tempo_inicial\] \[tempo_intervenção\]
\[tempo_final\] \[equipe\] \[resultado\] \[observações\]\`

\*\*Indicadores\*\*

\- \*\*Tempo Porta--Intervenção (TPI)\*\* = \`(tempo_intervenção -
chegada)\`

\- \*\*Adesão a Protocolos (AP%)\*\* = \`Protocolos_completos / Total ×
100%\`

\-\--

\### 🆕 20) Intercorrências Críticas e Eventos Adversos

\*\*Descrição Funcional\*\*

\- Registro de \*\*ocorrências graves, falhas estruturais e
intercorrências clínicas\*\*.

\- Geração de \*\*alerta em tempo real\*\* ao gestor local e à equipe
técnica.

\- Integração com módulo de \*\*Gestão (CCO)\*\* para auditoria e SLA de
resolução.

\*\*Campos\*\*

\- \`\[tipo_evento\] \[data_hora\] \[local\] \[descrição\]
\[classificação_gravidade\] \[responsável\] \[ação_imediata\] \[status\]
\[anexos\]\`

\*\*Indicadores\*\*

\- \*\*Tempo Médio de Resolução (TME)\*\* = \`Σ (data_resolução -
data_abertura) / N\`

\- \*\*Cumprimento de SLA (%)\*\* = \`Casos_no_prazo / Total × 100%\`

\-\--
