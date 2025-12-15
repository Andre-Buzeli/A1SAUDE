# Migration Guide - Error Handling System

Guia para migrar código existente para o novo sistema de erros customizados.

## Visão Geral

Este guia ajuda a migrar código que usa tratamento de erros manual para o novo sistema de erros customizados.

## Padrões de Migração

### 1. Substituir Respostas de Erro Diretas

#### ❌ Antes
```typescript
if (!patient) {
  return res.status(404).json({ 
    error: 'Patient not found' 
  });
}
```

#### ✅ Depois
```typescript
import { NotFoundError } from '../errors';

if (!patient) {
  throw new NotFoundError('Paciente');
}
```

---

### 2. Substituir Try-Catch com Respostas Manuais

#### ❌ Antes
```typescript
async getPatient(req: Request, res: Response) {
  try {
    const patient = await patientService.getPatient(req.params.id);
    res.json(patient);
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
}
```

#### ✅ Depois
```typescript
import { asyncHandler } from '../middlewares/errorHandler';

getPatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await patientService.getPatient(req.params.id);
  res.json(patient);
});
```

---

### 3. Substituir Validação Manual

#### ❌ Antes
```typescript
if (!data.email || !data.email.includes('@')) {
  return res.status(400).json({ 
    error: 'Invalid email' 
  });
}
```

#### ✅ Depois
```typescript
import { ValidationError } from '../errors';

if (!data.email || !data.email.includes('@')) {
  throw new ValidationError('Email inválido', [
    { field: 'email', message: 'Email deve ser válido' }
  ]);
}

// Ou melhor ainda, usar Zod:
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email inválido')
});

const validatedData = schema.parse(data); // Lança ValidationError automaticamente
```

---

### 4. Substituir Verificações de Autenticação

#### ❌ Antes
```typescript
if (!req.user) {
  return res.status(401).json({ 
    error: 'Unauthorized' 
  });
}
```

#### ✅ Depois
```typescript
import { UnauthorizedError } from '../errors';

if (!req.user) {
  throw new UnauthorizedError('Autenticação necessária');
}
```

---

### 5. Substituir Verificações de Permissão

#### ❌ Antes
```typescript
if (!req.user.permissions.includes('admin')) {
  return res.status(403).json({ 
    error: 'Forbidden' 
  });
}
```

#### ✅ Depois
```typescript
import { InsufficientPermissionsError } from '../errors';

if (!req.user.permissions.includes('admin')) {
  throw new InsufficientPermissionsError('admin');
}
```

---

### 6. Substituir Erros de Duplicação

#### ❌ Antes
```typescript
const existing = await prisma.patient.findUnique({ where: { cpf } });
if (existing) {
  return res.status(409).json({ 
    error: 'Patient already exists' 
  });
}
```

#### ✅ Depois
```typescript
import { DuplicateResourceError } from '../errors';

const existing = await prisma.patient.findUnique({ where: { cpf } });
if (existing) {
  throw new DuplicateResourceError('Paciente', 'cpf');
}
```

---

### 7. Substituir Erros de Estado

#### ❌ Antes
```typescript
if (attendance.status !== 'IN_PROGRESS') {
  return res.status(400).json({ 
    error: 'Attendance is not in progress' 
  });
}
```

#### ✅ Depois
```typescript
import { InvalidStateError } from '../errors';

if (attendance.status !== 'IN_PROGRESS') {
  throw new InvalidStateError(
    'Atendimento',
    attendance.status,
    'IN_PROGRESS'
  );
}
```

---

### 8. Substituir Erros de Serviços Externos

#### ❌ Antes
```typescript
try {
  const response = await axios.get(url);
  return response.data;
} catch (error) {
  return res.status(502).json({ 
    error: 'External service error' 
  });
}
```

#### ✅ Depois
```typescript
import { ExternalServiceError, GatewayTimeoutError } from '../errors';

try {
  const response = await axios.get(url, { timeout: 5000 });
  return response.data;
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    throw new GatewayTimeoutError('API Externa', 5000);
  }
  throw new ExternalServiceError('API Externa', { 
    originalError: error.message 
  });
}
```

---

### 9. Substituir Middleware de Erro

#### ❌ Antes
```typescript
// server.ts
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message
  });
});
```

#### ✅ Depois
```typescript
// server.ts
import { createErrorHandler, notFoundHandler } from './middlewares/errorHandler';

// 404 handler
app.use(notFoundHandler(logger));

// Error handler
app.use(createErrorHandler(logger));
```

---

## Checklist de Migração

### Controllers

- [ ] Substituir `res.status().json({ error })` por `throw new Error()`
- [ ] Adicionar `asyncHandler` em métodos assíncronos
- [ ] Remover try-catch que apenas retornam erro
- [ ] Usar `next(error)` em try-catch necessários

### Services

- [ ] Substituir retornos de erro por `throw new Error()`
- [ ] Usar erros específicos (NotFoundError, ValidationError, etc)
- [ ] Adicionar contexto útil nos erros
- [ ] Remover logs manuais de erro (middleware faz isso)

### Middlewares

- [ ] Substituir verificações de auth por erros
- [ ] Usar `UnauthorizedError` e `ForbiddenError`
- [ ] Remover respostas diretas de erro

### Validators

- [ ] Migrar para Zod schemas
- [ ] Remover validação manual com if/else
- [ ] Usar `schema.parse()` que lança erro automaticamente

### Routes

- [ ] Adicionar `asyncHandler` em rotas assíncronas
- [ ] Remover try-catch desnecessários
- [ ] Garantir que erros são passados para `next()`

## Exemplo Completo de Migração

### Antes (Código Antigo)

```typescript
// PatientController.ts
export class PatientController {
  async getPatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }
      
      const patient = await prisma.patient.findUnique({ where: { id } });
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      res.json(patient);
    } catch (error) {
      console.error('Error getting patient:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async createPatient(req: Request, res: Response) {
    try {
      const { name, cpf, email } = req.body;
      
      if (!name || !cpf) {
        return res.status(400).json({ 
          error: 'Name and CPF are required' 
        });
      }
      
      if (email && !email.includes('@')) {
        return res.status(400).json({ 
          error: 'Invalid email' 
        });
      }
      
      const existing = await prisma.patient.findUnique({ 
        where: { cpf } 
      });
      
      if (existing) {
        return res.status(409).json({ 
          error: 'Patient already exists' 
        });
      }
      
      const patient = await prisma.patient.create({
        data: { name, cpf, email }
      });
      
      res.status(201).json(patient);
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

### Depois (Código Novo)

```typescript
// PatientController.ts
import { asyncHandler } from '../middlewares/errorHandler';
import { PatientService } from '../services/PatientService';
import { createPatientSchema } from '../validators/patient.validators';

export class PatientController {
  constructor(private patientService: PatientService) {}
  
  getPatient = asyncHandler(async (req: Request, res: Response) => {
    const patient = await this.patientService.getPatient(req.params.id);
    res.json(patient);
  });
  
  createPatient = asyncHandler(async (req: Request, res: Response) => {
    // Validação Zod - lança ValidationError automaticamente
    const validatedData = createPatientSchema.parse(req.body);
    
    const patient = await this.patientService.createPatient(validatedData);
    res.status(201).json(patient);
  });
}

// PatientService.ts
import { NotFoundError, DuplicateResourceError } from '../errors';

export class PatientService {
  async getPatient(id: string) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    
    if (!patient) {
      throw new NotFoundError('Paciente', { id });
    }
    
    return patient;
  }
  
  async createPatient(data: CreatePatientDTO) {
    const existing = await prisma.patient.findUnique({ 
      where: { cpf: data.cpf } 
    });
    
    if (existing) {
      throw new DuplicateResourceError('Paciente', 'cpf');
    }
    
    return prisma.patient.create({ data });
  }
}

// validators/patient.validators.ts
import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().length(11, 'CPF deve ter 11 dígitos'),
  email: z.string().email('Email inválido').optional()
});
```

## Benefícios da Migração

✅ **Código mais limpo**: Menos boilerplate, mais legível

✅ **Consistência**: Todas as respostas de erro seguem o mesmo formato

✅ **Logging automático**: Erros são logados com contexto completo

✅ **Type safety**: Erros tipados com TypeScript

✅ **Manutenibilidade**: Mais fácil de manter e testar

✅ **Debugging**: Stack traces e contexto detalhado

## Dicas

1. **Migre gradualmente**: Comece por um controller/service por vez
2. **Teste após cada migração**: Garanta que tudo funciona
3. **Use asyncHandler**: Simplifica muito o código
4. **Prefira Zod**: Para validação consistente
5. **Adicione contexto**: Use o parâmetro `details` dos erros
6. **Documente**: Atualize comentários e documentação

## Suporte

Para dúvidas ou problemas na migração:
- Consulte [README.md](./README.md) para documentação completa
- Veja [EXAMPLES.md](./EXAMPLES.md) para mais exemplos
- Revise o [Design Document](../../.kiro/specs/sistema-melhorias-gerais/design.md)
