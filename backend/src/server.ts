import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Import environment service and service manager
import { environmentService } from './config/env';
import { serviceManager } from './core/ServiceManager';
import { DatabaseService } from './core/services/DatabaseService';
import { RedisService } from './core/services/RedisService';
import { SyncServiceWrapper } from './core/services/SyncServiceWrapper';
import { LoggerService } from './core/services/LoggerService';

// Initialize services
const loggerService = new LoggerService();
const databaseService = new DatabaseService();
const redisService = new RedisService();
const syncServiceWrapper = new SyncServiceWrapper();

// Export service instances for backward compatibility
export let prisma: any;
export let redis: any;
export let syncService: any;
export let logger: LoggerService;

const app = express();
const PORT = environmentService.get('PORT');

// Debug middleware - very early
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`[EARLY Debug] ${req.method} ${req.path}`);
    console.log(`[EARLY Debug] Content-Type: ${req.get('Content-Type')}`);
    console.log(`[EARLY Debug] Raw body length:`, req.rawBody ? req.rawBody.length : 'no rawBody');
  }
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration
const corsOrigins = environmentService.getCorsOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origem (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Verificar se a origem está na lista permitida
    if (corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Em produção, aceitar também requisições do frontend interno (nginx)
      if (environmentService.isProduction() && origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: environmentService.get('RATE_LIMIT_WINDOW_MS'),
  max: environmentService.get('RATE_LIMIT_MAX_REQUESTS'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Debug middleware for all requests
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`[Global Debug] ${req.method} ${req.path}`);
    console.log(`[Global Debug] Content-Type: ${req.get('Content-Type')}`);
    console.log(`[Global Debug] Body type:`, typeof req.body);
    console.log(`[Global Debug] Body:`, req.body);
  }
  next();
});


// Compression middleware - temporarily disabled
// app.use(compression());

// Audit middleware - temporarily disabled for debugging
// app.use(async (req, res, next) => {
//   const startTime = Date.now();

//   // Store original send method
//   const originalSend = res.send;

//   res.send = function(data) {
//     // Log audit events for sensitive operations
//     const auditActions = [
//       'POST /api/patients',
//       'PUT /api/patients',
//       'DELETE /api/patients',
//       'POST /api/prescriptions',
//       'PUT /api/prescriptions',
//       'POST /api/attendances/start',
//       'PUT /api/attendances',
//       'POST /api/admin/users',
//       'PUT /api/admin/users',
//       'PUT /api/admin/users/:id/status',
//       'POST /api/hospital/admissions',
//       'PUT /api/hospital/admissions/:id/discharge'
//     ];

//     const requestPath = `${req.method} ${req.path}`;
//     const shouldAudit = auditActions.some(action => {
//       const actionParts = action.split(' ');
//       if (actionParts.length < 2) return false;
//       const actionPath = actionParts[1];
//       const actionMethod = actionParts[0];
//       return requestPath.includes(actionPath) && req.method === actionMethod;
//     });

//     if (shouldAudit && req.user && req.user.id) {
//       prisma.auditLog.create({
//         data: {
//           userId: req.user.id,
//           action: `${req.method} ${req.path}`,
//           resource: req.path.split('/')[2] || 'unknown',
//           details: {
//             method: req.method,
//             path: req.path,
//             query: req.query,
//             body: req.method !== 'GET' ? req.body : undefined,
//             statusCode: res.statusCode,
//             duration: Date.now() - startTime,
//             userAgent: req.get('User-Agent'),
//             ip: req.ip
//           },
//           ipAddress: req.ip,
//           userAgent: req.get('User-Agent')
//         }
//       }).catch(error => console.error('Audit logging failed:', error));
//     }

//     // Call original send method
//     return originalSend.call(this, data);
//   };

//   next();
// });

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check all services health
    const healthResults = await serviceManager.healthCheckAll();
    
    // Get service status
    const serviceStatus = serviceManager.getStatus();
    
    // Get sync stats if available
    let cacheStats = null;
    if (syncService && typeof syncService.getStats === 'function') {
      try {
        cacheStats = syncService.getStats();
      } catch (error) {
        console.error('[Health] Erro ao obter estatísticas do sync:', error);
      }
    }
    
    // Determine overall health
    const allHealthy = Array.from(healthResults.values()).every(h => h);
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: environmentService.get('NODE_ENV'),
      services: Object.fromEntries(
        serviceStatus.map(s => [
          s.name,
          {
            initialized: s.initialized,
            healthy: healthResults.get(s.name) || false,
            dependencies: s.dependencies
          }
        ])
      ),
      cacheStats: cacheStats
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Import routes
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import attendanceRoutes from './routes/attendances';
import prescriptionRoutes from './routes/prescriptions';
import examRoutes from './routes/exams';
import medicationRoutes from './routes/medications';
import vitalSignsRoutes from './routes/vital-signs';
import nursingRoutes from './routes/nursing';
import adminRoutes from './routes/admin';
import pharmacyRoutes from './routes/pharmacy';
import psychologyRoutes from './routes/psychology';
import physiotherapistRoutes from './routes/physiotherapist';
import directorLocalRoutes from './routes/director-local';
import coordinatorRoutes from './routes/coordinator';
import supervisorRoutes from './routes/supervisor';
import secretaryRoutes from './routes/secretary';
import receptionistRoutes from './routes/receptionist';
import ubsRoutes from './routes/ubs';
import upaRoutes from './routes/upa';
import hospitalRoutes from './routes/hospital';
import reportsRoutes from './routes/reports';
import triageRoutes from './routes/triage';
import medicalRoutes from './routes/medical';
import notificationsRoutes from './routes/notifications';
import syncRoutes, { setSyncServices } from './routes/sync';
import rhRoutes from './routes/rh';
import homeVisitsRoutes from './routes/home-visits';
import surgeryRoutes from './routes/surgery';
import imagingRoutes from './routes/imaging';
import vaccinationRoutes from './routes/vaccination';
import healthProgramsRoutes from './routes/health-programs';
import dentalRoutes from './routes/dental';
import labRoutes from './routes/lab';
import pharmacyStockRoutes from './routes/pharmacy-stock';
import medicationRoomRoutes from './routes/medication-room';
import minorSurgeryRoutes from './routes/minor-surgery';
import emergencyRoutes from './routes/emergency';
import icuRoutes from './routes/icu';
import dischargeRoutes from './routes/discharge';

// Import sync routes
import { syncDatabase } from './services/SyncDatabaseService';

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/attendances', attendanceRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/medications', medicationRoutes);
app.use('/api/v1/vital-signs', vitalSignsRoutes);
app.use('/api/v1/nursing', nursingRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/psychology', psychologyRoutes);
app.use('/api/v1/physiotherapist', physiotherapistRoutes);
app.use('/api/v1/director-local', directorLocalRoutes);
app.use('/api/v1/coordinator', coordinatorRoutes);
app.use('/api/v1/supervisor', supervisorRoutes);
app.use('/api/v1/secretary', secretaryRoutes);
app.use('/api/v1/receptionist', receptionistRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/ubs', ubsRoutes);
app.use('/api/v1/upa', upaRoutes);
app.use('/api/v1/hospital', hospitalRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/triage', triageRoutes);
app.use('/api/v1/medical', medicalRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/rh', rhRoutes);
app.use('/api/v1/home-visits', homeVisitsRoutes);
app.use('/api/v1/surgery', surgeryRoutes);
app.use('/api/v1/imaging', imagingRoutes);
app.use('/api/v1/vaccination', vaccinationRoutes);
app.use('/api/v1/health-programs', healthProgramsRoutes);
app.use('/api/v1/dental', dentalRoutes);
app.use('/api/v1/lab', labRoutes);
app.use('/api/v1/pharmacy-stock', pharmacyStockRoutes);
app.use('/api/v1/medication-room', medicationRoomRoutes);
app.use('/api/v1/minor-surgery', minorSurgeryRoutes);
app.use('/api/v1/emergency', emergencyRoutes);
app.use('/api/v1/icu', icuRoutes);
app.use('/api/v1/discharge', dischargeRoutes);

// Default API route
app.use('/api/v1', (req, res) => {
  res.json({ 
    message: 'A1 Saúde API v1.0.0 - Sistema de Gestão de Saúde Pública',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      admin: '/api/v1/admin',
      patients: '/api/v1/patients',
      attendances: '/api/v1/attendances',
      prescriptions: '/api/v1/prescriptions',
      exams: '/api/v1/exams',
      medications: '/api/v1/medications',
      vitalSigns: '/api/v1/vital-signs',
      nursing: '/api/v1/nursing',
      pharmacy: '/api/v1/pharmacy',
      psychology: '/api/v1/psychology',
      physiotherapist: '/api/v1/physiotherapist',
      directorLocal: '/api/v1/director-local',
      coordinator: '/api/v1/coordinator',
      supervisor: '/api/v1/supervisor',
      secretary: '/api/v1/secretary',
      receptionist: '/api/v1/receptionist',
      ubs: '/api/v1/ubs',
      upa: '/api/v1/upa',
      hospital: '/api/v1/hospital',
      reports: '/api/v1/reports',
      triage: '/api/v1/triage',
      medical: '/api/v1/medical',
      notifications: '/api/v1/notifications',
      sync: '/api/v1/sync',
      rh: '/api/v1/rh',
      homeVisits: '/api/v1/home-visits',
      surgery: '/api/v1/surgery',
      imaging: '/api/v1/imaging',
      vaccination: '/api/v1/vaccination',
      healthPrograms: '/api/v1/health-programs',
      dental: '/api/v1/dental',
      lab: '/api/v1/lab',
      pharmacyStock: '/api/v1/pharmacy-stock',
      medicationRoom: '/api/v1/medication-room',
      minorSurgery: '/api/v1/minor-surgery',
      emergency: '/api/v1/emergency',
      icu: '/api/v1/icu',
      discharge: '/api/v1/discharge',
      health: '/health'
    },
    features: {
      offlineSync: true,
      offlineCache: true,
      centralSync: true
    }
  });
});

// Import error handling middleware
import { createErrorHandler, notFoundHandler } from './middlewares/errorHandler';

// 404 handler - must be before error handler
app.use(notFoundHandler(logger));

// Error handling middleware - must be last
app.use(createErrorHandler(logger));

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (logger) {
    logger.info('SIGTERM received, shutting down gracefully');
  } else {
    console.log('SIGTERM received, shutting down gracefully');
  }
  await serviceManager.shutdownAll();
  process.exit(0);
});

process.on('SIGINT', async () => {
  if (logger) {
    logger.info('SIGINT received, shutting down gracefully');
  } else {
    console.log('SIGINT received, shutting down gracefully');
  }
  await serviceManager.shutdownAll();
  process.exit(0);
});

/**
 * Inicializa todos os serviços usando ServiceManager
 */
async function initializeServices() {
  try {
    console.log('[Server] Inicializando serviços...');

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/13fde11e-4976-4980-8f1d-35463ba02f97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/server.ts:370',message:'Service initialization started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion

    // Registrar serviços com suas dependências
    serviceManager.register(loggerService, []); // Sem dependências - primeiro a ser inicializado
    serviceManager.register(databaseService, ['LoggerService']); // Depende do logger
    serviceManager.register(redisService, ['LoggerService']); // Depende do logger
    serviceManager.register(syncServiceWrapper, ['DatabaseService', 'LoggerService']); // Depende do banco e logger

    // Inicializar todos os serviços
    await serviceManager.initializeAll();

    // Exportar instâncias para compatibilidade com código existente
    logger = loggerService;
    prisma = databaseService.getClient();
    redis = redisService.getClient();
    syncService = syncServiceWrapper.getService();

    // Configurar instância global do logger
    const { setLoggerInstance } = await import('./utils/getLogger');
    setLoggerInstance(loggerService);

    // Configurar rotas de sincronização
    setSyncServices(null, syncService);

    // Adicionar middleware de logging de requisições após inicialização do logger
    const { createRequestLoggerMiddleware } = await import('./middlewares/requestLogger');
    app.use(createRequestLoggerMiddleware(loggerService));

    logger.info('Todos os serviços inicializados com sucesso', {
      environment: environmentService.get('NODE_ENV'),
      port: environmentService.get('PORT')
    });
  } catch (error) {
    console.error('[Server] ✗ Erro ao inicializar serviços:', error);
    throw error;
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 A1 Saúde Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
  console.log(`🌍 Environment: ${environmentService.get('NODE_ENV')}`);
  
  try {
    // Initialize all services
    await initializeServices();
    
    // Log server startup
    if (logger) {
      logger.info('A1 Saúde Server started successfully', {
        port: PORT,
        environment: environmentService.get('NODE_ENV'),
        nodeVersion: process.version
      });
    }
  } catch (error) {
    console.error('[Server] Falha crítica na inicialização. Encerrando...');
    if (logger) {
      logger.error('Critical initialization failure', error);
    }
    process.exit(1);
  }
});

export default app;
