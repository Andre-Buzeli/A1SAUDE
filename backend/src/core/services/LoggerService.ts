import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { Service } from '../ServiceManager';
import { environmentService } from '../../config/env';

/**
 * Interface para contexto de log com informações de requisição
 */
export interface LogContext {
  requestId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

/**
 * LoggerService - Sistema de logging estruturado com Winston
 * 
 * Features:
 * - Múltiplos transports (console, arquivo)
 * - Níveis de log configuráveis (error, warn, info, debug)
 * - Sanitização automática de dados sensíveis
 * - Contexto de requisição (requestId, userId, ipAddress)
 * - Rotação de arquivos de log
 * - Formatação estruturada em JSON
 */
export class LoggerService implements Service {
  public readonly name = 'LoggerService';
  private logger: winston.Logger | null = null;
  private logDirectory: string;
  private sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'authorization',
    'cookie',
    'sessionId',
    'creditCard',
    'cvv',
    'ssn',
    'cpf'
  ];

  constructor() {
    this.logDirectory = path.dirname(environmentService.get('LOG_FILE_PATH'));
  }

  /**
   * Inicializa o serviço de logging
   */
  async initialize(): Promise<void> {
    try {
      // Criar diretório de logs se não existir
      this.ensureLogDirectory();

      const logLevel = environmentService.get('LOG_LEVEL');
      const isDevelopment = environmentService.isDevelopment();

      // Configurar formato de log
      const logFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
        winston.format.json()
      );

      // Configurar transports
      const transports: winston.transport[] = [
        // Transport para arquivo de erro
        new winston.transports.File({
          filename: path.join(this.logDirectory, 'error.log'),
          level: 'error',
          maxsize: 10485760, // 10MB
          maxFiles: 5,
          format: logFormat
        }),
        // Transport para arquivo combinado
        new winston.transports.File({
          filename: path.join(this.logDirectory, 'combined.log'),
          maxsize: 10485760, // 10MB
          maxFiles: 10,
          format: logFormat
        })
      ];

      // Adicionar console transport em desenvolvimento
      if (isDevelopment) {
        transports.push(
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp({ format: 'HH:mm:ss' }),
              winston.format.printf(({ timestamp, level, message, metadata }) => {
                const metaStr = metadata && Object.keys(metadata).length > 0
                  ? `\n${JSON.stringify(metadata, null, 2)}`
                  : '';
                return `[${timestamp}] ${level}: ${message}${metaStr}`;
              })
            )
          })
        );
      }

      // Criar logger
      this.logger = winston.createLogger({
        level: logLevel,
        format: logFormat,
        transports,
        exitOnError: false
      });

      console.log('[LoggerService] Sistema de logging inicializado');
    } catch (error) {
      console.error('[LoggerService] Erro ao inicializar:', error);
      throw error;
    }
  }

  /**
   * Desliga o serviço de logging
   */
  async shutdown(): Promise<void> {
    if (this.logger) {
      this.logger.close();
      this.logger = null;
      console.log('[LoggerService] Sistema de logging encerrado');
    }
  }

  /**
   * Verifica saúde do serviço
   */
  async healthCheck(): Promise<boolean> {
    return this.logger !== null;
  }

  /**
   * Garante que o diretório de logs existe
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  /**
   * Sanitiza dados sensíveis do contexto
   */
  private sanitizeContext(context?: LogContext): LogContext {
    if (!context) return {};

    const sanitized = { ...context };

    // Sanitizar campos sensíveis
    for (const field of this.sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Sanitizar objetos aninhados
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeNestedObject(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Sanitiza objetos aninhados recursivamente
   */
  private sanitizeNestedObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeNestedObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (this.sensitiveFields.includes(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitized[key] = this.sanitizeNestedObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Log de nível debug
   */
  debug(message: string, context?: LogContext): void {
    if (!this.logger) return;
    const sanitizedContext = this.sanitizeContext(context);
    this.logger.debug(message, { metadata: sanitizedContext });
  }

  /**
   * Log de nível info
   */
  info(message: string, context?: LogContext): void {
    if (!this.logger) return;
    const sanitizedContext = this.sanitizeContext(context);
    this.logger.info(message, { metadata: sanitizedContext });
  }

  /**
   * Log de nível warn
   */
  warn(message: string, context?: LogContext): void {
    if (!this.logger) return;
    const sanitizedContext = this.sanitizeContext(context);
    this.logger.warn(message, { metadata: sanitizedContext });
  }

  /**
   * Log de nível error
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.logger) return;

    const sanitizedContext = this.sanitizeContext(context);
    const errorInfo: any = {};

    if (error instanceof Error) {
      errorInfo.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else if (error) {
      errorInfo.error = error;
    }

    this.logger.error(message, {
      metadata: {
        ...sanitizedContext,
        ...errorInfo
      }
    });
  }

  /**
   * Log de requisição HTTP
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const message = `${method} ${path} - ${statusCode} (${duration}ms)`;

    const requestContext: LogContext = {
      ...context,
      method,
      path,
      statusCode,
      duration
    };

    if (level === 'error') {
      this.error(message, undefined, requestContext);
    } else if (level === 'warn') {
      this.warn(message, requestContext);
    } else {
      this.info(message, requestContext);
    }
  }

  /**
   * Log de auditoria
   */
  audit(action: string, userId: string, details?: any, context?: LogContext): void {
    this.info(`AUDIT: ${action}`, {
      ...context,
      audit: true,
      userId,
      action,
      details: this.sanitizeNestedObject(details)
    });
  }

  /**
   * Log de segurança
   */
  security(event: string, details?: any, context?: LogContext): void {
    this.warn(`SECURITY: ${event}`, {
      ...context,
      security: true,
      event,
      details: this.sanitizeNestedObject(details)
    });
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, details?: any, context?: LogContext): void {
    const level = duration > 1000 ? 'warn' : 'info';
    const message = `PERFORMANCE: ${operation} took ${duration}ms`;

    const perfContext: LogContext = {
      ...context,
      performance: true,
      operation,
      duration,
      details
    };

    if (level === 'warn') {
      this.warn(message, perfContext);
    } else {
      this.info(message, perfContext);
    }
  }

  /**
   * Obtém a instância do logger Winston (para uso avançado)
   */
  getLogger(): winston.Logger | null {
    return this.logger;
  }
}
