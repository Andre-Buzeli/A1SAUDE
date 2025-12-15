import { Router } from 'express';
import { authRoutes } from './authRoutes';
import medicalRoutes from './medical';
import medicalRecordsRoutes from './medical-records';
import { generalRateLimit } from '../middlewares/rateLimit';
import { ResponseUtils } from '../utils/response';

const router = Router();

// Aplicar rate limiting geral
router.use(generalRateLimit);

// Rota de health check
router.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  };
  
  res.status(200).json({
    success: true,
    data: healthCheck
  });
});

// Rota de informações da API
router.get('/info', (req, res) => {
  const apiInfo = {
    name: 'A1 Saúde API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'API para sistema de gestão de saúde municipal',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api/docs', // TODO: Implementar Swagger
    endpoints: {
      auth: '/api/auth',
      health: '/api/health',
      info: '/api/info'
    }
  };

  res.status(200).json({
    success: true,
    data: apiInfo
  });
});

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas médicas
router.use('/medical', medicalRoutes);

// Rotas de prontuário eletrônico
router.use('/medical-records', medicalRecordsRoutes);

// TODO: Adicionar outras rotas quando necessário
// router.use('/users', userRoutes);
// router.use('/establishments', establishmentRoutes);
// router.use('/reports', reportRoutes);

export { router as apiRoutes };