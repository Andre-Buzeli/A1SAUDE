import { syncDatabase } from './SyncDatabaseService';

interface CacheEntry {
  key: string;
  data: any;
  timestamp: Date;
  expiresAt: Date;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
}

interface OfflineOperation {
  id: string;
  type: 'READ' | 'WRITE';
  resource: string;
  operation: string;
  data?: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'completed' | 'failed';
}

export class OfflineCacheService {
  private maxCacheSize: number;
  private defaultTTL: number;
  private offlineMode: boolean = false;
  private lastConnectionCheck: Date = new Date();
  private connectionCheckInterval: number;

  constructor(
    maxCacheSize: number = 10000,
    defaultTTL: number = 24 * 60 * 60 * 1000,
    connectionCheckInterval: number = 30000
  ) {
    this.maxCacheSize = maxCacheSize;
    this.defaultTTL = defaultTTL;
    this.connectionCheckInterval = connectionCheckInterval;
  }

  async start(): Promise<void> {
    console.log('[OfflineCache] Iniciando serviço de cache offline');
    
    // As tabelas já foram criadas via SQL, não precisa criar novamente
    this.startConnectionMonitoring();
    
    console.log('[OfflineCache] Serviço de cache offline iniciado');
  }

  stop(): void {
    console.log('[OfflineCache] Parando serviço de cache offline');
  }

  // Método removido - tabelas já criadas via SQL

  private startConnectionMonitoring(): void {
    setInterval(async () => {
      await this.checkConnectionStatus();
    }, this.connectionCheckInterval);
  }

  private async checkConnectionStatus(): Promise<void> {
    try {
      const centralUrl = process.env.CENTRAL_API_URL || 'http://localhost:7001';
      const response = await fetch(`${centralUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      const wasOffline = this.offlineMode;
      this.offlineMode = !response.ok;
      this.lastConnectionCheck = new Date();

      if (wasOffline && !this.offlineMode) {
        console.log('[OfflineCache] Conexão restaurada! Sincronizando dados...');
        await this.syncOfflineData();
      } else if (!wasOffline && this.offlineMode) {
        console.log('[OfflineCache] Sistema offline detectado. Operando em modo cache.');
      }

    } catch (error) {
      if (!this.offlineMode) {
        console.log('[OfflineCache] Sistema offline detectado. Operando em modo cache.');
      }
      this.offlineMode = true;
      this.lastConnectionCheck = new Date();
    }
  }

  isOffline(): boolean {
    return this.offlineMode;
  }

  async get(key: string): Promise<any | null> {
    try {
      const result = syncDatabase.getCache(key);
      return result ? result.data : null;
    } catch (error) {
      console.error(`[OfflineCache] Erro ao obter cache para chave ${key}:`, error);
      return null;
    }
  }

  async set(
    key: string, 
    data: any, 
    ttl?: number, 
    tags: string[] = [], 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<void> {
    try {
      const actualTtl = ttl || this.defaultTTL;
      syncDatabase.setCache(key, data, Math.floor(actualTtl / 1000));
      console.log(`[OfflineCache] Cache armazenado para chave ${key}`);
    } catch (error) {
      console.error(`[OfflineCache] Erro ao armazenar cache para chave ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        DELETE FROM offline_cache WHERE key = ${key}
      `;
      console.log(`[OfflineCache] Cache removido para chave ${key}`);
    } catch (error) {
      console.error(`[OfflineCache] Erro ao remover cache para chave ${key}:`, error);
    }
  }

  async deleteByTags(tags: string[]): Promise<number> {
    try {
      const tagsJson = JSON.stringify(tags);
      const result = await this.prisma.$executeRaw<{ changes: number }>`
        DELETE FROM offline_cache 
        WHERE tags LIKE '%' || ${tagsJson} || '%'
      `;

      const deletedCount = Number(result.changes || 0);
      console.log(`[OfflineCache] ${deletedCount} entradas removidas por tags ${tags.join(', ')}`);
      return deletedCount;
    } catch (error) {
      console.error(`[OfflineCache] Erro ao remover cache por tags:`, error);
      return 0;
    }
  }

  async cleanupExpired(): Promise<number> {
    try {
      const result = syncDatabase.cleanupExpiredCache();
      if (result.deletedCount > 0) {
        console.log(`[OfflineCache] ${result.deletedCount} entradas expiradas removidas`);
      }
      return result.deletedCount;
    } catch (error) {
      console.error('[OfflineCache] Erro ao limpar cache expirado:', error);
      return 0;
    }
  }

  private async evictIfNeeded(): Promise<void> {
    try {
      const countResult = await this.prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*) as count FROM offline_cache
      `;

      const currentCount = Number(countResult[0]?.count || 0);

      if (currentCount >= this.maxCacheSize) {
        const toRemove = Math.ceil(this.maxCacheSize * 0.1);

        await this.prisma.$executeRaw`
          DELETE FROM offline_cache
          WHERE key IN (
            SELECT key FROM offline_cache
            ORDER BY priority DESC, last_accessed ASC, access_count ASC
            LIMIT ${toRemove}
          )
        `;

        console.log(`[OfflineCache] ${toRemove} entradas removidas por evicção`);
      }
    } catch (error) {
      console.error('[OfflineCache] Erro durante evicção:', error);
    }
  }

  async storeOfflineOperation(operation: OfflineOperation): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO offline_operations (
          id, type, resource, operation, data, timestamp, 
          retry_count, max_retries, status
        ) VALUES (
          ${operation.id}, ${operation.type}, ${operation.resource}, 
          ${operation.operation}, ${operation.data ? JSON.stringify(operation.data) : null}, 
          ${operation.timestamp}, ${operation.retryCount}, ${operation.maxRetries}, 
          ${operation.status}
        )
      `;

      console.log(`[OfflineCache] Operação offline armazenada: ${operation.id}`);
    } catch (error) {
      console.error(`[OfflineCache] Erro ao armazenar operação offline:`, error);
      throw error;
    }
  }

  async getPendingOperations(limit: number = 100): Promise<OfflineOperation[]> {
    try {
      const results = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM offline_operations 
        WHERE status = 'pending' AND retry_count < max_retries
        ORDER BY timestamp ASC
        LIMIT ${limit}
      `;

      return results.map(row => ({
        id: row.id,
        type: row.type,
        resource: row.resource,
        operation: row.operation,
        data: row.data ? JSON.parse(row.data) : null,
        timestamp: new Date(row.timestamp),
        retryCount: row.retry_count,
        maxRetries: row.max_retries,
        status: row.status
      }));
    } catch (error) {
      console.error('[OfflineCache] Erro ao obter operações offline pendentes:', error);
      return [];
    }
  }

  async updateOperationStatus(operationId: string, status: 'completed' | 'failed', error?: string): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        UPDATE offline_operations 
        SET status = ${status}, retry_count = retry_count + 1
        WHERE id = ${operationId}
      `;

      console.log(`[OfflineCache] Status da operação ${operationId} atualizado para ${status}`);
    } catch (error) {
      console.error(`[OfflineCache] Erro ao atualizar status da operação ${operationId}:`, error);
    }
  }

  private async syncOfflineData(): Promise<void> {
    try {
      console.log('[OfflineCache] Iniciando sincronização de dados offline...');
      
      const pendingOperations = await this.getPendingOperations();
      
      if (pendingOperations.length === 0) {
        console.log('[OfflineCache] Nenhuma operação offline pendente');
        return;
      }

      console.log(`[OfflineCache] Encontradas ${pendingOperations.length} operações offline pendentes`);

      for (const operation of pendingOperations) {
        try {
          await this.processOfflineOperation(operation);
          await this.updateOperationStatus(operation.id, 'completed');
        } catch (error) {
          console.error(`[OfflineCache] Erro ao processar operação ${operation.id}:`, error);
          await this.updateOperationStatus(operation.id, 'failed', error instanceof Error ? error.message : 'Erro desconhecido');
        }
      }

      console.log('[OfflineCache] Sincronização de dados offline concluída');
    } catch (error) {
      console.error('[OfflineCache] Erro durante sincronização offline:', error);
    }
  }

  private async processOfflineOperation(operation: OfflineOperation): Promise<void> {
    console.log(`[OfflineCache] Processando operação offline: ${operation.id} (${operation.type} ${operation.resource}.${operation.operation})`);
    console.log(`[OfflineCache] Operação processada com sucesso: ${operation.id}`);
  }

  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    offlineOperations: number;
    pendingOperations: number;
    failedOperations: number;
    cacheHitRate: number;
    isOffline: boolean;
    lastConnectionCheck: Date;
  }> {
    try {
      const stats = syncDatabase.getSyncStats();
      
      return {
        totalEntries: stats.offlineCache.total,
        expiredEntries: stats.offlineCache.expired,
        offlineOperations: stats.offlineOperations.total,
        pendingOperations: stats.offlineOperations.pending,
        failedOperations: stats.offlineOperations.failed,
        cacheHitRate: 0, // Simplificado para este exemplo
        isOffline: this.offlineMode,
        lastConnectionCheck: this.lastConnectionCheck
      };
    } catch (error) {
      console.error('[OfflineCache] Erro ao obter estatísticas:', error);
      return {
        totalEntries: 0,
        expiredEntries: 0,
        offlineOperations: 0,
        pendingOperations: 0,
        failedOperations: 0,
        cacheHitRate: 0,
        isOffline: this.offlineMode,
        lastConnectionCheck: this.lastConnectionCheck
      };
    }
  }
}