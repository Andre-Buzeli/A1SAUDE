# Error Handling Examples

Exemplos práticos de uso do sistema de erros customizados.

## Exemplo 1: Service com Validação

```typescript
// src/services/PatientService.ts
import { NotFoundError, ValidationError, DuplicateResourceError } from '../errors';
import { PrismaClient } from '@prisma/client';

export class PatientService {
  constructor(private prisma: PrismaClient) {}

  async getPatient(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id }
    });

    if (!patient) {
      throw new NotFoundError('Paciente', { id });
    }

    return patient;
  }

  async createPatient(data: CreatePatientDTO) {
    // Validação de negócio
    if (data.age < 0 || data.age > 150) {
      throw new ValidationError('Idade inválida', [
        { 
          field: 'age', 
          message: 'Idade deve estar entre 0 e 150 anos',
          value: data.age 
        }
      ]);
    }

    // Verificar duplicação de CPF
    const existing = await this.prisma.patient.findUnique({
      where: { cpf: data.cpf }
    });

    if (existing) {
      throw new DuplicateResourceError('Paciente', 'cpf', { cpf: data.cpf });
    }

    return this.prisma.patient.create({ data });
  }

  async updatePatient(id: string, data: UpdatePatientDTO) {
    // Verificar se existe
    await this.getPatient(id); // Lança NotFoundError se não existir

    return this.prisma.patient.update({
      where: { id },
      data
    });
  }

  async deletePatient(id: string) {
    // Verificar se tem atendimentos ativos
    const activeAttendances = await this.prisma.attendance.count({
      where: {
        patientId: id,
        status: 'IN_PROGRESS'
      }
    });

    if (activeAttendances > 0) {
      throw new DependencyError(
        'Não é possível excluir paciente com atendimentos ativos',
        ['attendances']
      );
    }

    await this.getPatient(id); // Verificar se existe

    return this.prisma.patient.delete({ where: { id } });
  }
}
```

## Exemplo 2: Controller com asyncHandler

```typescript
// src/controllers/PatientController.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { PatientService } from '../services/PatientService';

export class PatientController {
  constructor(private patientService: PatientService) {}

  // Método 1: Usando asyncHandler (recomendado)
  getPatient = asyncHandler(async (req: Request, res: Response) => {
    const patient = await this.patientService.getPatient(req.params.id);
    res.json(patient);
  });

  // Método 2: Try-catch manual
  createPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patient = await this.patientService.createPatient(req.body);
      res.status(201).json(patient);
    } catch (error) {
      next(error); // Passa para o error handler
    }
  };

  // Método 3: Usando asyncHandler com validação Zod
  updatePatient = asyncHandler(async (req: Request, res: Response) => {
    // Validação Zod - erros são automaticamente convertidos
    const validatedData = updatePatientSchema.parse(req.body);
    
    const patient = await this.patientService.updatePatient(
      req.params.id,
      validatedData
    );
    
    res.json(patient);
  });

  deletePatient = asyncHandler(async (req: Request, res: Response) => {
    await this.patientService.deletePatient(req.params.id);
    res.status(204).send();
  });
}
```

## Exemplo 3: Autenticação com Erros Customizados

```typescript
// src/services/AuthService.ts
import { 
  InvalidCredentialsError, 
  AccountLockedError,
  TokenExpiredError,
  InvalidTokenError 
} from '../errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  async login(email: string, password: string, ipAddress: string) {
    // Verificar rate limiting
    const attempts = await this.getFailedAttempts(email);
    if (attempts >= 5) {
      throw new AccountLockedError(
        'Conta bloqueada devido a múltiplas tentativas falhas',
        new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
      );
    }

    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      await this.recordFailedAttempt(email, ipAddress);
      throw new InvalidCredentialsError();
    }

    // Verificar senha
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      await this.recordFailedAttempt(email, ipAddress);
      throw new InvalidCredentialsError();
    }

    // Limpar tentativas falhas
    await this.clearFailedAttempts(email);

    // Gerar tokens
    return this.generateTokens(user);
  }

  async verifyToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError();
      }
      throw new InvalidTokenError();
    }
  }
}
```

## Exemplo 4: Middleware de Permissões

```typescript
// src/middlewares/permissions.ts
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, InsufficientPermissionsError } from '../errors';

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verificar se usuário está autenticado
    if (!req.user) {
      throw new UnauthorizedError('Autenticação necessária');
    }

    // Verificar permissão
    if (!req.user.permissions.includes(permission)) {
      throw new InsufficientPermissionsError(permission, {
        userId: req.user.id,
        requiredPermission: permission,
        userPermissions: req.user.permissions
      });
    }

    next();
  };
}

// Uso em rotas
router.delete(
  '/patients/:id',
  requirePermission('patients:delete'),
  asyncHandler(async (req, res) => {
    await patientService.deletePatient(req.params.id);
    res.status(204).send();
  })
);
```

## Exemplo 5: Tratamento de Erros Prisma

```typescript
// src/services/AttendanceService.ts
import { DatabaseError, ValidationError } from '../errors';

export class AttendanceService {
  async createAttendance(data: CreateAttendanceDTO) {
    try {
      return await this.prisma.attendance.create({ data });
    } catch (error) {
      // Prisma errors são automaticamente tratados pelo middleware
      // mas você pode adicionar lógica customizada se necessário
      if (error.code === 'P2002') {
        // Unique constraint - já tratado automaticamente
        throw error;
      }
      
      if (error.code === 'P2003') {
        // Foreign key - adicionar contexto
        throw new ValidationError('Paciente ou profissional inválido', [
          { field: 'patientId', message: 'Paciente não encontrado' }
        ]);
      }
      
      throw error;
    }
  }
}
```

## Exemplo 6: Validação com Zod

```typescript
// src/validators/patient.validators.ts
import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string()
    .length(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d+$/, 'CPF deve conter apenas números'),
  birthDate: z.string().datetime(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'Telefone inválido').optional()
});

// src/controllers/PatientController.ts
import { asyncHandler } from '../middlewares/errorHandler';

export class PatientController {
  createPatient = asyncHandler(async (req, res) => {
    // Zod parse lança erro que é automaticamente convertido para ValidationError
    const validatedData = createPatientSchema.parse(req.body);
    
    const patient = await this.patientService.createPatient(validatedData);
    res.status(201).json(patient);
  });
}
```

## Exemplo 7: Erros de Serviços Externos

```typescript
// src/services/CepService.ts
import { ExternalServiceError, GatewayTimeoutError } from '../errors';
import axios from 'axios';

export class CepService {
  async getCepInfo(cep: string) {
    try {
      const response = await axios.get(
        `https://viacep.com.br/ws/${cep}/json/`,
        { timeout: 5000 }
      );
      
      if (response.data.erro) {
        throw new ValidationError('CEP não encontrado', [
          { field: 'cep', message: 'CEP inválido ou não encontrado' }
        ]);
      }
      
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new GatewayTimeoutError('ViaCEP', 5000);
      }
      
      throw new ExternalServiceError('ViaCEP', {
        cep,
        originalError: error.message
      });
    }
  }
}
```

## Exemplo 8: Erros de Estado Inválido

```typescript
// src/services/AttendanceService.ts
import { InvalidStateError } from '../errors';

export class AttendanceService {
  async finishAttendance(id: string) {
    const attendance = await this.getAttendance(id);
    
    // Verificar estado
    if (attendance.status !== 'IN_PROGRESS') {
      throw new InvalidStateError(
        'Atendimento',
        attendance.status,
        'IN_PROGRESS'
      );
    }
    
    return this.prisma.attendance.update({
      where: { id },
      data: { 
        status: 'COMPLETED',
        endTime: new Date()
      }
    });
  }

  async cancelAttendance(id: string) {
    const attendance = await this.getAttendance(id);
    
    // Não pode cancelar atendimento finalizado
    if (attendance.status === 'COMPLETED') {
      throw new InvalidStateError(
        'Atendimento',
        'COMPLETED',
        'SCHEDULED ou IN_PROGRESS'
      );
    }
    
    return this.prisma.attendance.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
  }
}
```

## Exemplo 9: Quota e Rate Limiting

```typescript
// src/services/ReportService.ts
import { QuotaExceededError } from '../errors';

export class ReportService {
  async generateReport(userId: string, type: string) {
    // Verificar quota diária
    const reportsToday = await this.prisma.report.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    
    const dailyLimit = 10;
    if (reportsToday >= dailyLimit) {
      throw new QuotaExceededError('relatórios diários', dailyLimit, reportsToday);
    }
    
    // Gerar relatório
    return this.createReport(userId, type);
  }
}
```

## Exemplo 10: Testes com Erros Customizados

```typescript
// src/__tests__/services/PatientService.test.ts
import { PatientService } from '../../services/PatientService';
import { NotFoundError, ValidationError, DuplicateResourceError } from '../../errors';

describe('PatientService', () => {
  let patientService: PatientService;

  beforeEach(() => {
    patientService = new PatientService(prismaMock);
  });

  describe('getPatient', () => {
    it('should throw NotFoundError when patient does not exist', async () => {
      prismaMock.patient.findUnique.mockResolvedValue(null);

      await expect(
        patientService.getPatient('invalid-id')
      ).rejects.toThrow(NotFoundError);
    });

    it('should return patient when found', async () => {
      const mockPatient = { id: '1', name: 'João' };
      prismaMock.patient.findUnique.mockResolvedValue(mockPatient);

      const result = await patientService.getPatient('1');
      expect(result).toEqual(mockPatient);
    });
  });

  describe('createPatient', () => {
    it('should throw ValidationError for invalid age', async () => {
      const data = { name: 'João', age: -1, cpf: '12345678901' };

      await expect(
        patientService.createPatient(data)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw DuplicateResourceError for existing CPF', async () => {
      prismaMock.patient.findUnique.mockResolvedValue({ id: '1' });

      await expect(
        patientService.createPatient({ cpf: '12345678901' })
      ).rejects.toThrow(DuplicateResourceError);
    });
  });
});
```

## Respostas de Erro Esperadas

### NotFoundError (404)
```json
{
  "error": {
    "message": "Paciente não encontrado",
    "code": "NOT_FOUND",
    "statusCode": 404,
    "timestamp": "2024-12-06T10:30:00.000Z",
    "requestId": "req_abc123",
    "details": {
      "id": "invalid-id"
    }
  }
}
```

### ValidationError (400)
```json
{
  "error": {
    "message": "Dados inválidos",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "timestamp": "2024-12-06T10:30:00.000Z",
    "requestId": "req_abc123",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Email inválido"
        },
        {
          "field": "age",
          "message": "Idade deve estar entre 0 e 150 anos",
          "value": -1
        }
      ]
    }
  }
}
```

### UnauthorizedError (401)
```json
{
  "error": {
    "message": "Token expirado",
    "code": "TOKEN_EXPIRED",
    "statusCode": 401,
    "timestamp": "2024-12-06T10:30:00.000Z",
    "requestId": "req_abc123"
  }
}
```

### InsufficientPermissionsError (403)
```json
{
  "error": {
    "message": "Permissão necessária: patients:delete",
    "code": "INSUFFICIENT_PERMISSIONS",
    "statusCode": 403,
    "timestamp": "2024-12-06T10:30:00.000Z",
    "requestId": "req_abc123",
    "details": {
      "userId": "user_123",
      "requiredPermission": "patients:delete",
      "userPermissions": ["patients:read", "patients:create"]
    }
  }
}
```
