import Redis from 'ioredis';
import { Service } from '../ServiceManager';
import { environmentService } from '../../config/env';

/**
 * RedisService - Gerencia conexão com Redis (opcional)
 */
export class RedisService implements Service {
  public readonly name = 'RedisService';
  private redis: Redis | null = null;
  private isEnabled: boolean = false;

  /**
   * Inicializa conexão com Redis
   */
  async initialize(): Promise<void> {
    const redisUrl = environmentService.get('REDIS_URL');

    // Redis é opcional
    if (!redisUrl) {
      console.log('[RedisService] Redis não configurado (opcional)');
      this.isEnabled = false;
      return;
    }

    try {
      this.redis = new Redis(redisUrl, {
        lazyConnect: false,
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('[RedisService] Máximo de tentativas de reconexão atingido');
            return null;
          }
          return Math.min(times * 100, 3000);
        }
      });

      this.redis.on('error', (err) => {
        console.warn('[RedisService] Erro de conexão:', err?.message || err);
      });

      this.redis.on('end', () => {
        console.warn('[RedisService] Conexão encerrada');
      });

      this.redis.on('reconnecting', () => {
        console.log('[RedisService] Reconectando...');
      });

      // Testar conexão
      await this.redis.ping();
      this.isEnabled = true;

      console.log('[RedisService] Conexão com Redis estabelecida');
    } catch (error) {
      console.warn('[RedisService] Não foi possível conectar ao Redis (continuando sem cache):', error);
      this.isEnabled = false;
      this.redis = null;
    }
  }

  /**
   * Desliga conexão com Redis
   */
  async shutdown(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      this.isEnabled = false;
      console.log('[RedisService] Conexão com Redis encerrada');
    }
  }

  /**
   * Verifica saúde da conexão
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isEnabled || !this.redis) return false;

    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('[RedisService] Health check falhou:', error);
      return false;
    }
  }

  /**
   * Obtém instância do Redis Client
   */
  getClient(): Redis | null {
    return this.redis;
  }

  /**
   * Verifica se Redis está habilitado
   */
  isRedisEnabled(): boolean {
    return this.isEnabled;
  }
}
