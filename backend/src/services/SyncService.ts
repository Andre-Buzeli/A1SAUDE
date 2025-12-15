import axios from 'axios';
import { SecureCommunicationService, createSecureCommunicationService } from './SecureCommunicationService';
import { syncDatabase } from './SyncDatabaseService';

interface SyncEvent {
  id: string;
  tableName: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  recordId: string;
  data: any;
  timestamp: Date;
  synced: boolean;
  retryCount: number;
  lastError?: string;
}

interface SyncResponse {
  success: boolean;
  syncedEvents: string[];
  conflicts?: Array<{
    eventId: string;
    conflictType: string;
    resolution: string;
  }>;
}

export class SyncService {
  private centralApiUrl: string;
  private apiKey: string;
  private syncInterval: number;
  private batchSize: number;
  private maxRetries: number;
  private retryDelay: number;
  private isSyncing: boolean = false;
  private syncTimer?: NodeJS.Timeout;
  private secureComm: SecureCommunicationService;
  private establishmentId: string;

  constructor(
    centralApiUrl: string,
    apiKey: string,
    syncInterval: number = 300000,
    batchSize: number = 100,
    maxRetries: number = 3,
    retryDelay: number = 1000,
    establishmentId: string = 'local-establishment'
  ) {
    this.centralApiUrl = centralApiUrl;
    this.apiKey = apiKey;
    this.syncInterval = syncInterval;
    this.batchSize = batchSize;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.establishmentId = establishmentId;
    this.secureComm = createSecureCommunicationService();
  }

  start() {
    if (this.syncTimer) {
      console.log('[SyncService] Sincronização já está em execução');
      return;
    }

    console.log('[SyncService] Iniciando serviço de sincronização');
    
    this.sync().catch(error => {
      console.error('[SyncService] Erro na sincronização inicial:', error);
    });

    this.syncTimer = setInterval(() => {
      this.sync().catch(error => {
        console.error('[SyncService] Erro na sincronização periódica:', error);
      });
    }, this.syncInterval);

    console.log(`[SyncService] Sincronização agendada a cada ${this.syncInterval}ms`);
  }

  stop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
      console.log('[SyncService] Serviço de sincronização parado');
    }
  }

  async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('[SyncService] Sincronização já em andamento, ignorando...');
      return;
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      console.log('[SyncService] Iniciando sincronização...');

      const pendingEvents = await this.prisma.$queryRaw<SyncEvent[]>`
        SELECT * FROM sync_events 
        WHERE synced = false AND retry_count < ${this.maxRetries}
        ORDER BY timestamp ASC
        LIMIT ${this.batchSize}
      `;

      if (pendingEvents.length === 0) {
        console.log('[SyncService] Nenhum evento pendente para sincronização');
        return;
      }

      console.log(`[SyncService] Encontrados ${pendingEvents.length} eventos pendentes`);

      const eventsToSync = pendingEvents.map(event => ({
        id: event.id,
        tableName: event.tableName,
        operation: event.operation,
        recordId: event.recordId,
        data: JSON.parse(event.data),
        timestamp: event.timestamp,
        establishmentId: this.establishmentId
      }));

      const response = await this.sendEventsToCentral(eventsToSync);

      if (response.success) {
        await this.markEventsAsSynced(response.syncedEvents);
        
        console.log(`[SyncService] ${response.syncedEvents.length} eventos sincronizados com sucesso`);
        
        if (response.conflicts && response.conflicts.length > 0) {
          console.warn(`[SyncService] ${response.conflicts.length} conflitos detectados e resolvidos`);
          await this.handleConflicts(response.conflicts);
        }
      } else {
        throw new Error('Falha na sincronização com o sistema central');
      }

    } catch (error) {
      console.error('[SyncService] Erro durante sincronização:', error);
      
      await this.incrementRetryCount();
      
      await this.delay(this.retryDelay);
      
    } finally {
      this.isSyncing = false;
      const duration = Date.now() - startTime;
      console.log(`[SyncService] Sincronização finalizada em ${duration}ms`);
    }
  }

  private async sendEventsToCentral(events: any[]): Promise<SyncResponse> {
    try {
      const securePackage = this.secureComm.createSecureSyncPackage(events, this.establishmentId);
      
      const securityHeaders = this.secureComm.createSecurityHeaders(this.establishmentId, {
        'X-API-Key': this.apiKey,
        'User-Agent': 'A1-Saude-Local-System/1.0'
      });

      const response = await axios.post(
        `${this.centralApiUrl}/sync/events`,
        securePackage,
        {
          headers: {
            ...securityHeaders,
            'Content-Type': 'application/json'
          },
          timeout: 30000,
          validateStatus: (status) => status >= 200 && status < 500
        }
      );

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Erro de rede: ${error.message}`);
      }
      throw error;
    }
  }

  private async markEventsAsSynced(eventIds: string[]): Promise<void> {
    if (eventIds.length === 0) return;

    await this.prisma.$executeRaw`
      UPDATE sync_events 
      SET synced = true, synced_at = ${new Date()}
      WHERE id IN (${eventIds.join(',')})
    `;
  }

  private async incrementRetryCount(): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE sync_events 
      SET retry_count = retry_count + 1, last_retry_at = ${new Date()}
      WHERE synced = false
    `;
  }

  private async handleConflicts(conflicts: any[]): Promise<void> {
    for (const conflict of conflicts) {
      console.warn(`[SyncService] Conflito resolvido: ${conflict.conflictType} - ${conflict.resolution}`);
    }
  }

  async recordEvent(
    tableName: string,
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
    recordId: string,
    data: any,
    establishmentId: string
  ): Promise<void> {
    const eventId = crypto.randomUUID();
    const timestamp = new Date();

    try {
      await this.prisma.$executeRaw`
        INSERT INTO sync_events (
          id, table_name, operation, record_id, data, timestamp, 
          establishment_id, synced, retry_count
        ) VALUES (
          ${eventId}, ${tableName}, ${operation}, ${recordId}, 
          ${JSON.stringify(data)}, ${timestamp}, ${establishmentId}, 
          false, 0
        )
      `;

      console.log(`[SyncService] Evento registrado: ${tableName}.${operation}#${recordId}`);
    } catch (error) {
      console.error('[SyncService] Erro ao registrar evento:', error);
      throw error;
    }
  }

  async getSyncStats(): Promise<{
    pending: number;
    synced: number;
    failed: number;
    lastSync: Date | null;
  }> {
    const stats = await this.prisma.$queryRaw<{
      pending: number;
      synced: number;
      failed: number;
      last_sync: Date | null;
    }[]>`
      SELECT 
        COUNT(CASE WHEN synced = false AND retry_count < ${this.maxRetries} THEN 1 END) as pending,
        COUNT(CASE WHEN synced = true THEN 1 END) as synced,
        COUNT(CASE WHEN synced = false AND retry_count >= ${this.maxRetries} THEN 1 END) as failed,
        MAX(synced_at) as last_sync
      FROM sync_events
    `;

    return {
      pending: Number(stats[0]?.pending || 0),
      synced: Number(stats[0]?.synced || 0),
      failed: Number(stats[0]?.failed || 0),
      lastSync: stats[0]?.last_sync || null
    };
  }

  async cleanupSyncedEvents(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.$executeRaw`
      DELETE FROM sync_events 
      WHERE synced = true AND synced_at < ${cutoffDate}
    `;

    console.log(`[SyncService] ${result} eventos antigos removidos`);
    return Number(result);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}