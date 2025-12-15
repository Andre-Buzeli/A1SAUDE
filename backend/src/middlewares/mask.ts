import { Request, Response, NextFunction } from 'express';
import { maskPayload } from '../utils/mask';

function deepMask(obj: any): any {
  if (Array.isArray(obj)) return obj.map(deepMask);
  if (obj && typeof obj === 'object') {
    const masked = maskPayload(obj);
    for (const k of Object.keys(masked)) {
      masked[k] = deepMask(masked[k]);
    }
    return masked;
  }
  return obj;
}

export function maskMiddleware(req: Request, res: Response, next: NextFunction) {
  const shouldMask = (req.query.mask === 'true') || (String(req.headers['x-mask']).toLowerCase() === 'true');
  if (!shouldMask) return next();
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    try {
      const masked = deepMask(body);
      return originalJson(masked);
    } catch {
      return originalJson(body);
    }
  };
  next();
}
