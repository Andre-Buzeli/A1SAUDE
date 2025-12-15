import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Stethoscope, Briefcase, Building, Home, Activity, Heart, UserCog } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { User as AuthUser, UserProfile, EstablishmentType, Permission } from '@/types/auth';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';

const DevProfileSelector: React.FC = () => {
  const { setDevUser, user: currentUser } = useAuth();

  const createDevUser = (
    profile: UserProfile,
    establishmentType: EstablishmentType,
    establishmentName: string,
    permissions: Permission[]
  ): AuthUser => {
    const userId = `dev-${profile}-${establishmentType}`;
    return {
      id: userId,
      name: `Usuário ${profile} (${establishmentName})`,
      email: `${userId}@a1saude.dev`,
      cpf: '000.000.000-00',
      profile,
      establishmentType,
      establishmentId: `dev-est-${establishmentType}`,
      establishmentName,
      permissions,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
    };
  };

  const profiles: { name: string; user: AuthUser, icon: React.ReactNode }[] = [
    {
      name: 'Médico (UPA)',
      icon: <Stethoscope className="w-5 h-5" />,
      user: createDevUser('medico', 'upa', 'UPA 24h DEV', ['medico:read', 'medico:write', 'upa:access']),
    },
    {
      name: 'Enfermeiro (Hospital)',
      icon: <Heart className="w-5 h-5" />,
      user: createDevUser('enfermeiro', 'hospital', 'Hospital Municipal DEV', ['enfermeiro:read', 'enfermeiro:write', 'hospital:access']),
    },
    {
      name: 'Técnico (UBS)',
      icon: <Activity className="w-5 h-5" />,
      user: createDevUser('tecnico_enfermagem', 'ubs', 'UBS Bem-Estar DEV', ['tecnico_enfermagem:read', 'ubs:access']),
    },
    {
      name: 'Diretor (Admin)',
      icon: <UserCog className="w-5 h-5" />,
      user: createDevUser('diretor_local', 'hospital', 'Hospital Municipal DEV', [
        'diretor_local:read', 'diretor_local:write', 'admin:full_access'
      ]),
    },
  ];

  const handleSelectProfile = (user: AuthUser) => {
    setDevUser(user);
  };

  return (
    <GlassCard className="mb-8 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className='mb-4 sm:mb-0'>
            <h3 className="text-lg font-bold text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Selecionar Perfil de Desenvolvimento
            </h3>
            <p className="text-sm text-text-secondary">
                Logado como: <span className='font-bold text-medical-blue'>{currentUser?.name || 'Nenhum'}</span>
            </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {profiles.map(({ name, user, icon }) => (
            <GlassButton
              key={name}
              onClick={() => handleSelectProfile(user)}
              variant={currentUser?.id === user.id ? 'primary' : 'secondary'}
              className="flex items-center justify-center space-x-2 text-xs h-10"
            >
              {icon}
              <span>{name}</span>
            </GlassButton>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default DevProfileSelector;
