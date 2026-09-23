import {
  BookOpenCheck,
  CalendarDays,
  ClipboardCheck,
  Code2,
  LockKeyhole,
  X,
  Users,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { useAuth } from '../../providers/AuthProvider';
import { getUserActivityAttempts } from '../../services/activityService';
import { getPostsByAuthor, getPublishedPostCountByAuthor } from '../../services/communityService';
import { getCatalogOverview } from '../../services/educationService';
import { getUserPracticalAttempts } from '../../services/practicalExerciseService';
import { getCourseProgressOverview, getLearningSummary, getStudyStartDate, getUserLessonProgress } from '../../services/progressService';
import { getAvatarInitials, getPublicProfile } from '../../services/profileService';
import { followUser, getFollowCounts, getFollowers, getFollowing, isFollowing, unfollowUser } from '../../services/socialService';
import { formatStudyDate, formatStudyDateTime } from '../../utils/date';
import type { CommunityPost, PostType } from '../../types/community';
import type { ActivityAttempt, Course, Lesson, LessonProgress, PracticalAttempt } from '../../types/education';
import type { FollowCounts, FollowListEntry } from '../../types/social';
import type { ExperienceLevel, LearningGoal, PublicUserProfile } from '../../types/user';

interface PrivateStudyData {
  loading: boolean;
  error: boolean;
  courses: Course[];
  lessons: Lesson[];
  progressItems: LessonProgress[];
  activityAttempts: ActivityAttempt[];
  practicalAttempts: PracticalAttempt[];
}

interface PublicPostsData {
  loading: boolean;
  error: boolean;
  posts: CommunityPost[];
  count: number | null;
}

type FollowListKind = 'followers' | 'following';

interface SocialProfileData {
  loading: boolean;
  saving: boolean;
  error: string;
  counts: FollowCounts | null;
  isFollowing: boolean;
}

interface FollowListData {
  kind: FollowListKind | null;
  loading: boolean;
  error: string;
  entries: FollowListEntry[];
}

const EXPERIENCE_LEVEL_LABELS: Readonly<Record<ExperienceLevel, string>> = {
  'never-programmed': 'Nunca programei',
  'some-contact': 'Já tive algum contato',
  'basic-knowledge': 'Já conheço o básico',
};

const LEARNING_GOAL_LABELS: Readonly<Record<LearningGoal, string>> = {
  'learn-from-zero': 'Aprender programação do zero',
  'web-development': 'Aprender desenvolvimento web',
  'review-knowledge': 'Reforçar conhecimentos',
  'build-projects': 'Criar projetos',
};

const emptyPrivateStudyData = (): PrivateStudyData => ({
  loading: false,
  error: false,
  courses: [],
  lessons: [],
  progressItems: [],
  activityAttempts: [],
  practicalAttempts: [],
});

const emptyPublicPostsData = (): PublicPostsData => ({
  loading: false,
  error: false,
  posts: [],
  count: null,
});

const emptySocialProfileData = (): SocialProfileData => ({
  loading: false,
  saving: false,
  error: '',
  counts: null,
  isFollowing: false,
});

const emptyFollowListData = (): FollowListData => ({
  kind: null,
  loading: false,
  error: '',
  entries: [],
});

function PrivateEducationSummary({ study }: { study: PrivateStudyData }): ReactElement {
  const summary = useMemo(
    () => getLearningSummary(study.lessons, study.progressItems, study.activityAttempts, []),
    [study.activityAttempts, study.lessons, study.progressItems],
  );
  const coursesStarted = useMemo(
    () => getCourseProgressOverview(study.courses, study.lessons, study.progressItems).filter((course) => course.progress.startedLessons > 0).length,
    [study.courses, study.lessons, study.progressItems],
  );
  const studyStartDate = useMemo(
    () => getStudyStartDate(study.progressItems, study.lessons),
    [study.lessons, study.progressItems],
  );
  const items: { icon: LucideIcon; value: string | number; label: string }[] = [
    { icon: BookOpenCheck, value: `${summary.completedLessons} de ${summary.totalLessons}`, label: 'Aulas concluídas' },
    { icon: ClipboardCheck, value: summary.activitiesPerformed, label: 'Atividades realizadas' },
    { icon: Code2, value: study.practicalAttempts.length, label: 'Práticas realizadas' },
    { icon: CalendarDays, value: coursesStarted, label: 'Cursos iniciados' },
  ];

  return (
    <GlassCard hover={false} className="p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <LockKeyhole aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Visível apenas para você</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-ink">Seu perfil educacional</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">Este resumo usa apenas seus próprios registros de estudo e não aparece em perfis públicos.</p>
        </div>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, value, label }) => <div key={label} className="rounded-2xl bg-mist p-5">
          <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
          <p className="mt-4 text-2xl font-bold text-ink">{value}</p>
          <p className="mt-1 text-sm text-ink/60">{label}</p>
        </div>)}
      </div>
      {studyStartDate && <p className="mt-6 text-sm leading-relaxed text-ink/65">Você começou a estudar aproximadamente em <span className="font-semibold text-ink">{formatStudyDate(studyStartDate)}</span>.</p>}
    </GlassCard>
  );
}

function postTypeLabel(type: PostType): string {
  return type === 'question' ? 'Pergunta' : 'Discussão';
}

function ProfilePosts({ postsData }: { postsData: PublicPostsData }): ReactElement {
  return (
    <GlassCard hover={false} className="p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Comunidade</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-ink">Posts</h2>
        </div>
        {postsData.count !== null && <p className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold text-ink/65">{postsData.count} {postsData.count === 1 ? 'publicação' : 'publicações'}</p>}
      </div>

      {postsData.loading ? <p className="mt-6 text-sm text-ink/55">Carregando publicações...</p> : postsData.error ? <p role="alert" className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">Não foi possível carregar as publicações deste perfil agora.</p> : postsData.posts.length === 0 ? <p className="mt-6 rounded-2xl border border-dashed border-ink/15 bg-mist px-5 py-6 text-sm leading-relaxed text-ink/60">Esta pessoa ainda não publicou na comunidade.</p> : <ol className="mt-6 space-y-3">
        {postsData.posts.map((post) => <li key={post.id}>
          <Link to={`/comunidade/posts/${post.id}`} className="block rounded-2xl border border-ink/10 bg-mist px-5 py-4 transition-colors hover:border-primary/30 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge color={post.type === 'question' ? 'blue' : 'purple'}>{postTypeLabel(post.type)}</Badge>
              <span className="text-xs text-ink/50">{formatStudyDateTime(post.createdAt)}</span>
            </div>
            <h3 className="mt-3 font-heading text-lg font-bold text-ink">{post.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/65">{post.body}</p>
          </Link>
        </li>)}
      </ol>}
    </GlassCard>
  );
}

function FollowListDialog({ list, onClose }: { list: FollowListData; onClose: () => void }): ReactElement | null {
  if (!list.kind) return null;

  const title = list.kind === 'followers' ? 'Seguidores' : 'Seguindo';
  const emptyMessage = list.kind === 'followers'
    ? 'Esta pessoa ainda não possui seguidores.'
    : 'Esta pessoa ainda não segue ninguém.';

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/45 p-4 sm:items-center sm:justify-center" role="presentation" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="follow-list-title" className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-7" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Perfil</p>
            <h2 id="follow-list-title" className="mt-2 font-heading text-2xl font-bold text-ink">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-ink/55 transition-colors hover:bg-mist hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Fechar lista">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {list.loading ? <p className="py-10 text-center text-sm text-ink/55">Carregando {title.toLowerCase()}...</p> : list.error ? <p role="alert" className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">{list.error}</p> : list.entries.length === 0 ? <p className="mt-6 rounded-2xl border border-dashed border-ink/15 bg-mist px-5 py-6 text-sm leading-relaxed text-ink/60">{emptyMessage}</p> : <>
          <ol className="mt-6 space-y-3">
            {list.entries.map(({ relation, profile }) => <li key={relation.id}>
              <Link to={`/perfil/${encodeURIComponent(profile.username)}`} onClick={onClose} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-mist px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <Avatar initials={getAvatarInitials(profile.displayName, profile.username)} photoURL={profile.photoURL} size="md" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">{profile.displayName}</span>
                  <span className="mt-0.5 block truncate text-sm font-semibold text-primary">@{profile.username}</span>
                </span>
              </Link>
            </li>)}
          </ol>
          <p className="mt-5 text-xs leading-relaxed text-ink/50">Mostramos até 20 perfis por enquanto.</p>
        </>}
      </section>
    </div>
  );
}

export default function ProfilePage(): ReactElement {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [privateStudy, setPrivateStudy] = useState<PrivateStudyData>(emptyPrivateStudyData);
  const [publicPosts, setPublicPosts] = useState<PublicPostsData>(emptyPublicPostsData);
  const [socialProfile, setSocialProfile] = useState<SocialProfileData>(emptySocialProfileData);
  const [followList, setFollowList] = useState<FollowListData>(emptyFollowListData);

  useEffect(() => {
    let active = true;
    setProfile(null);
    setError('');
    setIsLoading(true);
    setPrivateStudy(emptyPrivateStudyData());
    setPublicPosts(emptyPublicPostsData());
    setSocialProfile(emptySocialProfileData());
    setFollowList(emptyFollowListData());

    async function loadProfile(): Promise<void> {
      try {
        const publicProfile = await getPublicProfile(username);
        if (!active) return;

        setProfile(publicProfile);
        setIsLoading(false);
        if (!publicProfile) return;

        setPublicPosts((current) => ({ ...current, loading: true }));
        void Promise.all([getPostsByAuthor(publicProfile.uid), getPublishedPostCountByAuthor(publicProfile.uid)])
          .then(([posts, count]) => {
            if (active) setPublicPosts({ loading: false, error: false, posts, count });
          })
          .catch(() => {
            if (active) setPublicPosts({ ...emptyPublicPostsData(), error: true });
          });

        if (user?.uid) {
          setSocialProfile((current) => ({ ...current, loading: true }));
          const followingRequest = publicProfile.uid === user.uid
            ? Promise.resolve(false)
            : isFollowing(publicProfile.uid);
          void Promise.all([getFollowCounts(publicProfile.uid), followingRequest])
            .then(([counts, currentlyFollowing]) => {
              if (active) {
                setSocialProfile({ loading: false, saving: false, error: '', counts, isFollowing: currentlyFollowing });
              }
            })
            .catch(() => {
              if (active) {
                setSocialProfile({ ...emptySocialProfileData(), error: 'Não foi possível carregar os seguidores deste perfil agora.' });
              }
            });
        }

        if (publicProfile.uid !== user?.uid) return;

        setPrivateStudy((current) => ({ ...current, loading: true }));
        void Promise.allSettled([
          getCatalogOverview({ includeLessons: true }),
          getUserLessonProgress(user.uid),
          getUserActivityAttempts(user.uid),
          getUserPracticalAttempts(user.uid),
        ]).then(([catalogResult, progressResult, attemptsResult, practicalAttemptsResult]) => {
          if (!active) return;
          if (catalogResult.status === 'rejected' || progressResult.status === 'rejected' || attemptsResult.status === 'rejected' || practicalAttemptsResult.status === 'rejected') {
            setPrivateStudy({ ...emptyPrivateStudyData(), error: true });
            return;
          }

          setPrivateStudy({
            loading: false,
            error: false,
            courses: catalogResult.value.courses,
            lessons: catalogResult.value.lessons,
            progressItems: progressResult.value,
            activityAttempts: attemptsResult.value,
            practicalAttempts: practicalAttemptsResult.value,
          });
        });
      } catch {
        if (active) {
          setError('Não foi possível carregar este perfil agora. Tente novamente.');
          setIsLoading(false);
        }
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [user?.uid, username]);

  const isOwnProfile = profile?.uid === user?.uid;
  const showsLearningInfo = profile?.showLearningInfo === true
    && profile.experienceLevel !== undefined
    && profile.learningGoal !== undefined;

  async function handleFollowToggle(): Promise<void> {
    if (!profile || !user || isOwnProfile || socialProfile.saving) return;

    const targetUid = profile.uid;
    const wasFollowing = socialProfile.isFollowing;
    setSocialProfile((current) => ({ ...current, saving: true, error: '' }));

    try {
      if (wasFollowing) {
        await unfollowUser(targetUid);
      } else {
        await followUser(targetUid);
      }

      let refreshedCounts: FollowCounts | null = null;
      try {
        refreshedCounts = await getFollowCounts(targetUid);
      } catch {
        // A ação foi concluída; a contagem será atualizada na próxima leitura do perfil.
      }

      setSocialProfile((current) => ({
        ...current,
        saving: false,
        isFollowing: !wasFollowing,
        counts: refreshedCounts ?? (current.counts
          ? { ...current.counts, followers: Math.max(0, current.counts.followers + (wasFollowing ? -1 : 1)) }
          : null),
      }));
    } catch {
      setSocialProfile((current) => ({
        ...current,
        saving: false,
        error: 'Não foi possível atualizar este acompanhamento agora. Tente novamente.',
      }));
    }
  }

  async function openFollowList(kind: FollowListKind): Promise<void> {
    if (!profile) return;
    setFollowList({ kind, loading: true, error: '', entries: [] });

    try {
      const entries = kind === 'followers'
        ? await getFollowers(profile.uid)
        : await getFollowing(profile.uid);
      setFollowList({ kind, loading: false, error: '', entries });
    } catch {
      setFollowList({
        kind,
        loading: false,
        error: 'Não foi possível carregar esta lista agora. Tente novamente.',
        entries: [],
      });
    }
  }

  return (
    <PageFrame>
      <PageIntro backTo="/comunidade" backLabel="Voltar para comunidade" eyebrow="Perfil" title="Perfil" description="Conheça a trajetória pública de quem participa da comunidade." />
      {isLoading ? <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Carregando perfil...</div> : error ? <EmptyState icon={UserRound} title="Não foi possível carregar o perfil." description={error} /> : !profile ? <EmptyState icon={UserRound} title="Perfil não encontrado." description="Este username não corresponde a um perfil público disponível." /> : <div className="max-w-3xl space-y-6">
        <GlassCard hover={false} className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar initials={getAvatarInitials(profile.displayName, profile.username)} photoURL={profile.photoURL} size="lg" />
              <div className="min-w-0">
                <h2 className="truncate font-heading text-2xl font-bold text-ink">{profile.displayName}</h2>
                <p className="mt-1 font-semibold text-primary">@{profile.username}</p>
                {profile.bio && <p className="mt-4 max-w-xl leading-relaxed text-ink/65">{profile.bio}</p>}
              </div>
            </div>
            {isOwnProfile ? <Link to="/configuracoes" className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white">Editar perfil</Link> : <button type="button" onClick={handleFollowToggle} disabled={socialProfile.loading || socialProfile.saving} className="inline-flex min-w-28 shrink-0 items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">{socialProfile.saving ? 'Atualizando...' : socialProfile.loading ? 'Carregando...' : socialProfile.isFollowing ? 'Seguindo' : 'Seguir'}</button>}
          </div>

          {socialProfile.error && <p role="alert" className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">{socialProfile.error}</p>}

          {showsLearningInfo && <div className="mt-7 grid gap-3 border-t border-ink/10 pt-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-mist px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">Experiência</p>
              <p className="mt-2 text-sm font-semibold text-ink">{EXPERIENCE_LEVEL_LABELS[profile.experienceLevel]}</p>
            </div>
            <div className="rounded-2xl bg-mist px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">Objetivo</p>
              <p className="mt-2 text-sm font-semibold text-ink">{LEARNING_GOAL_LABELS[profile.learningGoal]}</p>
            </div>
          </div>}

          <div className="mt-7 grid gap-4 border-t border-ink/10 pt-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">Posts</p>
              <p className="mt-2 text-2xl font-bold text-ink" aria-label={publicPosts.count === null ? 'Quantidade de posts carregando' : `${publicPosts.count} posts`}>{publicPosts.count ?? '—'}</p>
            </div>
            <button type="button" onClick={() => void openFollowList('followers')} disabled={socialProfile.loading} className="rounded-xl text-left transition-colors hover:bg-mist focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">Seguidores</p>
              <p className="mt-2 text-2xl font-bold text-ink" aria-label={socialProfile.counts === null ? 'Quantidade de seguidores carregando' : `${socialProfile.counts.followers} seguidores`}>{socialProfile.counts?.followers ?? '—'}</p>
            </button>
            <button type="button" onClick={() => void openFollowList('following')} disabled={socialProfile.loading} className="rounded-xl text-left transition-colors hover:bg-mist focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">Seguindo</p>
              <p className="mt-2 text-2xl font-bold text-ink" aria-label={socialProfile.counts === null ? 'Quantidade de perfis seguidos carregando' : `${socialProfile.counts.following} seguindo`}>{socialProfile.counts?.following ?? '—'}</p>
            </button>
          </div>
          {profile.createdAt && <p className="mt-6 inline-flex items-center gap-2 text-sm text-ink/60"><CalendarDays aria-hidden="true" className="h-4 w-4 text-primary" />Membro desde {formatStudyDate(profile.createdAt)}</p>}
        </GlassCard>

        <ProfilePosts postsData={publicPosts} />

        {isOwnProfile ? privateStudy.loading ? <div className="rounded-3xl bg-white px-6 py-10 text-center text-sm text-ink/55 shadow-sm">Carregando seu resumo educacional...</div> : privateStudy.error ? <div role="alert" className="rounded-2xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-950">Não foi possível carregar seu resumo educacional agora.</div> : <PrivateEducationSummary study={privateStudy} /> : <div className="flex items-start gap-3 rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-5 text-sm leading-relaxed text-ink/60"><Users aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />Os dados de estudo desta pessoa permanecem privados.</div>}
      </div>}
      <FollowListDialog list={followList} onClose={() => setFollowList(emptyFollowListData())} />
    </PageFrame>
  );
}
