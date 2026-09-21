import { ArrowRight, BookOpenCheck, ClipboardCheck, Compass, LibraryBig, Lightbulb, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseCard, TrackCard } from '../../components/education/CatalogCards';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import ProgressBar from '../../components/ui/ProgressBar';
import { useAuth } from '../../providers/AuthProvider';
import { getUserActivityAttempts, getUserConceptMastery } from '../../services/activityService';
import { getCatalogOverview } from '../../services/educationService';
import { getCoursesInProgress, getLastAccessedLesson, getLearningSummary, getUserLessonProgress } from '../../services/progressService';
import { getPrivateProfile } from '../../services/profileService';
import type {
  ActivityAttempt,
  ConceptMastery,
  Course,
  CourseProgressOverview,
  LastAccessedLesson,
  LearningSummary,
  Lesson,
  LessonProgress,
  TrackWithCourseCount,
} from '../../types/education';

const learningSteps = [
  ['01', 'Estude o conteúdo', 'Leia cada aula no seu ritmo e organize suas ideias.'],
  ['02', 'Observe os exemplos', 'Veja como instruções claras ajudam a resolver problemas.'],
  ['03', 'Pratique', 'Aplique o que aprendeu nas atividades disponíveis.'],
  ['04', 'Revise quando necessário', 'Retorne aos conceitos que precisarem de mais atenção.'],
];

interface DashboardState {
  loading: boolean;
  error: boolean;
  studyError: boolean;
  displayName: string;
  tracks: TrackWithCourseCount[];
  courses: Course[];
  lessons: Lesson[];
  progressItems: LessonProgress[];
  activityAttempts: ActivityAttempt[];
  conceptMastery: ConceptMastery[];
}

interface DashboardLearningData {
  lastAccessed: LastAccessedLesson<Lesson> | null;
  coursesInProgress: CourseProgressOverview[];
  summary: LearningSummary | null;
}

const emptyDashboardState = (displayName = ''): DashboardState => ({
  loading: true,
  error: false,
  studyError: false,
  displayName,
  tracks: [],
  courses: [],
  lessons: [],
  progressItems: [],
  activityAttempts: [],
  conceptMastery: [],
});

function ProgressCourseCard({ course }: { course: CourseProgressOverview }) {
  const { progress } = course;

  return (
    <GlassCard className="flex h-full flex-col p-6 sm:p-7" hover>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Em andamento</p>
        <span className="text-sm font-semibold text-ink/60">{progress.percentage}%</span>
      </div>
      <h3 className="mt-3 font-heading text-2xl font-bold leading-tight text-ink">{course.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">{progress.completedLessons} de {progress.totalLessons} {progress.totalLessons === 1 ? 'aula concluída' : 'aulas concluídas'}</p>
      <ProgressBar value={progress.completedLessons} max={progress.totalLessons} ariaLabel={`Progresso no curso ${course.title}: ${progress.completedLessons} de ${progress.totalLessons} aulas concluídas`} className="mt-5" />
      <Link to={`/cursos/${course.slug}`} className="mt-7 inline-flex items-center gap-2 self-start text-sm font-semibold text-primary hover:text-primary-700">Abrir curso <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
    </GlassCard>
  );
}

function StudySummary({ summary }: { summary: LearningSummary }) {
  const items: { label: string; value: string | number; icon: LucideIcon }[] = [
    { label: 'Aulas concluídas', value: `${summary.completedLessons} de ${summary.totalLessons}`, icon: BookOpenCheck },
    { label: 'Atividades realizadas', value: summary.activitiesPerformed, icon: ClipboardCheck },
    { label: 'Conceitos para revisar', value: summary.conceptsNeedingReview, icon: Lightbulb },
  ];

  return (
    <section aria-labelledby="study-summary-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Acompanhamento individual</p>
          <h2 id="study-summary-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Seu progresso</h2>
        </div>
        <Link to="/progresso" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700">Ver progresso completo <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(({ label, value, icon: Icon }) => <GlassCard key={label} hover={false} className="p-5">
          <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
          <p className="mt-5 text-2xl font-bold text-ink">{value}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink/60">{label}</p>
        </GlassCard>)}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>(() => emptyDashboardState(user?.displayName ?? ''));
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!user?.uid) return undefined;

    let active = true;
    setState((current) => ({ ...current, loading: true, error: false, studyError: false }));

    void Promise.allSettled([
      getPrivateProfile(user.uid),
      getCatalogOverview({ includeLessons: true }),
      getUserLessonProgress(user.uid),
      getUserActivityAttempts(user.uid),
      getUserConceptMastery(user.uid),
    ]).then(([profileResult, catalogResult, progressResult, attemptsResult, masteryResult]) => {
      if (!active) return;

      const displayName = profileResult.status === 'fulfilled'
        ? profileResult.value?.displayName || user.displayName || ''
        : user.displayName || '';
      const studyError = progressResult.status === 'rejected' || attemptsResult.status === 'rejected' || masteryResult.status === 'rejected';

      if (catalogResult.status === 'rejected') {
        setState({ ...emptyDashboardState(displayName), loading: false, error: true, studyError });
        return;
      }

      setState({
        loading: false,
        error: false,
        studyError,
        displayName,
        tracks: catalogResult.value.tracks,
        courses: catalogResult.value.courses,
        lessons: catalogResult.value.lessons,
        progressItems: progressResult.status === 'fulfilled' ? progressResult.value : [],
        activityAttempts: attemptsResult.status === 'fulfilled' ? attemptsResult.value : [],
        conceptMastery: masteryResult.status === 'fulfilled' ? masteryResult.value : [],
      });
    });

    return () => {
      active = false;
    };
  }, [retry, user?.uid, user?.displayName]);

  const firstName = state.displayName.trim().split(/\s+/)[0];
  const greeting = firstName ? `Olá, ${firstName}` : 'Olá';
  const firstTrack = state.tracks[0] ?? null;
  const learningData = useMemo<DashboardLearningData>(() => {
    if (state.studyError) return { lastAccessed: null, coursesInProgress: [], summary: null };
    return {
      lastAccessed: getLastAccessedLesson(state.progressItems, state.lessons),
      coursesInProgress: getCoursesInProgress(state.courses, state.lessons, state.progressItems),
      summary: getLearningSummary(state.lessons, state.progressItems, state.activityAttempts, state.conceptMastery),
    };
  }, [state.activityAttempts, state.conceptMastery, state.courses, state.lessons, state.progressItems, state.studyError]);
  const lastCourse = learningData.lastAccessed ? state.courses.find((course) => course.id === learningData.lastAccessed?.lesson.courseId) : null;
  const lastAccessedStatus = learningData.lastAccessed?.progress.status === 'completed' ? 'Aula concluída' : 'Em andamento';

  return (
    <PageFrame>
      <PageIntro eyebrow="Área do estudante" title={greeting} description="Escolha uma trilha e continue desenvolvendo seus conhecimentos." />

      {state.loading ? <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Organizando seu espaço de aprendizado...</div> : state.error ? <EmptyState icon={Compass} title="Não foi possível carregar o catálogo agora." description="Tente novamente em alguns instantes." action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700">Tentar novamente</button>} /> : <div className="space-y-12">
        <section aria-labelledby="continue-learning-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Seu aprendizado</p>
            <h2 id="continue-learning-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Continuar estudando</h2>
          </div>
          {state.studyError ? <EmptyState icon={Compass} title="Não foi possível carregar seu acompanhamento agora." description="Tente atualizar a página em alguns instantes." /> : learningData.lastAccessed ? <GlassCard hover={false} className="max-w-3xl p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{lastAccessedStatus}</p>
            <h3 className="mt-3 font-heading text-2xl font-bold text-ink">{learningData.lastAccessed.lesson.title}</h3>
            {lastCourse && <p className="mt-2 text-sm text-ink/60">{lastCourse.title}</p>}
            <Link to={`/aulas/${learningData.lastAccessed.lesson.id}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700">Continuar aula <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </GlassCard> : <GlassCard hover={false} className="max-w-3xl p-6 sm:p-8">
            <p className="text-sm leading-relaxed text-ink/65">Você ainda não iniciou uma aula. Escolha uma trilha para começar seu percurso de aprendizado.</p>
            <Link to={firstTrack ? `/trilhas/${firstTrack.slug}` : '/trilhas'} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700">{firstTrack ? 'Ver trilha' : 'Conhecer trilhas'} <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </GlassCard>}
        </section>

        {!state.studyError && learningData.summary && <StudySummary summary={learningData.summary} />}

        {!state.studyError && <section aria-labelledby="courses-in-progress-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Acompanhamento individual</p>
            <h2 id="courses-in-progress-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Cursos em andamento</h2>
          </div>
          {learningData.coursesInProgress.length === 0 ? <EmptyState icon={BookOpenCheck} title="Nenhum curso em andamento ainda." description="Os cursos aparecerão aqui depois que você acessar a primeira aula." /> : <div className="grid gap-6 lg:grid-cols-2">{learningData.coursesInProgress.map((course) => <ProgressCourseCard key={course.id} course={course} />)}</div>}
        </section>}

        <section aria-labelledby="start-learning-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Começar a estudar</p>
              <h2 id="start-learning-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Escolha seu ponto de partida</h2>
            </div>
            <Link to="/trilhas" className="hidden text-sm font-semibold text-primary hover:text-primary-700 sm:inline-flex">Ver todas as trilhas</Link>
          </div>
          {firstTrack ? <div className="max-w-3xl"><TrackCard track={firstTrack} actionLabel="Ver trilha" /></div> : <EmptyState icon={BookOpenCheck} title="Ainda não há trilhas publicadas." description="Quando o conteúdo educacional estiver disponível, ele aparecerá aqui." action={<Link to="/trilhas" className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700">Conhecer trilhas</Link>} />}
        </section>

        <section aria-labelledby="available-courses-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Cursos disponíveis</p>
            <h2 id="available-courses-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Conteúdos publicados</h2>
          </div>
          {state.courses.length === 0 ? <EmptyState icon={LibraryBig} title="Nenhum curso foi publicado ainda." description="Os cursos aparecerão aqui assim que fizerem parte de uma trilha disponível." /> : <div className="grid gap-6 lg:grid-cols-2">{state.courses.map((course) => <CourseCard key={course.id} course={course} />)}</div>}
        </section>

        <section aria-labelledby="learning-process-heading" className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Como funciona o aprendizado</p>
          <h2 id="learning-process-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Um caminho claro para aprender</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {learningSteps.map(([number, title, description]) => <div key={number} className="rounded-2xl bg-mist p-5">
              <span className="text-sm font-bold text-primary">{number}</span>
              <h3 className="mt-3 font-heading text-lg font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{description}</p>
            </div>)}
          </div>
        </section>
      </div>}
    </PageFrame>
  );
}
