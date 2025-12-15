# Sistema de Logging Estruturado - Guia de Uso

## Visão Geral

O sistema de logging estruturado do A1 Saúde utiliza Winston para fornecer logs robustos, estruturados e seguros.

## Características

- ✅ **Múltiplos Transports**: Console (desenvolvimento) e arquivos (error.log, combined.log)
- ✅ **Níveis de Log**: error, warn, info, debug
- ✅ **Sanitização Automática**: Remove dados sensíveis (senhas, tokens, etc)
- ✅ **Contexto de Requisição**: requestId, userId, ipAddress em todos os logs
- ✅ **Rotação de Arquivos**: Máximo 10MB por arquivo, mantém últimos 5-10 arquivos
- ✅ **Formatação JSON**: Logs estruturados para fácil parsing

## Como Usar

### 1. Importar o Logger

```typescript
import { log } from '@/utils/getLogger';
// ou
import { getLogger } from '@/utils/getLogger';
const logger = getLogger();
```

### 2. Níveis de Log

#### Debug
Para informações detalhadas de debugging:

```typescript
log.debug('Processando requisição', {
  requestId: req.requestId,
  userId: req.user?.id,
  data: someData
});
```

#### Info
Para informações gerais:

```typescript
log.info('Usuário autenticado com sucesso', {
  userId: user.id,
  ipAddress: req.ip
});
```

#### Warn
Para situações que requerem atenção:

```typescript
log.warn('Taxa de requisições alta detectada', {
  ipAddress: req.ip,
  requestCount: count
});
```

#### Error
Para erros e exceções:

```typescript
try {
  // código
} catch (error) {
  log.error('Falha ao processar pagamento', error, {
    userId: user.id,
    orderId: order.id
  });
}
```

### 3. Logs Especializados

#### Auditoria
Para registrar ações importantes:

```typescript
log.audit('USER_CREATED', adminUser.id, {
  targetUserId: newUser.id,
  role: newUser.role
}, {
  ipAddress: req.ip,
  requestId: req.requestId
});
```

#### Segurança
Para eventos de segurança:

```typescript
log.security('FAILED_LOGIN_ATTEMPT', {
  email: email,
  attempts: failedAttempts
}, {
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
});
```

#### Performance
Para métricas de performance:

```typescript
const startTime = Date.now();
// ... operação
const duration = Date.now() - startTime;

log.performance('DATABASE_QUERY', duration, {
  query: 'findManyPatients',
  resultCount: results.length
}, {
  requestId: req.requestId
});
```

## Contexto de Requisição

O middleware `requestLogger` adiciona automaticamente contexto a todas as requisições:

```typescript
interface LogContext {
  requestId?: string;      // UUID único da requisição
  userId?: string;         // ID do usuário autenticado
  ipAddress?: string;      // IP do cliente
  userAgent?: string;      // User agent do cliente
  method?: string;         // Método HTTP
  path?: string;          // Path da requisição
  statusCode?: number;    // Status code da resposta
  duration?: number;      // Duração em ms
}
```

### Acessando o Contexto

```typescript
// Em um controller ou middleware
export async function myController(req: Request, res: Response) {
  log.info('Processando requisição', req.logContext);
  
  // Adicionar informações extras
  log.info('Operação concluída', {
    ...req.logContext,
    resultCount: results.length
  });
}
```

## Sanitização de Dados Sensíveis

Os seguintes campos são automaticamente sanitizados (substituídos por `[REDACTED]`):

- password
- passwordHash
- token
- accessToken
- refreshToken
- secret
- apiKey
- authorization
- cookie
- sessionId
- creditCard
- cvv
- ssn
- cpf

### Exemplo

```typescript
// Input
log.info('Login attempt', {
  email: 'user@example.com',
  password: 'secret123',
  ipAddress: '192.168.1.1'
});

// Output no log
{
  "timestamp": "2024-12-06 10:30:45",
  "level": "info",
  "message": "Login attempt",
  "metadata": {
    "email": "user@example.com",
    "password": "[REDACTED]",
    "ipAddress": "192.168.1.1"
  }
}
```

## Arquivos de Log

### Localização
- `logs/error.log` - Apenas erros (level: error)
- `logs/combined.log` - Todos os logs (levels: error, warn, info, debug)

### Rotação
- Tamanho máximo: 10MB por arquivo
- Arquivos mantidos: 5 (error.log) e 10 (combined.log)
- Arquivos antigos são automaticamente rotacionados

### Formato

```json
{
  "timestamp": "2024-12-06 10:30:45",
  "level": "info",
  "message": "User authenticated successfully",
  "metadata": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user123",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

## Configuração

### Variáveis de Ambiente

```env
# Nível de log (error, warn, info, debug)
LOG_LEVEL=info

# Caminho do arquivo de log
LOG_FILE_PATH=./logs/app.log
```

### Níveis de Log por Ambiente

- **Development**: `debug` - Todos os logs, incluindo detalhes de debugging
- **Production**: `info` - Logs informativos e acima (info, warn, error)
- **Test**: `error` - Apenas erros

## Boas Práticas

### ✅ Fazer

```typescript
// Usar contexto estruturado
log.info('Payment processed', {
  orderId: order.id,
  amount: order.amount,
  userId: user.id
});

// Incluir contexto de requisição
log.error('Database query failed', error, req.logContext);

// Usar níveis apropriados
log.debug('Cache hit', { key: cacheKey }); // Detalhes técnicos
log.info('User logged in', { userId }); // Eventos importantes
log.warn('High memory usage', { usage }); // Situações de atenção
log.error('Payment failed', error); // Erros
```

### ❌ Evitar

```typescript
// Não usar console.log diretamente
console.log('User logged in'); // ❌

// Não logar dados sensíveis manualmente
log.info('User data', { password: user.password }); // ❌ (mas será sanitizado)

// Não usar strings não estruturadas
log.info(`User ${userId} logged in at ${timestamp}`); // ❌

// Preferir:
log.info('User logged in', { userId, timestamp }); // ✅
```

## Exemplos Práticos

### Controller com Logging

```typescript
import { Request, Response } from 'express';
import { log } from '@/utils/getLogger';

export async function createPatient(req: Request, res: Response) {
  const startTime = Date.now();
  
  try {
    log.info('Creating patient', {
      ...req.logContext,
      patientData: req.body
    });
    
    const patient = await patientService.create(req.body);
    
    const duration = Date.now() - startTime;
    log.performance('CREATE_PATIENT', duration, {
      patientId: patient.id
    }, req.logContext);
    
    log.audit('PATIENT_CREATED', req.user!.id, {
      patientId: patient.id,
      patientName: patient.name
    }, req.logContext);
    
    res.status(201).json(patient);
  } catch (error) {
    log.error('Failed to create patient', error, req.logContext);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Service com Logging

```typescript
import { log } from '@/utils/getLogger';

export class AuthService {
  async login(email: string, password: string, ipAddress: string) {
    try {
      const user = await this.findUserByEmail(email);
      
      if (!user) {
        log.security('LOGIN_FAILED_USER_NOT_FOUND', {
          email,
          ipAddress
        });
        throw new Error('Invalid credentials');
      }
      
      const isValid = await this.verifyPassword(password, user.passwordHash);
      
      if (!isValid) {
        log.security('LOGIN_FAILED_INVALID_PASSWORD', {
          userId: user.id,
          ipAddress
        });
        throw new Error('Invalid credentials');
      }
      
      log.audit('USER_LOGIN', user.id, {
        loginMethod: 'password'
      }, { ipAddress });
      
      return this.generateTokens(user);
    } catch (error) {
      log.error('Login error', error, { email, ipAddress });
      throw error;
    }
  }
}
```

## Monitoramento

### Buscar Erros

```bash
# Últimos 50 erros
tail -n 50 logs/error.log

# Erros de um usuário específico
grep "userId123" logs/error.log

# Erros nas últimas 24h
grep "$(date -d '24 hours ago' '+%Y-%m-%d')" logs/error.log
```

### Análise de Performance

```bash
# Operações lentas (> 1000ms)
grep "PERFORMANCE" logs/combined.log | grep -E "took [0-9]{4,}ms"

# Requisições por endpoint
grep "Incoming request" logs/combined.log | cut -d' ' -f5-6 | sort | uniq -c
```

## Troubleshooting

### Logs não aparecem

1. Verificar se LoggerService foi inicializado
2. Verificar nível de log em `.env`
3. Verificar permissões da pasta `logs/`

### Arquivos de log muito grandes

1. Verificar configuração de rotação
2. Reduzir nível de log em produção
3. Implementar limpeza automática de logs antigos

### Performance degradada

1. Reduzir nível de log (usar `info` ou `warn` em produção)
2. Desabilitar console transport em produção
3. Usar logging assíncrono para operações críticas
