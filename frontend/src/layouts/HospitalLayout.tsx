import React from 'react';
import { 
  Activity, 
  Users, 
  Bed, 
  Stethoscope, 
  Pill, 
  FileText, 
  Calendar,
  Heart,
  Scissors,
  Monitor,
  UserCheck,
  ClipboardList,
  TestTube,
  Syringe
} from 'lucide-react';
import BaseLayout from './BaseLayout';
import { useAuth } from '@/contexts/AuthContext';

interface HospitalLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const HospitalLayout: React.FC<HospitalLayoutProps> = ({
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
      path: '/hospital/dashboard'
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
          path: '/hospital/patients',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'patient-search',
          label: 'Buscar Paciente',
          icon: <UserCheck className="w-4 h-4" />,
          path: '/hospital/patients/search',
          permissions: ['medico:read', 'enfermeiro:read']
        }
      ]
    },
    {
      id: 'attendances',
      label: 'Atendimentos',
      icon: <Stethoscope className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'attendances-active',
          label: 'Atendimentos Ativos',
          icon: <Activity className="w-4 h-4" />,
          path: '/hospital/attendances/active',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'attendances-history',
          label: 'Histórico',
          icon: <FileText className="w-4 h-4" />,
          path: '/hospital/attendances/history',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'emergency',
          label: 'Emergência',
          icon: <Heart className="w-4 h-4" />,
          path: '/hospital/emergency',
          permissions: ['medico:read', 'enfermeiro:read'],
          badge: '3'
        }
      ]
    },
    {
      id: 'admissions',
      label: 'Internações',
      icon: <Bed className="w-5 h-5" />,
      permissions: ['medico:internacao', 'enfermeiro:read'],
      children: [
        {
          id: 'beds',
          label: 'Mapa de Leitos',
          icon: <Bed className="w-4 h-4" />,
          path: '/hospital/beds',
          permissions: ['medico:internacao', 'enfermeiro:read']
        },
        {
          id: 'admissions-list',
          label: 'Internações Ativas',
          icon: <Monitor className="w-4 h-4" />,
          path: '/hospital/admissions',
          permissions: ['medico:internacao', 'enfermeiro:read']
        },
        {
          id: 'discharges',
          label: 'Altas',
          icon: <UserCheck className="w-4 h-4" />,
          path: '/hospital/discharges',
          permissions: ['medico:alta']
        }
      ]
    },
    {
      id: 'surgery',
      label: 'Centro Cirúrgico',
      icon: <Scissors className="w-5 h-5" />,
      permissions: ['medico:cirurgia'],
      children: [
        {
          id: 'surgery-schedule',
          label: 'Agenda Cirúrgica',
          icon: <Calendar className="w-4 h-4" />,
          path: '/hospital/surgery/schedule',
          permissions: ['medico:cirurgia']
        },
        {
          id: 'surgery-rooms',
          label: 'Salas Cirúrgicas',
          icon: <Monitor className="w-4 h-4" />,
          path: '/hospital/surgery/rooms',
          permissions: ['medico:cirurgia']
        }
      ]
    },
    {
      id: 'icu',
      label: 'UTI',
      icon: <Monitor className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'icu-patients',
          label: 'Pacientes UTI',
          icon: <Users className="w-4 h-4" />,
          path: '/hospital/icu/patients',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'icu-monitoring',
          label: 'Monitoramento',
          icon: <Activity className="w-4 h-4" />,
          path: '/hospital/icu/monitoring',
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
          path: '/hospital/prescriptions/active',
          permissions: ['medico:prescricao', 'farmaceutico:read']
        },
        {
          id: 'medication-admin',
          label: 'Administração',
          icon: <Syringe className="w-4 h-4" />,
          path: '/hospital/prescriptions/administration',
          permissions: ['enfermeiro:medicacao']
        }
      ]
    },
    {
      id: 'exams',
      label: 'Exames',
      icon: <TestTube className="w-5 h-5" />,
      permissions: ['medico:exame', 'enfermeiro:read'],
      children: [
        {
          id: 'exam-requests',
          label: 'Solicitações',
          icon: <ClipboardList className="w-4 h-4" />,
          path: '/hospital/exams/requests',
          permissions: ['medico:exame']
        },
        {
          id: 'exam-results',
          label: 'Resultados',
          icon: <FileText className="w-4 h-4" />,
          path: '/hospital/exams/results',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'laboratory',
          label: 'Laboratório',
          icon: <TestTube className="w-4 h-4" />,
          path: '/hospital/laboratory',
          permissions: ['medico:read']
        }
      ]
    },
    {
      id: 'nursing',
      label: 'Enfermagem',
      icon: <Heart className="w-5 h-5" />,
      permissions: ['enfermeiro:read', 'tecnico_enfermagem:read'],
      children: [
        {
          id: 'vital-signs',
          label: 'Sinais Vitais',
          icon: <Activity className="w-4 h-4" />,
          path: '/hospital/nursing/vital-signs',
          permissions: ['enfermeiro:vital_signs', 'tecnico_enfermagem:read']
        },
        {
          id: 'nursing-care',
          label: 'Cuidados',
          icon: <Heart className="w-4 h-4" />,
          path: '/hospital/nursing/care',
          permissions: ['enfermeiro:cuidados']
        },
        {
          id: 'nursing-notes',
          label: 'Anotações',
          icon: <FileText className="w-4 h-4" />,
          path: '/hospital/nursing/notes',
          permissions: ['enfermeiro:write']
        }
      ]
    },
    {
      id: 'pharmacy',
      label: 'Farmácia',
      icon: <Pill className="w-5 h-5" />,
      permissions: ['farmaceutico:read'],
      children: [
        {
          id: 'pharmacy-dispensing',
          label: 'Dispensação',
          icon: <Pill className="w-4 h-4" />,
          path: '/hospital/pharmacy/dispensing',
          permissions: ['farmaceutico:dispensacao']
        },
        {
          id: 'pharmacy-inventory',
          label: 'Estoque',
          icon: <ClipboardList className="w-4 h-4" />,
          path: '/hospital/pharmacy/inventory',
          permissions: ['farmaceutico:read']
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
          id: 'medical-reports',
          label: 'Relatórios Médicos',
          icon: <FileText className="w-4 h-4" />,
          path: '/hospital/reports/medical',
          permissions: ['medico:read']
        },
        {
          id: 'nursing-reports',
          label: 'Relatórios Enfermagem',
          icon: <Heart className="w-4 h-4" />,
          path: '/hospital/reports/nursing',
          permissions: ['enfermeiro:read']
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

export default HospitalLayout;