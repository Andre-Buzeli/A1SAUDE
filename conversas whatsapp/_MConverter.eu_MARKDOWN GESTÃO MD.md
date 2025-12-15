\# 🧩 A1 SAÚDE --- MÓDULO DE GESTÃO v3.0

\*\*Documento Técnico Oficial -- Nível Profissional Máximo (SRS + API
Blueprint + BI/IA)\*\*

\*\*Escopo:\*\* Gestão municipal integrada (UBS, UPA, Hospital) • RBAC •
LGPD • Auditoria • IA Preditiva

\-\--

\## 📑 SUMÁRIO (clicável)

1\. \[Padrões, RBAC e Estrutura de
Dados\](#1-padrões-rbac-e-estrutura-de-dados)

2\. \[Painel Geral / Dashboard
Executivo\](#2-painel-geral\--dashboard-executivo)

3\. \[Gestão de Unidades e Acessos\](#3-gestão-de-unidades-e-acessos)

4\. \[Gestão de Profissionais\](#4-gestão-de-profissionais)

5\. \[Escala e Ponto Eletrônico\](#5-escala-e-ponto-eletrônico)

6\. \[Controle de Estoque e
Farmácia\](#6-controle-de-estoque-e-farmácia)

7\. \[Gestão de Contratos e
Convênios\](#7-gestão-de-contratos-e-convênios)

8\. \[Gestão Financeira e Receitas\](#8-gestão-financeira-e-receitas)

9\. \[Planejamento e Execução
(Metas/Indicadores)\](#9-planejamento-e-execução-metasindicadores)

10\. \[Centro de Controle Operacional
(CCO)\](#10-centro-de-controle-operacional-cco)

11\. \[Centro de Inteligência em Saúde
(IA/BI)\](#11-centro-de-inteligência-em-saúde-iabi)

12\. \[Ouvidoria e Satisfação
Popular\](#12-ouvidoria-e-satisfação-popular)

13\. \[Governança, Compliance e
Auditoria\](#13-governança-compliance-e-auditoria)

14\. \[Gestão de Internações\](#14-gestão-de-internações)

15\. \[Vigilância Epidemiológica\](#15-vigilância-epidemiológica)

16\. \[Alertas e Inteligência Epidemiológica
(IA)\](#16-alertas-e-inteligência-epidemiológica-ia)

17\. \[Análise de Absenteísmo e
Evasão\](#17-análise-de-absenteísmo-e-evasão)

18\. \[Projeções, Riscos e Eficiência
Operacional\](#18-projeções-riscos-e-eficiência-operacional)

19\. \[Exports, Integrações e Segurança de
Dados\](#19-exports-integrações-e-segurança-de-dados)

20\. \[Apêndice --- Fórmulas, Campos e Layout de
Entrada\](#20-apêndice\--fórmulas-campos-e-layout-de-entrada)

\-\--

\## 1) Padrões, RBAC e Estrutura de Dados

\### 🧠 Descrição Funcional

\- Autenticação JWT + MFA; usuário escolhe \*\*Unidade Ativa\*\*
(contexto de sessão).

\- RBAC por perfil: \*\*Gestor Geral\*\* (rede inteira), \*\*Diretor
Local\*\* (distrito/regionais), \*\*Gestor Local\*\* (unidade).

\- Todas as consultas/relatórios são \*\*filtradas por unidade\*\*, com
\*\*auditoria\*\* e \*\*LGPD\*\*.

\### 💻 Estrutura Técnica (resumo de tabelas)

\- \`unidades(id, nome, tipo, cnes, municipio, ...)\`

\- \`profissionais(id, nome, conselho, registro, cpf, ...)\`

\- \`profissionais_unidades(profissional_id, unidade_id, funcao, ...)\`

\- \`ponto(id, profissional_id, unidade_id, checkin, checkout, ...)\`

\- \`estoque_itens(id, sku, descricao, classe, min, ...)\` /
\`estoque_lotes(id, item_id, lote, validade, saldo, ...)\`

\- \`contratos(id, numero, fornecedor, vigencia_inicio, vigencia_fim,
valor, ...)\`

\- \`financeiro_lancamentos(id, tipo, centro_custo, valor, competencia,
...)\`

\- \`internacoes(id, paciente_id, unidade_id, diag_principal, data_adm,
data_alta, ...)\`

\- \`epid_casos(id, agravo, unidade_id, status, data_notificacao, ...)\`

\- \`ouvidoria(id, canal, tipo, unidade_id, data, status,
nota_satisfacao, ...)\`

\- \`audit_logs(id, user_id, unidade_id, recurso, acao, timestamp, hash,
ip, ...)\`

\-\--

\## 2) Painel Geral / Dashboard Executivo

\### 🧠 Descrição Funcional

Visão 360° com \*\*KPI de produtividade, custo, internação,
epidemiologia, satisfação, absenteísmo, evasão\*\*, comparativos e
metas.

\### 🧾 Espaços de Entrada / Filtros

\- \`\[Período: data_inicial -- data_final\]\`

\- \`\[Unidade(s)\]\` \`\[Equipe/Setor\]\` \`\[Profissional\]\`
\`\[Serviço: UBS/UPA/HOSP\]\`

\### 📊 Principais Cálculos (exibidos em cards/gráficos)

\- \*\*Produtividade Geral (PG):\*\*

\`PG = (Atendimentos_Úteis / Horas_Trabalhadas)\`

\- \*\*Custo por Atendimento (CPA):\*\*

\`CPA = (Custos_Totais_Período / Total_Atendimentos_Período)\`

\- \*\*Taxa de Ocupação de Leitos (TO):\*\*

\`TO = (Leitos_Ocupados / Leitos_Totais) × 100%\`

\- \*\*Tempo Médio de Permanência (LOS):\*\*

\`LOS = (Σ dias_internação / Nº Altas)\`

\- \*\*Readmissão 30 dias (TR30):\*\*

\`TR30 = (Readmissões_30d / Altas_Totais) × 100%\`

\- \*\*Absenteísmo (ABS):\*\*

\`ABS = (Faltas / (Escalas_Publicadas × Profissionais_Escalados)) ×
100%\`

\- \*\*Evasão (EV):\*\*

\`EV = (Faltas_Consultas + Abandono_Tratamento) / Agendamentos × 100%\`

\- \*\*Satisfação Popular (SP):\*\*

\`SP = (Σ notas / N_respostas)\`

\- \*\*Alerta Epidemiológico (AE -- IA Score 0--1):\*\*

\`AE = f(Incidência, Crescimento 7d, Z-Score, Sazonalidade, HeatMap)\`

\### ⚙️ Regras

\- Gestor Local vê apenas \*\*unidade ativa\*\*; Diretor Local vê
\*\*conjunto regional\*\*; Gestor Geral vê \*\*toda a rede\*\*.

\- Todos os cards têm \*\*link de drill-down\*\* para o módulo de
origem.

\-\--

\## 3) Gestão de Unidades e Acessos

\### 🧠 Descrição Funcional

Cadastro/edição de unidades; vínculos de profissionais e perfis;
ativação/desativação; transferência de contexto.

\### 🧾 Espaços de Entrada

\- \`\[Cadastro Unidade\]\` nome, tipo(UBS/UPA/HOSP), CNES, município,
endereço, contatos, logo.

\- \`\[Vínculo Profissional-Unidade\]\` profissional, função,
data_início, data_fim(opc).

\- \`\[Perfis de Acesso\]\` (checkbox): gestor_local, diretor_local,
gestor_geral.

\### 💻 Validações

\- \`cnes\` e \`cnpj\` \*\*únicos\*\*.

\- Profissional \*\*não removível\*\* se houver histórico de
ponto/escalas/atendimentos.

\-\--

\## 4) Gestão de Profissionais

\### 🧠 Descrição Funcional

Cadastro completo (nome, CPF, conselho+registro, foto, documentos),
status, carga horária contratada, produtividade e histórico.

\### 🧾 Espaços de Entrada

\- \`\[Profissional\]\` nome, cpf, conselho, registro, email, telefone,
endereço, vínculo (efetivo/terceiro/PJ), \*\*foto\*\*,
\*\*documentos\*\* (PDF).

\- \`\[Carga Horária\]\` semanal_mín, semanal_máx.

\- \`\[Equipes/Setores\]\` multisseleção.

\### 📊 Cálculos

\- \*\*Produtividade Individual (PI):\*\*

\`PI = Atendimentos_Úteis / Horas_Trabalhadas\`

\- \*\*Aderência de Jornada (AJ):\*\*

\`AJ = Horas_Efetivas / Carga_Contratada × 100%\`

\-\--

\## 5) Escala e Ponto Eletrônico

\### 🧠 Descrição Funcional

Criação de \*\*escala mensal\*\*, registro de \*\*ponto\*\* (QR/GPS),
faltas/atrasos, \*\*alertas\*\* e \*\*relatórios\*\*.

\### 🧾 Espaços de Entrada

\- \`\[Escala\]\` unidade, setor, período, profissional(es), turnos
(data, hora_ini, hora_fim), \*\*observações\*\*.

\- \`\[Ponto\]\` check-in, check-out, pausa, justificativa (se atraso).

\### 📊 Cálculos

\- \*\*Horas Trabalhadas (HT):\*\*

\`HT = Σ (checkout - checkin) - pausas\`

\- \*\*Atraso Médio (AM):\*\*

\`AM = Σ minutos_atraso / Nº Ocorrências\`

\- \*\*Absenteísmo (ABS):\*\*

\`ABS = Faltas / Escalas_Publicadas × 100%\`

\- \*\*Cobertura de Turnos (CT):\*\*

\`CT = Turnos_Cobertos / Turnos_Totais × 100%\`

\-\--

\## 6) Controle de Estoque e Farmácia

\### 🧠 Descrição Funcional

Cadastro de itens, lote/validade, entradas/saídas/transferências,
\*\*alerta de validade\*\* e \*\*ponto de reposição\*\*; rastreio por
lote.

\### 🧾 Espaços de Entrada

\- \`\[Item\]\` sku, descrição, classe (medicamento/insumo/correlato),
unidade_medida, ponto_reposição, \*\*foto opcional\*\*.

\- \`\[Lote\]\` item, lote, validade, saldo_inicial.

\- \`\[Movimentação\]\` tipo(entrada/saída/transf), qtd,
unidade_origem/destino, responsável, \*\*anexo (NF)\*\*.

\### 📊 Cálculos

\- \*\*Giro de Estoque (GE):\*\*

\`GE = Consumo_Período / Estoque_Médio\`

\- \*\*Ruptura (RUP):\*\*

\`RUP = Dias_Sem_Estoque / Dias_Período × 100%\`

\- \*\*Perdas por Validade (PV):\*\*

\`PV = Σ valor_descartado_validade\`

\- \*\*Cumprimento FEFO (CFEFO):\*\*

\`CFEFO = Movimentações_FEFO / Movimentações_Totais × 100%\`

\- \*\*Cobertura de Estoque (dias):\*\*

\`Cobertura = Estoque_Atual / Consumo_Médio_Diário\`

\-\--

\## 7) Gestão de Contratos e Convênios

\### 🧠 Descrição Funcional

Cadastro, vigência, \*\*alerta T-30/T-15/T-5\*\*, aditivos, execução
financeira, \*\*SLA\*\* e \*\*risco contratual\*\*.

\### 🧾 Espaços de Entrada

\- \`\[Contrato\]\` nº, fornecedor, objeto, vigência(início/fim),
valor_total, gestor_resp, \*\*PDF\*\*.

\- \`\[Aditivo\]\` contrato_id, descrição, valor, novo_fim, \*\*PDF\*\*.

\### 📊 Cálculos

\- \*\*Execução (%)\*\*: \`Execução = Valor_Pago / Valor_Total × 100%\`

\- \*\*Aderência a Prazos (SLA%)\*\*: \`SLA% = Tarefas_no_Prazo /
Tarefas_Totais × 100%\`

\- \*\*Risco Contratual (RC)\*\*: \`RC = f(Prazo, Penalidades, Entregas,
Reincidência) ∈ \[0,1\]\`

\-\--

\## 8) Gestão Financeira e Receitas

\### 🧠 Descrição Funcional

Receitas/despesas por centro de custo, \*\*orçamento vs realizado\*\*,
\*\*custo por atendimento\*\* e \*\*margem operacional\*\*.

\### 🧾 Espaços de Entrada

\- \`\[Receita\]\` competência, unidade, fonte, valor.

\- \`\[Despesa\]\` competência, unidade, centro_custo, valor.

\### 📊 Cálculos

\- \*\*Custo por Atendimento (CPA):\*\* \`CPA = Custos_Totais /
Atendimentos\`

\- \*\*Margem Operacional (MO):\*\* \`MO = (Receitas - Despesas) /
Receitas × 100%\`

\- \*\*Desvio Orçamentário (ΔO):\*\* \`ΔO = (Realizado - Orçado) /
Orçado × 100%\`

\- \*\*Custo Médio por Leito-Dia (CMLD):\*\* \`CMLD =
Custos_Incorporação / Leito_Dia\`

\- \*\*Forecast (t+1..t+3):\*\* modelos ARIMA/Prophet sobre séries de
receita/ despesa.

\-\--

\## 9) Planejamento e Execução (Metas/Indicadores)

\### 🧠 Descrição Funcional

Definição de \*\*metas\*\* por unidade/equipe, acompanhamento
\*\*RAG\*\* (Red/Amber/Green), \*\*OKRs\*\* e \*\*alertas\*\*.

\### 🧾 Espaços de Entrada

\- \`\[Meta\]\` indicador, alvo, período, unidade, equipe, responsável.

\### 📊 Cálculos

\- \*\*Status RAG:\*\*

\- Verde: \`≥ 100%\` do alvo

\- Amarelo: \`80%--99%\`

\- Vermelho: \`\< 80%\`

\- \*\*Taxa de Cumprimento (TC):\*\* \`TC = Realizado/Meta × 100%\`

\-\--

\## 10) Centro de Controle Operacional (CCO)

\### 🧠 Descrição Funcional

Monitoramento em tempo real de \*\*incidentes\*\*, SLA de resposta,
\*\*chat interno\*\* e plano de ação.

\### 🧾 Espaços de Entrada

\- \`\[Incidente\]\` tipo, unidade, descrição, impacto, responsável,
prazo, \*\*anexos\*\*.

\### 📊 Cálculos

\- \*\*TMA (Resposta):\*\* \`TMA = Σ tempo_primeira_resposta /
incidentes\`

\- \*\*TME (Resolução):\*\* \`TME = Σ tempo_resolução / incidentes\`

\- \*\*SLA Cumprido (%)\*\*: \`Dentro_Prazo / Total × 100%\`

\-\--

\## 11) Centro de Inteligência em Saúde (IA/BI)

\### 🧠 Descrição Funcional

Análises \*\*preditivas\*\* (demanda, escala, estoque, custos, ocupação,
surtos), \*\*what-if\*\* e \*\*recomendações\*\*.

\### 🧾 Espaços de Entrada

\- \`\[Config IA\]\` horizonte previsão (30/60/90), variáveis
habilitadas, sensibilidade alertas.

\### 📊 Outputs (IA)

\- \*\*Score de Sobrecarga (0--1):\*\* \`f(HT, ABS, demanda_prevista,
complexidade)\`

\- \*\*Recomendação de Escala:\*\* \`minimize(custo) subject to CT≥95%,
AJ≥90%\`

\- \*\*Recomendação de Reposição:\*\* \`if Cobertura\<Limite then
sugerir pedido\`

\-\--

\## 12) Ouvidoria e Satisfação Popular

\### 🧠 Descrição Funcional

Registra manifestações (elogios/reclamações/sugestões) e \*\*índice de
satisfação\*\* por unidade.

\### 🧾 Espaços de Entrada

\- \`\[Manifestação\]\` canal, tipo, descrição, unidade, data, status,
\*\*anexo\*\*.

\- \`\[Pesquisa\]\` NPS (0--10), motivo, feedback livre.

\### 📊 Cálculos

\- \*\*NPS:\*\* \`%Promotores (9-10) - %Detratores (0-6)\`

\- \*\*Satisfação Média (SP):\*\* \`Σ nota / N\`

\- \*\*Tempo Médio de Resposta (TMR):\*\* \`Σ (1ª resposta - abertura) /
N\`

\-\--

\## 13) Governança, Compliance e Auditoria

\### 🧠 Descrição Funcional

Relatórios de \*\*acesso, alteração, exportação\*\*, conformidade LGPD,
\*\*trilhas de auditoria\*\*.

\### 🧾 Espaços de Entrada

\- \`\[Consulta Auditoria\]\` período, usuário, unidade, recurso, ação
(CRUD, export, login).

\### 📊 Cálculos

\- \*\*Conformidade (%)\*\*: \`Ações_conformes / Ações_totais × 100%\`

\- \*\*Tentativas inválidas (contagem)\*\*, \*\*IPs suspeitos\*\*.

\-\--

\## 14) Gestão de Internações

\### 🧠 Descrição Funcional

Consolida \*\*admissões, altas, transferências\*\*, \*\*leitos\*\*,
\*\*LOS\*\*, \*\*readmissão\*\*, \*\*custo por caso\*\*.

\### 🧾 Espaços de Entrada

\- \`\[Admissão\]\` paciente, diag_CID, data_adm, tipo(leito
clínico/cirúrgico/obstétrico/psiquiátrico), médico, \*\*anexos\*\*.

\- \`\[Alta/Transferência\]\` data_alta, destino, motivo.

\- \`\[UTI/Leito\]\` ocupação, suporte, intercorrências.

\### 📊 Cálculos

\- \*\*LOS\*\*, \*\*TO\*\*, \*\*TR30\*\* (já definidos)

\- \*\*Case Mix Index (CMI -- opcional):\*\* \`Σ pesos DRG / Casos\`

\- \*\*Custo por Caso (CPC):\*\* \`CPC = Custos_Alocados_Caso\`

\-\--

\## 15) Vigilância Epidemiológica

\### 🧠 Descrição Funcional

Registro e análise de \*\*notificações compulsórias\*\* (SINAN), mapas,
boletins e \*\*incidência/prevalência\*\*.

\### 🧾 Espaços de Entrada

\- \`\[Caso\]\` agravo, data_notificação, data_início_sintomas, status
(suspeito/confirmado/descartado), \*\*endereço/geo\*\*, \*\*anexos\*\*.

\### 📊 Cálculos

\- \*\*Incidência (I):\*\* \`I = Casos_novos / População_risco ×
100.000\`

\- \*\*Prevalência (P):\*\* \`P = Casos_totais / População × 100.000\`

\- \*\*Rt (simplificado):\*\* \`Rt ≈ Casos_7d / Casos_7d-1\`

\-\--

\## 16) Alertas e Inteligência Epidemiológica (IA)

\### 🧠 Descrição Funcional

Detecção de \*\*picos/surtos\*\* por análise de séries temporais,
\*\*Z-Score\*\*, \*\*sazonalidade\*\* e \*\*clusters\*\*
(DBSCAN/K-Means).

\### 🧾 Espaços de Entrada

\- \`\[Config Alerta\]\` janela (7/14/28d), sensibilidade, agravos
monitorados, raio geográfico.

\### 📊 Cálculos

\- \*\*Z-Score:\*\* \`Z = (x - μ) / σ\` (alerta se \`Z ≥ 2\`)

\- \*\*Crescimento Semanal:\*\* \`Δ% = (Casos_7d - Casos_7d-1) /
Casos_7d-1 × 100%\`

\- \*\*Score de Alerta (0--1):\*\* \`f(Z, Δ%, sazonalidade, Rt)\`

\-\--

\## 17) Análise de Absenteísmo e Evasão

\### 🧠 Descrição Funcional

Mede \*\*faltas\*\*, \*\*abandono\*\*, \*\*quebras de vínculo\*\*,
\*\*no-show\*\* e impacto em produtividade e metas.

\### 🧾 Espaços de Entrada

\- \`\[Agendamento\]\` data, hora, profissional, paciente, status
(realizado/falta/cancelado).

\- \`\[Tratamento\]\` plano, sessões_previstas, sessões_realizadas,
status (ativo/abandono).

\### 📊 Cálculos

\- \*\*No-Show (NS):\*\* \`NS = Faltas / Agendamentos × 100%\`

\- \*\*Evasão (EV):\*\* \`EV = (Abandono + Faltas_Sequenciais≥N) /
Tratamentos × 100%\`

\- \*\*Impacto em Produtividade (IP):\*\* \`IP = NS × CPA\` (perda
financeira aproximada)

\-\--

\## 18) Projeções, Riscos e Eficiência Operacional

\### 🧠 Descrição Funcional

Modelos preditivos para \*\*demanda\*\*, \*\*escala\*\*,
\*\*estoque\*\*, \*\*custos\*\* e \*\*eficiência\*\* com análises de
risco.

\### 📊 Cálculos

\- \*\*Eficiência Operacional (EO):\*\*

\`EO = (Outputs_Efetivos / Inputs_Consumidos) × 100%\`

\*onde\* \`Outputs_Efetivos = atendimentos ponderados por complexidade;
Inputs = horas, insumos, custos\`

\- \*\*Índice de Risco Operacional (IRO 0--1):\*\*

\`IRO = f(ABS, AM, RUP, ΔO, SLA, AE)\`

\- \*\*Economia Potencial (EP):\*\*

\`EP = Σ (CPA_atual - CPA_alvo) × atendimentos\`

\-\--

\## 19) Exports, Integrações e Segurança de Dados

\### 🧠 Descrição Funcional

\- \*\*Exports:\*\* PDF, CSV, XLSX, JSON.

\- \*\*Integrações:\*\* e-SUS PEC, GAL, CNES, SISREG, Power BI/Data
Studio, WhatsApp API (somente UBS), Webhooks.

\- \*\*Segurança:\*\* TLS 1.3, criptografia AES-256 em repouso,
mascaramento (\`cpf\`, \`email\`, \`telefone\`), \*\*auditoria 100%\*\*.

\### 🧾 Espaços de Entrada

\- \`\[Exportar Relatório\]\` módulo, período, formato
(PDF/CSV/XLSX/JSON).

\- \`\[Integração\]\` tipo, credenciais/scope, cron (ex.: \`0 3 \* \*
\*\`).

\-\--

\## 20) APÊNDICE --- Fórmulas, Campos e Layout de Entrada

\### 🧮 Fórmulas (consolidadas)

\- \*\*CPA\*\* = \`Custos_Totais / Atendimentos\`

\- \*\*MO%\*\* = \`(Receitas - Despesas) / Receitas × 100%\`

\- \*\*ΔO%\*\* = \`(Realizado - Orçado) / Orçado × 100%\`

\- \*\*GE\*\* = \`Consumo_Período / Estoque_Médio\`

\- \*\*RUP%\*\* = \`Dias_Sem_Estoque / Dias_Período × 100%\`

\- \*\*CFEFO%\*\* = \`Mov_FEFO / Mov_Totais × 100%\`

\- \*\*LOS\*\* = \`Σ dias_internação / Nº Altas\`

\- \*\*TO%\*\* = \`Leitos_Ocupados / Leitos_Totais × 100%\`

\- \*\*TR30%\*\* = \`Readmissões_30d / Altas × 100%\`

\- \*\*NS%\*\* = \`Faltas / Agendamentos × 100%\`

\- \*\*EV%\*\* = \`(Abandono + Faltas_Seq≥N) / Tratamentos × 100%\`

\- \*\*PI\*\* = \`Atendimentos_Úteis / Horas_Trabalhadas\`

\- \*\*AJ%\*\* = \`Horas_Efetivas / Carga_Contratada × 100%\`

\- \*\*SP\*\* = \`Σ notas / N\`

\- \*\*NPS\*\* = \`%Promotores - %Detratores\`

\- \*\*AE (score 0--1)\*\* = \`f(Incidência, Δ%, Z, sazonalidade, Rt)\`

\### 🧾 Layout de Entrada --- Exemplos Padrão

\- \*\*Campo de texto:\*\*
\`\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]\`

\- \*\*Seleção (dropdown):\*\* \`\[ v \]\`

\- \*\*Checkbox:\*\* \`\[ \]\`

\- \*\*Data/Hora:\*\* \`\[ dd/mm/aaaa \] \[ hh:mm \]\`

\- \*\*Anexo:\*\* \`\[ + Anexar PDF/JPG \]\`

\- \*\*Assinatura:\*\* \`\[ ✍ Assinar \]\`

\- \*\*Observações:\*\*

\-\--

\# ✅ PERMISSÕES (RBAC) --- RESUMO

\- \*\*Gestor Geral:\*\* acesso total (rede inteira); cria/edita
unidades, profissionais, contratos, metas; vê todos os dashboards;
auditoria completa.

\- \*\*Diretor Local:\*\* acesso consolidado da região/distrito;
aprovações; supervisão de metas e relatórios regionais.

\- \*\*Gestor Local:\*\* opera \*\*sua unidade\*\* (estoque, escala,
contratos, financeiro da unidade); lança dados; exporta relatórios
locais.

\-\--

\# 🔚 CRITÉRIOS DE ACEITE

1\. \*\*Todos os KPIs\*\* calculados conforme fórmulas acima e
filtráveis por \*\*período/unidade\*\*.

2\. \*\*RBAC\*\* aplicado em cada módulo (testes de "ver o que pode/ não
pode").

3\. \*\*Auditoria 100%\*\* dos eventos críticos (login, CRUD, export,
troca de unidade).

4\. \*\*Exports\*\* funcionais (PDF/CSV/XLSX) em todos os relatórios.

5\. \*\*IA/BI\*\* operacional para previsão
(estoque/escala/custos/epidemiologia).

6\. \*\*Segurança LGPD\*\*: dados sensíveis mascarados; logs com hash;
backup diário.

\## 🧩 MÓDULO DE GESTÃO --- ACRÉSCIMOS

\### 🆕 21) Gestão de Transportes Sanitários e Frota

\*\*Descrição Funcional\*\*

\- Controle de \*\*ambulâncias, veículos oficiais e transportes de
pacientes\*\*.

\- Registra viagens, motoristas, quilometragem, combustível, manutenção
e alertas de revisão.

\*\*Campos\*\*

\- \`\[veículo\] \[placa\] \[motorista\] \[tipo_transporte\] \[origem\]
\[destino\] \[km_inicial\] \[km_final\] \[combustível\] \[data\]
\[anexos\]\`

\*\*Indicadores\*\*

\- \*\*Consumo Médio (CM/L)\*\* = \`Km_percorridos / Litros\`

\- \*\*Custo por Viagem (CV)\*\* = \`Custo_total / Viagens\`

\- \*\*Tempo Médio de Viagem (TMV)\*\* = \`Σ (hora_chegada - hora_saida)
/ N\`

\-\--

\### 🆕 22) Gestão de Patrimônio e Equipamentos

\*\*Descrição Funcional\*\*

\- Inventário completo de \*\*equipamentos, bens permanentes e insumos
de alto valor\*\*.

\- Controle de \*\*manutenção preventiva, calibração, vencimentos e
rastreabilidade\*\*.

\*\*Campos\*\*

\- \`\[equipamento\] \[n_serie\] \[categoria\] \[localização\]
\[data_aquisição\] \[última_manut\] \[próxima_manut\] \[status\]
\[anexos\]\`

\*\*Indicadores\*\*

\- \*\*Taxa de Disponibilidade (TD%)\*\* = \`Equipamentos_operantes /
Total × 100%\`

\- \*\*Cumprimento de Manutenção (CM%)\*\* = \`Manutenções_realizadas /
Planejadas × 100%\`

\-\--

\### 🆕 23) Integração com Canais de Satisfação e Ouvidoria Digital

\*\*Descrição Funcional\*\*

\- Recebe feedbacks de pacientes via \*\*WhatsApp, QR Code ou formulário
digital\*\*.

\- Gera \*\*indicadores de NPS e Tempo Médio de Resposta\*\*.

\- Integração direta com a \*\*Ouvidoria Municipal\*\* e painel do
gestor geral.

\*\*Campos\*\*

\- \`\[canal\] \[mensagem\] \[categoria\] \[nota (0--10)\] \[status\]
\[prazo_resposta\] \[responsável\]\`

\*\*Indicadores\*\*

\- \*\*Tempo Médio de Resposta (TMR)\*\* = \`Σ (data_resposta -
data_recebimento) / N\`

\- \*\*NPS Rede Municipal\*\* = \`%Promotores - %Detratores\`

\-\--

\### 🆕 24) Expansão do Centro de Controle Operacional (CCO)

\*\*Descrição Funcional\*\*

\- Consolida incidentes das unidades (UBS/UPA/Hospitais) em \*\*painel
único\*\*.

\- Exibe alertas, status e tempos de resolução (SLA).

\- IA classifica eventos por \*\*criticidade e impacto operacional\*\*.

\*\*Indicadores\*\*

\- \*\*Cumprimento de SLA (%)\*\* = \`Casos_resolvidos_no_prazo / Total
× 100%\`

\- \*\*Índice de Risco Operacional (IRO 0--1)\*\* = \`f(ABS, AM, RUP,
ΔO, SLA, AE)\`

\-\--
