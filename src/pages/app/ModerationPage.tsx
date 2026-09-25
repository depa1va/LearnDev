import { CheckCircle2, ChevronRight, EyeOff, FileWarning, Flag, ShieldCheck, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { moderationReviewSchema, type ModerationReviewFormValues } from '../../schemas/community';
import { getModerationReportTargets, getOpenReports, getPublicProfilesByUids, getReportReasonLabel, reviewReport } from '../../services/communityService';
import { getAvatarInitials } from '../../services/profileService';
import { formatStudyDateTime } from '../../utils/date';
import type { CommunityReport, ModeratedContent, ModerationAction, ModerationReportContext, ReportTargetType } from '../../types/community';
import type { PublicUserProfile } from '../../types/user';

interface ModerationPageState {
  loading: boolean;
  error: string;
  reports: CommunityReport[];
  contexts: Map<string, ModerationReportContext>;
  profiles: Map<string, PublicUserProfile>;
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  loadingMore: boolean;
}

const initialReportsState = (): ModerationPageState => ({
  loading: true,
  error: '',
  reports: [],
  contexts: new Map(),
  profiles: new Map(),
  nextCursor: null,
  hasMore: false,
  loadingMore: false,
});

function targetTypeLabel(targetType: ReportTargetType): string {
  return targetType === 'reply' ? 'Resposta' : 'Publicação';
}

function targetPreview(target: ModeratedContent | null, kind: ReportTargetType | undefined): string | null {
  if (!target) return null;
  if (kind === 'reply') return target.body;
  return 'title' in target ? target.title || target.body : target.body;
}

function Person({ profile, label }: { profile: PublicUserProfile | undefined; label: string }) {
  if (!profile) return <span className="text-sm text-ink/55">{label} indisponível</span>;

  return (
    <Link to={`/perfil/${profile.username}`} className="inline-flex min-w-0 items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <Avatar initials={getAvatarInitials(profile.displayName, profile.username)} photoURL={profile.photoURL} size="sm" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">{profile.displayName}</span>
        <span className="block truncate text-xs text-ink/55">@{profile.username}</span>
      </span>
    </Link>
  );
}

interface ModerationDialogProps {
  report: CommunityReport;
  context: ModerationReportContext | undefined;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (action: ModerationAction, resolutionNote: string) => Promise<void>;
}

function ModerationDialog({ report, context, isSubmitting, error, onClose, onSubmit }: ModerationDialogProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const targetIsPublished = context?.content?.status === 'published';
  const removeLabel = targetIsPublished ? 'Remover conteúdo' : 'Resolver denúncia';
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ModerationReviewFormValues>({
    resolver: zodResolver(moderationReviewSchema),
    defaultValues: { resolutionNote: '' },
  });
  const note = watch('resolutionNote') ?? '';

  useEffect(() => {
    headingRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  function submitReview(action: ModerationAction): void {
    void handleSubmit(({ resolutionNote }) => onSubmit(action, typeof resolutionNote === 'string' ? resolutionNote : ''))();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/45 p-4 sm:items-center sm:justify-center" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="moderation-dialog-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Revisar denúncia</p>
            <h2 ref={headingRef} tabIndex={-1} id="moderation-dialog-title" className="mt-2 font-heading text-2xl font-bold text-ink focus:outline-none">Escolha a decisão</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Fechar revisão" className="rounded-xl p-2 text-ink/60 hover:bg-mist hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"><X aria-hidden="true" className="h-5 w-5" /></button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink/65">A denúncia é sobre uma {targetTypeLabel(report.targetType).toLowerCase()}. {targetIsPublished ? 'Remover o conteúdo também resolverá esta denúncia.' : 'O conteúdo não está mais publicado; ainda é possível registrar uma decisão.'}</p>

        <label className="mt-6 block text-sm font-semibold text-ink" htmlFor="moderation-note">Observação da moderação <span className="font-normal text-ink/50">(opcional)</span>
          <textarea id="moderation-note" {...register('resolutionNote')} disabled={isSubmitting} aria-invalid={errors.resolutionNote ? 'true' : undefined} aria-describedby={errors.resolutionNote ? 'moderation-note-error' : undefined} maxLength={1000} rows={4} className="mt-2 w-full resize-y rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" placeholder="Registre apenas o contexto necessário para a decisão." />
          <span className="mt-1 block text-right text-xs font-normal text-ink/45">{note.length}/1000</span>
          {errors.resolutionNote && <span id="moderation-note-error" role="alert" className="mt-2 block text-sm font-normal text-red-700">{errors.resolutionNote.message}</span>}
        </label>

        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-full border-2 border-ink/15 px-5 py-3 text-sm font-semibold text-ink/70 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60">Cancelar</button>
          <button type="button" onClick={() => submitReview('dismiss')} disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />Descartar denúncia</button>
          <button type="button" onClick={() => submitReview('remove')} disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"><EyeOff aria-hidden="true" className="h-4 w-4" />{isSubmitting ? 'Salvando...' : removeLabel}</button>
        </div>
      </section>
    </div>
  );
}

interface ReportCardProps {
  report: CommunityReport;
  context: ModerationReportContext | undefined;
  profiles: Map<string, PublicUserProfile>;
  onReview: (report: CommunityReport) => void;
}

function ReportCard({ report, context, profiles, onReview }: ReportCardProps) {
  const content = context?.content ?? null;
  const targetAuthor = content ? profiles.get(content.authorUid) : undefined;
  const reporter = profiles.get(report.reporterUid);
  const isPublished = content?.status === 'published';
  const preview = targetPreview(content, context?.kind);

  return (
    <GlassCard hover={false} className="p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="purple"><Flag aria-hidden="true" className="h-3.5 w-3.5" />{targetTypeLabel(report.targetType)}</Badge>
          <Badge color="yellow">{getReportReasonLabel(report.reason)}</Badge>
          {content?.status === 'deleted' && <Badge color="gray">Conteúdo removido</Badge>}
          {!content && <Badge color="gray">Conteúdo indisponível</Badge>}
        </div>
        <p className="text-xs font-medium text-ink/50">{formatStudyDateTime(report.createdAt)}</p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_13rem]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">Conteúdo denunciado</p>
          {preview ? <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/75">{preview}</p> : <p className="mt-2 text-sm leading-relaxed text-ink/60">{context?.unavailable ? 'O conteúdo não pôde ser carregado para análise agora.' : 'O conteúdo não está mais publicado.'}</p>}
          {isPublished && <Link to={`/comunidade/posts/${report.postId}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-700">Abrir contexto público <ChevronRight aria-hidden="true" className="h-4 w-4" /></Link>}
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">Autor do conteúdo</p>
          <div className="mt-3"><Person profile={targetAuthor} label="Autor" /></div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink/8 bg-white/70 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">Detalhes da denúncia</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/70">{report.details || 'Nenhum detalhe adicional foi informado.'}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-ink/8 pt-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">Denunciante</p>
          <div className="mt-2"><Person profile={reporter} label="Denunciante" /></div>
        </div>
        <button type="button" onClick={() => onReview(report)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700"><ShieldCheck aria-hidden="true" className="h-4 w-4" />Analisar denúncia</button>
      </div>
    </GlassCard>
  );
}

export default function ModerationPage() {
  const [state, setState] = useState<ModerationPageState>(initialReportsState);
  const [retry, setRetry] = useState(0);
  const [reviewingReport, setReviewingReport] = useState<CommunityReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const isMountedRef = useRef(false);
  const initialLoadRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function hydrateReports(reports: CommunityReport[]): Promise<{ contexts: Map<string, ModerationReportContext>; profiles: Map<string, PublicUserProfile> }> {
    const contexts = await getModerationReportTargets(reports);
    const uids = reports.flatMap((report) => [report.reporterUid, contexts.get(report.id)?.content?.authorUid]).filter((uid): uid is string => typeof uid === 'string' && uid.length > 0);
    let profiles = new Map<string, PublicUserProfile>();
    try {
      profiles = await getPublicProfilesByUids(uids);
    } catch {
      // A revisão permanece possível caso um perfil público esteja indisponível.
    }
    return { contexts, profiles };
  }

  useEffect(() => {
    if (initialLoadRef.current) return undefined;

    async function loadReports(): Promise<void> {
      setState(initialReportsState());
      try {
        const result = await getOpenReports();
        const hydrated = await hydrateReports(result.reports);
        if (isMountedRef.current) setState({ loading: false, error: '', reports: result.reports, ...hydrated, nextCursor: result.nextCursor, hasMore: result.hasMore, loadingMore: false });
      } catch (error: unknown) {
        console.error('Não foi possível carregar as denúncias abertas.', error);
        if (isMountedRef.current) setState({ ...initialReportsState(), loading: false, error: error instanceof Error ? error.message : 'Não foi possível carregar as denúncias agora.' });
      } finally {
        initialLoadRef.current = null;
      }
    }

    initialLoadRef.current = loadReports();
    return undefined;
  }, [retry]);

  async function handleLoadMore(): Promise<void> {
    if (state.loadingMore || !state.hasMore || !state.nextCursor) return;
    setState((current) => ({ ...current, loadingMore: true }));

    try {
      const result = await getOpenReports({ cursor: state.nextCursor });
      const hydrated = await hydrateReports(result.reports);
      setState((current) => {
        const known = new Set(current.reports.map((report) => report.id));
        const reports = [...current.reports, ...result.reports.filter((report) => !known.has(report.id))];
        return {
          ...current,
          loadingMore: false,
          error: '',
          reports,
          contexts: new Map([...current.contexts, ...hydrated.contexts]),
          profiles: new Map([...current.profiles, ...hydrated.profiles]),
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
        };
      });
    } catch (error: unknown) {
      console.error('Não foi possível carregar mais denúncias abertas.', error);
      setState((current) => ({ ...current, loadingMore: false, error: error instanceof Error ? error.message : 'Não foi possível carregar mais denúncias agora.' }));
    }
  }

  async function handleReview(action: ModerationAction, resolutionNote: string): Promise<void> {
    if (!reviewingReport || isSubmitting) return;
    setIsSubmitting(true);
    setActionError('');

    try {
      await reviewReport({ reportId: reviewingReport.id, action, resolutionNote });
      setState((current) => ({ ...current, reports: current.reports.filter((report) => report.id !== reviewingReport.id) }));
      setReviewingReport(null);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível concluir a revisão agora.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageFrame>
      <PageIntro eyebrow="Área restrita" title="Moderação da comunidade" description="Analise denúncias abertas e registre decisões para manter as conversas focadas em aprendizado e respeito." />

      {state.loading ? <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Carregando denúncias abertas...</div> : state.error && state.reports.length === 0 ? <EmptyState icon={FileWarning} title="Não foi possível carregar as denúncias." description={state.error} action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Tentar novamente</button>} /> : state.reports.length === 0 ? <EmptyState icon={ShieldCheck} title="Nenhuma denúncia pendente." description="As novas denúncias da comunidade aparecerão aqui para análise." /> : <div className="space-y-5">
        {state.error && <p role="alert" className="rounded-2xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-950">{state.error}</p>}
        {state.reports.map((report) => <ReportCard key={report.id} report={report} context={state.contexts.get(report.id)} profiles={state.profiles} onReview={(selectedReport) => { setReviewingReport(selectedReport); setActionError(''); }} />)}
        {state.hasMore && <div className="flex justify-center"><button type="button" onClick={handleLoadMore} disabled={state.loadingMore} className="rounded-full border-2 border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60">{state.loadingMore ? 'Carregando...' : 'Carregar mais denúncias'}</button></div>}
      </div>}

      {reviewingReport && <ModerationDialog report={reviewingReport} context={state.contexts.get(reviewingReport.id)} isSubmitting={isSubmitting} error={actionError} onClose={() => { if (!isSubmitting) { setReviewingReport(null); setActionError(''); } }} onSubmit={handleReview} />}
    </PageFrame>
  );
}
