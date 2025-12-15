import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin de teste
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@a1saude.com' },
    update: {},
    create: {
      email: 'admin@a1saude.com',
      password: hashedPassword,
      name: 'Administrador A1 Saúde',
      role: 'ADMIN',
      cpf: '12345678901',
      phone: '(11) 98765-4321',
      isActive: true,
      twoFactorEnabled: false,
    },
  });

  console.log('✅ Usuário admin criado:', adminUser.email);

  // Criar estabelecimento de teste
  const hospital = await prisma.establishment.upsert({
    where: { cnpj: '12345678000195' },
    update: {},
    create: {
      name: 'Hospital Municipal Teste',
      cnpj: '12345678000195',
      type: 'HOSPITAL',
      street: 'Rua Teste',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000',
      phone: '(11) 3333-4444',
      email: 'hospital@teste.com',
      operatingHours: JSON.stringify({
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '08:00', close: '12:00' },
        sunday: { closed: true }
      }),
      services: JSON.stringify(['emergency', 'surgery', 'consultation']),
      capacity: JSON.stringify({ beds: 100, doctors: 20 }),
      isActive: true,
    },
  });

  console.log('✅ Estabelecimento criado:', hospital.name);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });