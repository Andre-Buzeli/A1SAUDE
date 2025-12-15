import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar estabelecimento de teste primeiro
  const hospital = await prisma.establishment.upsert({
    where: { cnesCode: '1234567' },
    update: {},
    create: {
      name: 'Hospital Municipal Teste',
      cnesCode: '1234567',
      type: 'hospital',
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

  // Criar usuário admin de teste
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@a1saude.com' },
    update: {},
    create: {
      email: 'admin@a1saude.com',
      passwordHash: hashedPassword,
      name: 'Administrador A1 Saúde',
      cpf: '12345678901',
      phone: '(11) 98765-4321',
      profile: 'gestor_geral',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name,
      isActive: true,
    },
  });

  console.log('✅ Usuário admin criado:', adminUser.email);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('📧 Login: admin@a1saude.com');
  console.log('🔑 Senha: admin123');
  console.log('🏥 Estabelecimento:', hospital.name);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });