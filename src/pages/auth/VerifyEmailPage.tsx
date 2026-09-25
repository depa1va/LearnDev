import { useEffect, useState } from 'react';
import { LogOut, MailCheck, RefreshCw, Send } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { getAuthErrorMessage, resendVerificationEmail, syncEmailVerification } from '../../services/authService';
import AuthCard from './AuthCard';
import type { ReactElement } from 'react';

interface VerificationLocationState {
  verificationEmailSent?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isVerificationLocationState(value: unknown): value is VerificationLocationState {
  return isRecord(value) && (
    value.verificationEmailSent === undefined
    || value.verificationEmailSent === true
    || value.verificationEmailSent === false
  );
}

function getInitialStatus(state: unknown): string {
  if (!isVerificationLocationState(state)) return '';
  if (state.verificationEmailSent) return 'E-mail de verificação enviado. Confira sua caixa de entrada e a pasta de spam.';
  if (state.verificationEmailSent === false) return 'Sua conta foi criada, mas o e-mail não pôde ser enviado agora. Use o botão abaixo para reenviar.';
  return '';
}

export default function VerifyEmailPage(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isConfigured, configurationMissing, logout, refreshUser } = useAuth();
  const [error, setError] = useState('');
  const [status, setStatus] = useState(() => getInitialStatus(location.state));
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.emailVerified) navigate('/dashboard', { replace: true });
  }, [isLoading, navigate, user?.emailVerified]);

  async function handleCheckVerification(): Promise<void> {
    if (!isConfigured || isChecking) return;
    setError('');
    setStatus('');
    setIsChecking(true);
    try {
      const refreshedUser = await refreshUser();
      if (!refreshedUser) throw new Error('Sua sessão expirou. Entre novamente para continuar.');

      if (!refreshedUser.emailVerified) {
        setStatus('Seu e-mail ainda não foi confirmado. Depois de confirmar, use este botão novamente.');
        return;
      }

      try {
        await syncEmailVerification(refreshedUser);
      } catch {
        // A confirmação no Firebase Authentication continua válida; o campo no Firestore será sincronizado no próximo acesso.
      }
      navigate('/dashboard', { replace: true });
    } catch (verificationError: unknown) {
      setError(getAuthErrorMessage(verificationError, 'Não foi possível atualizar o estado da sua conta. Tente novamente.'));
    } finally {
      setIsChecking(false);
    }
  }

  async function handleResend(): Promise<void> {
    if (!isConfigured || !user || isResending) return;
    setError('');
    setStatus('');
    setIsResending(true);
    try {
      // A tela delega ao authService o POST autenticado de verificação; o destinatário é resolvido pelo servidor a partir do token.
      await resendVerificationEmail();
      setStatus('Novo e-mail de verificação enviado. Confira também a pasta de spam.');
    } catch (resendError: unknown) {
      setError(getAuthErrorMessage(resendError, 'Não foi possível reenviar o e-mail agora. Tente novamente mais tarde.'));
    } finally {
      setIsResending(false);
    }
  }

  async function handleLogout(): Promise<void> {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (logoutError: unknown) {
      setError(getAuthErrorMessage(logoutError, 'Não foi possível encerrar a sessão. Tente novamente.'));
    } finally {
      setIsLoggingOut(false);
    }
  }

  const configurationNotice = !isConfigured
    ? `Configure ${configurationMissing.join(', ')} em .env.local para habilitar a verificação.`
    : null;

  return (
    <AuthCard eyebrow="Verificar e-mail" title="Confirme seu endereço" description="A confirmação do e-mail é necessária antes de acessar a área do estudante." notice={configurationNotice}>
      <div className="rounded-2xl border border-ink/10 bg-mist p-6 text-center">
        <MailCheck className="mx-auto h-9 w-9 text-primary" />
        {isLoading ? <p className="mt-4 text-sm text-ink/60">Restaurando sua sessão...</p> : user ? <p className="mt-4 text-sm leading-relaxed text-ink/60">Enviamos uma mensagem de confirmação para <strong className="font-semibold text-ink">{user.email}</strong>.</p> : <p className="mt-4 text-sm leading-relaxed text-ink/60">Entre na sua conta para enviar ou consultar a verificação de e-mail.</p>}
      </div>
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {status && <p role="status" className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{status}</p>}
      <div className="mt-6 grid gap-3">
        {user ? <><button disabled={!isConfigured || isChecking} type="button" onClick={handleCheckVerification} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw className="h-4 w-4" />{isChecking ? 'Verificando...' : 'Já confirmei meu e-mail'}</button><button disabled={!isConfigured || isResending} type="button" onClick={handleResend} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-5 text-sm font-semibold text-ink hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" />{isResending ? 'Reenviando...' : 'Reenviar e-mail'}</button><button disabled={isLoggingOut} type="button" onClick={handleLogout} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-ink/60 hover:bg-ink/5 disabled:cursor-not-allowed"><LogOut className="h-4 w-4" />{isLoggingOut ? 'Saindo...' : 'Sair'}</button></> : <Link to="/entrar" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft hover:bg-primary-700">Ir para entrar</Link>}
      </div>
    </AuthCard>
  );
}
