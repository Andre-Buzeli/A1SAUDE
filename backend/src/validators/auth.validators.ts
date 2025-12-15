/**
 * Validadores de Autenticação
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../config/logger';

/**
 * Middleware para processar erros de validação
 */
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined
    }));

    logger.warn('Erro de validação:', { errors: errorMessages, path: req.path });

    res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      errors: errorMessages
    });
    return;
  }

  next();
};

/**
 * Validador para login
 */
export const validateLogin = [
  body('emailOrCpf')
    .notEmpty()
    .withMessage('Email ou CPF é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Email ou CPF deve ter entre 3 e 100 caracteres')
    .custom((value) => {
      // Verificar se é email ou CPF
      if (value.includes('@')) {
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Email inválido');
        }
      } else {
        // Validar CPF (apenas números)
        const cpfRegex = /^\d{11}$/;
        const cleanCpf = value.replace(/\D/g, '');
        if (!cpfRegex.test(cleanCpf)) {
          throw new Error('CPF deve conter 11 dígitos');
        }
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 1, max: 100 })
    .withMessage('Senha deve ter entre 1 e 100 caracteres'),

  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('RememberMe deve ser um valor booleano'),

  body('twoFactorCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('Código 2FA deve ter 6 dígitos')
    .isNumeric()
    .withMessage('Código 2FA deve conter apenas números'),

  handleValidationErrors
];

/**
 * Validador para refresh token
 */
export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token é obrigatório')
    .isLength({ min: 10 })
    .withMessage('Refresh token inválido'),

  handleValidationErrors
];

/**
 * Validador para alteração de senha
 */
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória')
    .isLength({ min: 1, max: 100 })
    .withMessage('Senha atual inválida'),

  body('newPassword')
    .isLength({ min: 8, max: 100 })
    .withMessage('Nova senha deve ter entre 8 e 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirmação de senha é obrigatória')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Confirmação de senha não confere');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validador para criação de usuário
 */
export const validateCreateUser = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),

  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email deve ter no máximo 100 caracteres'),

  body('cpf')
    .notEmpty()
    .withMessage('CPF é obrigatório')
    .custom((value) => {
      const cleanCpf = value.replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        throw new Error('CPF deve ter 11 dígitos');
      }
      
      // Validação básica de CPF
      if (/^(\d)\1{10}$/.test(cleanCpf)) {
        throw new Error('CPF inválido');
      }
      
      return true;
    }),

  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),

  body('password')
    .isLength({ min: 8, max: 100 })
    .withMessage('Senha deve ter entre 8 e 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),

  body('profileType')
    .notEmpty()
    .withMessage('Tipo de perfil é obrigatório')
    .isIn([
      'SUPER_ADMIN', 'ADMIN_MUNICIPAL', 'ADMIN_ESTADUAL', 'ADMIN_FEDERAL',
      'GESTOR_UBS', 'GESTOR_HOSPITAL', 'MEDICO', 'ENFERMEIRO',
      'TECNICO_ENFERMAGEM', 'FARMACEUTICO', 'NUTRICIONISTA',
      'PSICOLOGO', 'FISIOTERAPEUTA', 'ASSISTENTE_SOCIAL', 'AGENTE_COMUNITARIO'
    ])
    .withMessage('Tipo de perfil inválido'),

  body('establishmentId')
    .optional()
    .isUUID()
    .withMessage('ID do estabelecimento deve ser um UUID válido'),

  handleValidationErrors
];

/**
 * Validador para reset de senha
 */
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),

  handleValidationErrors
];

/**
 * Validador para reset de senha
 */
export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),

  body('newPassword')
    .isLength({ min: 8, max: 100 })
    .withMessage('Nova senha deve ter entre 8 e 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirmação de senha é obrigatória')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Confirmação de senha não confere');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validador para verificação de 2FA
 */
export const validateTwoFactor = [
  body('userId')
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido'),

  body('token')
    .isLength({ min: 6, max: 6 })
    .withMessage('Token deve ter 6 dígitos')
    .isNumeric()
    .withMessage('Token deve conter apenas números'),

  handleValidationErrors
];

/**
 * Validador para parâmetros de ID
 */
export const validateIdParam = [
  body('id')
    .isUUID()
    .withMessage('ID deve ser um UUID válido'),

  handleValidationErrors
];

/**
 * Função utilitária para validar CPF
 */
export const isValidCPF = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, '');
  
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

  let sum = 0;
  let remainder;

  // Validar primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;

  // Validar segundo dígito
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;

  return true;
};

/**
 * Função utilitária para validar email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Função utilitária para validar senha forte
 */
export const isStrongPassword = (password: string): boolean => {
  // Pelo menos 8 caracteres, 1 minúscula, 1 maiúscula, 1 número
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordRegex.test(password);
};