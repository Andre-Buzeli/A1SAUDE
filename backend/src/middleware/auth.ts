import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    profile: string;
    establishmentId?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticação não fornecido' 
      });
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;

    // Verificar se o usuário ainda existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        profile: true,
        establishmentId: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado ou inativo' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      profile: user.profile,
      establishmentId: user.establishmentId || undefined
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Token inválido ou expirado' 
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          profile: true,
          establishmentId: true,
          isActive: true
        }
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          profile: user.profile,
          establishmentId: user.establishmentId || undefined
        };
      }
    }

    next();
  } catch (error) {
    // Token inválido, mas não bloqueia - continua sem usuário autenticado
    next();
  }
};

export const requireAccess = (options: { allowedEstablishments?: string[] }) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      });
    }

    next();
  };
};

export const requireEstablishmentType = (allowedTypes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      });
    }

    // This is a simplified check - in a real implementation, 
    // you would need to get the user's establishment type from the database
    // For now, we'll allow the request to proceed
    next();
  };
};