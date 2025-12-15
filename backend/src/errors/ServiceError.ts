import { AppError } from './AppError';

/**
 * Internal Server Error
 * 
 * Thrown when an unexpected error occurs on the server.
 * HTTP Status: 500
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Erro interno do servidor', details?: any) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }
}

/**
 * Service Unavailable Error
 * 
 * Thrown when a required service is temporarily unavailable.
 * HTTP Status: 503
 */
export class ServiceUnavailableError extends AppError {
  constructor(service: string = 'Serviço', details?: any) {
    super(`${service} temporariamente indisponível`, 503, 'SERVICE_UNAVAILABLE', details);
  }
}

/**
 * Database Error
 * 
 * Thrown when a database operation fails.
 * HTTP Status: 500
 */
export class DatabaseError extends InternalServerError {
  constructor(message: string = 'Erro no banco de dados', details?: any) {
    super(message, details);
    this.code = 'DATABASE_ERROR';
  }
}

/**
 * External Service Error
 * 
 * Thrown when an external service call fails.
 * HTTP Status: 502
 */
export class ExternalServiceError extends AppError {
  constructor(service: string = 'Serviço externo', details?: any) {
    super(`Erro ao comunicar com ${service}`, 502, 'EXTERNAL_SERVICE_ERROR', details);
  }
}

/**
 * Gateway Timeout Error
 * 
 * Thrown when an external service takes too long to respond.
 * HTTP Status: 504
 */
export class GatewayTimeoutError extends AppError {
  constructor(service: string = 'Serviço', timeout?: number) {
    super(`Timeout ao comunicar com ${service}`, 504, 'GATEWAY_TIMEOUT', { timeout });
  }
}

/**
 * Configuration Error
 * 
 * Thrown when there's a configuration problem.
 * HTTP Status: 500
 */
export class ConfigurationError extends InternalServerError {
  constructor(message: string = 'Erro de configuração', details?: any) {
    super(message, details);
    this.code = 'CONFIGURATION_ERROR';
    this.isOperational = false; // Configuration errors are not operational
  }
}
