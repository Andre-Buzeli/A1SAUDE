import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Stethoscope, 
  FileText, 
  TestTube, 
  AlertTriangle,
  Pill,
  Activity,
  UserCog,
  Building2,
  DollarSign,
  FileBarChart,
  Heart,
  Calendar,
  ClipboardList,
  Crown,
  MapPin,
  BarChart3,
  Syringe,
  Baby,
  Smile,
  HeartPulse,
  LogOut,
  Package,
  Scissors,
  Home,
  Bed,
  Image,
  Clock
} from 'lucide-react';
import { FileText as DocsIcon } from 'lucide-react';
import DevDocsPage from '@/pages/dev/DevDocsPage';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { DevModeBanner } from '@/components/dev/DevModeBanner';
import DevProfileSelector from '@/components/dev/DevProfileSelector';

interface DevRoute {
  id: string;
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'clinico' | 'admin' | 'especifico' | 'gestao';
  status: 'implemented' | 'partial' | 'planned';
}

const devRoutes: DevRoute[] = [
  // Documentação do Frontend
  {
    id: 'docs',
    path: '/dev/docs',
    label: 'Documentação Frontend',
    description: 'Status atual, roadmap, prioridades e links',
    icon: <DocsIcon className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  // Módulos de Gestão
  {
    id: 'gestor-geral',
    path: '/dev/gestor-geral',
    label: 'Gestor Geral',
    description: 'Visão completa de todos os estabelecimentos e 24 módulos administrativos',
    icon: <Crown className="w-6 h-6" />,
    category: 'gestao',
    status: 'implemented'
  },
  {
    id: 'gestor-local',
    path: '/dev/gestor-local',
    label: 'Gestor Local',
    description: 'Gestão específica de estabelecimento local com funcionalidades direcionadas',
    icon: <MapPin className="w-6 h-6" />,
    category: 'gestao',
    status: 'implemented'
  },
  {
    id: 'gestor-total',
    path: '/dev/gestor-total',
    label: 'Gestor Total',
    description: 'Visão consolidada e relatórios executivos de toda a rede',
    icon: <BarChart3 className="w-6 h-6" />,
    category: 'gestao',
    status: 'implemented'
  },
  // Clínicos
  {
    id: 'patients',
    path: '/dev/patients',
    label: 'Gestão de Pacientes',
    description: 'Lista e cadastro de pacientes',
    icon: <Users className="w-6 h-6" />,
    category: 'clinico',
    status: 'implemented'
  },
  {
    id: 'attendances',
    path: '/dev/attendances',
    label: 'Atendimentos e Consultas',
    description: 'Atendimentos ativos e histórico',
    icon: <Stethoscope className="w-6 h-6" />,
    category: 'clinico',
    status: 'implemented'
  },
  {
    id: 'prescriptions',
    path: '/dev/prescriptions',
    label: 'Prescrições Médicas',
    description: 'Sistema de prescrições digitais',
    icon: <FileText className="w-6 h-6" />,
    category: 'clinico',
    status: 'implemented'
  },
  {
    id: 'exams',
    path: '/dev/exams',
    label: 'Solicitação de Exames',
    description: 'Solicitar e visualizar resultados',
    icon: <TestTube className="w-6 h-6" />,
    category: 'clinico',
    status: 'implemented'
  },
  {
    id: 'triage',
    path: '/dev/triage',
    label: 'Triagem Manchester',
    description: 'Classificação de risco UPA',
    icon: <AlertTriangle className="w-6 h-6" />,
    category: 'clinico',
    status: 'implemented'
  },
  {
    id: 'medications',
    path: '/dev/medications',
    label: 'Administração de Medicamentos',
    description: 'Gestão de medicações',
    icon: <Pill className="w-6 h-6" />,
    category: 'clinico',
    status: 'implemented'
  },
  {
    id: 'vital-signs',
    path: '/dev/vital-signs',
    label: 'Sinais Vitais',
    description: 'Registro e monitoramento',
    icon: <Activity className="w-6 h-6" />,
    category: 'clinico',
    status: 'implemented'
  },
  // Administrativos
  {
    id: 'admin-users',
    path: '/dev/admin/users',
    label: 'Gestão de Usuários',
    description: 'CRUD de usuários e permissões',
    icon: <UserCog className="w-6 h-6" />,
    category: 'admin',
    status: 'planned'
  },
  {
    id: 'admin-establishments',
    path: '/dev/admin/establishments',
    label: 'Gestão de Estabelecimentos',
    description: 'CRUD de estabelecimentos',
    icon: <Building2 className="w-6 h-6" />,
    category: 'admin',
    status: 'planned'
  },
  {
    id: 'admin-financial',
    path: '/dev/admin/financial',
    label: 'Gestão Financeira',
    description: 'Orçamentos, despesas e contratos',
    icon: <DollarSign className="w-6 h-6" />,
    category: 'admin',
    status: 'planned'
  },
  {
    id: 'admin-reports',
    path: '/dev/admin/reports',
    label: 'Relatórios',
    description: 'Geração de relatórios personalizados',
    icon: <FileBarChart className="w-6 h-6" />,
    category: 'admin',
    status: 'planned'
  },
  // Específicos por estabelecimento - UBS
  {
    id: 'vaccinations',
    path: '/dev/ubs/vaccination',
    label: 'Vacinação',
    description: 'Controle de imunização UBS',
    icon: <Syringe className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'health-programs',
    path: '/dev/ubs/health-programs',
    label: 'Programas de Saúde',
    description: 'Hiperdia, Pré-natal, Puericultura, Idosos',
    icon: <Heart className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'dental',
    path: '/dev/ubs/dental',
    label: 'Odontologia',
    description: 'Atendimentos odontológicos UBS',
    icon: <Smile className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'home-visits',
    path: '/dev/ubs/home-visits',
    label: 'Visitas Domiciliares',
    description: 'Gestão de visitas ACS',
    icon: <Home className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  // Específicos por estabelecimento - Hospital
  {
    id: 'emergency',
    path: '/dev/hospital/emergency',
    label: 'Pronto Socorro',
    description: 'Emergências e classificação Manchester',
    icon: <AlertTriangle className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'icu',
    path: '/dev/hospital/icu',
    label: 'UTI',
    description: 'Unidade de Terapia Intensiva',
    icon: <HeartPulse className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'lab',
    path: '/dev/hospital/lab',
    label: 'Laboratório',
    description: 'Exames laboratoriais',
    icon: <TestTube className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'discharge',
    path: '/dev/hospital/discharge',
    label: 'Alta Hospitalar',
    description: 'Gestão de altas',
    icon: <LogOut className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'surgery',
    path: '/dev/surgery',
    label: 'Centro Cirúrgico',
    description: 'Agendamento e gestão de cirurgias',
    icon: <Scissors className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'imaging',
    path: '/dev/imaging',
    label: 'Centro de Imagem',
    description: 'Exames de imagem (RX, TC, RM, USG)',
    icon: <Image className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  // Específicos por estabelecimento - UPA
  {
    id: 'medication-room',
    path: '/dev/upa/medication-room',
    label: 'Sala de Medicação',
    description: 'Administração de medicamentos UPA',
    icon: <Pill className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'minor-surgery',
    path: '/dev/upa/minor-surgery',
    label: 'Pequenas Cirurgias',
    description: 'Procedimentos ambulatoriais UPA',
    icon: <Scissors className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  // Farmácia
  {
    id: 'pharmacy-stock',
    path: '/dev/pharmacy-stock',
    label: 'Estoque Farmácia',
    description: 'Controle de medicamentos e insumos',
    icon: <Package className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  // RH
  {
    id: 'rh',
    path: '/dev/rh',
    label: 'RH Dashboard',
    description: 'Dashboard de Recursos Humanos',
    icon: <Users className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'rh-schedules',
    path: '/dev/rh/schedules',
    label: 'Escalas de Trabalho',
    description: 'Turnos 12x36, 24x48, 5x2',
    icon: <Calendar className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'rh-time-records',
    path: '/dev/rh/time-records',
    label: 'Controle de Ponto',
    description: 'Registro entrada/saída',
    icon: <Clock className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'rh-vacations',
    path: '/dev/rh/vacations',
    label: 'Gestão de Férias',
    description: 'Solicitações e aprovações',
    icon: <Calendar className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  {
    id: 'rh-payroll',
    path: '/dev/rh/payroll',
    label: 'Folha de Pagamento',
    description: 'Cálculo de salários e holerites',
    icon: <DollarSign className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  },
  // Leitos
  {
    id: 'beds',
    path: '/dev/beds',
    label: 'Gestão de Leitos',
    description: 'Mapa visual de leitos hospitalares',
    icon: <Bed className="w-6 h-6" />,
    category: 'especifico',
    status: 'implemented'
  }
];

const getStatusColor = (status: DevRoute['status']) => {
  switch (status) {
    case 'implemented':
      return 'border-green-400/50 bg-green-500/10';
    case 'partial':
      return 'border-yellow-400/50 bg-yellow-500/10';
    case 'planned':
      return 'border-gray-400/50 bg-gray-500/10';
    default:
      return 'border-gray-400/50 bg-gray-500/10';
  }
};

const getStatusLabel = (status: DevRoute['status']) => {
  switch (status) {
    case 'implemented':
      return '✅ Implementado';
    case 'partial':
      return '🔄 Parcial';
    case 'planned':
      return '📋 Planejado';
    default:
      return '📋 Planejado';
  }
};

export const DevRoutesPage: React.FC = () => {
  const routesByCategory = {
    gestao: devRoutes.filter(r => r.category === 'gestao'),
    clinico: devRoutes.filter(r => r.category === 'clinico'),
    admin: devRoutes.filter(r => r.category === 'admin'),
    especifico: devRoutes.filter(r => r.category === 'especifico')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DevModeBanner />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            🚧 Modo Desenvolvimento
          </h1>
          <p className="text-text-secondary text-lg">
            Visualize todas as telas em desenvolvimento sem necessidade de login
          </p>
        </motion.div>

        {/* Dev Profile Selector */}
        <DevProfileSelector />

        {/* Categoria: Módulos Gestão */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <Crown className="w-6 h-6 mr-2 text-yellow-400" />
            Módulos Gestão
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routesByCategory.gestao.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={route.path}>
                  <GlassCard variant="interactive" className="p-6 h-full">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-yellow-400/20 text-yellow-400">
                        {route.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {route.label}
                        </h3>
                        <p className="text-sm text-text-secondary mb-3">
                          {route.description}
                        </p>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(route.status)} text-white`}>
                          {getStatusLabel(route.status)}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Categoria: Clínicos */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <Stethoscope className="w-6 h-6 mr-2 text-medical-blue" />
            Módulos Clínicos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routesByCategory.clinico.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={route.path}>
                  <GlassCard variant="interactive" className="p-6 h-full">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-medical-blue/20 text-medical-blue">
                        {route.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {route.label}
                        </h3>
                        <p className="text-sm text-text-secondary mb-3">
                          {route.description}
                        </p>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(route.status)} text-white`}>
                          {getStatusLabel(route.status)}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Categoria: Administrativos */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <UserCog className="w-6 h-6 mr-2 text-medical-purple" />
            Módulos Administrativos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routesByCategory.admin.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={route.path}>
                  <GlassCard variant="interactive" className="p-6 h-full">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-medical-purple/20 text-medical-purple">
                        {route.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {route.label}
                        </h3>
                        <p className="text-sm text-text-secondary mb-3">
                          {route.description}
                        </p>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(route.status)} text-white`}>
                          {getStatusLabel(route.status)}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Categoria: Específicos */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-medical-green" />
            Módulos Específicos por Estabelecimento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routesByCategory.especifico.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={route.path}>
                  <GlassCard variant="interactive" className="p-6 h-full">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-medical-green/20 text-medical-green">
                        {route.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {route.label}
                        </h3>
                        <p className="text-sm text-text-secondary mb-3">
                          {route.description}
                        </p>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(route.status)} text-white`}>
                          {getStatusLabel(route.status)}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <GlassCard className="p-6">
            <p className="text-text-secondary mb-4">
              📝 <strong>Nota:</strong> Todas as telas aqui são previews em desenvolvimento.
              Algumas funcionalidades podem não estar completamente implementadas.
            </p>
            <Link to="/login">
              <GlassButton variant="ghost">
                Ir para Login
              </GlassButton>
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
