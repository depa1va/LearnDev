import { Activity, ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, ClipboardCheck, Clock3, Code2, Lightbulb, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import ProgressBar from '../../components/ui/ProgressBar';
import { useAuth } from '../../providers/AuthProvider';
import { getConceptsNeedingReviewFromMastery, getUserActivityAttempts, getUserConceptMastery, type ConceptNeedingReview } from '../../services/activityService';
import { getCatalogOverview } from '../../services/educationService';
import { getCourseProgressOverview, getLearningSummary, getRecentStudyActivity, getUserLessonProgress } from '../../services/progressService';
import { getUserPracticalAttempts } from '../../services/practicalExerciseService';
import { getPracticeStatusLabel } from '../../services/practicalExerciseValidation';
import { formatStudyDateTime } from '../../utils/date';
import type {
  Activity as LessonActivity,
  ActivityAttempt,
  ConceptMastery,
  Course,
  CourseProgressOverview,
  Lesson,
  LessonProgress,
  PracticalAttempt,
  PracticalExercise,
  RecentStudyActivity,
} from '../../types/education';

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
}

interface ProgressPageState {
  loading: boolean;
  error: boolean;
  attemptsError: boolean;
  practicalAttemptsError: boolean;
  reviewError: boolean;
  courses: Course[];
  lessons: Lesson[];
  activities: LessonActivity[];
  practicalExercises: PracticalExercise[];
  progressItems: LessonProgress[];
  activityAttempts: ActivityAttempt[];
  practicalAttempts: PracticalAttempt[];
  conceptMastery: ConceptMastery[];
  reviewConcepts: ConceptNeedingReview[];
}

const emptyProgressState = (loading = true): ProgressPageState => ({
  loading,
  error: false,
  attemptsError: false,
  practicalAttemptsError: false,
  reviewError: false,
  courses: [],
  lessons: [],
  activities: [],
  practicalExercises: [],
  progressItems: [],
  activityAttempts: [],
  practicalAttempts: [],
  conceptMastery: [],
  reviewConcepts: [],
});

function SummaryCard({ icon: Icon, label, value, description }: SummaryCardProps) {
  return (
    <GlassCard hover={false} className="p-5">
      <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
      <p className="mt-5 text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{label}</p>
      {description && <p className="mt-1 text-xs leading-relaxed text-ink/55">{description}</p>}
    </GlassCard>
  );
}

function CourseProgressCard({ course }: { course: CourseProgressOverview }) {
  const { progress, lastAccessed } = course;
  const hasLessons = progress.totalLessons > 0;
  const status = progress.isCompleted ? 'Concluído' : progress.startedLessons > 0 ? 'Em andamento' : 'Ainda não iniciado';
  const actionTo = lastAccessed ? `/aulas/${lastAccessed.lesson.id}` : `/cursos/${course.slug}`;

  return (
    <GlassCard hover className="flex h-full flex-col p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{status}</p>
        {hasLessons && <span className="text-sm font-semibold text-ink/60">{progress.percentage}%</span>}
      </div>
      <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-ink">{course.title}</h2>
      {hasLessons ? <>
        <p className="mt-3 text-sm text-ink/60">{progress.completedLessons} de {progress.totalLessons} {progress.totalLessons === 1 ? 'aula concluída' : 'aulas concluídas'}</p>
        <ProgressBar value={progress.completedLessons} max={progress.totalLessons} ariaLabel={`Progresso no curso ${course.title}: ${progress.completedLessons} de ${progress.totalLessons} aulas concluídas`} className="mt-5" />
      </> : <p className="mt-3 text-sm leading-relaxed text-ink/60">Este curso ainda não possui aulas publicadas.</p>}
      {lastAccessed && <p className="mt-5 text-sm leading-relaxed text-ink/65">Última aula acessada: <span className="font-semibold text-ink">{lastAccessed.lesson.title}</span></p>}
      <Link to={actionTo} className="mt-7 inline-flex items-center gap-2 self-start text-sm font-semibold text-primary hover:text-primary-700">{lastAccessed ? 'Continuar estudando' : 'Abrir curso'} <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
    </GlassCard>
  );
}

function HistoryItem({ item }: { item: RecentStudyActivity }) {
  const title = item.type === 'lesson_completed'
    ? `Você concluiu ${item.lesson.title}`
    : item.type === 'lesson_accessed'
      ? `Você estudou ${item.lesson.title}`
      : `Você realizou a atividade ${item.activity?.title ?? 'registrada anteriormente'}`;
  const relatedLesson = item.type === 'activity_submitted' ? item.lesson?.title : null;
  const Icon = item.type === 'lesson_completed' ? CheckCircle2 : item.type === 'activity_submitted' ? ClipboardCheck : BookOpenCheck;

  return (
    <li className="flex gap-4 rounded-2xl bg-mist px-4 py-4 sm:px-5">
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="font-semibold leading-relaxed text-ink">{title}</p>
        {relatedLesson && <p className="mt-1 text-sm text-ink/60">Relacionada à aula {relatedLesson}</p>}
        <p className="mt-2 text-xs font-medium text-ink/50">{formatStudyDateTime(item.timestamp)}</p>
      </div>
    </li>
  );
}

function ActivityAttemptCard({ attempt, activity, lesson }: { attempt: ActivityAttempt; activity: LessonActivity | undefined; lesson: Lesson | undefined }) {
  const percentage = Number.isInteger(attempt.totalQuestions) && attempt.totalQuestions > 0
    ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100)
    : null;

  return (
    <li className="rounded-2xl bg-mist px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-ink">{activity?.title ?? 'Atividade registrada anteriormente'}</h3>
          {lesson && <p className="mt-1 text-sm text-ink/60">{lesson.title}</p>}
        </div>
        {percentage !== null && <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-primary">{percentage}%</span>}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">{attempt.correctCount} de {attempt.totalQuestions} {attempt.totalQuestions === 1 ? 'resposta correta' : 'respostas corretas'}</p>
      <p className="mt-2 text-xs font-medium text-ink/50">Realizada em {formatStudyDateTime(attempt.submittedAt)}</p>
    </li>
  );
}

function PracticalAttemptCard({ attempt, exercise, lesson }: { attempt: PracticalAttempt; exercise: PracticalExercise | undefined; lesson: Lesson | undefined }) {
  return (
    <li className="rounded-2xl bg-mist px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-heading text-lg font-bold text-ink">{exercise?.title ?? 'Prática registrada anteriormente'}</h3>{lesson && <p className="mt-1 text-sm text-ink/60">{lesson.title}</p>}</div><span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-primary">{getPracticeStatusLabel(attempt.resultStatus)}</span></div>
      <p className="mt-3 text-xs font-medium text-ink/50">Realizada em {formatStudyDateTime(attempt.submittedAt)}</p>
      {exercise && <Link to={`/praticas/${exercise.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700">Praticar novamente <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>}
    </li>
  );
}

function ReviewConcepts({ concepts, lessonsById }: { concepts: ConceptNeedingReview[]; lessonsById: Map<string, Lesson> }) {
  if (concepts.length === 0) {
    return <EmptyState icon={Lightbulb} title="Você não possui conceitos marcados para revisão no momento." description="Quando uma atividade indicar uma dificuldade, a recomendação aparecerá aqui." />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {concepts.map((concept) => {
        const lastLesson = lessonsById.get(concept.mastery.lastLessonId);
        return <GlassCard key={concept.id} hover={false} className="p-6">
          <div className="flex items-start gap-3">
            <Lightbulb aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <h3 className="font-heading text-xl font-bold text-ink">{concept.name}</h3>
              {concept.description && <p className="mt-2 text-sm leading-relaxed text-ink/65">{concept.description}</p>}
              <p className="mt-4 text-sm text-ink/70"><span className="font-semibold">{concept.mastery.correctAnswers}</span> respostas corretas · <span className="font-semibold">{concept.mastery.incorrectAnswers}</span> respostas incorretas</p>
              {lastLesson ? <>
                <p className="mt-3 text-sm text-ink/60">Última aula relacionada: {lastLesson.title}</p>
                <Link to={`/aulas/${lastLesson.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700">Revisar conceito <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
              </> : <p className="mt-3 text-sm text-ink/55">A aula relacionada não está disponível entre os conteúdos publicados.</p>}
            </div>
          </div>
        </GlassCard>;
      })}
    </div>
  );
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [state, setState] = useState<ProgressPageState>(emptyProgressState);
  const [retry, setRetry] = useState(0);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAllAttempts, setShowAllAttempts] = useState(false);

  useEffect(() => {
    if (!user?.uid) return undefined;

    let active = true;
    setState(emptyProgressState());
    setShowAllHistory(false);
    setShowAllAttempts(false);

    async function loadProgress(): Promise<void> {
      const [catalogResult, progressResult, attemptsResult, practicalAttemptsResult, masteryResult] = await Promise.allSettled([
        getCatalogOverview({ includeLessons: true, includeActivities: true, includePracticalExercises: true }),
        getUserLessonProgress(user.uid),
        getUserActivityAttempts(user.uid),
        getUserPracticalAttempts(user.uid),
        getUserConceptMastery(user.uid),
      ]);

      if (!active) return;

      if (catalogResult.status === 'rejected' || progressResult.status === 'rejected') {
        setState({
          ...emptyProgressState(false),
          error: true,
          attemptsError: attemptsResult.status === 'rejected',
          practicalAttemptsError: practicalAttemptsResult.status === 'rejected',
          reviewError: masteryResult.status === 'rejected',
        });
        return;
      }

      let reviewConcepts: ConceptNeedingReview[] = [];
      let reviewError = masteryResult.status === 'rejected';
      if (masteryResult.status === 'fulfilled') {
        try {
          reviewConcepts = await getConceptsNeedingReviewFromMastery(masteryResult.value);
        } catch {
          reviewError = true;
        }
      }

      if (!active) return;
      setState({
        loading: false,
        error: false,
        attemptsError: attemptsResult.status === 'rejected',
        practicalAttemptsError: practicalAttemptsResult.status === 'rejected',
        reviewError,
        courses: catalogResult.value.courses,
        lessons: catalogResult.value.lessons,
        activities: catalogResult.value.activities,
        practicalExercises: catalogResult.value.practicalExercises,
        progressItems: progressResult.value,
        activityAttempts: attemptsResult.status === 'fulfilled' ? attemptsResult.value : [],
        practicalAttempts: practicalAttemptsResult.status === 'fulfilled' ? practicalAttemptsResult.value : [],
        conceptMastery: masteryResult.status === 'fulfilled' ? masteryResult.value : [],
        reviewConcepts,
      });
    }

    void loadProgress();
    return () => {
      active = false;
    };
  }, [retry, user?.uid]);

  const progressData = useMemo(() => {
    const summary = getLearningSummary(state.lessons, state.progressItems, state.activityAttempts, state.conceptMastery);
    const courses = getCourseProgressOverview(state.courses, state.lessons, state.progressItems);
    const history = getRecentStudyActivity({
      progressItems: state.progressItems,
      lessons: state.lessons,
      activityAttempts: state.activityAttempts,
      activities: state.activities,
    });

    return { summary, courses, history };
  }, [state.activities, state.activityAttempts, state.conceptMastery, state.courses, state.lessons, state.progressItems]);
  const lessonsById = useMemo(() => new Map(state.lessons.map((lesson) => [lesson.id, lesson])), [state.lessons]);
  const activitiesById = useMemo(() => new Map(state.activities.map((activity) => [activity.id, activity])), [state.activities]);
  const practicalExercisesById = useMemo(() => new Map(state.practicalExercises.map((exercise) => [exercise.id, exercise])), [state.practicalExercises]);
  const visibleHistory = showAllHistory ? progressData.history : progressData.history.slice(0, 8);
  const visibleAttempts = showAllAttempts ? state.activityAttempts : state.activityAttempts.slice(0, 5);

  return (
    <PageFrame>
      <PageIntro eyebrow="Acompanhamento" title="Seu progresso" description="Acompanhe o que você estudou, as atividades realizadas e os conceitos que precisam de revisão." />
      {state.loading ? <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Carregando seu progresso...</div> : state.error ? <EmptyState icon={BarChart3} title="Não foi possível carregar seu progresso." description="Tente novamente em alguns instantes." action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Tentar novamente</button>} /> : <div className="space-y-12">
        <section aria-labelledby="progress-summary-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Visão geral</p>
            <h2 id="progress-summary-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Seu aprendizado em números reais</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard icon={BookOpenCheck} value={`${progressData.summary.completedLessons} de ${progressData.summary.totalLessons}`} label="Aulas concluídas" />
            <SummaryCard icon={ClipboardCheck} value={state.attemptsError ? '—' : progressData.summary.activitiesPerformed} label="Atividades realizadas" description={state.attemptsError ? 'Não foi possível carregar este dado agora.' : undefined} />
            <SummaryCard icon={Code2} value={state.practicalAttemptsError ? '—' : state.practicalAttempts.length} label="Práticas realizadas" description={state.practicalAttemptsError ? 'Não foi possível carregar este dado agora.' : undefined} />
            <SummaryCard icon={Lightbulb} value={state.reviewError ? '—' : progressData.summary.conceptsNeedingReview} label="Conceitos para revisar" description={state.reviewError ? 'Não foi possível carregar este dado agora.' : undefined} />
            <SummaryCard icon={Activity} value={progressData.courses.filter((course) => course.progress.startedLessons > 0).length} label="Cursos iniciados" />
          </div>
        </section>

        <section aria-labelledby="course-progress-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Por curso</p>
            <h2 id="course-progress-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Acompanhe cada percurso</h2>
          </div>
          {progressData.courses.length === 0 ? <EmptyState icon={BookOpenCheck} title="Ainda não há cursos publicados." description="Quando o conteúdo estiver disponível, ele aparecerá aqui." action={<Link to="/trilhas" className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700">Conhecer trilhas</Link>} /> : <div className="grid gap-6 lg:grid-cols-2">{progressData.courses.map((course) => <CourseProgressCard key={course.id} course={course} />)}</div>}
        </section>

        <section aria-labelledby="study-history-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Linha do tempo</p>
              <h2 id="study-history-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Histórico de estudo</h2>
            </div>
            {progressData.history.length > 8 && <button type="button" onClick={() => setShowAllHistory((current) => !current)} className="text-sm font-semibold text-primary hover:text-primary-700">{showAllHistory ? 'Mostrar menos' : 'Ver histórico completo'}</button>}
          </div>
          {progressData.history.length === 0 ? <EmptyState icon={Clock3} title="Seu histórico de estudo aparecerá aqui." description="Acesse uma aula ou realize uma atividade para iniciar seu acompanhamento." /> : <ol className="space-y-3">{visibleHistory.map((item) => <HistoryItem key={item.id} item={item} />)}</ol>}
        </section>

        <section aria-labelledby="activity-history-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Prática realizada</p>
              <h2 id="activity-history-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Atividades realizadas</h2>
            </div>
            {state.activityAttempts.length > 5 && <button type="button" onClick={() => setShowAllAttempts((current) => !current)} className="text-sm font-semibold text-primary hover:text-primary-700">{showAllAttempts ? 'Mostrar menos' : 'Ver tentativas anteriores'}</button>}
          </div>
          {state.attemptsError ? <div role="alert" className="rounded-2xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-950">Não foi possível carregar suas atividades realizadas agora.</div> : state.activityAttempts.length === 0 ? <EmptyState icon={ClipboardCheck} title="Suas atividades realizadas aparecerão aqui." description="Quando você enviar uma atividade, cada tentativa ficará registrada no seu histórico pessoal." /> : <ol className="space-y-3">{visibleAttempts.map((attempt) => <ActivityAttemptCard key={attempt.id} attempt={attempt} activity={activitiesById.get(attempt.activityId)} lesson={lessonsById.get(attempt.lessonId)} />)}</ol>}
        </section>

        <section aria-labelledby="practice-history-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Prática</p>
            <h2 id="practice-history-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Práticas recentes</h2>
          </div>
          {state.practicalAttemptsError ? <div role="alert" className="rounded-2xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-950">Não foi possível carregar suas práticas agora.</div> : state.practicalAttempts.length === 0 ? <EmptyState icon={Code2} title="Suas práticas aparecerão aqui." description="Quando você verificar uma solução prática, ela ficará registrada neste histórico privado." /> : <ol className="space-y-3">{state.practicalAttempts.slice(0, 5).map((attempt) => <PracticalAttemptCard key={attempt.id} attempt={attempt} exercise={practicalExercisesById.get(attempt.exerciseId)} lesson={lessonsById.get(attempt.lessonId)} />)}</ol>}
        </section>

        <section aria-labelledby="review-concepts-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Revisão recomendada</p>
            <h2 id="review-concepts-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Conceitos para revisar</h2>
          </div>
          {state.reviewError ? <div role="alert" className="rounded-2xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-950">Não foi possível carregar os conceitos para revisão agora.</div> : <ReviewConcepts concepts={state.reviewConcepts} lessonsById={lessonsById} />}
        </section>
      </div>}
    </PageFrame>
  );
}
