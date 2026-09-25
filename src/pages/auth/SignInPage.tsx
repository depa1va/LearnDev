import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { signInSchema, type SignInFormValues } from '../../schemas/auth';
import { getAuthErrorMessage, loginUser, syncEmailVerification } from '../../services/authService';
import AuthCard from './AuthCard';
import AuthField from './AuthField';
import type { ReactElement } from 'react';
import type { AuthLocationState, IntendedRoute } from '../../types/auth';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIntendedRoute(value: unknown): value is IntendedRoute {
  return isRecord(value) && typeof value.pathname === 'string';
}

function isAuthLocationState(value: unknown): value is AuthLocationState {
  return isRecord(value) && isIntendedRoute(value.from);
}

function getRedirectDestination(state: unknown): string {
  if (!isAuthLocationState(state)) return '/dashboard';

  const { pathname } = state.from;
  return pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/dashboard';
}

export default function SignInPage(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isConfigured, configurationMissing, refreshUser } = useAuth();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isLoading || !user) return;
    navigate(user.emailVerified ? '/dashboard' : '/verificar-email', { replace: true });
  }, [isLoading, navigate, user]);

  async function onSubmit({ email, password }: SignInFormValues): Promise<void> {
    if (!isConfigured || isSubmitting) return;

    setError('');
    try {
      await loginUser({ email, password });
      const currentUser = await refreshUser();
      if (!currentUser) throw new Error('Não foi possível restaurar sua sessão. Tente entrar novamente.');

      if (currentUser.emailVerified) {
        try {
          await syncEmailVerification(currentUser);
        } catch {
          // A conta já foi confirmada no Firebase Authentication; o campo no Firestore será sincronizado depois.
        }
        const destination = getRedirectDestination(location.state);
        navigate(destination, { replace: true });
      } else {
        navigate('/verificar-email', { replace: true });
      }
    } catch (submissionError: unknown) {
      setError(getAuthErrorMessage(submissionError, 'Não foi possível entrar. Confira seus dados e tente novamente.'));
    }
  }

  const configurationNotice = !isConfigured
    ? `Configure ${configurationMissing.join(', ')} em .env.local para habilitar o acesso.`
    : null;

  return (
    <AuthCard eyebrow="Entrar" title="Acesse sua conta" description="Continue seu percurso de aprendizado no LearnDev." notice={configurationNotice} footer={<><span>Ainda não possui uma conta? </span><Link to="/cadastro" className="font-semibold text-primary hover:text-primary-700">Criar conta</Link></>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField label="E-mail" icon={Mail} required disabled={!isConfigured || isSubmitting} type="email" autoComplete="email" placeholder="voce@exemplo.com" feedback={errors.email ? { tone: 'error', text: errors.email.message } : undefined} {...register('email')} />
        <div>
          <AuthField label="Senha" icon={LockKeyhole} required disabled={!isConfigured || isSubmitting} type="password" autoComplete="current-password" placeholder="Sua senha" feedback={errors.password ? { tone: 'error', text: errors.password.message } : undefined} {...register('password')} />
          <div className="mt-3 flex items-center justify-end"><Link to="/recuperar-senha" className="text-xs font-semibold text-primary hover:text-primary-700">Esqueci minha senha</Link></div>
        </div>
        {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"><AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        <button disabled={!isConfigured || isSubmitting} type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><span>{isSubmitting ? 'Entrando...' : 'Entrar'}</span>{!isSubmitting && <ArrowRight aria-hidden="true" className="h-4 w-4" />}</button>
        <p className="border-t border-ink/10 pt-5 text-center text-xs leading-relaxed text-ink/50"><Link to="/termos" className="hover:text-primary">Termos de Uso</Link><span aria-hidden="true"> · </span><Link to="/privacidade" className="hover:text-primary">Política de Privacidade</Link></p>
      </form>
    </AuthCard>
  );
}
