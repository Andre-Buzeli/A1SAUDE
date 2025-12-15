import { Request, Response, NextFunction } from 'express';
import { OfflineCacheService } from '../services/OfflineCacheService';

export function createOfflineCacheMiddleware(offlineCacheService: OfflineCacheService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const excludedPaths = [
      '/health',
      '/api/v1/auth',
      '/api/v1/sync',
      '/api/v1/admin'
    ];

    const shouldCache = !excludedPaths.some(path => req.path.startsWith(path));
    
    if (!shouldCache) {
      return next();
    }

    const isOnline = res.locals?.isOnline ?? !offlineCacheService.isOffline();
    
    if (isOnline) {
      const originalSend = res.send;
      const startTime = Date.now();

      res.send = function(data: any) {
        res.send = originalSend;

        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheResponse(offlineCacheService, req, data).catch(error => {
            console.error('[OfflineCacheMiddleware] Erro ao armazenar no cache:', error);
          });
        }

        return originalSend.call(this, data);
      };

      return next();
    } else {
      try {
        const cacheKey = generateCacheKey(req);
        const cachedData = await offlineCacheService.get(cacheKey);
        
        if (cachedData !== null) {
          console.log(`[OfflineCacheMiddleware] Servindo do cache: ${cacheKey}`);
          
          res.set({
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey,
            'X-Offline': 'true'
          });
          
          return res.json(cachedData);
        } else {
          console.log(`[OfflineCacheMiddleware] Cache miss: ${cacheKey}`);
          
          res.set({
            'X-Cache': 'MISS',
            'X-Offline': 'true'
          });
          
          return res.status(503).json({
            error: 'Sistema offline e dados não disponíveis em cache',
            message: 'O sistema está operando em modo offline e os dados solicitados não estão disponíveis no cache local.',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('[OfflineCacheMiddleware] Erro ao acessar cache:', error);
        return res.status(503).json({
          error: 'Erro ao acessar cache offline',
          message: 'Ocorreu um erro ao tentar acessar os dados em cache.',
          timestamp: new Date().toISOString()
        });
      }
    }
  };
}

async function cacheResponse(
  offlineCacheService: OfflineCacheService,
  req: Request,
  responseData: any
): Promise<void> {
  try {
    const cacheKey = generateCacheKey(req);
    
    let ttl = 24 * 60 * 60 * 1000;
    
    if (req.path.includes('/patients/')) {
      ttl = 12 * 60 * 60 * 1000;
    } else if (req.path.includes('/attendances/')) {
      ttl = 6 * 60 * 60 * 1000;
    } else if (req.path.includes('/prescriptions/')) {
      ttl = 4 * 60 * 60 * 1000;
    } else if (req.path.includes('/reports/')) {
      ttl = 2 * 60 * 60 * 1000;
    }
    
    const tags = generateCacheTags(req);
    
    let priority: 'high' | 'medium' | 'low' = 'medium';
    if (req.path.includes('/patients/') || req.path.includes('/attendances/')) {
      priority = 'high';
    } else if (req.path.includes('/reports/')) {
      priority = 'low';
    }
    
    let dataToCache = responseData;
    if (typeof responseData === 'string') {
      try {
        dataToCache = JSON.parse(responseData);
      } catch {
        dataToCache = responseData;
      }
    }
    
    await offlineCacheService.set(cacheKey, dataToCache, ttl, tags, priority);
    
    console.log(`[OfflineCacheMiddleware] Resposta cacheada: ${cacheKey}`);
  } catch (error) {
    console.error('[OfflineCacheMiddleware] Erro ao cachear resposta:', error);
    throw error;
  }
}

function generateCacheKey(req: Request): string {
  const path = req.path;
  const queryString = Object.keys(req.query)
    .sort()
    .map(key => `${key}=${req.query[key]}`)
    .join('&');
  
  const key = queryString ? `${path}?${queryString}` : path;
  
  if (req.user && (req.user as any).id) {
    return `user:${(req.user as any).id}:${key}`;
  }
  
  return key;
}

function generateCacheTags(req: Request): string[] {
  const tags: string[] = [];
  const path = req.path;
  
  if (path.includes('/patients')) {
    tags.push('patients');
  } else if (path.includes('/attendances')) {
    tags.push('attendances');
  } else if (path.includes('/prescriptions')) {
    tags.push('prescriptions');
  } else if (path.includes('/exams')) {
    tags.push('exams');
  } else if (path.includes('/medications')) {
    tags.push('medications');
  } else if (path.includes('/reports')) {
    tags.push('reports');
  }
  
  tags.push(`method:${req.method}`);
  
  if (req.user && (req.user as any).id) {
    tags.push(`user:${(req.user as any).id}`);
  }
  
  return tags;
}