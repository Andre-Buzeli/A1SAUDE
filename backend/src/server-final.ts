/**
 * Servidor Final - Sistema A1 Saúde
 * Sistema de Gestão de Saúde Pública - VERSÃO OFICIAL
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Configurações
const app = express();
const PORT = 5001;
const prisma = new PrismaClient();

// JWT Secrets
const JWT_ACCESS_SECRET = 'a1-saude-super-secret-jwt-access-key-2024-development-only';
const JWT_REFRESH_SECRET = 'a1-saude-super-secret-jwt-refresh-key-2024-development-only';

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: ['http://localhost:5002', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use(limiter);

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: true
});

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Interface para request autenticado
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware de autenticação
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
        code: 'MISSING_TOKEN'
      });
    }

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as any;
    
    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { establishment: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo',
        code: 'USER_INACTIVE'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
};

// Função para gerar permissões baseadas no perfil
const getUserPermissions = (profileType: string) => {
  const permissionsMap: Record<string, string[]> = {
    SUPER_ADMIN: [
      'admin:full_access',
      'gestor_geral:read',
      'gestor_geral:write',
      'gestor_geral:delete',
      'gestor_geral:admin',
      'upa:access',
      'ubs:access',
      'hospital:access',
      'reports:read',
      'reports:write',
      'audit:read',
      'audit:write'
    ],
    ADMIN_MUNICIPAL: [
      'gestor_geral:read',
      'gestor_geral:write',
      'gestor_geral:delete',
      'upa:access',
      'ubs:access',
      'hospital:access',
      'reports:read',
      'reports:write'
    ],
    GESTOR_HOSPITAL: [
      'hospital:access',
      'gestor_geral:read',
      'patient:read',
      'patient:write',
      'attendance:read',
      'reports:read'
    ],
    GESTOR_UBS: [
      'ubs:access',
      'gestor_geral:read',
      'patient:read',
      'patient:write',
      'attendance:read',
      'reports:read'
    ],
    MEDICO: [
      'medico:read',
      'medico:write',
      'medico:prescricao',
      'medico:exame',
      'medico:procedimento',
      'patient:read',
      'patient:write',
      'attendance:read',
      'attendance:write',
      'upa:access',
      'ubs:access',
      'hospital:access'
    ],
    ENFERMEIRO: [
      'enfermeiro:read',
      'enfermeiro:write',
      'enfermeiro:triage',
      'enfermeiro:medicacao',
      'patient:read',
      'attendance:read',
      'upa:access',
      'ubs:access',
      'hospital:access'
    ],
    FARMACEUTICO: [
      'patient:read',
      'medico:prescricao',
      'upa:access',
      'ubs:access',
      'hospital:access'
    ]
  };

  return permissionsMap[profileType] || [];
};

// ROTAS DA API

// Rota principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'A1 Saúde Backend API - VERSÃO OFICIAL',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Testar conexão com banco
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      message: 'API funcionando',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        database: 'healthy'
      },
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro no health check',
      services: {
        api: 'healthy',
        database: 'unhealthy'
      }
    });
  }
});

// LOGIN
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { emailOrCpf, password, rememberMe = false } = req.body;

    if (!emailOrCpf || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/CPF e senha são obrigatórios',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Buscar usuário por email ou CPF
    let user;
    if (emailOrCpf.includes('@')) {
      user = await prisma.user.findUnique({
        where: { email: emailOrCpf },
        include: { establishment: true }
      });
    } else {
      const cleanCpf = emailOrCpf.replace(/\D/g, '');
      user = await prisma.user.findUnique({
        where: { cpf: cleanCpf },
        include: { establishment: true }
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email/CPF ou senha incorretos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email/CPF ou senha incorretos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo. Entre em contato com o administrador.',
        code: 'USER_INACTIVE'
      });
    }

    // Gerar tokens JWT
    const accessToken = jwt.sign(
      { 
        userId: user.id,
        profileType: user.profileType,
        establishmentId: user.establishmentId
      },
      JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Preparar dados do usuário para resposta
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone,
      profileType: user.profileType,
      establishmentId: user.establishmentId,
      establishmentName: user.establishment?.name,
      establishmentType: user.establishment?.type,
      permissions: getUserPermissions(user.profileType),
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log(`✅ Login bem-sucedido: ${user.name} (${user.email})`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 minutos
          tokenType: 'Bearer'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// LOGOUT
app.post('/api/auth/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no logout'
    });
  }
});

// OBTER DADOS DO USUÁRIO ATUAL
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone,
      profileType: user.profileType,
      establishmentId: user.establishmentId,
      establishmentName: user.establishment?.name,
      establishmentType: user.establishment?.type,
      permissions: getUserPermissions(user.profileType),
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      data: {
        user: userResponse,
        session: {
          id: 'session-id',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          createdAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao obter dados do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao obter dados do usuário'
    });
  }
});

// VALIDAR TOKEN
app.get('/api/auth/validate', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    message: 'Token válido',
    data: { valid: true }
  });
});

// RENOVAR TOKENS
app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token é obrigatório',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Gerar novos tokens
    const newAccessToken = jwt.sign(
      { 
        userId: user.id,
        profileType: user.profileType,
        establishmentId: user.establishmentId
      },
      JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Tokens renovados com sucesso',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 900,
          tokenType: 'Bearer'
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao renovar tokens:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token inválido ou expirado',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl
  });
});

// Error handler global
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// Conectar ao banco e iniciar servidor
async function startServer() {
  try {
    // Conectar ao Prisma
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados SQLite');

    // Verificar se o banco está funcionando
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Banco de dados funcionando corretamente');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 A1 Saúde Backend OFICIAL iniciado com sucesso!');
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`🌍 Ambiente: development`);
      console.log(`🔒 CORS: http://localhost:5173, http://localhost:5002`);
      console.log('');
      console.log('📋 Usuários de teste disponíveis:');
      console.log('• admin@a1saude.gov.br / admin123 (Super Admin)');
      console.log('• maria.santos@hospitalcentral.sp.gov.br / medico123 (Médico)');
      console.log('• carlos.oliveira@upaleste.sp.gov.br / enfermeiro123 (Enfermeiro)');
      console.log('• ana.costa@ubsvilanova.sp.gov.br / gestor123 (Gestor UBS)');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM recebido, encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT recebido, encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Iniciar servidor
startServer();