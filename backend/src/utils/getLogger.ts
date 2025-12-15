import { LoggerService, LogContext } from '../core/services/LoggerService';

/**
 * Instância global do logger (será definida após inicialização)
 */
let loggerInstance: LoggerService | null = null;

/**
 * Define a instância global do logger
 */
export function setLoggerInstance(logger: LoggerService): void {
  loggerInstance = logger;
}

/**
 * Obtém a instância do logger
 * 
 * @returns LoggerService instance ou null se não inicializado
 */
export function getLogger(): LoggerService | null {
  return loggerInstance;
}

/**
 * Wrapper de conveniência para logging
 * Fallback para console se logger não estiver disponível
 */
export const log = {
  debug: (message: string, context?: LogContext): void => {
    if (loggerInstance) {
      loggerInstance.debug(message, context);
    } else {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  },

  info: (message: string, context?: LogContext): void => {
    if (loggerInstance) {
      loggerInstance.info(message, context);
    } else {
      console.info(`[INFO] ${message}`, context || '');
    }
  },

  warn: (message: string, context?: LogContext): void => {
    if (loggerInstance) {
      loggerInstance.warn(message, context);
    } else {
      console.warn(`[WARN] ${message}`, context || '');
    }
  },

  error: (message: string, error?: Error | unknown, context?: LogContext): void => {
    if (loggerInstance) {
      loggerInstance.error(message, error, context);
    } else {
      console.error(`[ERROR] ${message}`, error, context || '');
    }
  },

  audit: (action: string, userId: string, details?: any, context?: LogContext): void => {
    if (loggerInstance) {
      loggerInstance.audit(action, userId, details, context);
    } else {
      console.info(`[AUDIT] ${action}`, { userId, details, ...context });
    }
  },

  security: (event: string, details?: any, context?: LogContext): void => {
    if (loggerInstance) {
      loggerInstance.security(event, details, context);
    } else {
      console.warn(`[SECURITY] ${event}`, { details, ...context });
    }
  },

  performance: (operation: string, duration: number, details?: any, context?: LogContext): void => {
    if (loggerInstance) {
      loggerInstance.performance(operation, duration, details, context);
    } else {
      console.info(`[PERFORMANCE] ${operation} took ${duration}ms`, { details, ...context });
    }
  }
};
