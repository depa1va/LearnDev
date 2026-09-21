import { Flag, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { REPORT_REASONS } from '../../services/communityService';
import type { ReportReason } from '../../types/community';

interface ReportSubmission {
  reason: ReportReason;
  details: string;
}

interface ReportDialogProps {
  targetLabel: string;
  onClose: () => void;
  onSubmit: (values: ReportSubmission) => Promise<void>;
}

export default function ReportDialog({ targetLabel, onClose, onSubmit }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    titleRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isSubmitting, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting || isComplete) return;
    if (!reason) {
      setError('Escolha um motivo para a denúncia.');
      return;
    }
    if (reason === 'other' && details.trim().length < 5) {
      setError('Explique o motivo da denúncia em pelo menos 5 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({ reason, details });
      setIsComplete(true);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível enviar a denúncia agora.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function isReportReason(value: string): value is ReportReason {
    return REPORT_REASONS.some((item) => item.value === value);
  }

  function handleReasonChange(value: string): void {
    if (value === '') setReason('');
    else if (isReportReason(value)) setReason(value);
    setError('');
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="report-dialog-title" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-700"><Flag aria-hidden="true" className="h-5 w-5" /></span>
            <h2 ref={titleRef} id="report-dialog-title" tabIndex={-1} className="mt-4 font-heading text-2xl font-bold text-ink focus:outline-none">Denunciar {targetLabel}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">Sua denúncia será enviada para análise. Isso não remove o conteúdo automaticamente.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Fechar denúncia" className="rounded-xl p-2 text-ink/60 hover:bg-mist hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"><X aria-hidden="true" className="h-5 w-5" /></button>
        </div>

        {isComplete ? <div role="status" className="mt-7 rounded-2xl bg-green-50 px-5 py-4 text-sm leading-relaxed text-green-700">
          <p className="font-semibold">Denúncia enviada para análise.</p>
          <p className="mt-1">O conteúdo permanece disponível enquanto a análise não é realizada.</p>
          <button type="button" onClick={onClose} className="mt-4 rounded-full border border-green-700/30 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-white">Fechar</button>
        </div> : <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
          <label className="block text-sm font-semibold text-ink">Motivo
            <select value={reason} onChange={(event) => handleReasonChange(event.target.value)} disabled={isSubmitting} className="mt-2 w-full rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60">
              <option value="" disabled>Selecione um motivo</option>
              {REPORT_REASONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-ink">Detalhes {reason !== 'other' && <span className="font-normal text-ink/50">(opcional)</span>}
            <textarea value={details} onChange={(event) => { setDetails(event.target.value); setError(''); }} disabled={isSubmitting} required={reason === 'other'} minLength={reason === 'other' ? 5 : undefined} maxLength={1000} rows={5} placeholder={reason === 'other' ? 'Explique o motivo da denúncia.' : 'Inclua contexto adicional, se achar necessário.'} className="mt-2 w-full resize-y rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" />
            <span className="mt-2 block text-right text-xs font-normal text-ink/45">{details.length}/1000</span>
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-full border-2 border-ink/15 px-5 py-3 text-sm font-semibold text-ink/70 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"><Flag aria-hidden="true" className="h-4 w-4" />{isSubmitting ? 'Enviando...' : 'Enviar denúncia'}</button>
          </div>
        </form>}
      </section>
    </div>
  );
}
