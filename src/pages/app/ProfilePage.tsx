import { BookOpenCheck, CalendarDays, ClipboardCheck, Code2, LockKeyhole, UserRound, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { useAuth } from '../../providers/AuthProvider';
import { getUserActivityAttempts } from '../../services/activityService';
import { getCatalogOverview } from '../../services/educationService';
import { getUserPracticalAttempts } from '../../services/practicalExerciseService';
import { getCourseProgressOverview, getLearningSummary, getStudyStartDate, getUserLessonProgress } from '../../services/progressService';
import { getAvatarInitials, getPublicProfile } from '../../services/profileService';
import { formatStudyDate } from '../../utils/date';
import type { ActivityAttempt, Course, Lesson, LessonProgress, PracticalAttempt } from '../../types/education';
import type { PublicUserProfile } from '../../types/user';

interface PrivateStudyData {
  loading: boolean;
  error: boolean;
  courses: Course[];
  lessons: Lesson[];
  progressItems: LessonProgress[];
  activityAttempts: ActivityAttempt[];
  practicalAttempts: PracticalAttempt[];
}

const emptyPrivateStudyData = (): PrivateStudyData => ({
  loading: false,
  error: false,
  courses: [],
  lessons: [],
  progressItems: [],
  activityAttempts: [],
  practicalAttempts: [],
});

function PrivateEducationSummary({ study }: { study: PrivateStudyData }) {
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

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [privateStudy, setPrivateStudy] = useState<PrivateStudyData>(emptyPrivateStudyData);

  useEffect(() => {
    let active = true;
    setProfile(null);
    setError('');
    setIsLoading(true);
    setPrivateStudy(emptyPrivateStudyData());

    async function loadProfile(): Promise<void> {
      try {
        const publicProfile = await getPublicProfile(username);
        if (!active) return;

        setProfile(publicProfile);
        setIsLoading(false);
        if (!publicProfile || publicProfile.uid !== user?.uid) return;

        setPrivateStudy((current) => ({ ...current, loading: true }));
        const [catalogResult, progressResult, attemptsResult, practicalAttemptsResult] = await Promise.allSettled([
          getCatalogOverview({ includeLessons: true }),
          getUserLessonProgress(user.uid),
          getUserActivityAttempts(user.uid),
          getUserPracticalAttempts(user.uid),
        ]);

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

  return (
    <PageFrame>
      <PageIntro backTo="/comunidade" backLabel="Voltar para comunidade" eyebrow="Perfil" title="Perfil" description="Nome, foto e bio são públicos. Dados de estudo permanecem privados." />
      {isLoading ? <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Carregando perfil...</div> : error ? <EmptyState icon={UserRound} title="Não foi possível carregar o perfil." description={error} /> : !profile ? <EmptyState icon={UserRound} title="Perfil não encontrado." description="Este username não corresponde a um perfil público disponível." /> : <div className="max-w-3xl space-y-6">
        <GlassCard hover={false} className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar initials={getAvatarInitials(profile.displayName, profile.username)} photoURL={profile.photoURL} size="lg" />
            <div>
              <h2 className="font-heading text-2xl font-bold text-ink">{profile.displayName}</h2>
              <p className="mt-1 font-semibold text-primary">@{profile.username}</p>
              {profile.bio && <p className="mt-4 max-w-xl leading-relaxed text-ink/65">{profile.bio}</p>}
            </div>
          </div>
        </GlassCard>

        {isOwnProfile ? privateStudy.loading ? <div className="rounded-3xl bg-white px-6 py-10 text-center text-sm text-ink/55 shadow-sm">Carregando seu resumo educacional...</div> : privateStudy.error ? <div role="alert" className="rounded-2xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-950">Não foi possível carregar seu resumo educacional agora.</div> : <PrivateEducationSummary study={privateStudy} /> : <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-5 text-sm leading-relaxed text-ink/60">As informações educacionais deste perfil são privadas e não são exibidas para outras pessoas.</div>}
      </div>}
    </PageFrame>
  );
}
