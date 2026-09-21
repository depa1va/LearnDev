import { useState } from 'react';
import { AlertCircle, ArrowRight, AtSign, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { getAuthErrorMessage, registerUser, validateUsername } from '../../services/authService';
import AuthCard from './AuthCard';
import AuthField from './AuthField';
import type { FormEvent, ReactElement } from 'react';

interface SignUpForm {
  displayName: string;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

const initialForm: SignUpForm = { displayName: '', username: '', email: '', password: '', passwordConfirmation: '' };

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
  const [form, setForm] = useState(initialForm);
  const [hasAcceptedLegalTerms, setHasAcceptedLegalTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof SignUpForm, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!isConfigured || isSubmitting) return;

    if (form.displayName.trim().length < 2 || form.displayName.trim().length > 80) {
      setError('Informe um nome entre 2 e 80 caracteres.');
      return;
    }

    const usernameError = validateUsername(form.username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (form.password.length < 6) {
      setError('Use uma senha com pelo menos 6 caracteres.');
      return;
    }

    if (form.password !== form.passwordConfirmation) {
      setError('A confirmação de senha não corresponde à senha informada.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const result = await registerUser({ ...form, hasAcceptedLegalTerms });
      navigate('/verificar-email', { replace: true, state: { verificationEmailSent: result.verificationEmailSent } });
    } catch (submissionError: unknown) {
      setError(getAuthErrorMessage(submissionError, 'Não foi possível criar sua conta. Tente novamente.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const configurationNotice = !isConfigured
    ? `Configure ${configurationMissing.join(', ')} em .env.local para habilitar o cadastro.`
    : null;

  return (
    <AuthCard eyebrow="Cadastro" title="Crie sua conta" description="Organize seus estudos, pratique e retome o aprendizado quando quiser." notice={configurationNotice} footer={<><span>Já possui uma conta? </span><Link to="/entrar" className="font-semibold text-primary hover:text-primary-700">Entrar</Link></>}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField label="Nome completo" icon={UserRound} required disabled={!isConfigured || isSubmitting} value={form.displayName} onChange={(event) => updateField('displayName', event.target.value)} type="text" autoComplete="name" placeholder="Como você quer ser chamado(a)?" />
        <AuthField label="Nome de usuário" icon={AtSign} required disabled={!isConfigured || isSubmitting} value={form.username} onChange={(event) => updateField('username', event.target.value)} type="text" autoComplete="username" placeholder="exemplo_dev" hint="De 3 a 20 caracteres: letras, números e underscore." />
        <AuthField label="E-mail" icon={Mail} required disabled={!isConfigured || isSubmitting} value={form.email} onChange={(event) => updateField('email', event.target.value)} type="email" autoComplete="email" placeholder="voce@exemplo.com" />

        <div className="border-t border-ink/10 pt-5">
          <AuthField label="Senha" icon={LockKeyhole} required disabled={!isConfigured || isSubmitting} value={form.password} onChange={(event) => updateField('password', event.target.value)} type="password" autoComplete="new-password" placeholder="Crie uma senha" hint="A senha precisa ter pelo menos 6 caracteres." />
          <PasswordStrength password={form.password} />
        </div>

        <AuthField label="Confirmar senha" icon={LockKeyhole} required disabled={!isConfigured || isSubmitting} value={form.passwordConfirmation} onChange={(event) => updateField('passwordConfirmation', event.target.value)} type="password" autoComplete="new-password" placeholder="Repita sua senha" feedback={form.passwordConfirmation ? (form.password === form.passwordConfirmation ? { tone: 'success', text: 'As senhas coincidem.' } : { tone: 'error', text: 'As senhas ainda não coincidem.' }) : undefined} />

        <div className="flex items-start gap-3 border-t border-ink/10 pt-5 text-sm leading-relaxed text-ink/70">
          <input id="legal-acceptance" required checked={hasAcceptedLegalTerms} disabled={!isConfigured || isSubmitting} onChange={(event) => setHasAcceptedLegalTerms(event.target.checked)} type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink/30 text-primary focus:ring-primary disabled:cursor-not-allowed" />
          <p><label htmlFor="legal-acceptance" className="cursor-pointer">Li e aceito os </label><Link to="/termos" className="font-semibold text-primary hover:text-primary-700">Termos de Uso</Link><label htmlFor="legal-acceptance" className="cursor-pointer"> e a </label><Link to="/privacidade" className="font-semibold text-primary hover:text-primary-700">Política de Privacidade</Link><label htmlFor="legal-acceptance" className="cursor-pointer">.</label></p>
        </div>
        {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"><AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        <button disabled={!isConfigured || isSubmitting || !hasAcceptedLegalTerms} type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><span>{isSubmitting ? 'Criando conta...' : 'Criar minha conta'}</span>{!isSubmitting && <ArrowRight aria-hidden="true" className="h-4 w-4" />}</button>
      </form>
    </AuthCard>
  );
}
