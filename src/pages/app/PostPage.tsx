import { CheckCircle2, FileQuestion, Flag, Lightbulb, Pencil, Send, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CommunityPostForm from '../../components/community/CommunityPostForm';
import HelpfulButton from '../../components/community/HelpfulButton';
import ReportDialog from '../../components/community/ReportDialog';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { useAuth } from '../../providers/AuthProvider';
import { replySchema, type ReplyFormValues } from '../../schemas/community';
import {
  COMMUNITY_LIMITS,
  createReport,
  createReply,
  deletePost,
  deleteReply,
  getPostHelpfulSummary,
  getPostById,
  getPublicProfilesByUids,
  getReplies,
  getReplyHelpfulStates,
  togglePostHelpful,
  toggleReplyHelpful,
  updatePost,
  updateReply,
} from '../../services/communityService';
import { getAvatarInitials } from '../../services/profileService';
import { formatStudyDateTime } from '../../utils/date';
import type {
  CommunityPost,
  CommunityPostInput,
  CommunityReply,
  HelpfulState,
  PostType,
  ReportReason,
  ReportTarget,
} from '../../types/community';
import type { PublicUserProfile } from '../../types/user';

interface PostPageState {
  loading: boolean;
  error: boolean;
  repliesError: boolean;
  post: CommunityPost | null;
  replies: CommunityReply[];
  authors: Map<string, PublicUserProfile>;
}

interface HelpfulPageState {
  loading: boolean;
  error: string;
  post: HelpfulState & { count: number | null };
  replies: Map<string, HelpfulState>;
}

interface ReportSubmission {
  reason: ReportReason;
  details: string;
}

const initialPostState = (): PostPageState => ({
  loading: true,
  error: false,
  repliesError: false,
  post: null,
  replies: [],
  authors: new Map(),
});

const initialHelpfulState = (): HelpfulPageState => ({
  loading: true,
  error: '',
  post: { count: null, isHelpful: false, isSaving: false },
  replies: new Map(),
});

function postTypeLabel(type: PostType): string {
  return type === 'question' ? 'Pergunta' : 'Discussão';
}

function reportTargetKey(target: ReportTarget): string {
  return target.targetType === 'post' ? `post:${target.postId}` : `reply:${target.postId}:${target.replyId}`;
}

function AuthorIdentity({ profile }: { profile: PublicUserProfile | undefined }) {
  if (!profile) return <span className="text-sm text-ink/55">Autor indisponível</span>;

  return (
    <Link to={`/perfil/${profile.username}`} className="inline-flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <Avatar initials={getAvatarInitials(profile.displayName, profile.username)} photoURL={profile.photoURL} size="md" />
      <span className="min-w-0">
        <span className="block truncate font-semibold text-ink hover:text-primary">{profile.displayName}</span>
        <span className="block truncate text-sm text-ink/55">@{profile.username}</span>
      </span>
    </Link>
  );
}

function ReplyComposer({ onSubmit }: { onSubmit: (body: string) => Promise<void> }) {
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting: isSaving },
  } = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { body: '' },
  });
  const body = watch('body') ?? '';

  async function submitReply({ body: replyBody }: ReplyFormValues): Promise<void> {
    if (isSaving) return;
    if (typeof replyBody !== 'string') return;
    setError('');
    try {
      await onSubmit(replyBody);
      reset({ body: '' });
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível enviar sua resposta agora.');
    }
  }

  return (
    <form onSubmit={handleSubmit(submitReply)} noValidate>
      <label className="block text-sm font-semibold text-ink">Escreva uma resposta
        <textarea {...register('body', { onChange: () => setError('') })} disabled={isSaving} aria-invalid={errors.body ? 'true' : undefined} aria-describedby={errors.body ? 'reply-body-error' : undefined} required minLength={COMMUNITY_LIMITS.replyBody.min} maxLength={COMMUNITY_LIMITS.replyBody.max} rows={6} placeholder="Compartilhe uma explicação, uma sugestão ou uma pergunta complementar." className="mt-2 w-full resize-y rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" />
        <span className="mt-2 block text-right text-xs font-normal text-ink/45">{body.length}/{COMMUNITY_LIMITS.replyBody.max}</span>
        {errors.body && <span id="reply-body-error" role="alert" className="mt-2 block text-sm font-normal text-red-700">{errors.body.message}</span>}
      </label>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={isSaving} className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"><Send aria-hidden="true" className="h-4 w-4" />{isSaving ? 'Enviando...' : 'Publicar resposta'}</button>
    </form>
  );
}

interface ReplyCardProps {
  reply: CommunityReply;
  author: PublicUserProfile | undefined;
  isAuthor: boolean;
  onUpdate: (replyId: string, body: string) => Promise<void>;
  onDelete: (replyId: string) => Promise<void>;
  helpful: HelpfulState;
  onToggleHelpful: (replyId: string) => void;
  onReport: (reply: CommunityReply) => void;
  isReported: boolean;
}

function ReplyCard({ reply, author, isAuthor, onUpdate, onDelete, helpful, onToggleHelpful, onReport, isReported }: ReplyCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { body: reply.body },
  });
  const isSaving = isSubmitting || isDeleting;

  useEffect(() => {
    reset({ body: reply.body });
  }, [reply.body, reset]);

  async function submitEditedReply({ body: updatedBody }: ReplyFormValues): Promise<void> {
    if (isSaving) return;
    if (typeof updatedBody !== 'string') return;
    setError('');
    try {
      await onUpdate(reply.id, updatedBody);
      setIsEditing(false);
    } catch (updateError: unknown) {
      setError(updateError instanceof Error ? updateError.message : 'Não foi possível editar a resposta agora.');
    }
  }

  async function handleDelete(): Promise<void> {
    if (isSaving) return;
    setIsDeleting(true);
    setError('');
    try {
      await onDelete(reply.id);
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir a resposta agora.');
      setIsDeleting(false);
    }
  }

  return (
    <li className="rounded-3xl border border-ink/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AuthorIdentity profile={author} />
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-medium text-ink/50">{formatStudyDateTime(reply.createdAt)}</p>
          {isAuthor && !isEditing && <>
            <button type="button" onClick={() => { reset({ body: reply.body }); setIsEditing(true); setError(''); }} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-700"><Pencil aria-hidden="true" className="h-4 w-4" />Editar</button>
            <button type="button" onClick={() => setIsConfirmingDelete(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-900"><Trash2 aria-hidden="true" className="h-4 w-4" />Excluir</button>
          </>}
        </div>
      </div>
      {isEditing ? <form onSubmit={handleSubmit(submitEditedReply)} noValidate className="mt-5">
        <label className="sr-only" htmlFor={`reply-${reply.id}`}>Editar resposta</label>
        <textarea id={`reply-${reply.id}`} {...register('body', { onChange: () => setError('') })} disabled={isSaving} aria-invalid={errors.body ? 'true' : undefined} aria-describedby={errors.body ? `reply-${reply.id}-error` : undefined} minLength={COMMUNITY_LIMITS.replyBody.min} maxLength={COMMUNITY_LIMITS.replyBody.max} rows={5} className="w-full resize-y rounded-xl border border-ink/10 bg-mist px-4 py-3 text-ink focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60" />
        {errors.body && <p id={`reply-${reply.id}-error`} role="alert" className="mt-2 text-sm text-red-700">{errors.body.message}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />{isSaving ? 'Salvando...' : 'Salvar resposta'}</button>
          <button type="button" onClick={() => { setIsEditing(false); reset({ body: reply.body }); setError(''); }} disabled={isSaving} className="rounded-full border-2 border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink/70 hover:border-primary hover:text-primary">Cancelar</button>
        </div>
      </form> : <p className="mt-5 whitespace-pre-wrap leading-relaxed text-ink/75">{reply.body}</p>}
      {!isEditing && <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-ink/5 pt-5">
        <HelpfulButton isHelpful={helpful.isHelpful} isLoading={helpful.isSaving || helpful.isLoading} onClick={() => onToggleHelpful(reply.id)} />
        {!isAuthor && <button type="button" onClick={() => onReport(reply)} disabled={isReported} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink/60 hover:bg-mist hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"><Flag aria-hidden="true" className="h-4 w-4" />{isReported ? 'Denúncia enviada' : 'Denunciar'}</button>}
      </div>}
      {isConfirmingDelete && <div role="alertdialog" aria-label="Confirmar exclusão da resposta" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-950">
        <p className="font-semibold">Excluir resposta?</p>
        <p className="mt-1 leading-relaxed">A resposta deixará de aparecer para a comunidade.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={handleDelete} disabled={isSaving} className="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Excluindo...' : 'Confirmar exclusão'}</button>
          <button type="button" onClick={() => setIsConfirmingDelete(false)} disabled={isSaving} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-white">Cancelar</button>
        </div>
      </div>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </li>
  );
}

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<PostPageState>(initialPostState);
  const [retry, setRetry] = useState(0);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [helpful, setHelpful] = useState<HelpfulPageState>(initialHelpfulState);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportedTargets, setReportedTargets] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let active = true;
    setState(initialPostState());
    setIsEditingPost(false);
    setIsConfirmingDelete(false);
    setDeleteError('');
    setHelpful(initialHelpfulState());
    setReportTarget(null);
    setReportedTargets(new Set());

    async function loadHelpful(contentPost: CommunityPost, contentReplies: CommunityReply[]): Promise<void> {
      try {
        const [postHelpful, replyHelpfulStates] = await Promise.all([
          getPostHelpfulSummary(contentPost.id),
          getReplyHelpfulStates(contentPost.id, contentReplies.map((reply) => reply.id)),
        ]);
        if (!active) return;
        setHelpful({
          loading: false,
          error: '',
          post: { ...postHelpful, isSaving: false },
          replies: new Map([...replyHelpfulStates].map(([replyId, isHelpful]) => [replyId, { isHelpful, isSaving: false }])),
        });
      } catch (helpfulError: unknown) {
        if (!active) return;
        setHelpful({ ...initialHelpfulState(), loading: false, error: helpfulError instanceof Error ? helpfulError.message : 'Não foi possível carregar as reações agora.' });
      }
    }

    async function loadPost(): Promise<void> {
      try {
        const post = await getPostById(postId);
        if (!post) {
          if (active) setState({ ...initialPostState(), loading: false });
          return;
        }
        let replies: CommunityReply[] = [];
        let repliesError = false;
        try {
          replies = await getReplies(post.id);
        } catch {
          repliesError = true;
        }
        let authors = new Map<string, PublicUserProfile>();
        try {
          authors = await getPublicProfilesByUids([post.authorUid, ...replies.map((reply) => reply.authorUid)]);
        } catch {
          // O conteúdo público continua acessível com um fallback neutro para o autor.
        }
        if (active) setState({ loading: false, error: false, repliesError, post, replies, authors });
        void loadHelpful(post, replies);
      } catch {
        if (active) setState({ ...initialPostState(), loading: false, error: true });
      }
    }

    void loadPost();
    return () => {
      active = false;
    };
  }, [postId, retry]);

  const post = state.post;
  const isPostAuthor = post?.authorUid === user?.uid;

  async function refreshReplies(): Promise<void> {
    if (!post) return;
    const replies = await getReplies(post.id);
    let authors = new Map<string, PublicUserProfile>();
    try {
      authors = await getPublicProfilesByUids([post.authorUid, ...replies.map((reply) => reply.authorUid)]);
    } catch {
      // A resposta nova continua visível mesmo se a leitura do perfil público falhar.
    }
    setState((current) => ({ ...current, repliesError: false, replies, authors: new Map([...current.authors, ...authors]) }));
    try {
      const replyHelpfulStates = await getReplyHelpfulStates(post.id, replies.map((reply) => reply.id));
      setHelpful((current) => ({
        ...current,
        replies: new Map([...replyHelpfulStates].map(([replyId, isHelpful]) => [replyId, { isHelpful, isSaving: false }])),
      }));
    } catch (helpfulError: unknown) {
      setHelpful((current) => ({ ...current, error: helpfulError instanceof Error ? helpfulError.message : 'Não foi possível carregar as reações das respostas agora.' }));
    }
  }

  async function handleCreateReply(body: string): Promise<void> {
    if (!post) return;
    // createReply aciona, após persistir a resposta, a API de notificações documentada com postId e replyId.
    const reply = await createReply(post.id, body);

    try {
      await refreshReplies();
    } catch (error: unknown) {
      console.error('[community:refreshReplies] Firestore read failed after reply creation', {
        message: error instanceof Error ? error.message : undefined,
      });
      const fallbackReply: CommunityReply = { ...reply, status: 'published' };
      setState((current) => ({
        ...current,
        repliesError: true,
        replies: current.replies.some((item) => item.id === fallbackReply.id)
          ? current.replies
          : [...current.replies, fallbackReply],
      }));
    }
  }

  async function handleUpdatePost(values: CommunityPostInput): Promise<void> {
    if (!post) return;
    const updated = await updatePost(post.id, values);
    setState((current) => ({ ...current, post: current.post ? { ...current.post, ...updated } : null }));
    setIsEditingPost(false);
  }

  async function handleDeletePost(): Promise<void> {
    if (!post || isDeleting) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deletePost(post.id);
      navigate('/comunidade', { replace: true });
    } catch (error: unknown) {
      setDeleteError(error instanceof Error ? error.message : 'Não foi possível excluir a publicação agora.');
      setIsDeleting(false);
    }
  }

  async function handleUpdateReply(replyId: string, body: string): Promise<void> {
    if (!post) return;
    const updatedBody = await updateReply(post.id, replyId, body);
    setState((current) => ({ ...current, replies: current.replies.map((reply) => reply.id === replyId ? { ...reply, body: updatedBody } : reply) }));
  }

  async function handleDeleteReply(replyId: string): Promise<void> {
    if (!post) return;
    await deleteReply(post.id, replyId);
    setState((current) => ({ ...current, replies: current.replies.filter((reply) => reply.id !== replyId) }));
    setHelpful((current) => {
      const replies = new Map(current.replies);
      replies.delete(replyId);
      return { ...current, replies };
    });
  }

  async function handleTogglePostHelpful(): Promise<void> {
    if (!post || helpful.loading || helpful.post.isSaving) return;
    const previousHelpful = helpful.post.isHelpful;
    setHelpful((current) => ({ ...current, error: '', post: { ...current.post, isSaving: true } }));
    try {
      // Ao marcar como útil, o communityService solicita a API de notificações somente após confirmar o marcador no Firestore.
      const isHelpful = await togglePostHelpful(post.id, previousHelpful);
      setHelpful((current) => ({
        ...current,
        post: {
          ...current.post,
          isHelpful,
          isSaving: false,
          count: Number.isInteger(current.post.count) ? Math.max(0, current.post.count + (isHelpful ? 1 : -1)) : null,
        },
      }));
    } catch (helpfulError: unknown) {
      setHelpful((current) => ({ ...current, error: helpfulError instanceof Error ? helpfulError.message : 'Não foi possível atualizar a reação agora.', post: { ...current.post, isSaving: false } }));
    }
  }

  async function handleToggleReplyHelpful(replyId: string): Promise<void> {
    if (!post || helpful.loading) return;
    const previous = helpful.replies.get(replyId) ?? { isHelpful: false, isSaving: false };
    if (previous.isSaving) return;
    setHelpful((current) => {
      const replies = new Map(current.replies);
      replies.set(replyId, { ...previous, isSaving: true });
      return { ...current, error: '', replies };
    });
    try {
      // A resposta usa o mesmo fluxo documentado, incluindo postId e replyId para validação server-side.
      const isHelpful = await toggleReplyHelpful(post.id, replyId, previous.isHelpful);
      setHelpful((current) => {
        const replies = new Map(current.replies);
        replies.set(replyId, { isHelpful, isSaving: false });
        return { ...current, replies };
      });
    } catch (helpfulError: unknown) {
      setHelpful((current) => {
        const replies = new Map(current.replies);
        replies.set(replyId, { ...previous, isSaving: false });
        return { ...current, error: helpfulError instanceof Error ? helpfulError.message : 'Não foi possível atualizar a reação agora.', replies };
      });
    }
  }

  async function handleSubmitReport(values: ReportSubmission): Promise<void> {
    if (!reportTarget) return;
    if (reportTarget.targetType === 'post') {
      await createReport({ targetType: 'post', postId: reportTarget.postId, replyId: null, ...values });
    } else {
      await createReport({ targetType: 'reply', postId: reportTarget.postId, replyId: reportTarget.replyId, ...values });
    }
    setReportedTargets((current) => new Set([...current, reportTargetKey(reportTarget)]));
  }

  return (
    <PageFrame className="max-w-4xl">
      {state.loading ? <><PageIntro backTo="/comunidade" backLabel="Voltar para comunidade" eyebrow="Publicação" title="Carregando publicação" /><div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Carregando publicação e respostas...</div></> : state.error ? <><PageIntro backTo="/comunidade" backLabel="Voltar para comunidade" eyebrow="Publicação" title="Publicação indisponível" /><EmptyState icon={FileQuestion} title="Não foi possível carregar esta publicação." description="Tente novamente em alguns instantes." action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Tentar novamente</button>} /></> : !post ? <><PageIntro backTo="/comunidade" backLabel="Voltar para comunidade" eyebrow="Publicação" title="Publicação não encontrada" /><EmptyState icon={FileQuestion} title="Esta publicação não está disponível." description="Ela pode ter sido removida ou este endereço não corresponde a uma publicação publicada." /></> : <>
        <PageIntro backTo="/comunidade" backLabel="Voltar para comunidade" eyebrow={postTypeLabel(post.type)} title={post.title} />
        <div className="space-y-8">
          {isEditingPost ? <GlassCard hover={false} className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Editar publicação</p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-ink">Atualize seu conteúdo</h2>
            <div className="mt-7"><CommunityPostForm initialValues={post} onSubmit={handleUpdatePost} onCancel={() => setIsEditingPost(false)} submitLabel="Salvar publicação" mode="edit" /></div>
          </GlassCard> : <GlassCard hover={false} className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Badge color={post.type === 'question' ? 'blue' : 'purple'}>{postTypeLabel(post.type)}</Badge>
              <p className="text-sm text-ink/55">Publicado em {formatStudyDateTime(post.createdAt)}</p>
            </div>
            <div className="mt-6"><AuthorIdentity profile={state.authors.get(post.authorUid)} /></div>
            <p className="mt-7 whitespace-pre-wrap text-base leading-8 text-ink/75">{post.body}</p>
            {post.tags.length > 0 && <div className="mt-7 flex flex-wrap gap-2">{post.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}</div>}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink/5 pt-6">
              <HelpfulButton isHelpful={helpful.post.isHelpful} count={helpful.loading ? null : helpful.post.count} isLoading={helpful.loading || helpful.post.isSaving} onClick={handleTogglePostHelpful} />
              {!isPostAuthor && <button type="button" onClick={() => setReportTarget({ targetType: 'post', postId: post.id, replyId: null })} disabled={reportedTargets.has(reportTargetKey({ targetType: 'post', postId: post.id, replyId: null }))} className="inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold text-ink/60 hover:bg-mist hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"><Flag aria-hidden="true" className="h-4 w-4" />{reportedTargets.has(reportTargetKey({ targetType: 'post', postId: post.id, replyId: null })) ? 'Denúncia enviada' : 'Denunciar'}</button>}
              {isPostAuthor && <>
                <button type="button" onClick={() => setIsEditingPost(true)} className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white"><Pencil aria-hidden="true" className="h-4 w-4" />Editar publicação</button>
                <button type="button" onClick={() => setIsConfirmingDelete(true)} className="inline-flex items-center gap-2 rounded-full border-2 border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 aria-hidden="true" className="h-4 w-4" />Excluir publicação</button>
              </>}
            </div>
            {helpful.error && <p role="alert" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">{helpful.error}</p>}
            {isConfirmingDelete && <div role="alertdialog" aria-label="Confirmar exclusão da publicação" className="mt-6 rounded-2xl bg-red-50 p-5 text-sm text-red-950">
              <p className="font-semibold">Excluir publicação?</p>
              <p className="mt-1 leading-relaxed">A publicação e suas respostas deixarão de aparecer para a comunidade. Essa ação não apaga os documentos físicos nesta fase.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={handleDeletePost} disabled={isDeleting} className="rounded-full bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">{isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}</button>
                <button type="button" onClick={() => { setIsConfirmingDelete(false); setDeleteError(''); }} disabled={isDeleting} className="rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-800 hover:bg-white">Cancelar</button>
              </div>
              {deleteError && <p role="alert" className="mt-4 rounded-xl bg-white px-4 py-3 text-red-700">{deleteError}</p>}
            </div>}
          </GlassCard>}

          <section aria-labelledby="replies-heading">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Conversa</p>
              <h2 id="replies-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Respostas</h2>
            </div>
            <GlassCard hover={false} className="p-6 sm:p-7"><ReplyComposer onSubmit={handleCreateReply} /></GlassCard>
            {state.repliesError ? <div role="alert" className="mt-5 rounded-2xl bg-amber-50 px-6 py-5 text-sm leading-relaxed text-amber-950">Não foi possível carregar as respostas agora. A publicação continua disponível; tente atualizar a página em alguns instantes.</div> : state.replies.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-8 text-sm leading-relaxed text-ink/60">Ainda não há respostas.</div> : <ol className="mt-5 space-y-4">{state.replies.map((reply) => <ReplyCard key={reply.id} reply={reply} author={state.authors.get(reply.authorUid)} isAuthor={reply.authorUid === user?.uid} helpful={{ ...(helpful.replies.get(reply.id) ?? { isHelpful: false, isSaving: false }), isLoading: helpful.loading }} onToggleHelpful={handleToggleReplyHelpful} onReport={(targetReply) => setReportTarget({ targetType: 'reply', postId: post.id, replyId: targetReply.id })} isReported={reportedTargets.has(reportTargetKey({ targetType: 'reply', postId: post.id, replyId: reply.id }))} onUpdate={handleUpdateReply} onDelete={handleDeleteReply} />)}</ol>}
          </section>

          <div className="rounded-2xl bg-mist px-5 py-4 text-sm leading-relaxed text-ink/65"><Lightbulb aria-hidden="true" className="mr-2 inline h-4 w-4 text-primary" />Mantenha a conversa focada no aprendizado e trate outras pessoas com respeito.</div>
        </div>
        {reportTarget && <ReportDialog targetLabel={reportTarget.targetType === 'post' ? 'publicação' : 'resposta'} onClose={() => setReportTarget(null)} onSubmit={handleSubmitReport} />}
      </>}
    </PageFrame>
  );
}
