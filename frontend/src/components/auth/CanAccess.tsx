import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/types/auth';

type Props = {
  permission?: Permission;
  any?: Permission[];
  all?: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export const CanAccess: React.FC<Props> = ({ permission, any, all, children, fallback = null }) => {
  const auth = useAuth();
  let allowed = true;
  if (permission) allowed = auth.hasPermission(permission);
  if (any && any.length) allowed = auth.hasAnyPermission(any);
  if (all && all.length) allowed = auth.hasAllPermissions(all);
  return allowed ? <>{children}</> : <>{fallback}</>;
};
