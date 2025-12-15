import { AppError } from './AppError';

/**
 * Business Logic Error
 * 
 * Base class for business rule violations.
 * HTTP Status: 422
 */
export class BusinessError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 422, 'BUSINESS_ERROR', details);
  }
}

/**
 * Insufficient Permissions Error
 * 
 * Thrown when user lacks required permissions for an operation.
 * HTTP Status: 403
 */
export class InsufficientPermissionsError extends AppError {
  constructor(requiredPermission?: string, details?: any) {
    const message = requiredPermission
      ? `Permissão necessária: ${requiredPermission}`
      : 'Permissões insuficientes';
    super(message, 403, 'INSUFFICIENT_PERMISSIONS', details);
  }
}

/**
 * Account Locked Error
 * 
 * Thrown when user account is locked due to security reasons.
 * HTTP Status: 423
 */
export class AccountLockedError extends AppError {
  constructor(reason?: string, unlockTime?: Date) {
    const message = reason || 'Conta bloqueada';
    super(message, 423, 'ACCOUNT_LOCKED', { reason, unlockTime });
  }
}

/**
 * Invalid State Error
 * 
 * Thrown when an operation is attempted on a resource in an invalid state.
 * HTTP Status: 422
 */
export class InvalidStateError extends BusinessError {
  constructor(resource: string, currentState: string, requiredState?: string) {
    const message = requiredState
      ? `${resource} está em estado '${currentState}', mas deveria estar em '${requiredState}'`
      : `${resource} está em estado inválido: '${currentState}'`;
    super(message, { resource, currentState, requiredState });
    this.code = 'INVALID_STATE';
  }
}

/**
 * Quota Exceeded Error
 * 
 * Thrown when a resource quota or limit is exceeded.
 * HTTP Status: 429
 */
export class QuotaExceededError extends AppError {
  constructor(resource: string, limit: number, current: number) {
    super(
      `Limite de ${resource} excedido: ${current}/${limit}`,
      429,
      'QUOTA_EXCEEDED',
      { resource, limit, current }
    );
  }
}

/**
 * Dependency Error
 * 
 * Thrown when an operation cannot be completed due to dependent resources.
 * HTTP Status: 422
 */
export class DependencyError extends BusinessError {
  constructor(message: string, dependencies?: string[]) {
    super(message, { dependencies });
    this.code = 'DEPENDENCY_ERROR';
  }
}
