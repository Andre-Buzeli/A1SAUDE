import { z } from 'zod';

/**
 * Valida CPF brasileiro
 */
export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validar primeiro dígito
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = cleanCPF[i];
    if (!digit) return false;
    sum += parseInt(digit) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;
  
  const ninthDigit = cleanCPF[9];
  if (!ninthDigit || parseInt(ninthDigit) !== firstDigit) return false;

  // Validar segundo dígito
  sum = 0;
  for (let i = 0; i < 10; i++) {
    const digit = cleanCPF[i];
    if (!digit) return false;
    sum += parseInt(digit) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;

  const tenthDigit = cleanCPF[10];
  return tenthDigit ? parseInt(tenthDigit) === secondDigit : false;
}

// Manter compatibilidade com código existente
export const validateCPF = isValidCPF;

/**
 * Valida CNPJ brasileiro
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  // Validar primeiro dígito
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = cleanCNPJ[i];
    const weight = weights1[i];
    if (!digit || !weight) return false;
    sum += parseInt(digit) * weight;
  }
  let firstDigit = sum % 11;
  firstDigit = firstDigit < 2 ? 0 : 11 - firstDigit;
  
  const twelfthDigit = cleanCNPJ[12];
  if (!twelfthDigit || parseInt(twelfthDigit) !== firstDigit) return false;

  // Validar segundo dígito
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = cleanCNPJ[i];
    const weight = weights2[i];
    if (!digit || !weight) return false;
    sum += parseInt(digit) * weight;
  }
  let secondDigit = sum % 11;
  secondDigit = secondDigit < 2 ? 0 : 11 - secondDigit;

  const thirteenthDigit = cleanCNPJ[13];
  return thirteenthDigit ? parseInt(thirteenthDigit) === secondDigit : false;
}

// Manter compatibilidade com código existente
export const validateCNPJ = isValidCNPJ;

/**
 * Valida CNES (Cadastro Nacional de Estabelecimentos de Saúde)
 */
export const validateCNES = (cnes: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNES = cnes.replace(/\D/g, '');
  
  // Verifica se tem 7 dígitos
  if (cleanCNES.length !== 7) return false;
  
  // CNES não pode ser todos zeros
  if (cleanCNES === '0000000') return false;
  
  return true;
};

/**
 * Valida telefone brasileiro
 */
export const validatePhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
  
  // Verifica se o DDD é válido (11-99)
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  // Para celular (11 dígitos), o primeiro dígito após o DDD deve ser 9
  if (cleanPhone.length === 11 && cleanPhone[2] !== '9') return false;
  
  return true;
};

/**
 * Valida CEP brasileiro
 */
export const validateCEP = (cep: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');
  
  // Verifica se tem 8 dígitos
  if (cleanCEP.length !== 8) return false;
  
  // CEP não pode ser todos zeros
  if (cleanCEP === '00000000') return false;
  
  return true;
};

/**
 * Schema Zod para CPF
 */
export const cpfSchema = z.string()
  .min(11, 'CPF deve ter 11 dígitos')
  .max(14, 'CPF inválido')
  .refine(validateCPF, 'CPF inválido');

/**
 * Schema Zod para CNPJ
 */
export const cnpjSchema = z.string()
  .min(14, 'CNPJ deve ter 14 dígitos')
  .max(18, 'CNPJ inválido')
  .refine(validateCNPJ, 'CNPJ inválido');

/**
 * Schema Zod para CNES
 */
export const cnesSchema = z.string()
  .length(7, 'CNES deve ter 7 dígitos')
  .refine(validateCNES, 'CNES inválido');

/**
 * Schema Zod para telefone
 */
export const phoneSchema = z.string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone muito longo')
  .refine(validatePhone, 'Telefone inválido');

/**
 * Schema Zod para CEP
 */
export const cepSchema = z.string()
  .length(8, 'CEP deve ter 8 dígitos')
  .refine(validateCEP, 'CEP inválido');

/**
 * Schema Zod para email
 */
export const emailSchema = z.string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(255, 'Email muito longo');

/**
 * Schema Zod para senha
 */
export const passwordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/\d/, 'Senha deve conter pelo menos um número')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Senha deve conter pelo menos um caractere especial');

/**
 * Schema Zod para nome
 */
export const nameSchema = z.string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');

/**
 * Utilitários de formatação
 */
export const formatCPF = (cpf: string): string => {
  const clean = cpf.replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCNPJ = (cnpj: string): string => {
  const clean = cnpj.replace(/\D/g, '');
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatPhone = (phone: string): string => {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

export const formatCEP = (cep: string): string => {
  const clean = cep.replace(/\D/g, '');
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Utilitários de limpeza
 */
export const cleanCPF = (cpf: string): string => cpf.replace(/\D/g, '');
export const cleanCNPJ = (cnpj: string): string => cnpj.replace(/\D/g, '');
export const cleanPhone = (phone: string): string => phone.replace(/\D/g, '');
export const cleanCEP = (cep: string): string => cep.replace(/\D/g, '');

/**
 * Valida se string é um email válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length >= 5 && email.length <= 255;
};

/**
 * Valida se string é um identificador válido (email ou CPF)
 */
export const validateIdentifier = (identifier: string): { type: 'email' | 'cpf' | null; isValid: boolean } => {
  // Tenta validar como email
  if (isValidEmail(identifier)) {
    return { type: 'email', isValid: true };
  }
  
  // Tenta validar como CPF
  if (isValidCPF(identifier)) {
    return { type: 'cpf', isValid: true };
  }
  
  return { type: null, isValid: false };
};