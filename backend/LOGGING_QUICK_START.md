# Sistema de Logging - Quick Start

## 🚀 Início Rápido

### 1. O Logger Já Está Configurado!

O sistema de logging já está integrado ao servidor e será inicializado automaticamente quando você iniciar a aplicação.

### 2. Como Usar em Qualquer Arquivo

```typescript
import { log } from '@/utils/getLogger';

// Logs básicos
log.info('Operação realizada com sucesso');
log.error('Erro ao processar', error);
log.warn('Atenção: recurso limitado');
log.debug('Detalhes técnicos para debugging');
```

### 3. Adicionar Contexto

```typescript
// Em um controller
export async function myController(req: Request, res: Response) {
  // O contexto da requisição já está disponível em req.logContext
  log.info('Processando requisição', req.logContext);
  
  // Adicionar informações extras
  log.info('Operação concluída', {
    ...req.logContext,
    resultCount: results.length,
    processingTime: duration
  });
}
```

### 4. Logs Especializados

```typescript
// Auditoria (para ações importantes)
log.audit('USER_CREATED', adminUser.id, {
  targetUserId: newUser.id,
  role: newUser.role
}, req.logContext);

// Segurança (para eventos de segurança)
log.security('FAILED_LOGIN_ATTEMPT', {
  email: email,
  attempts: failedAttempts
}, req.logContext);

// Performance (para métricas)
const startTime = Date.now();
// ... operação
const duration = Date.now() - startTime;
log.performance('DATABASE_QUERY', duration, {
  query: 'findManyPatients'
}, req.logContext);
```

## 📁 Onde os Logs São Salvos?

- **Console**: Logs coloridos durante desenvolvimento
- **logs/error.log**: Apenas erros
- **logs/combined.log**: Todos os logs

## 🔍 Ver os Logs

```bash
# Ver logs em tempo real
tail -f logs/combined.log

# Ver apenas erros
tail -f logs/error.log

# Buscar por requestId específico
grep "550e8400-e29b-41d4-a716-446655440000" logs/combined.log
```

## 🛡️ Dados Sensíveis São Protegidos Automaticamente

Não se preocupe! Estes campos são automaticamente sanitizados:
- password, token, secret, apiKey
- cpf, creditCard, cvv
- E mais...

```typescript
// Você pode logar tranquilamente
log.info('User data', {
  email: 'user@example.com',
  password: 'secret123' // Aparecerá como [REDACTED] no log
});
```

## 📖 Documentação Completa

- **Guia Completo**: `backend/src/core/services/LOGGING_GUIDE.md`
- **Exemplos de Migração**: `backend/LOGGING_MIGRATION_EXAMPLE.md`
- **Resumo da Implementação**: `backend/LOGGING_IMPLEMENTATION_SUMMARY.md`

## 💡 Dica Rápida

Substitua todos os `console.log` por `log.info` ou `log.debug`:

```typescript
// ❌ Antes
console.log('User logged in:', userId);

// ✅ Depois
log.info('User logged in', { userId });
```

## 🎯 Pronto!

Você já pode começar a usar o sistema de logging em qualquer arquivo do projeto. Basta importar e usar!
