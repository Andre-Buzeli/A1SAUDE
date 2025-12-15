import dotenv from 'dotenv';
import { z } from 'zod';

// Carrega variáveis de ambiente
dotenv.config({ override: true });

// Schema de validação das variáveis de ambiente
const envSchema = z.object({
  // Servidor
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3001'),
  API_VERSION: z.string().default('v1'),

  // Banco de Dados
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET deve ter pelo menos 32 caracteres'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform((val) => parseInt(val, 10)).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform((val) => parseInt(val, 10)).default('0'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform((val) => parseInt(val, 10)).optional(),
  SMTP_SECURE: z.string().transform(val => val === 'true').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((val) => parseInt(val, 10)).default('100'),
  LOGIN_RATE_LIMIT_MAX: z.string().transform((val) => parseInt(val, 10)).default('5'),
  FORGOT_PASSWORD_RATE_LIMIT_MAX: z.string().transform((val) => parseInt(val, 10)).default('3'),

  // Segurança
  BCRYPT_SALT_ROUNDS: z.string().transform((val) => parseInt(val, 10)).default('12'),
  SESSION_TIMEOUT_MINUTES: z.string().transform((val) => parseInt(val, 10)).default('30'),
  MAX_CONCURRENT_SESSIONS: z.string().transform((val) => parseInt(val, 10)).default('3'),

  // 2FA
  TWO_FACTOR_SERVICE_NAME: z.string().default('A1 Saúde'),
  TWO_FACTOR_ISSUER: z.string().default('A1 Saúde System'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),

  // Logs
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().default('./logs/app.log'),

  // Upload
  MAX_FILE_SIZE: z.string().transform((val) => parseInt(val, 10)).default('10485760'),
  UPLOAD_PATH: z.string().default('./uploads'),

  // Backup
  BACKUP_ENABLED: z.string().transform(val => val === 'true').default('false'),
  BACKUP_SCHEDULE: z.string().default('0 2 * * *'),
  BACKUP_RETENTION_DAYS: z.string().transform((val) => parseInt(val, 10)).default('30'),
});

export type EnvironmentConfig = z.infer<typeof envSchema>;

/**
 * EnvironmentService - Gerencia e valida variáveis de ambiente
 */
class EnvironmentService {
  private config: EnvironmentConfig;
  private static instance: EnvironmentService;

  private constructor() {
    this.config = this.validateAndLoad();
  }

  /**
   * Singleton instance
   */
  public static getInstance(): EnvironmentService {
    if (!EnvironmentService.instance) {
      EnvironmentService.instance = new EnvironmentService();
    }
    return EnvironmentService.instance;
  }

  /**
   * Valida e carrega as variáveis de ambiente
   */
  private validateAndLoad(): EnvironmentConfig {
    try {
      const validated = envSchema.parse(process.env);
      console.log('✓ Variáveis de ambiente validadas com sucesso');
      return validated;
    } catch (error) {
      console.error('❌ Erro na validação das variáveis de ambiente:');
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
      }
      throw new Error('Falha na validação das variáveis de ambiente');
    }
  }

  /**
   * Obtém uma variável de ambiente específica
   */
  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  /**
   * Obtém todas as configurações
   */
  public getAll(): EnvironmentConfig {
    return { ...this.config };
  }

  /**
   * Verifica se está em ambiente de desenvolvimento
   */
  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * Verifica se está em ambiente de produção
   */
  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Verifica se está em ambiente de teste
   */
  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  /**
   * Valida se DATABASE_URL está configurada corretamente
   */
  public validateDatabaseUrl(): void {
    const dbUrl = this.config.DATABASE_URL;
    if (!dbUrl || dbUrl.trim().length === 0) {
      throw new Error('DATABASE_URL não está configurada');
    }
    console.log('✓ DATABASE_URL validada');
  }

  /**
   * Obtém array de origens CORS
   */
  public getCorsOrigins(): string[] {
    return this.config.CORS_ORIGIN.split(',').map(origin => origin.trim());
  }
}

// Exporta instância singleton
export const environmentService = EnvironmentService.getInstance();

// Exporta configuração validada para compatibilidade com código existente
export default environmentService.getAll();