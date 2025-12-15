import fs from 'fs';
import path from 'path';
import env from '../config/env';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

const logLevelMap: Record<string, LogLevel> = {
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG
};

class Logger {
  private currentLevel: LogLevel;
  private logFilePath: string;

  constructor() {
    this.currentLevel = logLevelMap[env.LOG_LEVEL] || LogLevel.INFO;
    this.logFilePath = env.LOG_FILE_PATH;
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  private writeToFile(formattedMessage: string): void {
    try {
      fs.appendFileSync(this.logFilePath, formattedMessage + '\n');
    } catch (error) {
      console.error('Erro ao escrever no arquivo de log:', error);
    }
  }

  private log(level: LogLevel, levelName: string, message: string, meta?: any): void {
    if (level <= this.currentLevel) {
      const formattedMessage = this.formatMessage(levelName, message, meta);
      
      // Console output com cores
      const colors = {
        ERROR: '\x1b[31m', // Vermelho
        WARN: '\x1b[33m',  // Amarelo
        INFO: '\x1b[36m',  // Ciano
        DEBUG: '\x1b[35m'  // Magenta
      };
      
      const reset = '\x1b[0m';
      const color = colors[levelName as keyof typeof colors] || '';
      
      console.log(`${color}${formattedMessage}${reset}`);
      
      // Escreve no arquivo
      this.writeToFile(formattedMessage);
    }
  }

  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, meta);
  }

  // Métodos específicos para auditoria
  auditLogin(userId: string, success: boolean, ipAddress?: string, userAgent?: string): void {
    this.info('Login attempt', {
      userId,
      success,
      ipAddress,
      userAgent,
      type: 'AUDIT_LOGIN'
    });
  }

  auditLogout(userId: string, ipAddress?: string): void {
    this.info('User logout', {
      userId,
      ipAddress,
      type: 'AUDIT_LOGOUT'
    });
  }

  auditPasswordChange(userId: string, ipAddress?: string): void {
    this.info('Password changed', {
      userId,
      ipAddress,
      type: 'AUDIT_PASSWORD_CHANGE'
    });
  }

  auditTwoFactorEnabled(userId: string, ipAddress?: string): void {
    this.info('Two-factor authentication enabled', {
      userId,
      ipAddress,
      type: 'AUDIT_2FA_ENABLED'
    });
  }

  auditTwoFactorDisabled(userId: string, ipAddress?: string): void {
    this.info('Two-factor authentication disabled', {
      userId,
      ipAddress,
      type: 'AUDIT_2FA_DISABLED'
    });
  }

  auditPermissionGranted(userId: string, permission: string, grantedBy: string): void {
    this.info('Permission granted', {
      userId,
      permission,
      grantedBy,
      type: 'AUDIT_PERMISSION_GRANTED'
    });
  }

  auditPermissionRevoked(userId: string, permission: string, revokedBy: string): void {
    this.info('Permission revoked', {
      userId,
      permission,
      revokedBy,
      type: 'AUDIT_PERMISSION_REVOKED'
    });
  }
}

export const logger = new Logger();