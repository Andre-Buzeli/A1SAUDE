# Error Handling System

Sistema de tratamento de erros customizado para o A1 Saúde.

## Visão Geral

Este sistema fornece uma hierarquia de erros consistente e bem estruturada para toda a aplicação, com:

- ✅ Classes de erro tipadas e específicas
- ✅ Logging automático com contexto
- ✅ Formato de resposta padronizado
- ✅ Stack traces sanitizados em produção
- ✅ Integração com Zod e Prisma

## Hierarquia de Erros

```
AppError (base)
├── ValidationError (400)
├── UnauthorizedError (401)
│   ├── InvalidCredentialsError
│   ├── TokenExpiredError
│   └── InvalidTokenError
├── ForbiddenError (403)
│   └── InsufficientPermissionsError
├── NotFoundError (404)
├── ConflictError (409)
│   └── DuplicateResourceError
├── GoneError (410)
├── UnprocessableEntityError (422)
│   ├── BusinessError
│   ├── InvalidStateError
│   └── DependencyError
├── AccountLockedError (423)
├── TooManyRequestsError (429)
│   └── QuotaExceededError
├── InternalServerError (500)
│   ├── DatabaseError
│   └── ConfigurationError
├── ExternalServiceError (502)
├── ServiceUnavailableError (503)
└── GatewayTimeoutError (504)
```

## Uso Básico

### 1. Importar Erros

```typescript
import { 
  NotFoundError, 
  ValidationError, 
  UnauthorizedError 
} from '../errors';
```

### 2. Lançar Erros em Services

```typescript
class PatientService {
  async getPatient(id: string) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    
    if (!patient) {
      throw new NotFoundError('Paciente');
    }
    
    return patient;
  }
  
  async createPatient(data: CreatePatientDTO) {
    // Validação de negócio
    if (data.age < 0) {
      throw new ValidationError('Idade inválida', [
        { field: 'age', message: 'Idade não pode ser negativa' }
      ]);
    }
    
    return prisma.patient.create({ data });
  }
}
```

### 3. Usar em Controllers

```typescript
import { asyncHandler } from '../middlewares/errorHandler';

class PatientController {
  // Opção 1: Try-catch manual
  getPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patient = await patientService.getPatient(req.params.id);
      res.json(patient);
    } catch (error) {
      next(error); // Passa para o error handler
    }
  };
  
  // Opção 2: Usar asyncHandler (recomendado)
  createPatient = asyncHandler(async (req, res) => {
    const patient = await patientService.createPatient(req.body);
    res.status(201).json(patient);
  });
}
```

## Tipos de Erro

### ValidationError

Para erros de validação de dados:

```typescript
throw new ValidationError('Dados inválidos', [
  { field: 'email', message: 'Email inválido' },
  { field: 'cpf', message: 'CPF já cadastrado' }
]);

// Ou criar a partir de erro Zod
try {
  schema.parse(data);
} catch (error) {
  throw ValidationError.fromZodError(error);
}
```

### NotFoundError

Para recursos não encontrados:

```typescript
throw new NotFoundError('Paciente');
// Resposta: "Paciente não encontrado"

throw new NotFoundError('Atendimento', { id: '123' });
// Com detalhes adicionais
```

### UnauthorizedError

Para falhas de autenticação:

```typescript
throw new UnauthorizedError('Token inválido');
throw new InvalidCredentialsError();
throw new TokenExpiredError();
```

### ForbiddenError

Para falta de permissões:

```typescript
throw new ForbiddenError('Acesso negado a este recurso');
throw new InsufficientPermissionsError('admin:users:delete');
```

### ConflictError

Para conflitos de estado:

```typescript
throw new ConflictError('Paciente já possui atendimento ativo');
throw new DuplicateResourceError('Paciente', 'cpf');
```

### BusinessError

Para violações de regras de negócio:

```typescript
throw new BusinessError('Não é possível cancelar atendimento finalizado');
throw new InvalidStateError('Atendimento', 'FINALIZADO', 'EM_ANDAMENTO');
```

### ServiceError

Para erros de serviços:

```typescript
throw new DatabaseError('Falha ao conectar com banco');
throw new ServiceUnavailableError('Redis');
throw new ExternalServiceError('API de CEP');
```

## Formato de Resposta

Todas as respostas de erro seguem o formato:

```json
{
  "error": {
    "message": "Paciente não encontrado",
    "code": "NOT_FOUND",
    "statusCode": 404,
    "timestamp": "2024-12-06T10:30:00.000Z",
    "requestId": "req_abc123",
    "details": {
      "id": "123"
    }
  }
}
```

Em desenvolvimento, também inclui stack trace:

```json
{
  "error": {
    "message": "...",
    "code": "...",
    "stack": [
      "Error: Paciente não encontrado",
      "    at PatientService.getPatient (/app/services/PatientService.ts:45:13)",
      "    ..."
    ]
  }
}
```

## Logging Automático

Todos os erros são automaticamente logados com contexto:

```typescript
// Erros 5xx (servidor) - logados como ERROR
logger.error('Erro no banco de dados', error, {
  requestId: 'req_123',
  userId: 'user_456',
  method: 'POST',
  path: '/api/patients',
  statusCode: 500
});

// Erros 4xx (cliente) - logados como WARN
logger.warn('Validação falhou', {
  requestId: 'req_123',
  method: 'POST',
  path: '/api/patients',
  statusCode: 400
});
```

## Tratamento de Erros Prisma

Erros do Prisma são automaticamente convertidos:

```typescript
// P2002 - Unique constraint
// Converte para: ValidationError com campo duplicado

// P2025 - Record not found
// Converte para: NotFoundError

// P2003 - Foreign key constraint
// Converte para: ValidationError com referência inválida
```

## Tratamento de Erros Zod

Erros do Zod são automaticamente convertidos:

```typescript
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0)
});

try {
  schema.parse(data);
} catch (error) {
  // Automaticamente convertido para ValidationError
  // com lista de campos e mensagens
}
```

## Boas Práticas

### ✅ DO

```typescript
// Usar erros específicos
throw new NotFoundError('Paciente');

// Incluir contexto útil
throw new ValidationError('CPF inválido', [
  { field: 'cpf', message: 'Formato inválido', value: data.cpf }
]);

// Usar asyncHandler em rotas
router.get('/patients/:id', asyncHandler(async (req, res) => {
  // ...
}));

// Passar erros para next() em try-catch
try {
  // ...
} catch (error) {
  next(error);
}
```

### ❌ DON'T

```typescript
// Não usar Error genérico
throw new Error('Paciente não encontrado');

// Não retornar erro diretamente
res.status(404).json({ error: 'Not found' });

// Não engolir erros
try {
  // ...
} catch (error) {
  console.log(error); // ❌
  return null; // ❌
}

// Não usar status codes inconsistentes
throw new AppError('Not found', 400); // ❌ Deveria ser 404
```

## Migração de Código Existente

### Antes

```typescript
if (!patient) {
  return res.status(404).json({ 
    error: 'Patient not found' 
  });
}
```

### Depois

```typescript
if (!patient) {
  throw new NotFoundError('Paciente');
}
```

### Antes

```typescript
try {
  // ...
} catch (error) {
  res.status(500).json({ 
    error: error.message 
  });
}
```

### Depois

```typescript
// Opção 1: Deixar o middleware tratar
const handler = asyncHandler(async (req, res) => {
  // Erros são automaticamente capturados
});

// Opção 2: Try-catch com next
try {
  // ...
} catch (error) {
  next(error); // Middleware trata
}
```

## Testes

```typescript
import { NotFoundError, ValidationError } from '../errors';

describe('PatientService', () => {
  it('should throw NotFoundError when patient does not exist', async () => {
    await expect(
      patientService.getPatient('invalid-id')
    ).rejects.toThrow(NotFoundError);
  });
  
  it('should throw ValidationError with correct fields', async () => {
    try {
      await patientService.createPatient({ age: -1 });
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.errors).toContainEqual({
        field: 'age',
        message: expect.any(String)
      });
    }
  });
});
```

## Referências

- [Design Document](../../.kiro/specs/sistema-melhorias-gerais/design.md)
- [Requirements](../../.kiro/specs/sistema-melhorias-gerais/requirements.md)
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
