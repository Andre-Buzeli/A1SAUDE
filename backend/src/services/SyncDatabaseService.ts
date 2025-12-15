// Serviço de banco de dados SQLite para sincronização
import Database from 'better-sqlite3';
import { join } from 'path';

export class SyncDatabaseService {
  private db: Database.Database;

  constructor() {
    const dbPath = join(process.cwd(), 'prisma', 'dev.db');
    this.db = new Database(dbPath);
    
    // Habilitar foreign keys
    this.db.pragma('foreign_keys = ON');
    
    console.log('📋 Serviço de banco de dados de sincronização inicializado');
  }

  // Métodos para SyncEvent
  createSyncEvent(event: any) {
    const stmt = this.db.prepare(`
      INSERT INTO "SyncEvent" (id, type, entity, "entityId", data, timestamp, status, "retryCount", "lastError", "createdAt", "updatedAt")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    return stmt.run(
      event.id || this.generateId(),
      event.type,
      event.entity,
      event.entityId,
      JSON.stringify(event.data),
      event.timestamp || now,
      event.status || 'pending',
      event.retryCount || 0,
      event.lastError || null,
      event.createdAt || now,
      event.updatedAt || now
    );
  }

  getPendingSyncEvents(limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM "SyncEvent" 
      WHERE status = 'pending' 
      ORDER BY timestamp ASC 
      LIMIT ?
    `);
    return stmt.all(limit).map(this.rowToSyncEvent);
  }

  updateSyncEventStatus(id: string, status: string, lastError?: string) {
    const stmt = this.db.prepare(`
      UPDATE "SyncEvent" 
      SET status = ?, "lastError" = ?, "updatedAt" = ?, "retryCount" = "retryCount" + 1
      WHERE id = ?
    `);
    return stmt.run(status, lastError || null, new Date().toISOString(), id);
  }

  // Métodos para OfflineCache
  setCache(key: string, data: any, ttl = 3600) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO "OfflineCache" (id, key, data, timestamp, ttl, "expiresAt", "accessCount", "lastAccessed", "createdAt", "updatedAt")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 1000);
    const id = this.generateId();
    
    return stmt.run(
      id,
      key,
      JSON.stringify(data),
      now.toISOString(),
      ttl,
      expiresAt.toISOString(),
      0,
      null,
      now.toISOString(),
      now.toISOString()
    );
  }

  getCache(key: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM "OfflineCache" 
      WHERE key = ? AND "expiresAt" > ?
    `);
    
    const result = stmt.get(key, new Date().toISOString());
    if (!result) return null;
    
    // Atualizar contador de acesso
    const updateStmt = this.db.prepare(`
      UPDATE "OfflineCache" 
      SET "accessCount" = "accessCount" + 1, "lastAccessed" = ?
      WHERE key = ?
    `);
    updateStmt.run(new Date().toISOString(), key);
    
    return this.rowToCache(result);
  }

  cleanupExpiredCache() {
    const stmt = this.db.prepare(`
      DELETE FROM "OfflineCache" 
      WHERE "expiresAt" < ?
    `);
    const result = stmt.run(new Date().toISOString());
    return { deletedCount: result.changes };
  }

  // Métodos para OfflineOperation
  createOfflineOperation(operation: any) {
    const stmt = this.db.prepare(`
      INSERT INTO "OfflineOperation" (id, method, url, headers, body, timestamp, status, "retryCount", "lastError", response, "createdAt", "updatedAt")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    return stmt.run(
      operation.id || this.generateId(),
      operation.method,
      operation.url,
      operation.headers ? JSON.stringify(operation.headers) : null,
      operation.body ? JSON.stringify(operation.body) : null,
      operation.timestamp || now,
      operation.status || 'pending',
      operation.retryCount || 0,
      operation.lastError || null,
      operation.response || null,
      operation.createdAt || now,
      operation.updatedAt || now
    );
  }

  getPendingOperations(limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM "OfflineOperation" 
      WHERE status = 'pending' 
      ORDER BY timestamp ASC 
      LIMIT ?
    `);
    return stmt.all(limit).map(this.rowToOperation);
  }

  updateOperationStatus(id: string, status: string, response?: any, lastError?: string) {
    const stmt = this.db.prepare(`
      UPDATE "OfflineOperation" 
      SET status = ?, response = ?, "lastError" = ?, "updatedAt" = ?, "retryCount" = "retryCount" + 1
      WHERE id = ?
    `);
    return stmt.run(
      status, 
      response ? JSON.stringify(response) : null, 
      lastError || null, 
      new Date().toISOString(), 
      id
    );
  }

  // Métodos auxiliares
  private generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private rowToSyncEvent(row: any) {
    return {
      ...row,
      data: JSON.parse(row.data),
      lastError: row.lastError ? JSON.parse(row.lastError) : null
    };
  }

  private rowToCache(row: any) {
    return {
      ...row,
      data: JSON.parse(row.data)
    };
  }

  private rowToOperation(row: any) {
    return {
      ...row,
      headers: row.headers ? JSON.parse(row.headers) : null,
      body: row.body ? JSON.parse(row.body) : null,
      response: row.response ? JSON.parse(row.response) : null,
      lastError: row.lastError ? JSON.parse(row.lastError) : null
    };
  }

  // Estatísticas
  getSyncStats() {
    const stats = {
      syncEvents: {
        total: this.db.prepare('SELECT COUNT(*) as count FROM "SyncEvent"').get().count,
        pending: this.db.prepare('SELECT COUNT(*) as count FROM "SyncEvent" WHERE status = "pending"').get().count,
        synced: this.db.prepare('SELECT COUNT(*) as count FROM "SyncEvent" WHERE status = "synced"').get().count,
        failed: this.db.prepare('SELECT COUNT(*) as count FROM "SyncEvent" WHERE status = "failed"').get().count
      },
      offlineCache: {
        total: this.db.prepare('SELECT COUNT(*) as count FROM "OfflineCache"').get().count,
        expired: this.db.prepare('SELECT COUNT(*) as count FROM "OfflineCache" WHERE "expiresAt" < ?').get(new Date().toISOString()).count
      },
      offlineOperations: {
        total: this.db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation"').get().count,
        pending: this.db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation" WHERE status = "pending"').get().count,
        completed: this.db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation" WHERE status = "completed"').get().count,
        failed: this.db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation" WHERE status = "failed"').get().count
      }
    };
    
    return stats;
  }

  close() {
    this.db.close();
  }
}

// Exportar instância singleton
export const syncDatabase = new SyncDatabaseService();