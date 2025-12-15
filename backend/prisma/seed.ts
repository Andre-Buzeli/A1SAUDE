import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create establishments
  const hospital = await prisma.establishment.upsert({
    where: { cnesCode: 'CNES001' },
    update: {},
    create: {
      name: 'Hospital Municipal A1',
      cnesCode: 'CNES001',
      type: 'hospital',
      street: 'Rua das Flores, 123',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      phone: '(11) 1234-5678',
      email: 'hospital@a1saude.com.br',
      operatingHours: JSON.stringify({
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' }
      }),
      services: JSON.stringify(['emergency', 'surgery', 'icu', 'laboratory']),
      capacity: JSON.stringify({
        beds: 100,
        icuBeds: 20,
        emergencyBeds: 15
      })
    }
  });

  const ubs = await prisma.establishment.upsert({
    where: { cnesCode: 'CNES002' },
    update: {},
    create: {
      name: 'UBS Vila Esperança',
      cnesCode: 'CNES002',
      type: 'ubs',
      street: 'Avenida da Saúde, 456',
      number: '456',
      neighborhood: 'Vila Esperança',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-890',
      phone: '(11) 2345-6789',
      email: 'ubs@a1saude.com.br',
      operatingHours: JSON.stringify({
        monday: { open: '07:00', close: '17:00' },
        tuesday: { open: '07:00', close: '17:00' },
        wednesday: { open: '07:00', close: '17:00' },
        thursday: { open: '07:00', close: '17:00' },
        friday: { open: '07:00', close: '17:00' },
        saturday: { open: '08:00', close: '12:00' },
        sunday: { open: 'closed', close: 'closed' }
      }),
      services: JSON.stringify(['consultation', 'vaccination', 'prevention']),
      capacity: JSON.stringify({
        consultationRooms: 8,
        waitingCapacity: 50
      })
    }
  });

  const upa = await prisma.establishment.upsert({
    where: { cnesCode: 'CNES003' },
    update: {},
    create: {
      name: 'UPA 24h Norte',
      cnesCode: 'CNES003',
      type: 'upa',
      street: 'Rua do Socorro, 789',
      number: '789',
      neighborhood: 'Zona Norte',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-123',
      phone: '(11) 3456-7890',
      email: 'upa@a1saude.com.br',
      operatingHours: JSON.stringify({
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' }
      }),
      services: JSON.stringify(['emergency', 'triage', 'observation']),
      capacity: JSON.stringify({
        emergencyBeds: 25,
        observationBeds: 10,
        triageCapacity: 100
      })
    }
  });

  // Create units for each establishment
  await prisma.unit.createMany({
    data: [
      // Hospital units
      { name: 'Emergência', establishmentId: hospital.id, capacity: 15 },
      { name: 'UTI', establishmentId: hospital.id, capacity: 20 },
      { name: 'Centro Cirúrgico', establishmentId: hospital.id, capacity: 8 },
      { name: 'Enfermaria Geral', establishmentId: hospital.id, capacity: 40 },
      
      // UBS units
      { name: 'Consultórios', establishmentId: ubs.id, capacity: 8 },
      { name: 'Sala de Vacinas', establishmentId: ubs.id, capacity: 2 },
      { name: 'Farmácia', establishmentId: ubs.id, capacity: 1 },
      
      // UPA units
      { name: 'Triagem', establishmentId: upa.id, capacity: 5 },
      { name: 'Emergência', establishmentId: upa.id, capacity: 25 },
      { name: 'Observação', establishmentId: upa.id, capacity: 10 }
    ],
    // skipDuplicates: true
  });

  // Hash password for users
  const hashedPassword = await bcrypt.hash('123456', 12);

  // Create users for each profile and establishment (1 por perfil x estabelecimento)
  const users = [
    // System Master (único)
    {
      name: 'Administrador do Sistema',
      email: 'admin@a1saude.com.br',
      cpf: '00000000000',
      profile: 'system_master',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },

    // Gestor Geral (único)
    {
      name: 'Maria Silva',
      email: 'maria.silva@a1saude.com.br',
      cpf: '11111111111',
      profile: 'gestor_geral',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },

    // Diretor Local (por estabelecimento)
    {
      name: 'Pedro Diretor Hospital',
      email: 'pedro.diretor.hospital@a1saude.com.br',
      cpf: '11111111112',
      profile: 'diretor_local',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Ana Diretor UBS',
      email: 'ana.diretor.ubs@a1saude.com.br',
      cpf: '11111111113',
      profile: 'diretor_local',
      establishmentType: 'ubs',
      establishmentId: ubs.id,
      establishmentName: ubs.name
    },
    {
      name: 'Carlos Diretor UPA',
      email: 'carlos.diretor.upa@a1saude.com.br',
      cpf: '11111111114',
      profile: 'diretor_local',
      establishmentType: 'upa',
      establishmentId: upa.id,
      establishmentName: upa.name
    },

    // Gestor Local (por estabelecimento)
    {
      name: 'Roberto Gestor Hospital',
      email: 'roberto.gestor.hospital@a1saude.com.br',
      cpf: '11111111115',
      profile: 'gestor_local',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Lucia Gestor UBS',
      email: 'lucia.gestor.ubs@a1saude.com.br',
      cpf: '11111111116',
      profile: 'gestor_local',
      establishmentType: 'ubs',
      establishmentId: ubs.id,
      establishmentName: ubs.name
    },
    {
      name: 'Paulo Gestor UPA',
      email: 'paulo.gestor.upa@a1saude.com.br',
      cpf: '11111111117',
      profile: 'gestor_local',
      establishmentType: 'upa',
      establishmentId: upa.id,
      establishmentName: upa.name
    },

    // Coordenador Geral (único)
    {
      name: 'Silvia Coordenadora Geral',
      email: 'silvia.coordenadora.geral@a1saude.com.br',
      cpf: '11111111118',
      profile: 'coordenador_geral',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },

    // Coordenador Local (por estabelecimento)
    {
      name: 'Marcos Coordenador Hospital',
      email: 'marcos.coordenador.hospital@a1saude.com.br',
      cpf: '11111111119',
      profile: 'coordenador_local',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Fernanda Coordenador UBS',
      email: 'fernanda.coordenador.ubs@a1saude.com.br',
      cpf: '11111111120',
      profile: 'coordenador_local',
      establishmentType: 'ubs',
      establishmentId: ubs.id,
      establishmentName: ubs.name
    },
    {
      name: 'João Coordenador UPA',
      email: 'joao.coordenador.upa@a1saude.com.br',
      cpf: '11111111121',
      profile: 'coordenador_local',
      establishmentType: 'upa',
      establishmentId: upa.id,
      establishmentName: upa.name
    },

    // Supervisor (por estabelecimento)
    {
      name: 'Ricardo Supervisor Hospital',
      email: 'ricardo.supervisor.hospital@a1saude.com.br',
      cpf: '11111111122',
      profile: 'supervisor',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Tatiana Supervisor UBS',
      email: 'tatiana.supervisor.ubs@a1saude.com.br',
      cpf: '11111111123',
      profile: 'supervisor',
      establishmentType: 'ubs',
      establishmentId: ubs.id,
      establishmentName: ubs.name
    },
    {
      name: 'Gustavo Supervisor UPA',
      email: 'gustavo.supervisor.upa@a1saude.com.br',
      cpf: '11111111124',
      profile: 'supervisor',
      establishmentType: 'upa',
      establishmentId: upa.id,
      establishmentName: upa.name
    },

    // Secretario (por estabelecimento)
    {
      name: 'Laura Secretária Hospital',
      email: 'laura.secretaria.hospital@a1saude.com.br',
      cpf: '11111111125',
      profile: 'secretario',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Eduardo Secretário UBS',
      email: 'eduardo.secretario.ubs@a1saude.com.br',
      cpf: '11111111126',
      profile: 'secretario',
      establishmentType: 'ubs',
      establishmentId: ubs.id,
      establishmentName: ubs.name
    },
    {
      name: 'Cristina Secretária UPA',
      email: 'cristina.secretaria.upa@a1saude.com.br',
      cpf: '11111111127',
      profile: 'secretario',
      establishmentType: 'upa',
      establishmentId: upa.id,
      establishmentName: upa.name
    },

    // Recepcionista (por estabelecimento)
    {
      name: 'Carla Recepcionista Hospital',
      email: 'carla.recepcionista.hospital@a1saude.com.br',
      cpf: '11111111128',
      profile: 'recepcionista',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Bruno Recepcionista UBS',
      email: 'bruno.recepcionista.ubs@a1saude.com.br',
      cpf: '11111111129',
      profile: 'recepcionista',
      establishmentType: 'ubs',
      establishmentId: ubs.id,
      establishmentName: ubs.name
    },
    {
      name: 'Sofia Recepcionista UPA',
      email: 'sofia.recepcionista.upa@a1saude.com.br',
      cpf: '11111111130',
      profile: 'recepcionista',
      establishmentType: 'upa',
      establishmentId: upa.id,
      establishmentName: upa.name
    },

    // Médicos (por estabelecimento)
    {
      name: 'Dr. João Santos Hospital',
      email: 'joao.santos.hospital@a1saude.com.br',
      cpf: '22222222222',
      profile: 'medico',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Dra. Ana Costa UBS',
      email: 'ana.costa.ubs@a1saude.com.br',
      cpf: '33333333333',
      profile: 'medico',
      establishmentType: 'ubs',
      establishmentId: ubs.id,
      establishmentName: ubs.name
    },
    {
      name: 'Dr. Carlos Lima UPA',
      email: 'carlos.lima.upa@a1saude.com.br',
      cpf: '44444444444',
      profile: 'medico',
      establishmentType: 'upa',
      establishmentId: upa.id,
      establishmentName: upa.name
    },

    // Enfermeiros (por estabelecimento)
    {
      name: 'Enfª. Paula Oliveira Hospital',
      email: 'paula.oliveira.hospital@a1saude.com.br',
      cpf: '55555555555',
      profile: 'enfermeiro',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Enfº. Roberto Alves UPA',
      email: 'roberto.alves.upa@a1saude.com.br',
      cpf: '66666666666',
      profile: 'enfermeiro',
      establishmentType: 'upa',
      establishmentId: upa.id,
      establishmentName: upa.name
    },

    // Técnico de Enfermagem (por estabelecimento)
    {
      name: 'Tec. Maria Silva Hospital',
      email: 'maria.silva.tec.hospital@a1saude.com.br',
      cpf: '55555555556',
      profile: 'tecnico_enfermagem',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Tec. José Santos UPA',
      email: 'jose.santos.tec.upa@a1saude.com.br',
      cpf: '66666666667',
      profile: 'tecnico_enfermagem',
      establishmentType: 'upa',
      establishmentId: upa.id,
      establishmentName: upa.name
    },

    // Farmacêutico (por estabelecimento)
    {
      name: 'Farm. Lucia Pereira Hospital',
      email: 'lucia.pereira.hospital@a1saude.com.br',
      cpf: '77777777777',
      profile: 'farmaceutico',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Farm. Ricardo Alves UBS',
      email: 'ricardo.alves.farm.ubs@a1saude.com.br',
      cpf: '77777777778',
      profile: 'farmaceutico',
      establishmentType: 'ubs',
      establishmentId: ubs.id,
      establishmentName: ubs.name
    },
    {
      name: 'Farm. Sandra Costa UPA',
      email: 'sandra.costa.farm.upa@a1saude.com.br',
      cpf: '77777777779',
      profile: 'farmaceutico',
      establishmentType: 'upa',
      establishmentId: upa.id,
      establishmentName: upa.name
    },

    // Psicólogo (por estabelecimento onde aplicável)
    {
      name: 'Psic. Helena Souza Hospital',
      email: 'helena.souza.psic.hospital@a1saude.com.br',
      cpf: '88888888889',
      profile: 'psicologo',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Psic. Marcos Lima UBS',
      email: 'marcos.lima.psic.ubs@a1saude.com.br',
      cpf: '88888888890',
      profile: 'psicologo',
      establishmentType: 'ubs',
      establishmentId: ubs.id,
      establishmentName: ubs.name
    },

    // Fisioterapeuta (por estabelecimento onde aplicável)
    {
      name: 'Fisio. Pedro Santos Hospital',
      email: 'pedro.santos.fisio.hospital@a1saude.com.br',
      cpf: '99999999991',
      profile: 'fisioterapeuta',
      establishmentType: 'hospital',
      establishmentId: hospital.id,
      establishmentName: hospital.name
    },
    {
      name: 'Fisio. Ana Paula UBS',
      email: 'ana.paula.fisio.ubs@a1saude.com.br',
      cpf: '99999999992',
      profile: 'fisioterapeuta',
      establishmentType: 'ubs',
      establishmentId: ubs.id,
      establishmentName: ubs.name
    }
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        passwordHash: hashedPassword,
        profile: userData.profile as any,
        establishmentType: userData.establishmentType as any
      }
    });
  }

  // Create sample patients
  const patients = [
    {
      name: 'José da Silva',
      cpf: '12345678901',
      birthDate: new Date('1980-05-15'),
      gender: 'male',
      maritalStatus: 'married',
      street: 'Rua A, 100',
      number: '100',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000',
      phone: '(11) 9999-1111',
      allergies: JSON.stringify(['penicilina']),
      chronicConditions: JSON.stringify(['hipertensão']),
      medications: JSON.stringify([]),
      bloodType: 'O_POSITIVE'
    },
    {
      name: 'Maria dos Santos',
      cpf: '98765432109',
      birthDate: new Date('1975-08-22'),
      gender: 'female',
      maritalStatus: 'single',
      street: 'Avenida B, 200',
      number: '200',
      neighborhood: 'Vila Nova',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '02000-000',
      phone: '(11) 9999-2222',
      allergies: JSON.stringify([]),
      chronicConditions: JSON.stringify(['diabetes']),
      medications: JSON.stringify([]),
      bloodType: 'A_POSITIVE'
    }
  ];

  for (const patientData of patients) {
    await prisma.patient.upsert({
      where: { cpf: patientData.cpf },
      update: {},
      create: {
        ...patientData,
        gender: patientData.gender as any,
        maritalStatus: patientData.maritalStatus as any,
        bloodType: patientData.bloodType as any
      }
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('📧 Login credentials (password: 123456):');
  console.log('');
  console.log('🔑 ADMINISTRADORES:');
  console.log('   System Master: admin@a1saude.com.br');
  console.log('   Gestor Geral: maria.silva@a1saude.com.br');
  console.log('');
  console.log('🏥 HOSPITAL:');
  console.log('   Diretor Local: pedro.diretor.hospital@a1saude.com.br');
  console.log('   Gestor Local: roberto.gestor.hospital@a1saude.com.br');
  console.log('   Coordenador Local: marcos.coordenador.hospital@a1saude.com.br');
  console.log('   Supervisor: ricardo.supervisor.hospital@a1saude.com.br');
  console.log('   Secretário: laura.secretaria.hospital@a1saude.com.br');
  console.log('   Recepcionista: carla.recepcionista.hospital@a1saude.com.br');
  console.log('   Médico: joao.santos.hospital@a1saude.com.br');
  console.log('   Enfermeiro: paula.oliveira.hospital@a1saude.com.br');
  console.log('   Técnico Enfermagem: maria.silva.tec.hospital@a1saude.com.br');
  console.log('   Farmacêutico: lucia.pereira.hospital@a1saude.com.br');
  console.log('   Psicólogo: helena.souza.psic.hospital@a1saude.com.br');
  console.log('   Fisioterapeuta: pedro.santos.fisio.hospital@a1saude.com.br');
  console.log('');
  console.log('🏥 UBS:');
  console.log('   Diretor Local: ana.diretor.ubs@a1saude.com.br');
  console.log('   Gestor Local: lucia.gestor.ubs@a1saude.com.br');
  console.log('   Coordenador Local: fernanda.coordenador.ubs@a1saude.com.br');
  console.log('   Supervisor: tatiana.supervisor.ubs@a1saude.com.br');
  console.log('   Secretário: eduardo.secretario.ubs@a1saude.com.br');
  console.log('   Recepcionista: bruno.recepcionista.ubs@a1saude.com.br');
  console.log('   Médico: ana.costa.ubs@a1saude.com.br');
  console.log('   Farmacêutico: ricardo.alves.farm.ubs@a1saude.com.br');
  console.log('   Psicólogo: marcos.lima.psic.ubs@a1saude.com.br');
  console.log('   Fisioterapeuta: ana.paula.fisio.ubs@a1saude.com.br');
  console.log('');
  console.log('🚑 UPA:');
  console.log('   Diretor Local: carlos.diretor.upa@a1saude.com.br');
  console.log('   Gestor Local: paulo.gestor.upa@a1saude.com.br');
  console.log('   Coordenador Local: joao.coordenador.upa@a1saude.com.br');
  console.log('   Supervisor: gustavo.supervisor.upa@a1saude.com.br');
  console.log('   Secretário: cristina.secretaria.upa@a1saude.com.br');
  console.log('   Recepcionista: sofia.recepcionista.upa@a1saude.com.br');
  console.log('   Médico: carlos.lima.upa@a1saude.com.br');
  console.log('   Enfermeiro: roberto.alves.upa@a1saude.com.br');
  console.log('   Técnico Enfermagem: jose.santos.tec.upa@a1saude.com.br');
  console.log('   Farmacêutico: sandra.costa.farm.upa@a1saude.com.br');
  console.log('');
  console.log('👥 GERAIS:');
  console.log('   Coordenador Geral: silvia.coordenadora.geral@a1saude.com.br');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });