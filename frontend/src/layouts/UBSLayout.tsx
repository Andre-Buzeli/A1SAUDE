import React from 'react';
import { 
  Activity, 
  Users, 
  Calendar, 
  Stethoscope, 
  Pill, 
  FileText, 
  Heart,
  Baby,
  UserCheck,
  ClipboardList,
  Syringe,
  Home,
  Shield,
  Brain,
  Smile
} from 'lucide-react';
import BaseLayout from './BaseLayout';
import { useAuth } from '@/contexts/AuthContext';

interface UBSLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const UBSLayout: React.FC<UBSLayoutProps> = ({
  children,
  title,
  className
}) => {
  const { hasPermission, hasAnyPermission } = useAuth();

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Activity className="w-5 h-5" />,
      path: '/ubs/dashboard'
    },
    {
      id: 'appointments',
      label: 'Agendamentos',
      icon: <Calendar className="w-5 h-5" />,
      permissions: ['ubs:appointments'],
      children: [
        {
          id: 'appointments-today',
          label: 'Hoje',
          icon: <Calendar className="w-4 h-4" />,
          path: '/ubs/appointments/today',
          permissions: ['ubs:appointments'],
          badge: '12'
        },
        {
          id: 'appointments-schedule',
          label: 'Agendar',
          icon: <UserCheck className="w-4 h-4" />,
          path: '/ubs/appointments/schedule',
          permissions: ['ubs:appointments']
        },
        {
          id: 'appointments-calendar',
          label: 'Calendário',
          icon: <Calendar className="w-4 h-4" />,
          path: '/ubs/appointments/calendar',
          permissions: ['ubs:appointments']
        }
      ]
    },
    {
      id: 'patients',
      label: 'Pacientes',
      icon: <Users className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'patients-list',
          label: 'Lista de Pacientes',
          icon: <Users className="w-4 h-4" />,
          path: '/ubs/patients',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'patient-register',
          label: 'Cadastrar Paciente',
          icon: <UserCheck className="w-4 h-4" />,
          path: '/ubs/patients/register',
          permissions: ['medico:write', 'enfermeiro:write']
        }
      ]
    },
    {
      id: 'consultations',
      label: 'Consultas',
      icon: <Stethoscope className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'consultations-active',
          label: 'Consultas Ativas',
          icon: <Activity className="w-4 h-4" />,
          path: '/ubs/consultations/active',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'consultations-history',
          label: 'Histórico',
          icon: <FileText className="w-4 h-4" />,
          path: '/ubs/consultations/history',
          permissions: ['medico:read', 'enfermeiro:read']
        }
      ]
    },
    {
      id: 'preventive-care',
      label: 'Cuidados Preventivos',
      icon: <Shield className="w-5 h-5" />,
      permissions: ['ubs:preventive_care'],
      children: [
        {
          id: 'vaccinations',
          label: 'Vacinações',
          icon: <Syringe className="w-4 h-4" />,
          path: '/ubs/vaccinations',
          permissions: ['enfermeiro:read']
        },
        {
          id: 'screening',
          label: 'Rastreamento',
          icon: <ClipboardList className="w-4 h-4" />,
          path: '/ubs/screening',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'health-education',
          label: 'Educação em Saúde',
          icon: <Brain className="w-4 h-4" />,
          path: '/ubs/health-education',
          permissions: ['medico:read', 'enfermeiro:read']
        }
      ]
    },
    {
      id: 'maternal-child',
      label: 'Saúde Materno-Infantil',
      icon: <Baby className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'prenatal',
          label: 'Pré-natal',
          icon: <Heart className="w-4 h-4" />,
          path: '/ubs/prenatal',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'child-care',
          label: 'Puericultura',
          icon: <Baby className="w-4 h-4" />,
          path: '/ubs/child-care',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'family-planning',
          label: 'Planejamento Familiar',
          icon: <Users className="w-4 h-4" />,
          path: '/ubs/family-planning',
          permissions: ['medico:read', 'enfermeiro:read']
        }
      ]
    },
    {
      id: 'chronic-diseases',
      label: 'Doenças Crônicas',
      icon: <Activity className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'diabetes',
          label: 'Diabetes',
          icon: <Activity className="w-4 h-4" />,
          path: '/ubs/chronic/diabetes',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'hypertension',
          label: 'Hipertensão',
          icon: <Heart className="w-4 h-4" />,
          path: '/ubs/chronic/hypertension',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'chronic-monitoring',
          label: 'Monitoramento',
          icon: <ClipboardList className="w-4 h-4" />,
          path: '/ubs/chronic/monitoring',
          permissions: ['medico:read', 'enfermeiro:read']
        }
      ]
    },
    {
      id: 'mental-health',
      label: 'Saúde Mental',
      icon: <Brain className="w-5 h-5" />,
      permissions: ['psicologo:read', 'medico:read'],
      children: [
        {
          id: 'mental-consultations',
          label: 'Consultas',
          icon: <Stethoscope className="w-4 h-4" />,
          path: '/ubs/mental-health/consultations',
          permissions: ['psicologo:read']
        },
        {
          id: 'mental-assessments',
          label: 'Avaliações',
          icon: <ClipboardList className="w-4 h-4" />,
          path: '/ubs/mental-health/assessments',
          permissions: ['psicologo:avaliacao']
        },
        {
          id: 'group-therapy',
          label: 'Terapia em Grupo',
          icon: <Users className="w-4 h-4" />,
          path: '/ubs/mental-health/group-therapy',
          permissions: ['psicologo:read']
        }
      ]
    },
    {
      id: 'home-care',
      label: 'Atenção Domiciliar',
      icon: <Home className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'home-visits',
          label: 'Visitas Domiciliares',
          icon: <Home className="w-4 h-4" />,
          path: '/ubs/home-care/visits',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'home-schedule',
          label: 'Agenda de Visitas',
          icon: <Calendar className="w-4 h-4" />,
          path: '/ubs/home-care/schedule',
          permissions: ['medico:read', 'enfermeiro:read']
        }
      ]
    },
    {
      id: 'prescriptions',
      label: 'Prescrições',
      icon: <Pill className="w-5 h-5" />,
      permissions: ['medico:prescricao', 'farmaceutico:read'],
      children: [
        {
          id: 'prescriptions-active',
          label: 'Prescrições Ativas',
          icon: <Pill className="w-4 h-4" />,
          path: '/ubs/prescriptions/active',
          permissions: ['medico:prescricao', 'farmaceutico:read']
        },
        {
          id: 'pharmacy',
          label: 'Farmácia Básica',
          icon: <Pill className="w-4 h-4" />,
          path: '/ubs/pharmacy',
          permissions: ['farmaceutico:read']
        }
      ]
    },
    {
      id: 'referrals',
      label: 'Encaminhamentos',
      icon: <UserCheck className="w-5 h-5" />,
      permissions: ['medico:read'],
      children: [
        {
          id: 'referrals-create',
          label: 'Criar Encaminhamento',
          icon: <UserCheck className="w-4 h-4" />,
          path: '/ubs/referrals/create',
          permissions: ['medico:write']
        },
        {
          id: 'referrals-track',
          label: 'Acompanhar',
          icon: <ClipboardList className="w-4 h-4" />,
          path: '/ubs/referrals/track',
          permissions: ['medico:read']
        }
      ]
    },
    {
      id: 'community',
      label: 'Saúde da Comunidade',
      icon: <Users className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'community-health',
          label: 'Agentes Comunitários',
          icon: <Users className="w-4 h-4" />,
          path: '/ubs/community/agents',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'territory',
          label: 'Território',
          icon: <Home className="w-4 h-4" />,
          path: '/ubs/community/territory',
          permissions: ['medico:read', 'enfermeiro:read']
        }
      ]
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: <FileText className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'production-reports',
          label: 'Produção',
          icon: <FileText className="w-4 h-4" />,
          path: '/ubs/reports/production',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'epidemiological-reports',
          label: 'Epidemiológicos',
          icon: <Activity className="w-4 h-4" />,
          path: '/ubs/reports/epidemiological',
          permissions: ['medico:read', 'enfermeiro:read']
        }
      ]
    }
  ];

  return (
    <BaseLayout
      sidebarItems={sidebarItems}
      title={title}
      className={className}
    >
      {children}
    </BaseLayout>
  );
};

export default UBSLayout;