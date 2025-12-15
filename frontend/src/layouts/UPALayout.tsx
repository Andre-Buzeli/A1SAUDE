import React from 'react';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  Stethoscope, 
  Pill, 
  FileText, 
  Heart,
  Clock,
  UserCheck,
  ClipboardList,
  TestTube,
  Syringe,
  Monitor,
  Truck,
  Shield,
  Eye
} from 'lucide-react';
import BaseLayout from './BaseLayout';
import { useAuth } from '@/contexts/AuthContext';

interface UPALayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const UPALayout: React.FC<UPALayoutProps> = ({
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
      path: '/upa/dashboard'
    },
    {
      id: 'triage',
      label: 'Triagem Manchester',
      icon: <AlertTriangle className="w-5 h-5" />,
      permissions: ['enfermeiro:triage', 'upa:triage'],
      children: [
        {
          id: 'triage-active',
          label: 'Triagem Ativa',
          icon: <AlertTriangle className="w-4 h-4" />,
          path: '/upa/triage/active',
          permissions: ['enfermeiro:triage'],
          badge: '8'
        },
        {
          id: 'triage-queue',
          label: 'Fila de Espera',
          icon: <Clock className="w-4 h-4" />,
          path: '/upa/triage/queue',
          permissions: ['enfermeiro:read', 'medico:read']
        },
        {
          id: 'triage-protocols',
          label: 'Protocolos',
          icon: <ClipboardList className="w-4 h-4" />,
          path: '/upa/triage/protocols',
          permissions: ['enfermeiro:triage']
        }
      ]
    },
    {
      id: 'emergency',
      label: 'Atendimento de Emergência',
      icon: <Heart className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'emergency-red',
          label: 'Emergência (Vermelho)',
          icon: <Heart className="w-4 h-4 text-priority-red" />,
          path: '/upa/emergency/red',
          permissions: ['medico:read'],
          badge: '2'
        },
        {
          id: 'emergency-orange',
          label: 'Muito Urgente (Laranja)',
          icon: <AlertTriangle className="w-4 h-4 text-priority-orange" />,
          path: '/upa/emergency/orange',
          permissions: ['medico:read'],
          badge: '5'
        },
        {
          id: 'emergency-yellow',
          label: 'Urgente (Amarelo)',
          icon: <Clock className="w-4 h-4 text-priority-yellow" />,
          path: '/upa/emergency/yellow',
          permissions: ['medico:read'],
          badge: '12'
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
          id: 'patients-active',
          label: 'Pacientes Ativos',
          icon: <Users className="w-4 h-4" />,
          path: '/upa/patients/active',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'patient-register',
          label: 'Cadastro Rápido',
          icon: <UserCheck className="w-4 h-4" />,
          path: '/upa/patients/register',
          permissions: ['medico:write', 'enfermeiro:write']
        }
      ]
    },
    {
      id: 'observation',
      label: 'Sala de Observação',
      icon: <Eye className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'observation-patients',
          label: 'Pacientes em Observação',
          icon: <Monitor className="w-4 h-4" />,
          path: '/upa/observation/patients',
          permissions: ['medico:read', 'enfermeiro:read'],
          badge: '6'
        },
        {
          id: 'observation-monitoring',
          label: 'Monitoramento',
          icon: <Activity className="w-4 h-4" />,
          path: '/upa/observation/monitoring',
          permissions: ['enfermeiro:read']
        }
      ]
    },
    {
      id: 'procedures',
      label: 'Procedimentos',
      icon: <Stethoscope className="w-5 h-5" />,
      permissions: ['medico:procedimento', 'enfermeiro:read'],
      children: [
        {
          id: 'minor-procedures',
          label: 'Pequenos Procedimentos',
          icon: <Stethoscope className="w-4 h-4" />,
          path: '/upa/procedures/minor',
          permissions: ['medico:procedimento']
        },
        {
          id: 'wound-care',
          label: 'Curativos',
          icon: <Heart className="w-4 h-4" />,
          path: '/upa/procedures/wound-care',
          permissions: ['enfermeiro:cuidados']
        },
        {
          id: 'sutures',
          label: 'Suturas',
          icon: <Stethoscope className="w-4 h-4" />,
          path: '/upa/procedures/sutures',
          permissions: ['medico:procedimento']
        }
      ]
    },
    {
      id: 'exams',
      label: 'Exames Rápidos',
      icon: <TestTube className="w-5 h-5" />,
      permissions: ['medico:exame', 'enfermeiro:read'],
      children: [
        {
          id: 'point-of-care',
          label: 'Exames no Local',
          icon: <TestTube className="w-4 h-4" />,
          path: '/upa/exams/point-of-care',
          permissions: ['medico:exame', 'enfermeiro:read']
        },
        {
          id: 'imaging',
          label: 'Imagem',
          icon: <Monitor className="w-4 h-4" />,
          path: '/upa/exams/imaging',
          permissions: ['medico:exame']
        },
        {
          id: 'ecg',
          label: 'Eletrocardiograma',
          icon: <Activity className="w-4 h-4" />,
          path: '/upa/exams/ecg',
          permissions: ['medico:exame', 'enfermeiro:read']
        }
      ]
    },
    {
      id: 'medications',
      label: 'Medicações',
      icon: <Pill className="w-5 h-5" />,
      permissions: ['medico:prescricao', 'enfermeiro:medicacao'],
      children: [
        {
          id: 'emergency-medications',
          label: 'Medicações de Emergência',
          icon: <Syringe className="w-4 h-4" />,
          path: '/upa/medications/emergency',
          permissions: ['medico:prescricao', 'enfermeiro:medicacao']
        },
        {
          id: 'medication-admin',
          label: 'Administração',
          icon: <Pill className="w-4 h-4" />,
          path: '/upa/medications/administration',
          permissions: ['enfermeiro:medicacao']
        },
        {
          id: 'pharmacy-upa',
          label: 'Farmácia UPA',
          icon: <Pill className="w-4 h-4" />,
          path: '/upa/pharmacy',
          permissions: ['farmaceutico:read']
        }
      ]
    },
    {
      id: 'vital-signs',
      label: 'Sinais Vitais',
      icon: <Activity className="w-5 h-5" />,
      permissions: ['enfermeiro:vital_signs', 'tecnico_enfermagem:read'],
      children: [
        {
          id: 'vital-monitoring',
          label: 'Monitoramento',
          icon: <Monitor className="w-4 h-4" />,
          path: '/upa/vital-signs/monitoring',
          permissions: ['enfermeiro:vital_signs']
        },
        {
          id: 'vital-alerts',
          label: 'Alertas',
          icon: <AlertTriangle className="w-4 h-4" />,
          path: '/upa/vital-signs/alerts',
          permissions: ['enfermeiro:vital_signs'],
          badge: '3'
        }
      ]
    },
    {
      id: 'transport',
      label: 'Transporte',
      icon: <Truck className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'ambulance',
          label: 'Ambulâncias',
          icon: <Truck className="w-4 h-4" />,
          path: '/upa/transport/ambulance',
          permissions: ['medico:read', 'enfermeiro:read']
        },
        {
          id: 'transfers',
          label: 'Transferências',
          icon: <UserCheck className="w-4 h-4" />,
          path: '/upa/transport/transfers',
          permissions: ['medico:read']
        },
        {
          id: 'samu-integration',
          label: 'Integração SAMU',
          icon: <Shield className="w-4 h-4" />,
          path: '/upa/transport/samu',
          permissions: ['medico:read', 'enfermeiro:read']
        }
      ]
    },
    {
      id: 'protocols',
      label: 'Protocolos de Emergência',
      icon: <Shield className="w-5 h-5" />,
      permissions: ['medico:read', 'enfermeiro:read'],
      children: [
        {
          id: 'cardiac-protocols',
          label: 'Protocolos Cardíacos',
          icon: <Heart className="w-4 h-4" />,
          path: '/upa/protocols/cardiac',
          permissions: ['medico:read']
        },
        {
          id: 'trauma-protocols',
          label: 'Protocolos de Trauma',
          icon: <AlertTriangle className="w-4 h-4" />,
          path: '/upa/protocols/trauma',
          permissions: ['medico:read']
        },
        {
          id: 'pediatric-protocols',
          label: 'Protocolos Pediátricos',
          icon: <Users className="w-4 h-4" />,
          path: '/upa/protocols/pediatric',
          permissions: ['medico:read']
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
          id: 'emergency-reports',
          label: 'Relatórios de Emergência',
          icon: <FileText className="w-4 h-4" />,
          path: '/upa/reports/emergency',
          permissions: ['medico:read']
        },
        {
          id: 'triage-reports',
          label: 'Relatórios de Triagem',
          icon: <ClipboardList className="w-4 h-4" />,
          path: '/upa/reports/triage',
          permissions: ['enfermeiro:read']
        },
        {
          id: 'performance-reports',
          label: 'Indicadores de Performance',
          icon: <Activity className="w-4 h-4" />,
          path: '/upa/reports/performance',
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

export default UPALayout;