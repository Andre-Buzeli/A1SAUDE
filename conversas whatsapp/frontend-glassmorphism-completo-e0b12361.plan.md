<!-- e0b12361-17f6-406e-a6b5-6f8ba5307ddc 99279dbc-3e12-4b26-83df-3e9087c1065d -->
# Plano de Implementação: Frontend Completo com Glassmorphism

## Estrutura do Projeto

O projeto será dividido em **2 módulos principais** integrados em um único frontend:

### 1. **DIGESTOR** (Sistema de Gestão Estratégica)

- 3 níveis de acesso com permissões hierárquicas:
  - **Gestor Geral**: acesso total, cria unidades, outros gestores gerais, diretores locais e gestores locais
  - **Diretor Local**: acesso a múltiplas unidades do município, cria diretores locais e gestores locais
  - **Gestor Local**: acesso restrito à sua unidade única

### 2. **PEU** (Prontuário Eletrônico Unificado)

- 3 submódulos clínicos:
  - **UBS**: Atenção primária, linhas de cuidado, visitas domiciliares, vacinação, odontologia
  - **UPA**: Urgência/emergência, triagem Manchester, painel dinâmico, tempos-resposta
  - **Hospital**: Internações, leitos, centro cirúrgico, prescrições por turno

## Fase 1: Setup e Configuração Base

### Inicializar projeto Vite + React + TypeScript

- Criar estrutura com Vite
- Configurar TypeScript estrito
- Setup de aliases de importação (@components, @pages, @services, etc.)

### Instalar e configurar Tailwind CSS

- Configurar `tailwind.config.js` com tema customizado para glassmorphism
- Criar variáveis CSS para blur, depth, bordas translúcidas
- Definir paleta de cores da A1 Saúde (azuis médicos, brancos, cinzas suaves)

### Configurar React Router

- Sistema de rotas protegidas por autenticação
- Rotas com verificação de nível de acesso (gestor geral, diretor local, gestor local)
- Redirecionamento automático baseado em permissões

### Setup de gerenciamento de estado

- Context API para autenticação e usuário logado
- Context para unidade ativa (gestor local fixo, gestor geral selecionável)
- Context para permissões granulares

## Fase 2: Sistema de Design Glassmorphism

### Criar componentes base reutilizáveis com glassmorphism

Todos os componentes terão o efeito padrão:

```css
backdrop-filter: blur(1px);
background: rgba(255, 255, 255, 0.15);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

Componentes a criar:

- **GlassCard**: card base com glassmorphism
- **GlassModal**: modal/dialog com fundo blur
- **GlassButton**: botões com estados hover/active
- **GlassInput**: inputs de formulário
- **GlassSelect**: selects e dropdowns
- **GlassTable**: tabelas com header fixo
- **GlassSidebar**: menu lateral expansível
- **GlassTopBar**: barra superior fixa
- **GlassPanel**: painéis de dashboard
- **GlassTabs**: navegação em abas
- **GlassBadge**: badges e status indicators
- **GlassTooltip**: tooltips informativos
- **GlassDropdown**: menus dropdown

### Criar componentes compostos

- **DataTable**: tabela com filtros, ordenação, paginação
- **StatsCard**: card de estatísticas com ícone e valor
- **ChartCard**: card para gráficos com Recharts
- **FormSection**: seção de formulário com título
- **FilterBar**: barra de filtros complexos
- **NotificationBell**: sino de notificações
- **UserMenu**: menu do usuário no topo

## Fase 3: Autenticação e Controle de Acesso

### Tela 1: Login e Autenticação

**Arquivo**: `src/pages/Auth/Login.tsx`

Funcionalidades:

- Campo e-mail ou CPF
- Campo senha (validação: mínimo 8 caracteres, letras + números)
- Botão "Esqueci minha senha"
- 2FA via e-mail/SMS
- Logo A1 Saúde
- Termo de uso (aceite obrigatório no primeiro acesso)
- Background com glassmorphism sobre imagem médica

Lógica:

- Validação client-side com React Hook Form + Zod
- Chamada à API de autenticação
- Armazenar token JWT, dados do usuário e permissões
- Redirecionamento baseado em perfil:
  - Gestor Local → Dashboard da sua unidade fixa
  - Diretor Local → Dashboard com unidades do município
  - Gestor Geral → Seleção de unidades

### Sistema de Permissões

**Arquivos**:

- `src/contexts/AuthContext.tsx`
- `src/contexts/PermissionsContext.tsx`
- `src/hooks/useAuth.ts`
- `src/hooks/usePermissions.ts`

Implementar:

- Hook `useAuth()` com dados do usuário
- Hook `usePermissions()` para verificar acessos
- Componente `<ProtectedRoute>` para rotas
- Componente `<CanAccess>` para renderização condicional
- Guard que impede gestor local de ver outras unidades

## Fase 4: DIGESTOR - Módulo de Gestão

### Tela 2: Dashboard Inicial

**Arquivo**: `src/pages/Digestor/Dashboard.tsx`

**Barra Superior** (fixa, glassmorphism):

- Logo A1 Saúde (esquerda)
- Nome do usuário
- Nome da unidade ativa (gestor local)
- Dropdown de seleção de unidade (gestor geral/diretor)
- Botão perfil do usuário
- Botão notificações com badge
- Botão logout

**Menu Lateral** (glassmorphism, hover expand):

Ícones + labels que expandem ao hover:

- Dashboard
- Unidades (só gestor geral)
- Profissionais
- Escalas e Plantões
- Estoque e Insumos
- Contratos (só gestor geral)
- Financeiro (só gestor geral)
- Relatórios e IA (só gestor geral)
- Integração e-SUS PEC
- Análise Epidemiológica (só gestor geral)
- Configurações (só gestor geral)

**Painel Central**:

- Grid de cards com estatísticas (GlassCard)
- Para Gestor Local:
  - Unidade vinculada (fixo, não editável)
  - Nº profissionais ativos
  - Quantidade insumos
  - Plantões programados
  - Status integração e-SUS
- Para Gestor Geral:
  - Visão consolidada ou filtrada
  - Gráficos produtividade (Recharts)
  - Alertas centralizados

**Área de Notificações**:

- Lista de notificações inteligentes
- Lembretes importação e-SUS
- Insumos próximos vencimento
- Carga horária excedida
- Novos relatórios IA disponíveis

### Tela 3: Seleção de Unidades (Gestor Geral)

**Arquivo**: `src/pages/Digestor/Units/UnitSelection.tsx`

**Filtros e Busca**:

- Campo busca (nome ou CNES)
- Filtro tipo (UBS/UPA/Hospital/Clínica/Posto)
- Filtro município (todos os municípios do Brasil - API IBGE)
- Filtro status (ativa/inativa)
- Ordenação (alfabética, produtividade)

**Grid de Cards de Unidades**:

- Layout em grid responsivo
- Cada card (GlassCard) mostra:
  - Nome unidade
  - Tipo e município
  - Status (badge verde/cinza)
  - Indicadores rápidos: profissionais, estoque, atendimentos, custo
- Ações: "Acessar", "Editar", "Desativar"

**Botão fixo**: "Cadastrar nova unidade" (topo direito)

### Tela 4: Cadastro e Gerenciamento de Unidades

**Arquivo**: `src/pages/Digestor/Units/UnitForm.tsx`

**Formulário completo** (GlassCard):

- Nome da unidade
- Tipo (UBS/UPA/Hospital/Clínica/Posto de atendimento)
- Município (select com todos municípios brasileiros - API IBGE)
- Endereço completo (CEP com autocomplete via ViaCEP)
- Código CNES
- Telefone e e-mail
- Responsável técnico (nome, CPF, contato)
- Status (ativa/inativa)
- Observações

**Seção Gestores Locais**:

- Tabela de gestores vinculados
- Botão "Adicionar novo gestor local"
- Modal de cadastro:
  - Dados pessoais
  - Criação de login
  - Vinculação obrigatória à unidade
  - Checkboxes de permissões granulares:
    - Cadastro profissionais
    - Escalas
    - Estoque
    - Importação manual e-SUS

**Histórico de Auditoria**:

- Timeline de alterações
- Quem criou/editou/desativou
- Data/hora

### Tela 5: Gestão de Usuários e Permissões

**Arquivo**: `src/pages/Digestor/Users/UserManagement.tsx`

**Tabela de Usuários** (GlassTable):

- Colunas: Nome, E-mail, CPF, Unidade, Perfil, Status
- Filtros: unidade, perfil, status
- Busca: nome ou e-mail
- Paginação

**Modal Cadastro de Usuário**:

- Campos: nome, e-mail, CPF, telefone
- Select perfil: 
  - Gestor Geral (só aparece para gestor geral)
  - Diretor Local
  - Gestor Local
- Para Gestor Local: select unidade (obrigatório)
- Para Diretor Local: select município
- Grid de permissões (checkboxes granulares)
- Status (ativo/bloqueado)
- Geração senha temporária automática

**Logs de Acesso**:

- Tabela com histórico login/logout
- Tentativas falhas
- Filtros por usuário e período

### Tela 6: Gestão de Profissionais

**Arquivo**: `src/pages/Digestor/Professionals/ProfessionalManagement.tsx`

**Para Gestor Local** (CRUD básico):

- Tabela profissionais da unidade
- Filtros: cargo, setor, status, vínculo
- Busca: nome ou CPF
- Formulário cadastro/edição:
  - Nome, CPF, cargo, especialidade
  - Setor, data admissão, tipo vínculo
  - Contato (e-mail, telefone, endereço)
  - Status (ativo/afastado/desligado)
- Exportação: Excel, PDF, CSV

**Para Gestor Geral** (+ IA):

- Tudo do gestor local +
- Dashboard IA (só gestor geral):
  - Análises preditivas produtividade
  - Atendimentos por profissional (gráficos Recharts)
  - Consumo medicações/insumos por profissional
  - Custo por profissional
  - Sugestões otimização escala
- Exportação relatórios IA: PDF, Excel

### Tela 7: Gestão de Escalas e Plantões

**Arquivo**: `src/pages/Digestor/Schedules/ScheduleManagement.tsx`

**Para Gestor Local**:

- Calendário mensal interativo (FullCalendar ou React Big Calendar)
- Visualização por turno (manhã, tarde, noite)
- Indicação: folgas, férias, afastamentos, extras
- CRUD completo escalas/plantões
- Drag and drop para reorganizar
- Inclui sábado e domingo

**Para Gestor Geral** (+ IA):

- Tudo do gestor local +
- Painel de alertas IA:
  - Sobrecarga por turno
  - Conflitos/falhas na escala
  - Sugestões otimização automática
- Relatórios automáticos:
  - Gráficos escalas/plantões
  - Produtividade por turno
  - Custos operacionais
- Exportação: PDF, Excel

### Tela 8: Gestão de Estoque e Insumos

**Arquivo**: `src/pages/Digestor/Inventory/InventoryManagement.tsx`

**Para Gestor Local**:

- Tabela de insumos (GlassTable)
- Filtros: categoria, tipo, validade, quantidade
- CRUD itens:
  - Nome, tipo, categoria, especificação, unidade medida
  - Entradas: data, qtd, fornecedor, lote, validade
  - Saídas: data, qtd, destino, profissional
- Histórico movimentações por item
- Importação manual e-SUS (se autorizado):
  - Upload CSV/XLS
  - Validação prévia

**Integração e-SUS automática**:

- Status da integração
- Última sincronização
- Dados automaticamente populados

**Para Gestor Geral** (+ IA):

- Tudo do gestor local +
- Dashboard IA:
  - Alertas estoque crítico/ruptura
  - Análise consumo (gráficos Recharts)
  - Insumos mais/menos utilizados
  - Subutilização/excesso
  - Recomendações reposição
  - Previsão demanda (sazonalidade)
- Exportação: PDF, Excel

### Tela 9: Gestão Financeira

**Arquivo**: `src/pages/Digestor/Financial/FinancialManagement.tsx`

**Exclusivo Gestor Geral**:

**Receitas**:

- Formulário lançamento receita mensal
- Detalhamento por fonte (federal, estadual, municipal, convênios)
- Histórico com gráficos comparativos

**Custos e Despesas**:

- Lançamento por categoria (RH, insumos, estrutura, terceirizados)
- Integração automática com contratos cadastrados
- Upload comprovantes/faturas

**Painel Análise IA**:

- Indicadores financeiros (cards)
- Projeção fluxo de caixa (gráfico linha)
- Custo médio por atendimento
- Custo por profissional
- Produtividade vs custo
- Eficiência por equipe/linha cuidado
- Todos indicadores da Matriz de Cálculos

**Exportação**: PDF, Excel, CSV

**Integração**: Power BI (via API)

### Tela 10: Contratos e Fornecedores

**Arquivo**: `src/pages/Digestor/Contracts/ContractManagement.tsx`

**Exclusivo Gestor Geral**:

**Cadastro Contratos**:

- Tipo (prestação serviço, locação, fornecimento)
- Unidade vínculo (select)
- Fornecedor (nome, CNPJ)
- Objeto contrato
- Valor mensal/total
- Vigência (início/fim)
- Condições reajuste, cláusulas meta
- Upload documentos (PDF, DOC)
- Classificação IA automática (tipo, nível risco)

**Gestão Fornecedores**:

- CRUD fornecedores
- Histórico vínculos com unidades
- Avaliação desempenho
- Status (ativo/inativo)

**Monitoramento IA**:

- Acompanhamento cumprimento cláusulas
- Alertas não conformidade
- Recomendações reajuste (IPCA)
- Vinculação automática com custos (Tela 9)
- Controle pagamentos (pago, a pagar, previsão)

**Relatórios**: contratos vigentes, inadimplência, custo por tipo

**Exportação**: PDF, Excel, Power BI

### Tela 11: Relatórios e Análises IA

**Arquivo**: `src/pages/Digestor/Reports/ReportsAI.tsx`

**Exclusivo Gestor Geral**:

**Dashboard Principal**:

- Seletor de tipo de relatório (dropdown)
- Filtros: período, unidade, profissional, equipe, categoria

**Tipos de Relatórios Disponíveis**:

1. Produtividade individual/equipe
2. Volume atendimentos (por unidade, equipe, período)
3. Uso insumos (cruzamento profissional/equipe)
4. Custo por atendimento/profissional
5. Eficiência escala
6. Gestão contratos/fornecedores
7. Desempenho financeiro
8. Absenteísmo e carga excessiva
9. Eficiência gerencial por unidade
10. Todos os indicadores da Matriz de Cálculos

**Visualizações**:

- Gráficos interativos (Recharts):
  - Linhas, barras, pizza, área
  - Comparativos entre unidades
  - Séries temporais
- Tabelas detalhadas exportáveis

**Recursos IA**:

- Geração automática contínua
- Identificação padrões, gargalos, desperdícios
- Recomendações de melhoria
- Alertas de risco

**Exportação e Compartilhamento**:

- PDF, Excel, CSV, PNG (gráficos)
- Compartilhar com gestores locais (se autorizado)
- Integração Power BI

### Tela 12: Integração e-SUS PEC

**Arquivo**: `src/pages/Digestor/Integration/EsusPecIntegration.tsx`

**Integração Automática**:

- Status conexão PostgreSQL local
- Configuração conector (IP, porta, credenciais)
- Frequência sincronização (diária/semanal/sob demanda)
- Últimas sincronizações (log)
- Dados extraídos:
  - Produção ambulatorial
  - Cadastros profissionais/equipes
  - Fichas atendimento
  - Registro insumos

**Importação Manual** (se autorizado):

- Upload arquivos (CSV, XLS, JSON)
- Validação prévia
- Mapeamento campos

**Validação IA** (só gestor geral):

- Análise inconsistências
- Dados duplicados/ausentes
- Classificação confiabilidade
- Sugestões correção
- Aprovação/rejeição dados

**Apêndice Técnico**: documentação sobre conexão PostgreSQL

### Tela 13: Análise Epidemiológica

**Arquivo**: `src/pages/Digestor/Epidemiology/EpidemiologyAnalysis.tsx`

**Exclusivo Gestor Geral**:

**Identificação Automática IA**:

- Agravos prevalentes por unidade/região
- Doenças endêmicas
- Padrões epidemiológicos
- Análise preditiva

**Visualização Geoespacial**:

- Mapas interativos (Leaflet ou MapBox)
- Distribuição casos por área
- Áreas de risco (heat maps)
- Integração dados ambientais/sociais

**Alertas Automáticos**:

- Surtos
- Elevações súbitas incidência
- Notificações tempo real

**Dashboards e Relatórios**:

- Síntese informações epidemiológicas
- Planejamento campanhas
- Estratégias prevenção
- Indicadores da Matriz (seção epidemiologia)

**Planos de Ação**:

- Ferramenta elaboração planos preventivos
- Registro atividades
- Acompanhamento resultados
- Avaliação impacto

**Exportação**: PDF, Excel (LGPD compliant, dados anonimizados)

**Compartilhamento**: secretarias municipais, stakeholders

### Tela 14: Painel Central Gestor Geral

**Arquivo**: `src/pages/Digestor/Admin/AdminPanel.tsx`

**Exclusivo Gestor Geral**:

**Cadastro Unidades**:

- Formulário completo (igual Tela 4)
- Geração automática estrutura modular
- Identidade visual A1 Saúde

**Criação Acessos**:

- Cadastro gestores locais/diretores
- Vinculação unidade obrigatória
- Limites automáticos de acesso
- Redefinição senha
- Logs atividades

**Permissões Granulares**:

- Grid checkboxes por gestor local:
  - Importação e-SUS manual
  - Visualização dados operacionais
  - Relatórios parciais
  - Cadastros (insumos, escala, profissionais)

**Visualização Consolidada**:

- Painel macro comparativo
- Indicadores por unidade:
  - Rendimento médio
  - Custo total mensal
  - Eficiência escala
  - Uso insumos
  - Atingimento metas
- Filtros: período, tipo unidade, equipe, produção
- Gráficos IA: insights, alertas, outliers

**Controle e Auditoria**:

- Logs completos (acessos, movimentações, edições)
- Sistema notificações centralizadas
- Alertas risco, falhas integração, inconsistências
- Relatórios administrativos

**Exportação Global**:

- Por unidade ou consolidado
- PDF, Excel, PowerPoint, CSV
- Power BI

## Fase 5: PEU - Prontuário Eletrônico

### Estrutura Comum PEU

**Layout Padrão** (todos submódulos):

- Interface moderna, clean, responsiva
- Modo escuro disponível (toggle)
- Menu lateral esquerdo padrão (glassmorphism)
- Expansão ao hover

**Menu Lateral PEU**:

1. Dashboard Clínico
2. Identificação e Dados Cadastrais
3. Histórico Médico Completo
4. Anamnese (SOAP)
5. Antecedentes e Histórico Saúde
6. Consultas Prévias (timeline)
7. Procedimentos Realizados
8. Exames e Resultados
9. Prescrição e Documentos
10. Pareceres e Evoluções Multiprofissionais
11. Encaminhamentos e Contrarreferências
12. Agenda e Atendimentos
13. Alertas Clínicos (IA)
14. Documentos Emitidos
15. Assinatura Digital (ICP-Brasil)

**Recursos Globais PEU**:

- Criptografia ponta a ponta
- Backups automáticos (AWS/Cloudflare R2)
- Conformidade LGPD
- Assinatura digital ICP-Brasil em todos documentos

### Submódulo UBS (Atenção Primária)

**Arquivo Base**: `src/pages/PEU/UBS/`

**Diferenciais**:

- Linhas de Cuidado:
  - Saúde da Mulher
  - Saúde da Criança
  - Saúde do Idoso
  - Saúde do Homem
  - Saúde Mental
  - Saúde Bucal
- Visitas Domiciliares:
  - Planejamento
  - Registro
  - Georreferenciamento
  - Otimização rotas
- Odontograma Digital:
  - Interface gráfica dentes
  - Registro procedimentos
  - Histórico odontológico
- Controle Vacinação:
  - Registro completo
  - Alertas atraso
  - Integração SI-PNI
- Integração e-SUS PEC:
  - Sincronização automática
  - Indicadores SIAB/SISAB

### Submódulo UPA (Urgência e Emergência)

**Arquivo Base**: `src/pages/PEU/UPA/`

**Diferenciais**:

- Triagem Classificação de Risco:
  - Protocolo de Manchester
  - Indicação automática cor
  - Tempo-alvo
- Painel Atendimentos Dinâmico:
  - Visão tempo real fila
  - Status por cores (glassmorphism cards)
  - Filtros por prioridade
  - Gestão otimizada fluxo
- Prescrição Rápida:
  - Templates condições urgência:
    - Dor torácica
    - Convulsão
    - Trauma
    - Envenenamento
    - etc.
- Registro de Tempos:
  - Tempo chegada
  - Tempo atendimento
  - Tempo permanência
  - Tempo porta-médico
- Integração Transferência:
  - Ficha regulação
  - QR Code
  - Comunicação SAMU
  - Comunicação hospitais

### Submódulo Hospital

**Arquivo Base**: `src/pages/PEU/Hospital/`

**Diferenciais**:

- Painel Internações:
  - Visão geral pacientes internados
  - Status por cor (UTI, Clínica, etc.)
  - Cards glassmorphism
- Mapa de Leitos:
  - Visualização interativa
  - Controle ocupação tempo real
  - Filtros por setor/ala
- Gestão Fluxo Pacientes:
  - Admissões
  - Transferências internas
  - Altas
  - Automação processos
- Prescrição Médica e Enfermagem:
  - Divisão por turno
  - Via administração
  - Módulo checagem enfermagem:
    - Registro horário
    - Responsável
- Centro Cirúrgico:
  - Agendamento cirurgias
  - Registro equipe
  - Materiais utilizados
  - Custos
  - Duração
  - Descrição cirúrgica
  - Registro anestésico
- Sumário Alta Automatizado:
  - Geração automática
  - Diagnósticos
  - Procedimentos
  - Conduta
  - Prescrição alta
- Gestão Qualidade e Segurança:
  - Registro eventos adversos
  - Análise eventos
  - Protocolos segurança paciente
  - Acompanhamento

### Funcionalidades Adicionais PEU

**Módulo Comunicação Interna**:

- Chat entre equipes/setores
- Mensagens seguras LGPD
- Histórico conversas

**Teleatendimento/Teleconsulta**:

- Integrado ao prontuário
- Videoconferência
- Registro consulta remota

**Modo Offline**:

- Para visitas domiciliares
- UBS sem conectividade
- Sincronização posterior

**Painel Protocolos Clínicos**:

- Biblioteca protocolos
- Linhas de cuidado
- Acesso rápido

**Auditoria Assistencial**:

- Monitoramento indicadores qualidade
- Conformidade protocolos

**Faturamento SUS**:

- AIH, APAC, BPA
- Controle glosas
- Geração automática

**Gestão Ampliada Suprimentos**:

- Controle medicamentos
- Rastreabilidade lote
- Validade

**Painel Indicadores Integrado**:

- Clínicos
- Administrativos
- Financeiros
- Dashboards unificados

**Cadastro Equipamentos e Patrimônio**:

- CRUD equipamentos
- Controle manutenção
- Histórico

**Área Suporte e Treinamento**:

- Tutoriais interativos
- Vídeos
- Canal atendimento
- Base conhecimento

## Fase 6: Componentes Compartilhados

### Criar componentes avançados

- **PatientSearch**: busca paciente inteligente (CPF, nome, CNS)
- **ClinicalTimeline**: linha do tempo consultas/eventos
- **PrescriptionBuilder**: construtor prescrições com alertas interação
- **DocumentGenerator**: gerador documentos médicos (atestados, receitas, laudos)
- **DigitalSignature**: módulo assinatura ICP-Brasil
- **FileUpload**: upload arquivos (exames, documentos)
- **CalendarScheduler**: agendamento consultas
- **NotificationCenter**: central notificações
- **UserAvatar**: avatar usuário com status
- **BreadcrumbNavigation**: navegação breadcrumb
- **LoadingStates**: estados de carregamento elegantes
- **EmptyStates**: estados vazios ilustrados
- **ErrorBoundary**: tratamento erros global

## Fase 7: Integrações e APIs

### Criar serviços de API

**Arquivos**: `src/services/`

- `authService.ts`: autenticação, login, logout, refresh token
- `userService.ts`: CRUD usuários
- `unitService.ts`: CRUD unidades
- `professionalService.ts`: CRUD profissionais
- `scheduleService.ts`: CRUD escalas
- `inventoryService.ts`: CRUD estoque
- `contractService.ts`: CRUD contratos
- `financialService.ts`: receitas, custos
- `reportService.ts`: geração relatórios
- `esusService.ts`: integração e-SUS
- `patientService.ts`: CRUD pacientes
- `clinicalService.ts`: dados clínicos
- `prescriptionService.ts`: prescrições
- `documentService.ts`: documentos
- `notificationService.ts`: notificações

### Integração externa

- **API IBGE**: municípios brasileiros
- **ViaCEP**: autocomplete endereços
- **SI-PNI**: vacinação
- **SAMU**: transferências
- **ICP-Brasil**: assinatura digital
- **AWS S3 / Cloudflare R2**: armazenamento arquivos
- **PostgreSQL e-SUS**: integração local

## Fase 8: Gráficos e Visualizações

### Configurar Recharts

- Biblioteca gráficos React
- Componentes customizados com glassmorphism
- Tipos: linha, barra, área, pizza, radar, scatter

### Criar gráficos específicos

- Produtividade profissionais (barras)
- Atendimentos por período (linha)
- Consumo insumos (pizza)
- Custos operacionais (área)
- Comparação unidades (barras agrupadas)
- Indicadores epidemiológicos (mapas calor)
- Taxa ocupação leitos (gauge)
- Fluxo pacientes (sankey)

### Integração Power BI

- Endpoints API para exportação dados
- Documentação integração

## Fase 9: Responsividade e Acessibilidade

### Responsividade

- Mobile-first approach
- Breakpoints Tailwind: sm, md, lg, xl, 2xl
- Menu lateral collapse em mobile
- Tabelas com scroll horizontal
- Cards empilhados em mobile
- Dashboards adaptáveis

### Acessibilidade (WCAG 2.1 AA)

- Semântica HTML5
- ARIA labels e roles
- Navegação por teclado (tab index)
- Contraste adequado (mínimo 4.5:1)
- Textos alternativos imagens
- Focus visível
- Anúncios screen reader

### Modo Escuro

- Toggle no header
- Persistência localStorage
- Ajuste paleta glassmorphism:
  - Fundo mais escuro
  - Blur mais pronunciado
  - Bordas mais claras

## Fase 10: Performance e Otimização

### Otimizações

- Code splitting por rotas
- Lazy loading componentes pesados
- Memoização (React.memo, useMemo, useCallback)
- Virtualização listas longas (react-window)
- Debounce em buscas
- Throttle em scroll events
- Imagens otimizadas (WebP)
- Compressão assets

### SEO e Meta Tags

- React Helmet para meta tags dinâmicas
- Open Graph para compartilhamento
- Favicon customizado

## Fase 11: Testes e Qualidade

### Testes

- Vitest para testes unitários
- React Testing Library para componentes
- Cobertura mínima 70%
- Testes principais:
  - Autenticação e permissões
  - Formulários
  - Tabelas e filtros
  - Componentes glassmorphism

### Linting e Formatação

- ESLint configurado
- Prettier para formatação
- Husky para pre-commit hooks

## Fase 12: Documentação

### Criar documentação

- README.md:
  - Descrição projeto
  - Setup e instalação
  - Comandos disponíveis
  - Estrutura pastas
- CONTRIBUTING.md: guia contribuição
- Storybook (opcional): showcase componentes
- JSDoc comentários em funções complexas

###

### To-dos

- [ ] Configurar projeto React + TypeScript + Vite + Tailwind CSS do zero com estrutura de pastas modular
- [ ] Criar configuração customizada do Tailwind com plugin glassmorphism (blur 1px, depth 1px) e estilos globais
- [ ] Desenvolver biblioteca completa de 28+ componentes reutilizáveis com glassmorphism (GlassCard, GlassModal, GlassSidebar, GlassButton, GlassInput, etc.)
- [ ] Implementar sistema de layouts com GlassLayout, GlassTopbar, GlassSidebar com menu expansível (hover) e scroll reset entre abas
- [ ] Configurar React Router, sistema de autenticação com JWT, 2FA, guards de rota e contexts de permissão (Gestor Geral, Diretor Local, Gestor Local)
- [ ] Desenvolver serviços de API com Axios (auth, units, users, professionals, schedule, stock, financial, contracts, reports, esus, peu)
- [ ] Implementar Tela 1 (Login) e Tela 2 (Dashboard Inicial) do DIGESTOR com glassmorphism, redirecionamento por perfil e notificações
- [ ] Implementar Tela 3 (Seleção de Unidade) e Tela 4 (Cadastro/Gerenciamento de Unidades) com filtros, busca e CRUD completo
- [ ] Implementar Tela 5 (Gestão de Usuários) com hierarquia de criação (Gestor Geral cria todos, Diretor Local cria Diretor/Gestor Local), permissões granulares e logs
- [ ] Implementar Tela 6 (Gestão de Profissionais) com CRUD, filtros, relatórios IA de produtividade (Gestor Geral) e exportação
- [ ] Implementar Tela 7 (Gestão de Escalas) com calendário interativo, sábado/domingo, alertas de sobrecarga e otimização IA (Gestor Geral)
- [ ] Implementar Tela 8 (Gestão de Estoque) com movimentação, integração e-SUS PEC, alertas críticos e análise IA de consumo (Gestor Geral)
- [ ] Implementar Tela 9 (Gestão Financeira) exclusiva Gestor Geral com lançamentos, vinculação automática de contratos, KPIs e gráficos
- [ ] Implementar Tela 10 (Contratos e Fornecedores) exclusiva Gestor Geral com CRUD, upload de documentos, monitoramento IA e alertas
- [ ] Implementar Tela 11 (Relatórios e Análises IA) exclusiva Gestor Geral com geração automática contínua, gráficos interativos e exportação múltipla
- [ ] Implementar Tela 12 (Integração e-SUS PEC) com conexão PostgreSQL, importação manual opcional, validação IA e logs de sincronização
- [ ] Implementar Tela 13 (Análise Epidemiológica) exclusiva Gestor Geral com mapas geoespaciais, ranking de CIDs, alertas de surtos e planos preventivos
- [ ] Implementar Tela 14 (Painel Central) exclusiva Gestor Geral com visão consolidada, comparativos entre unidades, logs de auditoria e exportação global
- [ ] Implementar Dashboard Clínico do PEU com resumo do paciente, sinais vitais, timeline e alertas clínicos com glassmorphism
- [ ] Implementar tela de Identificação e Dados Cadastrais do Paciente com formulários glass
- [ ] Implementar Histórico Médico Completo agrupado por linhas de cuidado com acordeão glassmorphism
- [ ] Implementar Anamnese SOAP com formulário estruturado, auto-save e templates pré-definidos
- [ ] Implementar Consultas Prévias (timeline interativa) e Exames/Resultados com histórico gráfico
- [ ] Implementar Prescrições com alertas de interações medicamentosas e templates rápidos (UPA)
- [ ] Implementar submódulo UBS: Linhas de cuidado, Visitas domiciliares, Odontograma digital, Controle vacinal, integração e-SUS PEC
- [ ] Implementar submódulo UPA: Triagem com Classificação de Risco (Manchester), Painel dinâmico, Prescrição rápida, Registro de tempos
- [ ] Implementar submódulo Hospitalar: Painel de internações, Mapa de leitos, Prescrição por turno, Centro cirúrgico, Sumário de alta
- [ ] Implementar todos os filtros de dados por perfil (Diretor Local vê apenas seu município, Gestor Local apenas sua unidade) e permissões granulares
- [ ] Implementar modo escuro com toggle, ajuste automático de opacidade do glassmorphism e persistência
- [ ] Implementar responsividade completa (mobile-first) com menu colapsável, tabelas scroll, modais fullscreen no mobile
- [ ] Implementar code splitting, lazy loading de rotas, otimização de bundle, compression e React Query para cache
- [ ] Implementar testes com Vitest, validação com Zod, acessibilidade (ARIA, keyboard navigation) e coverage mínimo 80%
- [ ] Criar documentação completa: Storybook para componentes, README com arquitetura e instruções, guia de contribuição