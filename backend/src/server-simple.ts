// Servidor simplificado para testar sincronização
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import Database from 'better-sqlite3';
import { join } from 'path';

const app = express();
const PORT = process.env.PORT || 6001;

// Initialize SQLite database
const dbPath = join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    // Test database connection
    db.prepare('SELECT 1 as health_check').get();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        sync: 'enabled'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Sync stats endpoint
app.get('/api/v1/sync/stats', (req, res) => {
  try {
    const stats = {
      syncEvents: {
        total: db.prepare('SELECT COUNT(*) as count FROM "SyncEvent"').get().count,
        pending: db.prepare('SELECT COUNT(*) as count FROM "SyncEvent" WHERE status = "pending"').get().count,
        synced: db.prepare('SELECT COUNT(*) as count FROM "SyncEvent" WHERE status = "synced"').get().count,
        failed: db.prepare('SELECT COUNT(*) as count FROM "SyncEvent" WHERE status = "failed"').get().count
      },
      offlineCache: {
        total: db.prepare('SELECT COUNT(*) as count FROM "OfflineCache"').get().count,
        expired: db.prepare('SELECT COUNT(*) as count FROM "OfflineCache" WHERE "expiresAt" < ?').get(new Date().toISOString()).count
      },
      offlineOperations: {
        total: db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation"').get().count,
        pending: db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation" WHERE status = "pending"').get().count,
        completed: db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation" WHERE status = "completed"').get().count,
        failed: db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation" WHERE status = "failed"').get().count
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Sync trigger endpoint
app.post('/api/v1/sync/trigger', (req, res) => {
  try {
    console.log('[Sync] Sincronização manual acionada');
    // Simular sincronização
    setTimeout(() => {
      console.log('[Sync] Sincronização concluída');
    }, 2000);
    
    res.json({ message: 'Sincronização acionada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao acionar sincronização' });
  }
});

// Record sync event endpoint
app.post('/api/v1/sync/events', (req, res) => {
  try {
    const { type, entity, entityId, data } = req.body;
    
    if (!type || !entity || !entityId) {
      return res.status(400).json({ error: 'Campos obrigatórios: type, entity, entityId' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO "SyncEvent" (id, type, entity, "entityId", data, timestamp, status, "retryCount", "createdAt", "updatedAt")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const now = new Date().toISOString();
    const dataStr = JSON.stringify(data || {});
    
    stmt.run(
      id,
      type,
      entity,
      entityId,
      dataStr,
      now,
      'pending',
      0,
      now,
      now
    );
    
    console.log(`[Sync] Evento registrado: ${type}.${entity}#${entityId}`);
    
    res.json({ 
      message: 'Evento de sincronização registrado com sucesso',
      eventId: id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar evento' });
  }
});

// Basic API routes
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 A1 Saúde Server (Simplificado) rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
  console.log(`🔄 Sync stats: http://localhost:${PORT}/api/v1/sync/stats`);
});

export default app;