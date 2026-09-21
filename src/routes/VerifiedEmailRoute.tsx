import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import type { AuthLocationState } from '../types/auth';

export default function VerifiedEmailRoute(): ReactElement {
  const { user, isLoading, isConfigured } = useAuth();
  const location = useLocation();
  const redirectState: AuthLocationState = { from: { pathname: location.pathname } };

  if (isLoading) return <div className="min-h-screen grid place-items-center bg-mist text-sm text-ink/50">Verificando seu acesso...</div>;
  if (!isConfigured || !user) return <Navigate to="/entrar" replace state={redirectState} />;
  if (!user.emailVerified) return <Navigate to="/verificar-email" replace state={redirectState} />;
  return <Outlet />;
}
