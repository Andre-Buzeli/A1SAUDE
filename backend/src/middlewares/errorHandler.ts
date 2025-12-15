import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError, DatabaseError, InternalServerError } from '../errors';
import { LoggerService } from '../core/services/LoggerService';

/**
 * Centralized Error Handler Middleware
 * 
 * Handles all errors thrown in the application, providing:
 * - Consistent error response format
 * - Automatic logging with context
 * - Stack trace sanitization in production
 * - Special handling for known error types (Zod, Prisma, etc.)
 */
export function createErrorHandler(logger?: LoggerService) {
  return (err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.log('[ErrorHandler] Processing error:', err.message);
    console.log('[ErrorHandler] Error type:', err.constructor.name);
    console.log('[ErrorHandler] Request:', req.method, req.path);

    // If response already sent, delegate to default Express error handler
    if (res.headersSent) {
      return next(err);
    }

    // Convert known error types to AppError
    let error: AppError;

    if (err instanceof AppError) {
      // Already an AppError, use as-is
      error = err;
    } else if (err instanceof ZodError) {
      // Zod validation error
      error = ValidationError.fromZodError(err);
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma known errors
      error = handlePrismaError(err);
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      // Prisma validation error
      error = new ValidationError('Erro de validação no banco de dados');
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
      // Prisma initialization error
      error = new DatabaseError('Erro ao conectar com o banco de dados');
    } else {
      // Unknown error - wrap in InternalServerError
      error = new InternalServerError(
        process.env.NODE_ENV === 'production' 
          ? 'Erro interno do servidor' 
          : err.message,
        process.env.NODE_ENV === 'production' ? undefined : { originalError: err.message }
      );
    }

    // Log error with context
    logError(error, err, req, logger);

    // Send error response
    sendErrorResponse(error, req, res);
  };
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError): AppError {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      const target = err.meta?.target as string[] | undefined;
      const field = target?.[0] || 'campo';
      return new ValidationError(
        `Já existe um registro com este ${field}`,
        [{ field, message: 'Valor duplicado' }]
      );

    case 'P2025':
      // Record not found
      return new AppError('Registro não encontrado', 404, 'NOT_FOUND');

    case 'P2003':
      // Foreign key constraint violation
      return new ValidationError('Referência inválida a registro relacionado');

    case 'P2014':
      // Relation violation
      return new ValidationError('Violação de relacionamento entre registros');

    case 'P2021':
      // Table does not exist
      return new DatabaseError('Tabela não existe no banco de dados');

    case 'P2024':
      // Connection timeout
      return new DatabaseError('Timeout ao conectar com banco de dados');

    default:
      return new DatabaseError(`Erro no banco de dados: ${err.code}`);
  }
}

/**
 * Log error with full context
 */
function logError(
  error: AppError,
  originalError: Error,
  req: Request,
  logger?: LoggerService
): void {
  const logContext = {
    requestId: (req as any).requestId,
    userId: (req as any).logContext?.userId,
    ipAddress: (req as any).logContext?.ipAddress || req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    path: req.path,
    query: req.query,
    statusCode: error.statusCode,
    errorCode: error.code,
    isOperational: error.isOperational
  };

  if (logger) {
    // Use LoggerService if available
    if (error.statusCode >= 500) {
      // Server errors - log as error with stack trace
      logger.error(error.message, originalError, logContext);
    } else if (error.statusCode >= 400) {
      // Client errors - log as warning
      logger.warn(error.message, logContext);
    } else {
      // Other errors - log as info
      logger.info(error.message, logContext);
    }
  } else {
    // Fallback to console
    if (error.statusCode >= 500) {
      console.error('[Error]', error.message, {
        ...logContext,
        stack: originalError.stack
      });
    } else {
      console.warn('[Error]', error.message, logContext);
    }
  }
}

/**
 * Send formatted error response
 */
function sendErrorResponse(error: AppError, req: Request, res: Response): void {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  const response: any = {
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId
    }
  };

  // Include details if available
  if (error.details) {
    response.error.details = error.details;
  }

  // Include stack trace in development
  if (isDevelopment && error.stack) {
    response.error.stack = error.stack.split('\n');
  }

  // Send response
  res.status(error.statusCode).json(response);
}

/**
 * Async Error Handler Wrapper
 * 
 * Wraps async route handlers to catch errors and pass to error middleware.
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not Found Handler
 * 
 * Handles 404 errors for routes that don't exist.
 */
export function notFoundHandler(logger?: LoggerService) {
  return (req: Request, res: Response) => {
    if (logger) {
      logger.warn('Route not found', {
        requestId: (req as any).requestId,
        method: req.method,
        path: req.path,
        ipAddress: (req as any).logContext?.ipAddress || req.ip
      });
    }

    res.status(404).json({
      error: {
        message: 'Rota não encontrada',
        code: 'NOT_FOUND',
        statusCode: 404,
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId,
        path: req.path
      }
    });
  };
}
