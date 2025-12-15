import rateLimit from 'express-rate-limit';

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Muitas requisições deste IP, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    message: 'Muitas tentativas de login, tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

export const forgotPasswordRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 forgot password requests per hour
  message: {
    success: false,
    message: 'Muitas solicitações de recuperação de senha, tente novamente em 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const twoFactorRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 2FA requests per windowMs
  message: {
    success: false,
    message: 'Muitas tentativas de autenticação em dois fatores, tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const refreshTokenRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // limit each IP to 30 refresh token requests per hour
  message: {
    success: false,
    message: 'Muitas tentativas de atualização de token, tente novamente em 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 API requests per windowMs
  message: {
    success: false,
    message: 'Muitas requisições à API, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});