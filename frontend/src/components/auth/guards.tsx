import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission, UserProfile, EstablishmentType } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// HOC para verificar permissões
export const withPermission = (requiredPermission: Permission) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => {
      const { hasPermission, isAuthenticated, isLoading } = useAuth();

      if (isLoading) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <LoadingSpinner size="lg" />
          </div>
        );
      }

      if (!isAuthenticated) {
        return <div>Acesso negado - Não autenticado</div>;
      }

      if (!hasPermission(requiredPermission)) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="glass-card text-center p-8 max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
              <p className="text-text-secondary mb-6">
                Você não tem permissão para acessar esta página.
              </p>
              <button
                onClick={() => window.history.back()}
                className="glass-button text-white hover:bg-white/20"
              >
                Voltar
              </button>
            </div>
          </div>
        );
      }

      return <Component {...props} />;
    };
  };
};

// HOC para verificar qualquer uma das permissões
export const withAnyPermission = (requiredPermissions: Permission[]) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => {
      const { hasAnyPermission, isAuthenticated, isLoading } = useAuth();

      if (isLoading) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <LoadingSpinner size="lg" />
          </div>
        );
      }

      if (!isAuthenticated) {
        return <div>Acesso negado - Não autenticado</div>;
      }

      if (!hasAnyPermission(requiredPermissions)) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="glass-card text-center p-8 max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
              <p className="text-text-secondary mb-6">
                Você não tem permissão para acessar esta página.
              </p>
              <button
                onClick={() => window.history.back()}
                className="glass-button text-white hover:bg-white/20"
              >
                Voltar
              </button>
            </div>
          </div>
        );
      }

      return <Component {...props} />;
    };
  };
};

// HOC para verificar tipo de estabelecimento
export const withEstablishment = (requiredEstablishmentType: EstablishmentType) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => {
      const { user, isAuthenticated, isLoading } = useAuth();

      if (isLoading) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <LoadingSpinner size="lg" />
          </div>
        );
      }

      if (!isAuthenticated || !user) {
        return <div>Acesso negado - Não autenticado</div>;
      }

      if (user.establishmentType !== requiredEstablishmentType) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="glass-card text-center p-8 max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h2>
              <p className="text-text-secondary mb-6">
                Esta página é específica para {requiredEstablishmentType === 'hospital' ? 'Hospital' : requiredEstablishmentType === 'ubs' ? 'UBS' : 'UPA'}.
              </p>
              <button
                onClick={() => window.history.back()}
                className="glass-button text-white hover:bg-white/20"
              >
                Voltar
              </button>
            </div>
          </div>
        );
      }

      return <Component {...props} />;
    };
  };
};

// HOC para verificar perfil específico
export const withProfile = (requiredProfile: UserProfile) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => {
      const { user, isAuthenticated, isLoading } = useAuth();

      if (isLoading) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <LoadingSpinner size="lg" />
          </div>
        );
      }

      if (!isAuthenticated || !user) {
        return <div>Acesso negado - Não autenticado</div>;
      }

      if (user.profile !== requiredProfile) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="glass-card text-center p-8 max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
              <p className="text-text-secondary mb-6">
                Esta página é específica para o perfil {requiredProfile}.
              </p>
              <button
                onClick={() => window.history.back()}
                className="glass-button text-white hover:bg-white/20"
              >
                Voltar
              </button>
            </div>
          </div>
        );
      }

      return <Component {...props} />;
    };
  };
};

// Hook para obter dashboard correto baseado no perfil/estabelecimento
export const useDashboardRedirect = () => {
  const { user } = useAuth();

  const getDashboardPath = (): string => {
    if (!user) return '/login';

    // Perfis administrativos vão para dashboard admin
    const adminProfiles: UserProfile[] = [
      'gestor_geral',
      'diretor_local',
      'gestor_local',
      'coordenador_geral',
      'coordenador_local',
      'supervisor',
      'secretario',
      'system_master'
    ];

    if (adminProfiles.includes(user.profile as UserProfile)) {
      return '/admin/dashboard';
    }

    // Perfis clínicos vão para dashboard específico do estabelecimento
    switch (user.establishmentType) {
      case 'hospital':
        return '/hospital/dashboard';
      case 'ubs':
        return '/ubs/dashboard';
      case 'upa':
        return '/upa/dashboard';
      default:
        return '/';
    }
  };

  return { getDashboardPath, dashboardPath: getDashboardPath() };
};
