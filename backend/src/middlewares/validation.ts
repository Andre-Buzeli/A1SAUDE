import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

export const authSchemas = {
  login: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    establishmentId: z.string().optional()
  }),

  register: z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    profile: z.string().min(1, 'Perfil é obrigatório'),
    establishmentId: z.string().optional(),
    cpf: z.string().optional(),
    phone: z.string().optional(),
    specialization: z.string().optional()
  }),

  forgotPassword: z.object({
    email: z.string().email('Email inválido')
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres')
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres')
  }),

  updateProfile: z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().optional(),
    specialization: z.string().optional()
  }),

  twoFactor: z.object({
    email: z.string().email('Email inválido'),
    code: z.string().min(6, 'Código deve ter 6 dígitos').max(6, 'Código deve ter 6 dígitos')
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token é obrigatório')
  })
};

export const patientSchemas = {
  create: z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(11, 'CPF deve ter 11 dígitos'),
    birthDate: z.string().datetime(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    susCard: z.string().optional(),
    motherName: z.string().optional(),
    fatherName: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    medicalHistory: z.string().optional(),
    currentMedications: z.string().optional(),
    chronicConditions: z.array(z.string()).optional()
  }),

  update: z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
    cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(11, 'CPF deve ter 11 dígitos').optional(),
    birthDate: z.string().datetime().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    susCard: z.string().optional(),
    motherName: z.string().optional(),
    fatherName: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    medicalHistory: z.string().optional(),
    currentMedications: z.string().optional(),
    chronicConditions: z.array(z.string()).optional()
  })
};

export const attendanceSchemas = {
  create: z.object({
    patientId: z.string().min(1, 'ID do paciente é obrigatório'),
    establishmentId: z.string().min(1, 'ID do estabelecimento é obrigatório'),
    type: z.enum(['EMERGENCY', 'URGENT', 'SCHEDULED', 'WALK_IN']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    reason: z.string().min(1, 'Motivo do atendimento é obrigatório'),
    symptoms: z.string().optional(),
    notes: z.string().optional()
  }),

  update: z.object({
    type: z.enum(['EMERGENCY', 'URGENT', 'SCHEDULED', 'WALK_IN']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    reason: z.string().optional(),
    symptoms: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
  })
};

export const prescriptionSchemas = {
  create: z.object({
    patientId: z.string().min(1, 'ID do paciente é obrigatório'),
    attendanceId: z.string().min(1, 'ID do atendimento é obrigatório'),
    medications: z.array(z.object({
      name: z.string().min(1, 'Nome do medicamento é obrigatório'),
      dosage: z.string().min(1, 'Dosagem é obrigatória'),
      frequency: z.string().min(1, 'Frequência é obrigatória'),
      duration: z.string().min(1, 'Duração é obrigatória'),
      instructions: z.string().optional(),
      route: z.string().optional()
    })).min(1, 'Pelo menos um medicamento é obrigatório'),
    notes: z.string().optional()
  }),

  update: z.object({
    medications: z.array(z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Nome do medicamento é obrigatório'),
      dosage: z.string().min(1, 'Dosagem é obrigatória'),
      frequency: z.string().min(1, 'Frequência é obrigatória'),
      duration: z.string().min(1, 'Duração é obrigatória'),
      instructions: z.string().optional(),
      route: z.string().optional()
    })).optional(),
    notes: z.string().optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional()
  })
};