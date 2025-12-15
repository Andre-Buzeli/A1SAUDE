import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../core/services/LoggerService';

/**
 * Estende a interface Request do Express para incluir contexto de log
 */
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
      logContext?: {
        requestId: string;
        userId?: string;
        ipAddress: string;
        userAgent?: string;
      };
    }
  }
}

/**
 * Middleware de logging de requisições
 * 
 * Adiciona contexto de requisição (requestId, userId, ipAddress) a todas as requisições
 * e registra logs estruturados de entrada e saída
 */
export function createRequestLoggerMiddleware(loggerService: LoggerService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Gerar ID único para a requisição
    const requestId = uuidv4();
    req.requestId = requestId;
    req.startTime = Date.now();

    // Extrair informações da requisição
    const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown').replace('::ffff:', '');
    const userAgent = req.get('user-agent');
    const method = req.method;
    const path = req.path;

    // Criar contexto de log
    req.logContext = {
      requestId,
      ipAddress,
      userAgent
    };

    // Log de entrada da requisição
    loggerService.debug(`Incoming request: ${method} ${path}`, {
      requestId,
      method,
      path,
      ipAddress,
      userAgent,
      query: req.query,
      body: sanitizeRequestBody(req.body)
    });

    // Interceptar o método res.send para capturar a resposta
    const originalSend = res.send;
    res.send = function (data: any): Response {
      // Calcular duração da requisição
      const duration = req.startTime ? Date.now() - req.startTime : 0;
      const statusCode = res.statusCode;

      // Adicionar userId ao contexto se disponível (após autenticação)
      if ((req as any).user?.id) {
        req.logContext!.userId = (req as any).user.id;
      }

      // Log de saída da requisição
      loggerService.logRequest(method, path, statusCode, duration, req.logContext);

      // Chamar o método original
      return originalSend.call(this, data);
    };

    // Interceptar erros
    res.on('finish', () => {
      // Se houver erro (status >= 400), já foi logado pelo logRequest
      // Não precisamos fazer nada aqui
    });

    next();
  };
}

/**
 * Sanitiza o body da requisição removendo campos sensíveis
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'authorization',
    'creditCard',
    'cvv',
    'ssn',
    'cpf'
  ];

  const sanitized: any = Array.isArray(body) ? [] : {};

  for (const key in body) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof body[key] === 'object' && body[key] !== null) {
      sanitized[key] = sanitizeRequestBody(body[key]);
    } else {
      sanitized[key] = body[key];
    }
  }

  return sanitized;
}

/**
 * Middleware para adicionar userId ao contexto de log após autenticação
 */
export function addUserToLogContext(req: Request, res: Response, next: NextFunction): void {
  if ((req as any).user?.id && req.logContext) {
    req.logContext.userId = (req as any).user.id;
  }
  next();
}
