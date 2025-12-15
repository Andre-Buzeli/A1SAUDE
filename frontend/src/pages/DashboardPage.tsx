import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout, HospitalLayout, UBSLayout, UPALayout } from '@/layouts';
import { GlassCard, GlassButton } from '@/components/ui';
import { 
  Activity, 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  Heart,
  Stethoscope,
  AlertTriangle
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getEstablishmentDisplayName = (type: string) => {
    const establishmentNames: Record<string, string> = {
      ubs: 'Unidade Básica de Saúde',
      upa: 'Unidade de Pronto Atendimento',
      hospital: 'Hospital'
    };
    return establishmentNames[type] || type;
  };

  const isAdminProfile = (profile: string) => {
    return ['gestor_geral', 'diretor_local', 'gestor_local', 'coordenador_geral', 'coordenador_local', 'supervisor', 'secretario', 'system_master'].includes(profile);
  };

  const renderDashboardContent = () => (
    <>
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          {getWelcomeMessage()}, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-text-secondary">
          Bem-vindo ao painel do {getEstablishmentDisplayName(user?.establishmentType || '')} - {user?.establishmentName}
        </p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">
                  {user?.establishmentType === 'upa' ? 'Emergências Hoje' : 'Pacientes Hoje'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {user?.establishmentType === 'upa' ? '15' : '24'}
                </p>
              </div>
              <div className="w-12 h-12 bg-medical-blue/20 rounded-full flex items-center justify-center">
                {user?.establishmentType === 'upa' ? (
                  <AlertTriangle className="w-6 h-6 text-medical-blue" />
                ) : (
                  <Users className="w-6 h-6 text-medical-blue" />
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">
                  {user?.establishmentType === 'hospital' ? 'Internações' : 'Consultas'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {user?.establishmentType === 'hospital' ? '45' : '18'}
                </p>
              </div>
              <div className="w-12 h-12 bg-medical-green/20 rounded-full flex items-center justify-center">
                {user?.establishmentType === 'hospital' ? (
                  <Heart className="w-6 h-6 text-medical-green" />
                ) : (
                  <Stethoscope className="w-6 h-6 text-medical-green" />
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">
                  {user?.establishmentType === 'upa' ? 'Triagens' : 'Agendamentos'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {user?.establishmentType === 'upa' ? '28' : '12'}
                </p>
              </div>
              <div className="w-12 h-12 bg-medical-orange/20 rounded-full flex items-center justify-center">
                {user?.establishmentType === 'upa' ? (
                  <Activity className="w-6 h-6 text-medical-orange" />
                ) : (
                  <Calendar className="w-6 h-6 text-medical-orange" />
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Relatórios</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
              <div className="w-12 h-12 bg-medical-purple/20 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-medical-purple" />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassButton
              variant="ghost"
              className="flex items-center justify-center space-x-3 p-4 h-auto"
            >
              <Users className="w-6 h-6 text-medical-blue" />
              <span>Gerenciar Pacientes</span>
            </GlassButton>
            
            <GlassButton
              variant="ghost"
              className="flex items-center justify-center space-x-3 p-4 h-auto"
            >
              {user?.establishmentType === 'upa' ? (
                <>
                  <AlertTriangle className="w-6 h-6 text-medical-red" />
                  <span>Triagem</span>
                </>
              ) : (
                <>
                  <Calendar className="w-6 h-6 text-medical-green" />
                  <span>Agendar Consulta</span>
                </>
              )}
            </GlassButton>
            
            <GlassButton
              variant="ghost"
              className="flex items-center justify-center space-x-3 p-4 h-auto"
            >
              <TrendingUp className="w-6 h-6 text-medical-orange" />
              <span>Ver Relatórios</span>
            </GlassButton>
          </div>
        </GlassCard>
      </motion.div>
    </>
  );

  // Render with appropriate layout based on user profile
  if (!user) return null;

  if (isAdminProfile(user.profile)) {
    return (
      <AdminLayout title="Dashboard Administrativo">
        {renderDashboardContent()}
      </AdminLayout>
    );
  }

  switch (user.establishmentType) {
    case 'hospital':
      return (
        <HospitalLayout title="Dashboard Hospital">
          {renderDashboardContent()}
        </HospitalLayout>
      );
    case 'ubs':
      return (
        <UBSLayout title="Dashboard UBS">
          {renderDashboardContent()}
        </UBSLayout>
      );
    case 'upa':
      return (
        <UPALayout title="Dashboard UPA">
          {renderDashboardContent()}
        </UPALayout>
      );
    default:
      return (
        <AdminLayout title="Dashboard">
          {renderDashboardContent()}
        </AdminLayout>
      );
  }
};

export default DashboardPage;