import express from 'express';
import { PrismaClient } from '@prisma/client';
import { OfflineCacheService } from '../services/OfflineCacheService';
import { SyncService } from '../services/SyncService';

const router = express.Router();
const prisma = new PrismaClient();

let offlineCacheService: OfflineCacheService | null = null;
let syncService: SyncService | null = null;

export function setSyncServices(cacheService: OfflineCacheService | null, syncSvc: SyncService | any) {
  offlineCacheService = cacheService;
  syncService = syncSvc;
}

router.get('/stats', async (req, res) => {
  try {
    const stats = await prisma.$queryRaw<{
      pending: number;
      synced: number;
      failed: number;
      last_sync: Date | null;
    }[]>`
      SELECT 
        COUNT(CASE WHEN synced = false AND retry_count < 3 THEN 1 END) as pending,
        COUNT(CASE WHEN synced = true THEN 1 END) as synced,
        COUNT(CASE WHEN synced = false AND retry_count >= 3 THEN 1 END) as failed,
        MAX(synced_at) as last_sync
      FROM sync_events
    `;

    res.json({
      success: true,
      data: {
        pending: Number(stats[0]?.pending || 0),
        synced: Number(stats[0]?.synced || 0),
        failed: Number(stats[0]?.failed || 0),
        lastSync: stats[0]?.last_sync || null
      }
    });
  } catch (error) {
    console.error('[SyncStats] Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas de sincronização'
    });
  }
});

router.get('/pending', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const pendingEvents = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        table_name as tableName,
        operation,
        record_id as recordId,
        timestamp,
        retry_count as retryCount,
        last_retry_at as lastRetryAt,
        last_error as lastError
      FROM sync_events 
      WHERE synced = false AND retry_count < 3
      ORDER BY timestamp ASC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const total = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM sync_events 
      WHERE synced = false AND retry_count < 3
    `;

    res.json({
      success: true,
      data: {
        events: pendingEvents,
        pagination: {
          total: Number(total[0]?.count || 0),
          limit: Number(limit),
          offset: Number(offset)
        }
      }
    });
  } catch (error) {
    console.error('[SyncPending] Erro ao listar eventos pendentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar eventos pendentes'
    });
  }
});

router.get('/synced', async (req, res) => {
  try {
    const { limit = 50, offset = 0, days = 7 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));
    
    const syncedEvents = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        table_name as tableName,
        operation,
        record_id as recordId,
        timestamp,
        synced_at as syncedAt,
        retry_count as retryCount
      FROM sync_events 
      WHERE synced = true AND synced_at >= ${cutoffDate}
      ORDER BY synced_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const total = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM sync_events 
      WHERE synced = true AND synced_at >= ${cutoffDate}
    `;

    res.json({
      success: true,
      data: {
        events: syncedEvents,
        pagination: {
          total: Number(total[0]?.count || 0),
          limit: Number(limit),
          offset: Number(offset)
        }
      }
    });
  } catch (error) {
    console.error('[SyncSynced] Erro ao listar eventos sincronizados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar eventos sincronizados'
    });
  }
});

router.post('/trigger', async (req, res) => {
  try {
    if (!syncService) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de sincronização não está disponível'
      });
    }

    await syncService.sync();

    res.json({
      success: true,
      message: 'Sincronização manual iniciada com sucesso'
    });
  } catch (error) {
    console.error('[SyncTrigger] Erro ao executar sincronização manual:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao executar sincronização manual'
    });
  }
});

router.delete('/cleanup', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));

    const result = await prisma.$executeRaw`
      DELETE FROM sync_events 
      WHERE synced = true AND synced_at < ${cutoffDate}
    `;

    res.json({
      success: true,
      message: `${Number(result)} eventos antigos removidos`,
      data: {
        deleted: Number(result)
      }
    });
  } catch (error) {
    console.error('[SyncCleanup] Erro ao limpar eventos antigos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar eventos antigos'
    });
  }
});

router.get('/connectivity', async (req, res) => {
  try {
    const centralApiUrl = process.env.CENTRAL_API_URL || 'http://localhost:7001/api/v1';
    const apiKey = process.env.CENTRAL_API_KEY || 'local-system-api-key-2024';

    const axios = require('axios');
    const startTime = Date.now();

    try {
      const response = await axios.get(`${centralApiUrl}/health`, {
        headers: {
          'X-API-Key': apiKey,
          'X-Establishment-Id': process.env.ESTABLISHMENT_ID || 'local-establishment'
        },
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          connected: true,
          responseTime,
          centralStatus: response.data,
          lastCheck: new Date().toISOString()
        }
      });
    } catch (error) {
      res.json({
        success: true,
        data: {
          connected: false,
          error: error.message,
          lastCheck: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('[SyncConnectivity] Erro ao verificar conectividade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar conectividade'
    });
  }
});

router.get('/offline-cache/stats', async (req, res) => {
  try {
    if (!offlineCacheService) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de cache offline não está disponível'
      });
    }

    const stats = await offlineCacheService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[OfflineCacheStats] Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas do cache offline'
    });
  }
});

router.get('/offline-cache/:key', async (req, res) => {
  try {
    if (!offlineCacheService) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de cache offline não está disponível'
      });
    }

    const { key } = req.params;
    const data = await offlineCacheService.get(key);
    
    if (data === null) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado no cache'
      });
    }
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('[OfflineCacheGet] Erro ao obter item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter item do cache'
    });
  }
});

router.post('/offline-cache', async (req, res) => {
  try {
    if (!offlineCacheService) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de cache offline não está disponível'
      });
    }

    const { key, data, ttl, tags, priority } = req.body;
    
    if (!key || data === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Key e data são obrigatórios'
      });
    }
    
    await offlineCacheService.set(key, data, ttl, tags, priority);
    
    res.json({
      success: true,
      message: 'Item armazenado no cache com sucesso'
    });
  } catch (error) {
    console.error('[OfflineCacheSet] Erro ao armazenar item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao armazenar item no cache'
    });
  }
});

router.delete('/offline-cache/:key', async (req, res) => {
  try {
    if (!offlineCacheService) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de cache offline não está disponível'
      });
    }

    const { key } = req.params;
    await offlineCacheService.delete(key);
    
    res.json({
      success: true,
      message: 'Item removido do cache com sucesso'
    });
  } catch (error) {
    console.error('[OfflineCacheDelete] Erro ao deletar item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar item do cache'
    });
  }
});

router.delete('/offline-cache/expired', async (req, res) => {
  try {
    if (!offlineCacheService) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de cache offline não está disponível'
      });
    }

    await offlineCacheService.cleanupExpired();
    
    res.json({
      success: true,
      message: 'Cache expirado limpo com sucesso'
    });
  } catch (error) {
    console.error('[OfflineCacheClearExpired] Erro ao limpar cache expirado:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar cache expirado'
    });
  }
});

export default router;