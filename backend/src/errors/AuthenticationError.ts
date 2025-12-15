import { AppError } from './AppError';

/**
 * Unauthorized Error
 * 
 * Thrown when authentication fails or is missing.
 * HTTP Status: 401
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado', details?: any) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

/**
 * Forbidden Error
 * 
 * Thrown when user is authenticated but lacks permission for the requested resource.
 * HTTP Status: 403
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado', details?: any) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

/**
 * Invalid Credentials Error
 * 
 * Thrown when login credentials are invalid.
 * HTTP Status: 401
 */
export class InvalidCredentialsError extends UnauthorizedError {
  constructor(message: string = 'Credenciais inválidas') {
    super(message);
    this.code = 'INVALID_CREDENTIALS';
  }
}

/**
 * Token Expired Error
 * 
 * Thrown when JWT token has expired.
 * HTTP Status: 401
 */
export class TokenExpiredError extends UnauthorizedError {
  constructor(message: string = 'Token expirado') {
    super(message);
    this.code = 'TOKEN_EXPIRED';
  }
}

/**
 * Invalid Token Error
 * 
 * Thrown when JWT token is invalid or malformed.
 * HTTP Status: 401
 */
export class InvalidTokenError extends UnauthorizedError {
  constructor(message: string = 'Token inválido') {
    super(message);
    this.code = 'INVALID_TOKEN';
  }
}
