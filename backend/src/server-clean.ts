import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

// Middlewares básicos
app.use(cors({
  origin: ['http://localhost:5002', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Dados de usuários de teste (simulando banco de dados)
const testUsers = [
  {
    id: '1',
    name: 'Administrador do Sistema',
    email: 'admin@a1saude.gov.br',
    cpf: '12345678901',
    password: 'admin123',
    profileType: 'SUPER_ADMIN',
    establishmentId: null,
    establishmentName: null,
    establishmentType: null,
    permissions: ['admin:full_access', 'gestor_geral:read', 'gestor_geral:write'],
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: false
  },
  {
    id: '2',
    name: 'Dra. Maria Santos',
    email: 'maria.santos@hospitalcentral.sp.gov.br',
    cpf: '12345678903',
    password: 'medico123',
    profileType: 'MEDICO',
    establishmentId: '1',
    establishmentName: 'Hospital Central Municipal',
    establishmentType: 'HOSPITAL',
    permissions: ['medico:read', 'medico:write', 'medico:prescricao', 'hospital:access'],
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: false
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@upaleste.sp.gov.br',
    cpf: '12345678904',
    password: 'enfermeiro123',
    profileType: 'ENFERMEIRO',
    establishmentId: '2',
    establishmentName: 'UPA Zona Leste',
    establishmentType: 'UPA',
    permissions: ['enfermeiro:read', 'enfermeiro:write', 'enfermeiro:triage', 'upa:access'],
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: false
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@ubsvilanova.sp.gov.br',
    cpf: '12345678905',
    password: 'gestor123',
    profileType: 'GESTOR_UBS',
    establishmentId: '3',
    establishmentName: 'UBS Vila Nova',
    establishmentType: 'UBS',
    permissions: ['ubs:access', 'gestor_geral:read', 'patient:read', 'patient:write'],
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: false
  }
];

// Função para encontrar usuário por email ou CPF
function findUser(emailOrCpf: string) {
  return testUsers.find(user => 
    user.email === emailOrCpf || user.cpf === emailOrCpf.replace(/\D/g, '')
  );
}

// Rota principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'A1 Saúde Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      database: 'healthy'
    }
  });
});

// Rota de login
app.post('/api/auth/login', (req, res) => {
  const { emailOrCpf, password, rememberMe = false } = req.body;

  // Validar dados obrigatórios
  if (!emailOrCpf || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email/CPF e senha são obrigatórios',
      code: 'MISSING_CREDENTIALS'
    });
  }

  // Buscar usuário
  const user = findUser(emailOrCpf);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email/CPF ou senha incorretos',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Verificar senha
  if (user.password !== password) {
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

  // Gerar tokens simulados
  const accessToken = `fake-access-token-${user.id}-${Date.now()}`;
  const refreshToken = `fake-refresh-token-${user.id}-${Date.now()}`;

  // Remover senha da resposta
  const { password: _, ...userWithoutPassword } = user;

  // Login bem-sucedido
  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    data: {
      user: {
        ...userWithoutPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutos
        tokenType: 'Bearer'
      }
    }
  });
});

// Rota de logout
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

// Rota para obter dados do usuário atual
app.get('/api/auth/me', (req, res) => {
  // Simular usuário autenticado (em produção, verificaria o token)
  const user = testUsers[0]; // Retornar admin por padrão
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    data: {
      user: {
        ...userWithoutPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      },
      session: {
        id: 'fake-session-id',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        createdAt: new Date()
      }
    }
  });
});

// Rota para validar token
app.get('/api/auth/validate', (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    data: {
      valid: true
    }
  });
});

// Rota para renovar tokens
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token é obrigatório',
      code: 'MISSING_REFRESH_TOKEN'
    });
  }

  // Simular renovação de tokens
  const newAccessToken = `fake-access-token-renewed-${Date.now()}`;
  const newRefreshToken = `fake-refresh-token-renewed-${Date.now()}`;

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
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 A1 Saúde Backend iniciado na porta ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido, encerrando servidor...');
  process.exit(0);
});