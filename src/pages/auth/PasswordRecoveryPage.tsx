import { useState } from 'react';
import { AlertCircle, Mail, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { getAuthErrorMessage, requestPasswordReset } from '../../services/authService';
import AuthCard from './AuthCard';
import AuthField from './AuthField';
import type { FormEvent, ReactElement } from 'react';

export default function PasswordRecoveryPage(): ReactElement {
  const { isConfigured, configurationMissing } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!isConfigured || isSubmitting) return;

    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSuccess('Se houver uma conta associada a este e-mail, você receberá as instruções para redefinir a senha.');
    } catch (submissionError: unknown) {
      setError(getAuthErrorMessage(submissionError, 'Não foi possível solicitar a redefinição agora. Tente novamente.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const configurationNotice = !isConfigured
    ? `Configure ${configurationMissing.join(', ')} em .env.local para habilitar a recuperação.`
    : null;

  return (
    <AuthCard eyebrow="Recuperar acesso" title="Redefina sua senha" description="Informe seu e-mail e enviaremos instruções para recuperar o acesso." notice={configurationNotice} footer={<Link to="/entrar" className="font-semibold text-primary hover:text-primary-700">Voltar para entrar</Link>}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField label="E-mail" icon={Mail} required disabled={!isConfigured || isSubmitting} value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="voce@exemplo.com" />
        {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"><AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-950">{success}</p>}
        <button disabled={!isConfigured || isSubmitting} type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><Send aria-hidden="true" className="h-4 w-4" />{isSubmitting ? 'Enviando...' : 'Enviar instruções'}</button>
      </form>
    </AuthCard>
  );
}
