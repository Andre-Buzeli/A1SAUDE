import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
  bypassAuth?: boolean; // Se true, bypassa autenticação (para rotas dev)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requireAll = false,
  bypassAuth = false
}) => {
  const { isAuthenticated, isLoading, hasPermission, hasAnyPermission } = useAuth();
  const location = useLocation();

  // Se bypassAuth está ativo, permite acesso sem autenticação
  if (bypassAuth) {
    return <>{children}</>;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(permission => hasPermission(permission))
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
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
  }

  return <>{children}</>;
};

export default ProtectedRoute;