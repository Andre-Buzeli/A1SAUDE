import { Service } from '../ServiceManager';
import { SimpleSyncService } from '../../services/SimpleSyncService';

/**
 * SyncServiceWrapper - Wrapper para SimpleSyncService
 */
export class SyncServiceWrapper implements Service {
  public readonly name = 'SyncService';
  private syncService: SimpleSyncService | null = null;

  /**
   * Inicializa serviço de sincronização
   */
  async initialize(): Promise<void> {
    try {
      this.syncService = new SimpleSyncService();
      this.syncService.start();
      console.log('[SyncService] Serviço de sincronização inicializado');
    } catch (error) {
      console.error('[SyncService] Erro ao inicializar:', error);
      throw error;
    }
  }

  /**
   * Desliga serviço de sincronização
   */
  async shutdown(): Promise<void> {
    if (this.syncService) {
      this.syncService.stop();
      this.syncService = null;
      console.log('[SyncService] Serviço de sincronização encerrado');
    }
  }

  /**
   * Verifica saúde do serviço
   */
  async healthCheck(): Promise<boolean> {
    // SimpleSyncService não tem método de health check, assumir que está ok se inicializado
    return this.syncService !== null;
  }

  /**
   * Obtém instância do SimpleSyncService
   */
  getService(): SimpleSyncService | null {
    return this.syncService;
  }
}
