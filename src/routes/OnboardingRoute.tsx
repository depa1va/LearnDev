import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { getPrivateProfile } from '../services/profileService';
import type { AuthLocationState } from '../types/auth';
import type { UserAccount } from '../types/user';

interface OnboardingRouteState {
  loading: boolean;
  profile: UserAccount | null;
  error: Error | null;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error('Não foi possível carregar os dados de onboarding.');
}

export default function OnboardingRoute(): ReactElement {
  const { user } = useAuth();
  const location = useLocation();
  const userId = user?.uid;
  const redirectState: AuthLocationState = { from: { pathname: location.pathname } };
  const [state, setState] = useState<OnboardingRouteState>({ loading: true, profile: null, error: null });

  useEffect(() => {
    if (!userId) return undefined;

    let active = true;
    setState({ loading: true, profile: null, error: null });

    getPrivateProfile(userId)
      .then((profile) => {
        if (active) setState({ loading: false, profile, error: null });
      })
      .catch((error) => {
        if (active) setState({ loading: false, profile: null, error: toError(error) });
      });

    return () => {
      active = false;
    };
  }, [userId]);

  if (!user) return <Navigate to="/entrar" replace state={redirectState} />;

  if (state.loading) return <div className="min-h-screen grid place-items-center bg-mist text-sm text-ink/50">Preparando seu espaço de aprendizado...</div>;

  // Um erro de leitura não impede o acesso permanentemente. O onboarding poderá ser retomado em uma nova visita.
  if (!state.error && state.profile?.onboardingCompleted !== true) {
    return <Navigate to="/onboarding" replace state={redirectState} />;
  }

  return <Outlet />;
}
