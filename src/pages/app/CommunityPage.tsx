import { ArrowRight, MessageCircleHeart, MessagesSquare, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import CommunityPostForm from '../../components/community/CommunityPostForm';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { createPost, getPosts, getPublicProfilesByUids } from '../../services/communityService';
import { getAvatarInitials } from '../../services/profileService';
import { formatStudyDateTime } from '../../utils/date';
import type { CommunityPost, CommunityPostInput, CreatedCommunityPost, PostType } from '../../types/community';
import type { PublicUserProfile } from '../../types/user';

interface CommunityPageState {
  loading: boolean;
  error: boolean;
  posts: CommunityPost[];
  authors: Map<string, PublicUserProfile>;
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  loadingMore: boolean;
}

const initialCommunityState = (): CommunityPageState => ({
  loading: true,
  error: false,
  posts: [],
  authors: new Map(),
  nextCursor: null,
  hasMore: false,
  loadingMore: false,
});

function postTypeLabel(type: PostType): string {
  return type === 'question' ? 'Pergunta' : 'Discussão';
}

function excerpt(value: string, maxLength = 220): string {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

function PostAuthor({ profile }: { profile: PublicUserProfile | undefined }) {
  if (!profile) return <span className="text-sm text-ink/55">Autor indisponível</span>;

  return (
    <Link to={`/perfil/${profile.username}`} className="inline-flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <Avatar initials={getAvatarInitials(profile.displayName, profile.username)} photoURL={profile.photoURL} size="sm" />
      <span className="min-w-0 text-left">
        <span className="block truncate text-sm font-semibold text-ink hover:text-primary">{profile.displayName}</span>
        <span className="block truncate text-xs text-ink/55">@{profile.username}</span>
      </span>
    </Link>
  );
}

function PostCard({ post, author }: { post: CommunityPost; author: PublicUserProfile | undefined }) {
  return (
    <GlassCard hover className="p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge color={post.type === 'question' ? 'blue' : 'purple'}>{postTypeLabel(post.type)}</Badge>
        <p className="text-xs font-medium text-ink/50">{formatStudyDateTime(post.createdAt)}</p>
      </div>
      <Link to={`/comunidade/posts/${post.id}`} className="mt-4 block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <h2 className="font-heading text-2xl font-bold leading-tight text-ink hover:text-primary">{post.title}</h2>
        <p className="mt-3 leading-relaxed text-ink/65">{excerpt(post.body)}</p>
      </Link>
      {post.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{post.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}</div>}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink/5 pt-5">
        <PostAuthor profile={author} />
        <Link to={`/comunidade/posts/${post.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700">Ler publicação <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
      </div>
    </GlassCard>
  );
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<CommunityPageState>(initialCommunityState);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setState(initialCommunityState());

    async function loadInitialPosts(): Promise<void> {
      try {
        const result = await getPosts();
        let authors = new Map<string, PublicUserProfile>();
        try {
          authors = await getPublicProfilesByUids(result.posts.map((post) => post.authorUid));
        } catch {
          // A listagem continua útil mesmo se um perfil público estiver indisponível.
        }
        if (active) setState({ loading: false, error: false, posts: result.posts, authors, nextCursor: result.nextCursor, hasMore: result.hasMore, loadingMore: false });
      } catch {
        if (active) setState({ ...initialCommunityState(), loading: false });
      }
    }

    void loadInitialPosts();
    return () => {
      active = false;
    };
  }, [retry]);

  async function handleLoadMore(): Promise<void> {
    if (state.loadingMore || !state.hasMore || !state.nextCursor) return;
    setState((current) => ({ ...current, loadingMore: true }));

    try {
      const result = await getPosts({ cursor: state.nextCursor });
      let authors = new Map<string, PublicUserProfile>();
      try {
        authors = await getPublicProfilesByUids(result.posts.map((post) => post.authorUid));
      } catch {
        // Os cards usam um fallback neutro quando os perfis públicos não puderem ser lidos.
      }
      setState((current) => {
        const knownIds = new Set(current.posts.map((post) => post.id));
        const posts = [...current.posts, ...result.posts.filter((post) => !knownIds.has(post.id))];
        const mergedAuthors = new Map(current.authors);
        authors.forEach((profile, uid) => mergedAuthors.set(uid, profile));
        return { ...current, error: false, posts, authors: mergedAuthors, nextCursor: result.nextCursor, hasMore: result.hasMore, loadingMore: false };
      });
    } catch {
      setState((current) => ({ ...current, loadingMore: false, error: true }));
    }
  }

  function handleCreatePost(values: CommunityPostInput): Promise<CreatedCommunityPost> {
    return createPost(values);
  }

  function handlePostCreated(post: CreatedCommunityPost): void {
    navigate(`/comunidade/posts/${post.id}`);
  }

  return (
    <PageFrame>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <PageIntro eyebrow="Comunidade" title="Aprenda junto com outras pessoas" description="Compartilhe dúvidas e discussões de forma respeitosa enquanto desenvolve seus conhecimentos." />
        <button type="button" onClick={() => setIsComposerOpen((current) => !current)} className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700">
          <Plus aria-hidden="true" className="h-4 w-4" />{isComposerOpen ? 'Fechar formulário' : 'Criar publicação'}
        </button>
      </div>

      {isComposerOpen && <GlassCard hover={false} className="mb-10 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Nova publicação</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-ink">Inicie uma conversa</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">Escreva uma pergunta ou discussão. O conteúdo será exibido como texto, sem interpretação de HTML.</p>
        <div className="mt-7"><CommunityPostForm onSubmit={handleCreatePost} onCreated={handlePostCreated} onCancel={() => setIsComposerOpen(false)} /></div>
      </GlassCard>}

      {state.loading ? <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Carregando publicações...</div> : state.error && state.posts.length === 0 ? <EmptyState icon={MessageCircleHeart} title="Não foi possível carregar a comunidade." description="Tente novamente em alguns instantes." action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Tentar novamente</button>} /> : state.posts.length === 0 ? <EmptyState icon={MessagesSquare} title="Ainda não há publicações." description="Seja a primeira pessoa a iniciar uma discussão." action={<button type="button" onClick={() => setIsComposerOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700"><Plus aria-hidden="true" className="h-4 w-4" />Criar publicação</button>} /> : <div className="space-y-6">
        {state.error && <div role="alert" className="rounded-2xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-950">Não foi possível carregar mais publicações agora. Você pode tentar novamente.</div>}
        <div className="space-y-5">{state.posts.map((post) => <PostCard key={post.id} post={post} author={state.authors.get(post.authorUid)} />)}</div>
        {state.hasMore && <div className="flex justify-center"><button type="button" onClick={handleLoadMore} disabled={state.loadingMore} className="rounded-full border-2 border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60">{state.loadingMore ? 'Carregando...' : 'Carregar mais'}</button></div>}
      </div>}
    </PageFrame>
  );
}
