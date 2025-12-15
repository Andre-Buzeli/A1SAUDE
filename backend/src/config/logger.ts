/**
 * Configuração do Sistema de Logs
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import fs from 'fs';
import path from 'path';

// Tipos de log
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logFilePath: string;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.logFilePath = process.env.LOG_FILE_PATH || './logs/app.log';
    
    // Criar diretório de logs se não existir
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };

    return JSON.stringify(logEntry);
  }

  private writeToFile(formattedMessage: string): void {
    try {
      fs.appendFileSync(this.logFilePath, formattedMessage + '\n');
    } catch (error) {
      console.error('Erro ao escrever no arquivo de log:', error);
    }
  }

  private logToConsole(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'debug':
        console.debug(`\x1b[36m${prefix}\x1b[0m`, message, data || '');
        break;
      case 'info':
        console.info(`\x1b[32m${prefix}\x1b[0m`, message, data || '');
        break;
      case 'warn':
        console.warn(`\x1b[33m${prefix}\x1b[0m`, message, data || '');
        break;
      case 'error':
        console.error(`\x1b[31m${prefix}\x1b[0m`, message, data || '');
        break;
    }
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    // Log no console
    this.logToConsole(level, message, data);

    // Log no arquivo
    const formattedMessage = this.formatMessage(level, message, data);
    this.writeToFile(formattedMessage);
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: any): void {
    let errorData = error;
    
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    
    this.log('error', message, errorData);
  }

  // Método para logs de auditoria
  audit(action: string, userId?: string, details?: any): void {
    const auditMessage = `AUDIT: ${action}`;
    const auditData = {
      userId,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.info(auditMessage, auditData);
  }

  // Método para logs de segurança
  security(event: string, details?: any): void {
    const securityMessage = `SECURITY: ${event}`;
    this.warn(securityMessage, details);
  }

  // Método para logs de performance
  performance(operation: string, duration: number, details?: any): void {
    const perfMessage = `PERFORMANCE: ${operation} took ${duration}ms`;
    this.info(perfMessage, details);
  }
}

// Instância singleton do logger
export const logger = new Logger();

// Middleware para logs de requisições HTTP
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  const { method, url, ip, headers } = req;
  
  // Log da requisição
  logger.info(`${method} ${url}`, {
    ip,
    userAgent: headers['user-agent'],
    contentType: headers['content-type']
  });

  // Override do res.end para capturar o tempo de resposta
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Log da resposta
    logger.info(`${method} ${url} - ${statusCode}`, {
      duration: `${duration}ms`,
      statusCode
    });
    
    originalEnd.apply(this, args);
  };

  next();
};

export default logger;