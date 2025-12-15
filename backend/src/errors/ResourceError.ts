import { AppError } from './AppError';

/**
 * Not Found Error
 * 
 * Thrown when a requested resource does not exist.
 * HTTP Status: 404
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso', details?: any) {
    super(`${resource} não encontrado`, 404, 'NOT_FOUND', details);
  }
}

/**
 * Conflict Error
 * 
 * Thrown when there's a conflict with the current state of the resource.
 * Examples: duplicate entries, version conflicts, etc.
 * HTTP Status: 409
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflito detectado', details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * Duplicate Resource Error
 * 
 * Thrown when attempting to create a resource that already exists.
 * HTTP Status: 409
 */
export class DuplicateResourceError extends ConflictError {
  constructor(resource: string = 'Recurso', field?: string, details?: any) {
    const message = field 
      ? `${resource} com este ${field} já existe`
      : `${resource} já existe`;
    super(message, details);
    this.code = 'DUPLICATE_RESOURCE';
  }
}

/**
 * Gone Error
 * 
 * Thrown when a resource was previously available but has been permanently removed.
 * HTTP Status: 410
 */
export class GoneError extends AppError {
  constructor(resource: string = 'Recurso', details?: any) {
    super(`${resource} não está mais disponível`, 410, 'GONE', details);
  }
}
