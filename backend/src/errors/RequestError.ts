import { AppError } from './AppError';

/**
 * Bad Request Error
 * 
 * Thrown when the request is malformed or contains invalid data.
 * HTTP Status: 400
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Requisição inválida', details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

/**
 * Too Many Requests Error
 * 
 * Thrown when rate limit is exceeded.
 * HTTP Status: 429
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Muitas requisições', retryAfter?: number) {
    super(message, 429, 'TOO_MANY_REQUESTS', { retryAfter });
  }
}

/**
 * Payload Too Large Error
 * 
 * Thrown when request payload exceeds size limits.
 * HTTP Status: 413
 */
export class PayloadTooLargeError extends AppError {
  constructor(message: string = 'Payload muito grande', maxSize?: string) {
    super(message, 413, 'PAYLOAD_TOO_LARGE', { maxSize });
  }
}

/**
 * Unsupported Media Type Error
 * 
 * Thrown when request content type is not supported.
 * HTTP Status: 415
 */
export class UnsupportedMediaTypeError extends AppError {
  constructor(message: string = 'Tipo de mídia não suportado', supportedTypes?: string[]) {
    super(message, 415, 'UNSUPPORTED_MEDIA_TYPE', { supportedTypes });
  }
}

/**
 * Unprocessable Entity Error
 * 
 * Thrown when request is well-formed but contains semantic errors.
 * HTTP Status: 422
 */
export class UnprocessableEntityError extends AppError {
  constructor(message: string = 'Entidade não processável', details?: any) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
}
