// Serviço de sincronização simplificado
export class SimpleSyncService {
  private syncTimer?: NodeJS.Timeout;
  private isSyncing: boolean = false;

  constructor() {
    console.log('🔄 Serviço de sincronização simplificado inicializado');
  }

  start() {
    if (this.syncTimer) {
      console.log('[SimpleSync] Sincronização já está em execução');
      return;
    }

    console.log('[SimpleSync] Iniciando serviço de sincronização');
    
    // Simular sincronização periódica
    this.syncTimer = setInterval(() => {
      this.sync().catch(error => {
        console.error('[SimpleSync] Erro na sincronização periódica:', error);
      });
    }, 300000); // 5 minutos

    console.log('[SimpleSync] Sincronização agendada a cada 5 minutos');
  }

  stop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
      console.log('[SimpleSync] Serviço de sincronização parado');
    }
  }

  async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('[SimpleSync] Sincronização já em andamento, ignorando...');
      return;
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      console.log('[SimpleSync] Iniciando sincronização...');
      
      // Simular sincronização - em produção, isso se conectaria ao sistema central
      console.log('[SimpleSync] Simulando sincronização com sistema central...');
      
      // Aguardar um tempo simulado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('[SimpleSync] Sincronização simulada concluída com sucesso');

    } catch (error) {
      console.error('[SimpleSync] Erro durante sincronização:', error);
    } finally {
      this.isSyncing = false;
      const duration = Date.now() - startTime;
      console.log(`[SimpleSync] Sincronização finalizada em ${duration}ms`);
    }
  }

  // Registrar evento de sincronização
  recordEvent(type: string, entity: string, entityId: string, data: any) {
    console.log(`[SimpleSync] Evento registrado: ${type}.${entity}#${entityId}`);
  }

  // Obter estatísticas simplificadas
  getStats() {
    return {
      syncEvents: {
        total: 0,
        pending: 0,
        synced: 0,
        failed: 0
      },
      offlineCache: {
        total: 0,
        expired: 0
      },
      offlineOperations: {
        total: 0,
        pending: 0,
        completed: 0,
        failed: 0
      }
    };
  }
}

// Exportar instância singleton
export const simpleSyncService = new SimpleSyncService();