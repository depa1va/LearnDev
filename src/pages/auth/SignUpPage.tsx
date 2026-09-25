import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, AtSign, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { signUpSchema, type SignUpFormValues } from '../../schemas/auth';
import {
  checkUsernameAvailability,
  getAuthErrorMessage,
  normalizeUsername,
  registerUser,
  validateUsername,
} from '../../services/authService';
import AuthCard from './AuthCard';
import AuthField from './AuthField';
import type { ReactElement } from 'react';

type UsernameAvailabilityStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

interface UsernameAvailabilityState {
  normalizedUsername: string;
  status: UsernameAvailabilityStatus;
}

const USERNAME_AVAILABILITY_DEBOUNCE_MS = 450;

function PasswordStrength({ password }: { password: string }): ReactElement | null {
  if (!password) return null;
  const score = password.length < 6 ? 0 : [
    true,
    password.length >= 10,
    /[a-z]/i.test(password) && /\d/.test(password),
    /[^a-z0-9]/i.test(password),
  ].filter(Boolean).length;
  const label = score === 0 ? 'Use pelo menos 6 caracteres' : score === 1 ? 'Senha básica' : score === 2 ? 'Senha boa' : 'Senha forte';

  return (
    <div aria-live="polite" className="mt-3 rounded-xl border border-primary/10 bg-primary/5 px-3 py-3">
      <div className="flex gap-1.5" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index < score ? 'bg-primary' : 'bg-ink/10'}`} />)}</div>
      <p className="mt-2 text-xs font-semibold text-primary">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink/55">Use pelo menos 6 caracteres. Combinar letras, números e símbolos torna a senha mais difícil de adivinhar.</p>
    </div>
  );
}

export default function SignUpPage(): ReactElement {
  const navigate = useNavigate();
  const { isConfigured, configurationMissing } = useAuth();
  const [error, setError] = useState('');
  const [usernameAvailability, setUsernameAvailability] = useState<UsernameAvailabilityState>({
    normalizedUsername: '',
    status: 'idle',
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: '',
      username: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      hasAcceptedLegalTerms: false,
    },
  });
  const password = watch('password');
  const passwordConfirmation = watch('passwordConfirmation');
  const hasAcceptedLegalTerms = watch('hasAcceptedLegalTerms');
  const username = watch('username');
  const normalizedUsername = normalizeUsername(username);
  const usernameIsValid = validateUsername(normalizedUsername) === null;
  const availabilityStatus = usernameAvailability.normalizedUsername === normalizedUsername && usernameIsValid
    ? usernameAvailability.status
    : 'idle';

  useEffect(() => {
    if (!isConfigured || !usernameIsValid) {
      setUsernameAvailability({ normalizedUsername, status: 'idle' });
      return;
    }

    let isCurrent = true;
    setUsernameAvailability({ normalizedUsername, status: 'checking' });
    const timeoutId = window.setTimeout(() => {
      void checkUsernameAvailability(normalizedUsername)
        .then((isAvailable) => {
          if (!isCurrent) return;
          setUsernameAvailability({
            normalizedUsername,
            status: isAvailable ? 'available' : 'unavailable',
          });
        })
        .catch(() => {
          if (!isCurrent) return;
          setUsernameAvailability({ normalizedUsername, status: 'error' });
        });
    }, USERNAME_AVAILABILITY_DEBOUNCE_MS);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [isConfigured, normalizedUsername, usernameIsValid]);

  async function onSubmit({ displayName, username, email, password, hasAcceptedLegalTerms: hasAcceptedLegalTermsValue }: SignUpFormValues): Promise<void> {
    if (!isConfigured || isSubmitting) return;
    if (availabilityStatus === 'unavailable') return;

    setError('');
    try {
      const result = await registerUser({ displayName, username, email, password, hasAcceptedLegalTerms: hasAcceptedLegalTermsValue });
      navigate('/verificar-email', { replace: true, state: { verificationEmailSent: result.verificationEmailSent } });
    } catch (submissionError: unknown) {
      setError(getAuthErrorMessage(submissionError, 'Não foi possível criar sua conta. Tente novamente.'));
    }
  }

  const configurationNotice = !isConfigured
    ? `Configure ${configurationMissing.join(', ')} em .env.local para habilitar o cadastro.`
    : null;

  return (
    <AuthCard eyebrow="Cadastro" title="Crie sua conta" description="Organize seus estudos, pratique e retome o aprendizado quando quiser." notice={configurationNotice} footer={<><span>Já possui uma conta? </span><Link to="/entrar" className="font-semibold text-primary hover:text-primary-700">Entrar</Link></>}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField label="Nome completo" icon={UserRound} required disabled={!isConfigured || isSubmitting} type="text" autoComplete="name" placeholder="Como você quer ser chamado(a)?" feedback={errors.displayName ? { tone: 'error', text: errors.displayName.message } : undefined} {...register('displayName')} />
        <AuthField label="Nome de usuário" icon={AtSign} required disabled={!isConfigured || isSubmitting} type="text" autoComplete="username" placeholder="exemplo_dev" hint="De 3 a 20 caracteres: letras, números e underscore." feedback={errors.username ? { tone: 'error', text: errors.username.message } : availabilityStatus === 'checking' ? { tone: 'muted', text: 'Verificando disponibilidade...' } : availabilityStatus === 'available' ? { tone: 'success', text: 'Nome de usuário disponível.' } : availabilityStatus === 'unavailable' ? { tone: 'error', text: 'Esse nome de usuário já está em uso.' } : availabilityStatus === 'error' ? { tone: 'muted', text: 'Não foi possível verificar agora. Você ainda pode tentar criar a conta.' } : undefined} {...register('username')} />
        <AuthField label="E-mail" icon={Mail} required disabled={!isConfigured || isSubmitting} type="email" autoComplete="email" placeholder="voce@exemplo.com" feedback={errors.email ? { tone: 'error', text: errors.email.message } : undefined} {...register('email')} />

        <div className="border-t border-ink/10 pt-5">
          <AuthField label="Senha" icon={LockKeyhole} required disabled={!isConfigured || isSubmitting} type="password" autoComplete="new-password" placeholder="Crie uma senha" hint="A senha precisa ter pelo menos 6 caracteres." feedback={errors.password ? { tone: 'error', text: errors.password.message } : undefined} {...register('password')} />
          <PasswordStrength password={password} />
        </div>

        <AuthField label="Confirmar senha" icon={LockKeyhole} required disabled={!isConfigured || isSubmitting} type="password" autoComplete="new-password" placeholder="Repita sua senha" feedback={errors.passwordConfirmation ? { tone: 'error', text: errors.passwordConfirmation.message } : passwordConfirmation ? (password === passwordConfirmation ? { tone: 'success', text: 'As senhas coincidem.' } : { tone: 'error', text: 'As senhas ainda não coincidem.' }) : undefined} {...register('passwordConfirmation')} />

        <div className="flex items-start gap-3 border-t border-ink/10 pt-5 text-sm leading-relaxed text-ink/70">
          <input id="legal-acceptance" required disabled={!isConfigured || isSubmitting} aria-invalid={errors.hasAcceptedLegalTerms ? true : undefined} aria-describedby={errors.hasAcceptedLegalTerms ? 'legal-acceptance-feedback' : undefined} type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink/30 text-primary focus:ring-primary disabled:cursor-not-allowed" {...register('hasAcceptedLegalTerms')} />
          <p><label htmlFor="legal-acceptance" className="cursor-pointer">Li e aceito os </label><Link to="/termos" className="font-semibold text-primary hover:text-primary-700">Termos de Uso</Link><label htmlFor="legal-acceptance" className="cursor-pointer"> e a </label><Link to="/privacidade" className="font-semibold text-primary hover:text-primary-700">Política de Privacidade</Link><label htmlFor="legal-acceptance" className="cursor-pointer">.</label></p>
        </div>
        {errors.hasAcceptedLegalTerms && <p id="legal-acceptance-feedback" role="alert" className="-mt-3 text-xs font-medium text-red-700">{errors.hasAcceptedLegalTerms.message}</p>}
        {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"><AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        <button disabled={!isConfigured || isSubmitting || !hasAcceptedLegalTerms} type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><span>{isSubmitting ? 'Criando conta...' : 'Criar minha conta'}</span>{!isSubmitting && <ArrowRight aria-hidden="true" className="h-4 w-4" />}</button>
      </form>
    </AuthCard>
  );
}
