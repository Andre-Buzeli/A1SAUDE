// Servidor de sincronização compilado para JavaScript puro
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 6001;

// Initialize SQLite database
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
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
    // Criar tabelas se não existirem
    db.prepare(`
      CREATE TABLE IF NOT EXISTS "SyncEvent" (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        entity TEXT NOT NULL,
        "entityId" TEXT NOT NULL,
        data TEXT,
        timestamp TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        "retryCount" INTEGER DEFAULT 0,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL
      )
    `).run();

    db.prepare(`
      CREATE TABLE IF NOT EXISTS "OfflineCache" (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        data TEXT NOT NULL,
        "expiresAt" TEXT NOT NULL,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL
      )
    `).run();

    db.prepare(`
      CREATE TABLE IF NOT EXISTS "OfflineOperation" (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        "retryCount" INTEGER DEFAULT 0,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL
      )
    `).run();

    const stats = {
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

    try {
      stats.syncEvents.total = db.prepare('SELECT COUNT(*) as count FROM "SyncEvent"').get().count;
      stats.syncEvents.pending = db.prepare('SELECT COUNT(*) as count FROM "SyncEvent" WHERE status = "pending"').get().count;
      stats.syncEvents.synced = db.prepare('SELECT COUNT(*) as count FROM "SyncEvent" WHERE status = "synced"').get().count;
      stats.syncEvents.failed = db.prepare('SELECT COUNT(*) as count FROM "SyncEvent" WHERE status = "failed"').get().count;
    } catch (e) {
      // Tabela pode não existir ainda
    }

    try {
      stats.offlineCache.total = db.prepare('SELECT COUNT(*) as count FROM "OfflineCache"').get().count;
      stats.offlineCache.expired = db.prepare('SELECT COUNT(*) as count FROM "OfflineCache" WHERE "expiresAt" < ?').get(new Date().toISOString()).count;
    } catch (e) {
      // Tabela pode não existir ainda
    }

    try {
      stats.offlineOperations.total = db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation"').get().count;
      stats.offlineOperations.pending = db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation" WHERE status = "pending"').get().count;
      stats.offlineOperations.completed = db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation" WHERE status = "completed"').get().count;
      stats.offlineOperations.failed = db.prepare('SELECT COUNT(*) as count FROM "OfflineOperation" WHERE status = "failed"').get().count;
    } catch (e) {
      // Tabela pode não existir ainda
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
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
    const { type, entityId, entityType, data, localId, centralId } = req.body;
    
    if (!type || !entityId) {
      return res.status(400).json({ error: 'Campos obrigatórios: type, entityId' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO "SyncEvent" (id, type, entity, "entityId", data, timestamp, status, "retryCount", "createdAt", "updatedAt")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const now = new Date().toISOString();
    const dataStr = JSON.stringify(data || {});
    const entity = entityType || 'Unknown';
    
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
    console.error('Erro ao registrar evento:', error);
    res.status(500).json({ error: 'Erro ao registrar evento' });
  }
});

// Get sync events endpoint
app.get('/api/v1/sync/events', (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM "SyncEvent"';
    const params = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const events = db.prepare(query).all(...params);
    
    // Parse JSON data
    const parsedEvents = events.map(event => ({
      ...event,
      data: event.data ? JSON.parse(event.data) : {}
    }));
    
    res.json({
      events: parsedEvents,
      count: parsedEvents.length,
      status: status || 'all'
    });
  } catch (error) {
    console.error('Erro ao obter eventos:', error);
    res.status(500).json({ error: 'Erro ao obter eventos' });
  }
});

// Basic API routes
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 A1 Saúde Sync Server rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
  console.log(`🔄 Sync stats: http://localhost:${PORT}/api/v1/sync/stats`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    db.close();
    process.exit(0);
  });
});

module.exports = app;