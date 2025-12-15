# SISTEMA ORIGINAL - A1 SAUDE

## Descrição
Sistema unificado de gestão de saúde com capacidades de sincronização offline e comunicação com sistemas central e local.

## Estrutura
```
SISTEMA ORIGINAL/
├── backend/          # Backend Node.js + Express + TypeScript
├── frontend/         # Frontend React + TypeScript + Vite
├── docker-compose.yml
├── start-sistema-original.bat
├── stop-sistema-original.bat
└── README.md
```

## Características
- ✅ Backend completo com sincronização offline
- ✅ Frontend React com interface moderna
- ✅ Sincronização automática com sistemas central/local
- ✅ Cache offline para operação sem conexão
- ✅ Comunicação segura entre sistemas
- ✅ Dashboard por tipo de unidade (Hospital, UBS, UPA)

## Como usar
1. Execute `start-sistema-original.bat` para iniciar
2. Acesse http://localhost:5002 para o frontend
3. Acesse http://localhost:5001 para o backend principal
3. Acesse http://localhost:6001 para o backend de sincronização
4. Execute `stop-sistema-original.bat` para parar

## Portas utilizadas
- Frontend: 5002
- Backend Principal: 5001
- Backend Sincronização: 6001
- Proxy Nginx: 5003
- PostgreSQL: 5433
- Redis: 6379

## Tecnologias
- React 18 + TypeScript + Vite
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Redis para cache
- Docker + Docker Compose