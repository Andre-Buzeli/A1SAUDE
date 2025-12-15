# Documentação Completa do Sistema A1 Saúde — Frontend + Backend

Última atualização: <!-- updated --> 2025-10-29

Este documento oferece uma análise hiper detalhada de todo o sistema A1 Saúde, contemplando frontend (React + Vite), backend (Node/Express + Prisma), autenticação e RBAC, PWA, serviços, rotas, modelos, fluxos críticos, padrões de resposta e roadmap técnico. Foi projetado para servir como referência técnica central, útil para onboarding, auditoria e planejamento.

## Sumário Executivo

- Frontend: React 18 com `react-router-dom 7`, UI em Glassmorphism, rotas clínicas e páginas dev implementadas; documentação acessível em `/dev/docs` carregando este `.md` de `public/docs`.
- Backend: Express 5 com TypeScript, Prisma ORM, autenticação JWT com refresh, RBAC granular por perfil e por tipo de estabelecimento, rate limiting e auditoria (`AuditLog`).
- API: prefixo base `\api\v1\` com módulos: `auth`, `patients`, `attendances`, `prescriptions`, `exams`, `triage`, `medications`, `vital-signs`, `nursing`, `hospital`, `upa`, `admin`, `reports`.
- PWA: `manifest.json` completo, service worker registrado em produção; em desenvolvimento, caches são limpos e SW desregistrado.
- Consistência de tipos: há duas definições de auth no frontend (`src/types/auth.ts` e `src/types/auth.types.ts`) e uma no backend (`src/types/auth.ts`); recomenda-se unificação.

---

## Arquitetura Frontend

- Tecnologias
  - `react`, `react-dom`, `react-router-dom`, `axios`, `framer-motion`, `react-hot-toast`, `zustand`, `zod`, `recharts`, `@tanstack/react-query`.
  - Build com `vite`; scripts: `npm run dev`, `npm run build`, `npm run preview`.

- Rotas e Navegação (`src/App.tsx`)
  - Índice de desenvolvimento: `\dev` (hub para páginas clínicas e admin).
  - Documentação: `\dev\docs` — carrega `public/docs/complete_system_frontend.md`.
  - Clínico dev: `\dev\patients`, `\dev\attendances`, `\dev\prescriptions`, `\dev\exams`, `\dev\triage`, `\dev\medications`, `\dev\vital-signs` (e variações: `new`, `:id`, `results`, `trends/:patientId`).
  - Admin dev: `\dev\admin\users`, `\dev\admin\establishments`, `\dev\admin\financial`, `\dev\admin\reports`.
  - Gestores dev: `\dev\gestor-geral`, `\dev\gestor-local`, `\dev\gestor-total`.
  - Dashboards protegidos por estabelecimento (via `ProtectedRoute`): `\hospital\dashboard`, `\upa\dashboard`, `\ubs\dashboard`.

- Dev Hub (`src/pages/dev/DevRoutesPage.tsx`)
  - Lista cartões agrupados por áreas (clínico, admin, específico/estabelecimento, gestão) e links para rotas dev.
  - Destaque para “Documentação Frontend” (link para `\dev\docs`).

- Documentação (`src/pages/dev/DevDocsPage.tsx`)
  - `fetch` do `.md` sem parser; exibição com `<pre>`; estados de carregamento e erro; botões para voltar ao índice e abrir o original.

- Autenticação e Contexto (`src/contexts/AuthContext.tsx`)
  - Estado: `user`, `tokens` (`accessToken`, `refreshToken`), `isAuthenticated`, carregamento e erros.
  - Persistência: `localStorage` para tokens/usuário; re-hidratação em page reload.
  - Funções: `login`, `logout`, `refreshTokens`, `hasPermission`, `hasAnyPermission`, `hasAllPermissions`.
  - Seleção automática de dashboard por perfil/estabelecimento (ex.: médico-hospital → `\hospital\dashboard`).

- Proteção de Rotas (`src/components/ProtectedRoute.tsx`)
  - Verifica autenticação; aceita requisitos: `requiredProfile`, `requiredEstablishmentType`, `requiredPermissions`.
  - Redireciona para `\login` quando não autenticado; para `\unauthorized` quando sem requisitos.
  - Usa utilitários do `AuthContext` para checar permissões.

- Serviço de API (`src/services/api.service.ts`)
  - `axios` com `baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001'`.
  - Interceptor de requisição: injeta `Authorization: Bearer <accessToken>`.
  - Interceptor de resposta: em `401`, fila de replays, `refresh`, persistência de novos tokens; falha → `logout` e redirect `\login`.

- Serviços por Módulo (via `apiService`)
  - `auth.service.ts`: login, refresh, logout, forgot/reset, change-password, verify email.
  - `patientService.ts`: CRUD, busca, histórico, estatísticas.
  - `attendanceService.ts`: criar/atualizar/concluir, busca, ativos, stats.
  - `triageService.ts`: CRUD triagem, fila, calcular prioridade, stats.
  - `examService.ts`: solicitar, buscar, pendentes, tipos, críticos, agendar/iniciar/concluir/cancelar.
  - `prescriptionService.ts`: criar, buscar, ativas, stats, atualizar/cancelar/concluir.
  - `medicationService.ts`: administração (criar/atualizar/administer/missed/refused), agendas (criar/ativas/detalhe), stats.
  - `vitalSignsService.ts`: criar, busca, alertas, stats, tendências, últimos.
  - `nursingDashboardService.ts`: métricas e listagens para enfermagem.

- UI/UX
  - Glassmorphism (GlassCard/Button/Table/Input/Modal), animações com `framer-motion`, toasts (`react-hot-toast`), gráficos (`recharts`).
  - Dark/light theme; foco em acessibilidade básica.

- PWA
  - `public/manifest.json`: nome, descrições, ícones, `start_url`, cores, `shortcuts` (`/dashboard`, `/patients`, `/attendances`).
  - `src/main.tsx`: registra `sw.js` apenas em produção; em dev, desregistra SW e limpa caches.

---

## Arquitetura Backend

- Servidor (`backend/src/server.ts`)
  - Middlewares globais: `rate limit`, `express.json`, `urlencoded`, `cookieParser`, `compression`, `morgan`.
  - Auditoria: intercepta respostas sensíveis e grava `AuditLog` via Prisma.
  - Montagem de rotas sob `\api\v1\`: `auth`, `patients`, `attendances`, `prescriptions`, `exams`, `triage`, `medications`, `vital-signs`, `nursing`, `hospital`, `upa`, `admin`, `reports`.
  - Health endpoint básico e handlers de erro/404.

- Middlewares (`backend/src/middlewares/auth.ts`)
  - `authenticate`: valida JWT, popula `req.user`, verifica sessão/expiração.
  - `requirePermission`, `requireAnyPermission`, `requireAllPermissions`: verificação granular de permissões.
  - `requireEstablishmentType` e `requireEstablishment('hospital'|'upa'|'ubs')`: restrição por tipo de estabelecimento.
  - `authRateLimit(max, windowMs)`: rate limit especializado para rotas de auth.

- RBAC e Tipos (`backend/src/types/auth.ts`, `backend/src/config/permissions.ts`)
  - Perfis: `gestor_geral`, `gestor_local`, `medico`, `enfermeiro`, `farmaceutico`, `system_master`, etc.
  - Estabelecimentos: `hospital`, `upa`, `ubs` (há enum equivalente no frontend).
  - Permissões: clínicas e administrativas (ex.: `medico:read`, `medico:write`, `enfermeiro:read`, `farmaceutico:read`, `gestor_geral:read`, `hospital:access`, `upa:access`).
  - Mapeamentos: função/arquivo derivando `permissions[]` a partir de perfil/estabelecimento.

---

## API — Endpoints por Módulo

Observação: Todos os endpoints (salvo saúde/validations específicos) exigem `authenticate` e permissões conforme módulo.

- Auth (`/api/v1/auth`)
  - `POST /login` — rate limit defensivo; retorno `user + tokens`.
  - `POST /refresh` — troca `accessToken`/`refreshToken`.
  - `POST /logout` — invalida sessão.
  - `GET /me` — dados do usuário autenticado.
  - `POST /change-password`
  - `GET /validate` — validação de token/permissions.
  - `GET /permissions` — devolve `permissions[]` resolvidas.
  - `GET /health` — status do serviço.

- Patients (`/api/v1/patients`)
  - `POST /` — criar (perms: `medico:write` ou `enfermeiro:write`).
  - `GET /search` — buscar (perms: `medico:read`, `enfermeiro:read`).
  - `GET /stats` — métricas (perms: `gestor_geral:read` também).
  - `GET /cpf/:cpf`, `GET /:id` — obter por CPF/ID.
  - `PUT /:id` — atualizar (perms de escrita).
  - `DELETE /:id` — desativar/remover (perms: `gestor_geral:write` ou médico conforme regra).
  - `GET /:id/history` — histórico clínico.

- Attendances (`/api/v1/attendances`)
  - `POST /start` — iniciar atendimento.
  - `PUT /:id/soap` — atualizar notas SOAP.
  - `PUT /:id/complete` — concluir.
  - `GET /search`, `GET /active`, `GET /stats`, `GET /:id`, `PUT /:id`.

- Triage (`/api/v1/triage`)
  - `POST /` — criar triagem.
  - `GET /search` — busca.
  - `GET /queue` — fila ordenada por prioridade/tempo.
  - `GET /stats` — métricas.
  - `POST /calculate-priority` — regras Manchester.
  - `GET /:id`, `PUT /:id`, `PATCH /:id/status`.

- Exams (`/api/v1/exams`)
  - `POST /` — criar solicitação (perms: médico).
  - `GET /search`, `GET /pending`, `GET /types`, `GET /stats`, `GET /critical`, `GET /:id`.
  - `PUT /:id`, `POST /:id/schedule`, `POST /:id/start`, `POST /:id/complete`, `POST /:id/cancel`.

- Prescriptions (`/api/v1/prescriptions`)
  - `POST /` — criar (médico).
  - `GET /search`, `GET /active`, `GET /stats`, `GET /:id`.
  - `PUT /:id`, `POST /:id/cancel`, `POST /:id/complete`.

- Medications (`/api/v1/medications`)
  - Administração: `POST /administer`, `GET /administer/search`, `GET /administer/today`, `GET /administer/:id`, `PUT /administer/:id`, `POST /administer/:id/administer`, `POST /administer/:id/missed`, `POST /administer/:id/refused`.
  - Agendas: `POST /schedule`, `GET /schedule/active`, `GET /schedule/:id`.
  - Utilitários: `GET /stats`, `POST /schedule/generate-from-prescription`.

- Vital Signs (`/api/v1/vital-signs`)
  - `POST /`, `GET /search`, `GET /alerts`, `GET /stats`, `GET /trends/:patientId`, `GET /latest/:patientId`, `GET /:id`, `PUT /:id`.

- Nursing (`/api/v1/nursing`)
  - `GET /dashboard/:establishmentType`, `GET /activities/recent`, `GET /triages/pending`, `GET /patients/critical`.

- Hospital (`/api/v1/hospital`)
  - Proteções: `authenticate` + `requireEstablishment('hospital')`.
  - Admissões: `POST /admissions`, `GET /admissions`, `PUT /admissions/:id/discharge`, `PUT /admissions/:id/transfer`.
  - Leitos: `GET /beds`, `PUT /beds/:id/status`.
  - Cirurgias: `POST /surgeries`, `GET /surgeries`, `PUT /surgeries/:id/status`.
  - UTI: `GET /icu/patients`.
  - Estatísticas: `GET /stats`.

- UPA (`/api/v1/upa`)
  - Proteções: `authenticate` + `requireEstablishment('upa')`.
  - Triagem Manchester: `POST /triage`, `PUT /triage/:id/re-evaluate`.
  - Fila: `GET /queue`.
  - Observação: `GET /observation`, `PUT /observation/:id`.

- Admin (`/api/v1/admin`)
  - Dashboard: `GET /dashboard`.
  - Usuários: `GET /users`, `GET /users/stats`, `GET /users/profiles`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `PUT /users/:id/status`, `PUT /users/:id/reset-password`.
  - Estabelecimentos: `GET /establishments`.
  - Profissionais: `GET/POST/PUT/DELETE /professionals`.
  - Financeiro: `GET /financial`, `POST /financial/budget`, `POST /financial/expense`, `GET /financial/contracts`, `POST /financial/contract`.
  - Relatórios: `GET /reports`, `POST /reports/export`.
  - Epidemiologia: `GET /epidemiology`, `POST /epidemiology`, `PUT /epidemiology/:id`, `GET /epidemiology/dashboard`.

- Reports (`/api/v1/reports`)
  - `GET /attendances`, `GET /patients`, `GET /financial`, `GET /epidemiology`, `GET /dashboard-metrics`, `GET /available`.

---

## Banco de Dados (Prisma) — Modelos e Relações

- Enums
  - `UserProfile`, `EstablishmentType`/`EstablishmentTypeEnum`, `Gender`, `MaritalStatus`, `BloodType`.
  - Fluxo clínico: `AttendanceType`, `AttendanceStatus`, `PriorityLevel`, `PrescriptionStatus`, `ExamStatus`.

- Modelos Principais (resumo)
  - `User` — dados pessoais, `profile`, `permissions[]`, timestamps.
  - `Establishment` — `type`, dados de contato, `isActive`.
  - `Patient` — demografia, contatos, vínculo com `Attendance`, `Triage`, `VitalSigns`.
  - `Attendance` — `patientId`, `professionalId`, `chiefComplaint`, `status`, notas SOAP, `establishmentId`.
  - `Triage`/`TriageRecord` — sinais/sintomas, prioridade Manchester, status (waiting/in_progress/completed/transferred), fila ordenada.
  - `VitalSigns` — registros por paciente (PA, FC, FR, SpO2, T°, etc.), alertas.
  - `Prescription` — itens e status (active/completed/canceled), vínculo com farmácia.
  - `ExamRequest` — tipo, status (pending/started/completed/canceled), resultados (críticos/non-críticos).
  - `MedicationSchedule`/`MedicationAdministration` — agendas e administrações (administered/missed/refused).
  - `Bed`, `Admission`, `Procedure`, `Surgery` — hospital (leitos/internações/procedimentos/cirurgias).
  - `Session` — controle de sessão/expiração.
  - `AuditLog` — auditoria de ações sensíveis (user, recurso, ação, detalhes, IP/UA).
  - `Budget`, `Expense`, `Contract` — financeiro/gestão.
  - `DiseaseNotification` — epidemiologia e notificações.

- Notas
  - `@@map` aplicado em algumas tabelas para compatibilidade legada.
  - Índices e views podem existir para dashboards (ex.: enfermagem) e estatísticas.

---

## Fluxos Críticos

- Login/Refresh
  - Frontend envia `POST /auth/login`; recebe `user + tokens`; salva em `localStorage`.
  - Requisições passam pelo interceptor que injeta `Bearer`.
  - Em `401`, tenta `POST /auth/refresh`; sucesso → atualiza tokens; falha → `logout` e redirect `\login`.

- Triagem/Atendimento
  - Triagem cria/atualiza prioridade; fila (`GET /triage/queue`) ordena por `finalPriority` e `createdAt`.
  - Atendimento consome triagem; atualiza SOAP e status; conclui conforme fluxo.

- Prescrição/Medicação
  - Prescrição cria itens e agenda; administração registra eventos (aplicada, faltou, recusou) com auditoria.

- Exames
  - Solicitação → agendamento → execução → conclusão/cancelamento; críticos sinalizados nas listagens.

---

## Padrões de Resposta e Erros

- Sucesso: `{ success: true, data, message? }`.
- Erro: `{ success: false, error: { message, code?, statusCode? } }`.
- Buscas: `meta: { page, limit, total, totalPages }`.

---

## Segurança e Observabilidade

- Rate limiting global e em auth (previne brute-force).
- Auditoria de ações sensíveis (`AuditLog`).
- Logging (`morgan`), compressão (`compression`), parse seguro (`express.json` com limite).

---

## Estado Atual (Frontend) — Resumo

- Pacientes: [x] Lista, [x] Formulário, [x] Histórico, [ ] Integração CRUD completa
- Atendimentos: [x] Ativos, [x] Novo, [x] Detalhe, [ ] Fluxo SOAP e anexos
- Triagem: [x] Formulário, [x] Fila, [x] Estatísticas, [ ] Regras Manchester avançadas
- Exames: [x] Solicitação, [x] Resultados, [x] Detalhe, [ ] Integração laboratório
- Prescrições: [x] Lista, [x] Builder, [ ] Validações clínicas
- Medicações: [x] Agendas, [x] Administração, [ ] Auditoria detalhada
- Sinais Vitais: [x] CRUD, [x] Tendências, [ ] Alertas críticos
- Relatórios: [x] Métricas base, [ ] Filtros/exportações

---

## Roadmap Técnico

- Unificar tipos de auth/RBAC (front/back) e vocabulário de permissões.
- Completar CRUDs e validações (pacientes, prescrições, sinais vitais).
- Triagem Manchester com regras e reavaliação; fila em tempo real.
- Exames: integração externa/HL7; laudos e cadeia de custódia.
- Medicações: reconciliação e auditoria rígida (dupla checagem).
- Relatórios: filtros avançados, exportações e agendamentos.
- PWA: estratégias de cache por página, offline resiliente em módulos clínicos.

---

## Referências Rápidas

- Frontend
  - `src/App.tsx` — rotas públicas/dev/protegidas.
  - `src/pages/dev/DevRoutesPage.tsx` — índice dev.
  - `src/pages/dev/DevDocsPage.tsx` — exibe este `.md`.
  - `src/components/ProtectedRoute.tsx` — proteção de rotas.
  - `src/contexts/AuthContext.tsx` — estado e utilitários de auth.
  - `src/services/api.service.ts` — Axios com interceptores.
  - `src/services/*Service.ts` — clientes por módulo.
  - `public/manifest.json` — PWA.

- Backend
  - `src/server.ts` — bootstrap e montagem de rotas.
  - `src/routes/*.ts` — módulos: `auth`, `patients`, `attendances`, `triage`, `exams`, `prescriptions`, `medications`, `vital-signs`, `nursing`, `hospital`, `upa`, `admin`, `reports`.
  - `src/middlewares/auth.ts` — auth/RBAC.
  - `src/config/permissions.ts` — mapas de permissões.
  - `src/services/*Service.ts` — regras de negócio.
  - `prisma/schema.prisma` — modelos/enums.

