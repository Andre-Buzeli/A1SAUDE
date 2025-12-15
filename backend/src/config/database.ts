/**
 * Configuração do Banco de Dados - Prisma Client
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Configuração do Prisma Client
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
  errorFormat: 'pretty',
});

// Event listeners para logs
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Query: ' + e.query);
    logger.debug('Params: ' + e.params);
    logger.debug('Duration: ' + e.duration + 'ms');
  }
});

prisma.$on('error', (e) => {
  logger.error('Database error:', e);
});

prisma.$on('info', (e) => {
  logger.info('Database info:', e.message);
});

prisma.$on('warn', (e) => {
  logger.warn('Database warning:', e.message);
});

// Função para conectar ao banco
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ Conectado ao banco de dados SQLite');
    
    // Verificar se o banco está funcionando
    await prisma.$queryRaw`SELECT 1 as health_check`;
    logger.info('✅ Banco de dados funcionando corretamente');
    
  } catch (error) {
    logger.error('❌ Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
};

// Função para desconectar do banco
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Desconectado do banco de dados');
  } catch (error) {
    logger.error('❌ Erro ao desconectar do banco de dados:', error);
  }
};

// Função para verificar saúde do banco
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1 as health_check`;
    return true;
  } catch (error) {
    logger.error('❌ Banco de dados não está saudável:', error);
    return false;
  }
};

// Função para executar transações
export const executeTransaction = async <T>(
  callback: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(callback);
};

// Função para executar queries raw
export const executeRawQuery = async (query: string, params?: any[]): Promise<any> => {
  try {
    return await prisma.$queryRawUnsafe(query, ...(params || []));
  } catch (error) {
    logger.error('❌ Erro ao executar query raw:', error);
    throw error;
  }
};

// Função para executar comandos raw
export const executeRawCommand = async (command: string, params?: any[]): Promise<any> => {
  try {
    return await prisma.$executeRawUnsafe(command, ...(params || []));
  } catch (error) {
    logger.error('❌ Erro ao executar comando raw:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default prisma;