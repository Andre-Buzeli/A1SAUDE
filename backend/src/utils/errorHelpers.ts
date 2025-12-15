/**
 * Error Helper Utilities
 * 
 * Utility functions for working with errors throughout the application.
 */

import { AppError } from '../errors';

/**
 * Check if error is operational (expected) or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Extract error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido';
}

/**
 * Extract error code safely
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof AppError) {
    return error.code;
  }
  return undefined;
}

/**
 * Extract status code safely
 */
export function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Check if error should be retried
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof AppError) {
    // Retry on service unavailable, gateway timeout, or database errors
    return [503, 504].includes(error.statusCode) || 
           error.code === 'DATABASE_ERROR' ||
           error.code === 'EXTERNAL_SERVICE_ERROR';
  }
  return false;
}

/**
 * Sanitize error for logging (remove sensitive data)
 */
export function sanitizeError(error: Error): any {
  const sanitized: any = {
    name: error.name,
    message: error.message,
    stack: error.stack
  };

  if (error instanceof AppError) {
    sanitized.code = error.code;
    sanitized.statusCode = error.statusCode;
    sanitized.isOperational = error.isOperational;
    
    // Sanitize details
    if (error.details) {
      sanitized.details = sanitizeObject(error.details);
    }
  }

  return sanitized;
}

/**
 * Sanitize object by removing sensitive fields
 */
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'authorization',
    'cookie',
    'sessionId'
  ];

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Create error response object
 */
export function createErrorResponse(error: Error, requestId?: string): any {
  const statusCode = getStatusCode(error);
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  return {
    error: {
      message,
      code: code || 'INTERNAL_ERROR',
      statusCode,
      timestamp: new Date().toISOString(),
      requestId
    }
  };
}

/**
 * Wrap error with additional context
 */
export function wrapError(
  error: Error,
  message: string,
  context?: any
): AppError {
  if (error instanceof AppError) {
    // Add context to existing AppError
    return new AppError(
      message,
      error.statusCode,
      error.code,
      { ...error.details, ...context, originalError: error.message }
    );
  }

  // Wrap unknown error
  return new AppError(
    message,
    500,
    'WRAPPED_ERROR',
    { ...context, originalError: error.message }
  );
}
