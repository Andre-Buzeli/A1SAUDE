import { PrismaClient } from '@prisma/client';
import { Service } from '../ServiceManager';
import { environmentService } from '../../config/env';

/**
 * DatabaseService - Gerencia conexão com banco de dados
 */
export class DatabaseService implements Service {
  public readonly name = 'DatabaseService';
  private prisma: PrismaClient | null = null;

  /**
   * Inicializa conexão com banco de dados
   */
  async initialize(): Promise<void> {
    try {
      // Validar DATABASE_URL antes de inicializar
      environmentService.validateDatabaseUrl();

      const databaseUrl = environmentService.get('DATABASE_URL');

      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
        log: environmentService.isDevelopment() 
          ? ['query', 'error', 'warn'] 
          : ['error'],
      });

      // Testar conexão
      await this.prisma.$connect();
      
      // Verificar se banco está acessível
      await this.prisma.$queryRaw`SELECT 1 as health_check`;

      console.log('[DatabaseService] Conexão com banco de dados estabelecida');
    } catch (error) {
      console.error('[DatabaseService] Erro ao conectar ao banco de dados:', error);
      throw error;
    }
  }

  /**
   * Desliga conexão com banco de dados
   */
  async shutdown(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
      console.log('[DatabaseService] Conexão com banco de dados encerrada');
    }
  }

  /**
   * Verifica saúde da conexão
   */
  async healthCheck(): Promise<boolean> {
    if (!this.prisma) return false;

    try {
      await this.prisma.$queryRaw`SELECT 1 as health_check`;
      return true;
    } catch (error) {
      console.error('[DatabaseService] Health check falhou:', error);
      return false;
    }
  }

  /**
   * Obtém instância do Prisma Client
   */
  getClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('DatabaseService não foi inicializado');
    }
    return this.prisma;
  }
}
