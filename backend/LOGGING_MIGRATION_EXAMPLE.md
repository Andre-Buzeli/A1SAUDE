# Exemplo de Migração para o Novo Sistema de Logging

Este documento mostra como migrar código existente para usar o novo sistema de logging estruturado.

## Antes e Depois

### Exemplo 1: Service Simples

#### ❌ Antes (usando console.log)

```typescript
export class PatientService {
  async createPatient(data: CreatePatientDto) {
    console.log('Creating patient:', data);
    
    try {
      const patient = await this.prisma.patient.create({ data });
      console.log('Patient created:', patient.id);
      return patient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }
}
```

#### ✅ Depois (usando LoggerService)

```typescript
import { log } from '@/utils/getLogger';

export class PatientService {
  async createPatient(data: CreatePatientDto, context?: LogContext) {
    log.info('Creating patient', {
      ...context,
      patientName: data.name,
      cpf: data.cpf
    });
    
    try {
      const patient = await this.prisma.patient.create({ data });
      
      log.audit('PATIENT_CREATED', context?.userId || 'system', {
        patientId: patient.id,
        patientName: patient.name
      }, context);
      
      return patient;
    } catch (error) {
      log.error('Failed to create patient', error, {
        ...context,
        patientData: data
      });
      throw error;
    }
  }
}
```

### Exemplo 2: Controller com Requisição

#### ❌ Antes

```typescript
export async function loginController(req: Request, res: Response) {
  console.log('Login attempt:', req.body.email);
  
  try {
    const result = await authService.login(req.body);
    console.log('Login successful:', result.user.id);
    res.json(result);
  } catch (error) {
    console.error('Login failed:', error);
    res.status(401).json({ error: 'Login failed' });
  }
}
```

#### ✅ Depois

```typescript
import { log } from '@/utils/getLogger';

export async function loginController(req: Request, res: Response) {
  const startTime = Date.now();
  
  log.info('Login attempt', {
    ...req.logContext,
    email: req.body.email
  });
  
  try {
    const result = await authService.login(req.body, req.ip);
    
    const duration = Date.now() - startTime;
    log.performance('LOGIN', duration, {
      userId: result.user.id
    }, req.logContext);
    
    log.audit('USER_LOGIN', result.user.id, {
      loginMethod: 'password'
    }, req.logContext);
    
    res.json(result);
  } catch (error) {
    log.security('LOGIN_FAILED', {
      email: req.body.email,
      reason: error instanceof Error ? error.message : 'Unknown'
    }, req.logContext);
    
    res.status(401).json({ error: 'Login failed' });
  }
}
```

### Exemplo 3: Middleware

#### ❌ Antes

```typescript
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('User authenticated:', decoded.userId);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

#### ✅ Depois

```typescript
import { log } from '@/utils/getLogger';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    log.warn('Authentication failed: No token provided', req.logContext);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    // Adicionar userId ao contexto de log
    if (req.logContext) {
      req.logContext.userId = decoded.userId;
    }
    
    log.debug('User authenticated', {
      ...req.logContext,
      userId: decoded.userId
    });
    
    next();
  } catch (error) {
    log.security('TOKEN_VERIFICATION_FAILED', {
      error: error instanceof Error ? error.message : 'Unknown'
    }, req.logContext);
    
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Exemplo 4: Operações de Banco de Dados

#### ❌ Antes

```typescript
export class UserRepository {
  async findById(id: string) {
    console.log('Finding user:', id);
    const user = await this.prisma.user.findUnique({ where: { id } });
    console.log('User found:', !!user);
    return user;
  }
}
```

#### ✅ Depois

```typescript
import { log } from '@/utils/getLogger';

export class UserRepository {
  async findById(id: string, context?: LogContext) {
    const startTime = Date.now();
    
    log.debug('Finding user by ID', {
      ...context,
      userId: id
    });
    
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      
      const duration = Date.now() - startTime;
      if (duration > 100) {
        log.performance('USER_FIND_BY_ID', duration, {
          userId: id,
          found: !!user
        }, context);
      }
      
      return user;
    } catch (error) {
      log.error('Failed to find user', error, {
        ...context,
        userId: id
      });
      throw error;
    }
  }
}
```

## Padrões de Migração

### 1. Substituir console.log por log.info/debug

```typescript
// Antes
console.log('Processing request');

// Depois
log.info('Processing request', req.logContext);
```

### 2. Substituir console.error por log.error

```typescript
// Antes
console.error('Error:', error);

// Depois
log.error('Operation failed', error, req.logContext);
```

### 3. Adicionar Contexto de Requisição

```typescript
// Em controllers, sempre passar req.logContext
log.info('Processing request', req.logContext);

// Em services, aceitar context como parâmetro opcional
async myMethod(data: any, context?: LogContext) {
  log.info('Processing', context);
}
```

### 4. Adicionar Logs de Auditoria

```typescript
// Para operações importantes
log.audit('USER_CREATED', adminUser.id, {
  targetUserId: newUser.id,
  role: newUser.role
}, req.logContext);
```

### 5. Adicionar Logs de Segurança

```typescript
// Para eventos de segurança
log.security('FAILED_LOGIN_ATTEMPT', {
  email: email,
  attempts: failedAttempts
}, req.logContext);
```

### 6. Adicionar Métricas de Performance

```typescript
const startTime = Date.now();
// ... operação
const duration = Date.now() - startTime;

if (duration > 1000) {
  log.performance('SLOW_OPERATION', duration, {
    operation: 'databaseQuery'
  }, req.logContext);
}
```

## Checklist de Migração

- [ ] Substituir todos os `console.log` por `log.info` ou `log.debug`
- [ ] Substituir todos os `console.error` por `log.error`
- [ ] Substituir todos os `console.warn` por `log.warn`
- [ ] Adicionar contexto de requisição (`req.logContext`) em controllers
- [ ] Adicionar parâmetro `context?: LogContext` em services
- [ ] Adicionar logs de auditoria para operações críticas
- [ ] Adicionar logs de segurança para eventos de autenticação/autorização
- [ ] Adicionar métricas de performance para operações lentas
- [ ] Remover logs de dados sensíveis (senhas, tokens, etc)
- [ ] Testar logs em desenvolvimento e produção

## Prioridade de Migração

### Alta Prioridade
1. Controllers de autenticação
2. Middlewares de segurança
3. Services de operações críticas (pagamentos, dados médicos)
4. Error handlers

### Média Prioridade
1. Controllers CRUD
2. Services de negócio
3. Repositories
4. Utilities

### Baixa Prioridade
1. Scripts de setup
2. Testes
3. Código de desenvolvimento

## Testando a Migração

```typescript
// 1. Verificar se logs aparecem no console (desenvolvimento)
log.info('Test log', { test: true });

// 2. Verificar se logs aparecem nos arquivos
// tail -f logs/combined.log

// 3. Verificar sanitização de dados sensíveis
log.info('User data', {
  email: 'test@example.com',
  password: 'secret123' // Deve aparecer como [REDACTED]
});

// 4. Verificar contexto de requisição
// Fazer uma requisição e verificar se requestId, userId, ipAddress aparecem nos logs
```
