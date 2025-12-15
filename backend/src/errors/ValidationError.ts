import { AppError } from './AppError';

/**
 * Validation Error Detail
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
}

/**
 * Validation Error
 * 
 * Thrown when request data fails validation.
 * Includes detailed information about which fields failed validation.
 */
export class ValidationError extends AppError {
  public readonly errors: ValidationErrorDetail[];

  constructor(message: string = 'Dados inválidos', errors: ValidationErrorDetail[] = []) {
    super(message, 400, 'VALIDATION_ERROR', { errors });
    this.errors = errors;
  }

  /**
   * Create ValidationError from Zod error
   */
  static fromZodError(zodError: any): ValidationError {
    const errors: ValidationErrorDetail[] = zodError.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
      value: err.received
    }));

    return new ValidationError('Dados inválidos', errors);
  }
}
