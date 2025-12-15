/**
 * Componente de Rota Protegida
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Permission, UserProfile, EstablishmentType } from '../../types/auth';
import LoadingSpinner from '../shared/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: Permission[];
  allowedProfiles?: UserProfile[];
  allowedEstablishments?: EstablishmentType[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  allowedProfiles = [],
  allowedEstablishments = [],
  fallbackPath = '/login'
}) => {
  const { user, isAuthenticated, isLoading, hasPermission, hasAnyPermission } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar perfis permitidos
  if (allowedProfiles.length > 0 && !allowedProfiles.includes(user.profile as UserProfile)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar estabelecimentos permitidos
  if (allowedEstablishments.length > 0) {
    if (!user.establishmentType || !allowedEstablishments.includes(user.establishmentType)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Verificar permissões específicas
  if (requiredPermissions.length > 0) {
    if (!hasAnyPermission(requiredPermissions)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Usuário tem acesso - renderizar children
  return <>{children}</>;
};

export default ProtectedRoute;