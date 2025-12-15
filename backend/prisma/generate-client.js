// Script para gerar cliente Prisma manualmente
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('🔄 Gerando cliente Prisma...');
  
  // Verificar se o schema existe
  const schemaPath = path.join(__dirname, 'schema.prisma');
  if (!fs.existsSync(schemaPath)) {
    throw new Error('Schema.prisma não encontrado');
  }
  
  console.log('📋 Schema encontrado:', schemaPath);
  
  // Gerar cliente
  execSync('npx prisma generate', { 
    cwd: path.dirname(__dirname),
    stdio: 'inherit' 
  });
  
  console.log('✅ Cliente Prisma gerado com sucesso!');
  
} catch (error) {
  console.error('❌ Erro ao gerar cliente Prisma:', error.message);
  process.exit(1);
}