import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import type { AuthLocationState } from '../types/auth';

export default function ModeratorRoute(): ReactElement {
  const { user, isLoading, isAccountLoading, isConfigured, canModerate } = useAuth();
  const location = useLocation();
  const redirectState: AuthLocationState = { from: { pathname: location.pathname } };
  const moderationDeniedState: AuthLocationState = { ...redirectState, moderationDenied: true };

  if (isLoading || isAccountLoading) {
    return <div className="min-h-screen grid place-items-center bg-mist text-sm text-ink/50">Verificando permissões de moderação...</div>;
  }

  if (!isConfigured || !user) return <Navigate to="/entrar" replace state={redirectState} />;
  if (!canModerate) return <Navigate to="/dashboard" replace state={moderationDeniedState} />;
  return <Outlet />;
}
