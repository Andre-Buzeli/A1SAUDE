import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

interface DevPlaceholderPageProps {
  title: string;
  description: string;
}

export const DevPlaceholderPage: React.FC<DevPlaceholderPageProps> = ({
  title,
  description
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DevModeBanner />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-6">
          <Link to="/dev">
            <GlassButton variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Índice
            </GlassButton>
          </Link>
        </div>

        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <Construction className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-text-secondary text-lg">{description}</p>
          </div>

          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Status</h2>
            <p className="text-text-secondary">
              Esta página está em desenvolvimento. O conteúdo será implementado em breve.
            </p>
          </div>

        </GlassCard>
      </div>
    </div>
  );
};

// Componentes específicos para cada rota
// DevPatientsPage agora usa a página real
export { PatientListPage as DevPatientsPage } from '@/pages/patients/PatientListPage';

export const DevAttendancesPage: React.FC = () => (
  <DevPlaceholderPage
    title="Atendimentos e Consultas"
    description="Página de atendimentos ativos e histórico"
  />
);

export const DevPrescriptionsPage: React.FC = () => (
  <DevPlaceholderPage
    title="Prescrições Médicas"
    description="Sistema de prescrições digitais"
  />
);

export const DevExamsPage: React.FC = () => (
  <DevPlaceholderPage
    title="Solicitação de Exames"
    description="Solicitar e visualizar resultados de exames"
  />
);

export const DevTriagePage: React.FC = () => (
  <DevPlaceholderPage
    title="Triagem Manchester"
    description="Classificação de risco para UPA"
  />
);

export const DevMedicationsPage: React.FC = () => (
  <DevPlaceholderPage
    title="Administração de Medicamentos"
    description="Gestão de medicações e horários"
  />
);

export const DevVitalSignsPage: React.FC = () => (
  <DevPlaceholderPage
    title="Sinais Vitais"
    description="Registro e monitoramento de sinais vitais"
  />
);

export const DevAdminUsersPage: React.FC = () => (
  <DevPlaceholderPage
    title="Gestão de Usuários"
    description="CRUD de usuários e permissões"
  />
);

export const DevAdminEstablishmentsPage: React.FC = () => (
  <DevPlaceholderPage
    title="Gestão de Estabelecimentos"
    description="CRUD de estabelecimentos"
  />
);

export const DevAdminFinancialPage: React.FC = () => (
  <DevPlaceholderPage
    title="Gestão Financeira"
    description="Orçamentos, despesas e contratos"
  />
);

export const DevAdminReportsPage: React.FC = () => (
  <DevPlaceholderPage
    title="Relatórios"
    description="Geração de relatórios personalizados"
  />
);

export const DevVaccinationsPage: React.FC = () => (
  <DevPlaceholderPage
    title="Vacinações"
    description="Controle de vacinas UBS"
  />
);

export const DevAppointmentsPage: React.FC = () => (
  <DevPlaceholderPage
    title="Agendamentos"
    description="Sistema de agendamento"
  />
);

export const DevBedsPage: React.FC = () => (
  <DevPlaceholderPage
    title="Gestão de Leitos"
    description="Mapa visual de leitos hospitalares"
  />
);

