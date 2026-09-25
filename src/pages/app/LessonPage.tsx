import { ArrowLeft, ArrowRight, BookMarked, ClipboardCheck, Clock3, Code2, Lightbulb, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LessonContent from '../../components/education/LessonContent';
import InteractiveLesson from '../../components/education/InteractiveLesson';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { useAuth } from '../../providers/AuthProvider';
import { getLessonViewData } from '../../services/educationService';
import { markInteractiveLessonStep, markLessonStarted } from '../../services/progressService';
import { getUserPracticalAttempts } from '../../services/practicalExerciseService';
import type {
  InteractiveStepProgress,
  Lesson,
  LessonProgressState,
  LessonViewData,
  PracticalAttempt,
} from '../../types/education';

const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

interface YouTubeVideo {
  videoId: string;
  title: string;
  channelName: string | null;
  educationalRole: string | null;
}

interface LessonPageState {
  loading: boolean;
  data: LessonViewData | null;
  error: boolean;
  progress: LessonProgressState | null;
  progressLoading: boolean;
  progressError: boolean;
}

interface ProgressServiceResult {
  status: string;
  currentStep?: number;
  completedSteps?: number;
  legacyInteractiveCompletion?: boolean;
}

function toLessonProgressState(progress: ProgressServiceResult): LessonProgressState {
  return {
    status: progress.status === 'completed' ? 'completed' : 'in_progress',
    ...(typeof progress.currentStep === 'number' ? { currentStep: progress.currentStep } : {}),
    ...(typeof progress.completedSteps === 'number' ? { completedSteps: progress.completedSteps } : {}),
    ...(progress.legacyInteractiveCompletion === true ? { legacyInteractiveCompletion: true } : {}),
  };
}

function getYouTubeVideo(lesson: Lesson | null): YouTubeVideo | null {
  const video = lesson?.video;
  if (video?.provider !== 'youtube' || typeof video.videoId !== 'string' || !YOUTUBE_VIDEO_ID_PATTERN.test(video.videoId)) return null;

  return {
    videoId: video.videoId,
    title: typeof video.title === 'string' && video.title.trim() ? video.title.trim() : `Vídeo complementar: ${lesson.title}`,
    channelName: typeof video.channelName === 'string' && video.channelName.trim() ? video.channelName.trim() : null,
    educationalRole: typeof video.educationalRole === 'string' && video.educationalRole.trim() ? video.educationalRole.trim() : null,
  };
}

export default function LessonPage() {
  const { lessonId = '' } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState<LessonPageState>({
    loading: true,
    data: null,
    error: false,
    progress: null,
    progressLoading: false,
    progressError: false,
  });
  const [retry, setRetry] = useState(0);
  const [attemptedPracticalExerciseIds, setAttemptedPracticalExerciseIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    setState({ loading: true, data: null, error: false, progress: null, progressLoading: false, progressError: false });
    setAttemptedPracticalExerciseIds([]);

    async function loadLesson() {
      try {
        const data: LessonViewData | null = await getLessonViewData(lessonId);
        if (!active) return;

        if (!data) {
          setState({ loading: false, data: null, error: false, progress: null, progressLoading: false, progressError: false });
          return;
        }

        setState({ loading: false, data, error: false, progress: null, progressLoading: Boolean(user?.uid), progressError: false });
        if (!user?.uid) return;

        void getUserPracticalAttempts(user.uid)
          .then((attempts: PracticalAttempt[]) => {
            if (active) setAttemptedPracticalExerciseIds([...new Set(attempts.map((attempt) => attempt.exerciseId))]);
          })
          .catch(() => {
            // A prática continua acessível; apenas o rótulo de tentativa anterior não será exibido.
          });

        try {
          const progress = toLessonProgressState(await markLessonStarted(user.uid, data.lesson));
          if (active) setState((current) => ({ ...current, progress, progressLoading: false }));
        } catch {
          if (active) setState((current) => ({ ...current, progressLoading: false, progressError: true }));
        }
      } catch {
        if (active) setState({ loading: false, data: null, error: true, progress: null, progressLoading: false, progressError: false });
      }
    }

    loadLesson();

    return () => {
      active = false;
    };
  }, [lessonId, retry, user?.uid]);

  const lessonViewData = state.data;
  const lesson = lessonViewData?.lesson ?? null;
  const course = lessonViewData?.course ?? null;
  const backTo = course?.slug ? `/cursos/${course.slug}` : '/trilhas';
  const video = getYouTubeVideo(lesson);
  /**
   * Integração externa: embed do YouTube em modo de privacidade (youtube-nocookie).
   * O videoId vem do conteúdo educacional validado e rel=0 reduz sugestões de vídeos relacionados.
   * Esta tela não usa a IFrame API nem recebe eventos do player; assistir ao vídeo não altera o progresso.
   */
  const youtubeEmbedUrl = video ? `https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0` : null;
  const hasInteractiveSteps = (lesson?.steps?.length ?? 0) > 0;
  const checkpointActivities = lessonViewData?.activities.filter((activity) => lesson?.checkpointActivity === true && activity.status === 'published') ?? [];

  async function handleInteractiveStepResolved(nextProgress: InteractiveStepProgress): Promise<void> {
    if (!user?.uid || !lesson) throw new Error('Sua sessão não permite registrar este passo agora.');
    const progress = toLessonProgressState(await markInteractiveLessonStep(user.uid, lesson, nextProgress));
    setState((current) => ({ ...current, progress, progressError: false }));
  }

  async function handleInteractiveStepPositionChanged(nextProgress: InteractiveStepProgress): Promise<void> {
    if (!user?.uid || !lesson) throw new Error('Sua sessão não permite salvar esta posição agora.');
    const progress = toLessonProgressState(await markInteractiveLessonStep(user.uid, lesson, nextProgress));
    setState((current) => ({ ...current, progress, progressError: false }));
  }

  return (
    <PageFrame className="max-w-5xl">
      {state.loading ? <><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Aula" title="Carregando aula" /><div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Preparando o conteúdo...</div></> : state.error ? <><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Aula" title="Aula indisponível" /><EmptyState icon={BookMarked} title="Não foi possível carregar esta aula." description="Tente novamente em alguns instantes." action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Tentar novamente</button>} /></> : !lesson || !lessonViewData ? <><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Aula" title="Aula não encontrada" /><EmptyState icon={BookMarked} title="Aula não encontrada." description="Este endereço não corresponde a uma aula publicada." /></> : <>
        <Breadcrumbs items={[
          { label: 'Trilhas', to: '/trilhas' },
          ...(course?.slug ? [{ label: course.title, to: `/cursos/${course.slug}` }] : []),
          { label: lesson.title },
        ]} />
        <PageIntro backTo={backTo} backLabel={course?.title ? `Voltar para ${course.title}` : 'Voltar para trilhas'} eyebrow="Aula" title={lesson.title} description={lesson.description} />
        {Number.isFinite(lesson.estimatedMinutes) && <p className="-mt-5 mb-10 inline-flex items-center gap-2 text-sm font-medium text-ink/60"><Clock3 aria-hidden="true" className="h-4 w-4 text-primary" />{lesson.estimatedMinutes} min estimados</p>}

        <article className="mx-auto max-w-3xl space-y-6">
          {video && <GlassCard hover={false} className="p-5 sm:p-7">
            <div className="flex items-center gap-2"><PlayCircle aria-hidden="true" className="h-5 w-5 text-primary" /><h2 className="font-heading text-2xl font-bold text-ink">Vídeo complementar</h2></div>
            <div className="mt-5 aspect-video overflow-hidden rounded-2xl bg-ink"><iframe className="h-full w-full" src={youtubeEmbedUrl ?? ''} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
            <h3 className="mt-5 font-semibold text-ink">{video.title}</h3>
            {video.channelName && <p className="mt-1 text-sm text-ink/60">Canal: {video.channelName}</p>}
            {video.educationalRole && <p className="mt-3 text-sm leading-relaxed text-ink/65">{video.educationalRole} O conteúdo escrito desta aula continua sendo a referência principal.</p>}
          </GlassCard>}

          {lesson.objectives?.length > 0 && <GlassCard hover={false} className="p-6 sm:p-7">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Ao final desta aula, você será capaz de:</h2>
            <ul className="mt-5 space-y-3 text-[0.98rem] leading-relaxed text-ink/70">{lesson.objectives.map((objective, index) => <li key={`${objective}-${index}`} className="flex gap-3"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{objective}</li>)}</ul>
          </GlassCard>}

          {!hasInteractiveSteps && lesson.content?.introduction && <GlassCard hover={false} className="p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-bold text-ink">Começando por aqui</h2>
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-ink/70">{lesson.content.introduction}</p>
          </GlassCard>}

          {hasInteractiveSteps ? <InteractiveLesson lesson={lesson} progress={state.progress} onStepResolved={handleInteractiveStepResolved} onStepPositionChanged={handleInteractiveStepPositionChanged} /> : (lesson.sections && lesson.sections.length > 0 ? <LessonContent sections={lesson.sections} /> : <>
          {lesson.content?.explanation && <GlassCard hover={false} className="p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-bold text-ink">Explicação</h2>
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-ink/70">{lesson.content.explanation}</p>
          </GlassCard>}

          {lesson.content?.examples?.length > 0 && <GlassCard hover={false} className="p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-bold text-ink">Exemplos</h2>
            <div className="mt-5 space-y-5">{lesson.content.examples.map((example, index) => <section key={`${example.title}-${index}`} className="rounded-2xl border border-ink/8 bg-mist p-5">
              {example.title && <h3 className="font-heading text-lg font-bold text-ink">{example.title}</h3>}
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-7 text-ink/75">{example.content}</pre>
            </section>)}</div>
          </GlassCard>}</>)}

          {lessonViewData.concepts.length > 0 && <GlassCard hover={false} className="p-6 sm:p-8">
            <div className="flex items-center gap-2"><Lightbulb aria-hidden="true" className="h-5 w-5 text-primary" /><h2 className="font-heading text-2xl font-bold text-ink">Conceitos relacionados</h2></div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">{lessonViewData.concepts.map((concept) => <li key={concept.id} className="rounded-2xl bg-primary/5 p-4"><h3 className="font-semibold text-primary">{concept.name}</h3>{concept.description && <p className="mt-2 text-sm leading-relaxed text-ink/65">{concept.description}</p>}</li>)}</ul>
          </GlassCard>}

          {state.progressLoading && <p role="status" className="rounded-2xl bg-white px-5 py-4 text-sm font-medium text-ink/60 shadow-sm">Preparando o registro desta aula...</p>}
          {state.progressError && <p role="alert" className="rounded-2xl bg-red-50 px-5 py-4 text-sm leading-relaxed text-red-800">Não foi possível registrar o acesso agora. Você ainda pode ler o conteúdo e tentar novamente ao recarregar a página.</p>}

           {lessonViewData.practicalExercises.length > 0 && <GlassCard hover={false} className="p-6 sm:p-7">
             <div className="flex items-center gap-2"><Code2 aria-hidden="true" className="h-5 w-5 text-primary" /><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Pratique</p><h2 className="mt-1 font-heading text-2xl font-bold text-ink">Aplique o que aprendeu</h2></div></div>
             <p className="mt-3 text-sm leading-relaxed text-ink/65">Estas práticas são opcionais e ajudam a transformar os conceitos da aula em uma solução passo a passo.</p>
             <div className="mt-5 grid gap-3">{lessonViewData.practicalExercises.map((exercise) => {
               const hasAttempt = attemptedPracticalExerciseIds.includes(exercise.id);
               return <Link key={exercise.id} to={`/praticas/${exercise.id}`} className="group flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-mist px-5 py-4 transition-colors hover:border-primary/35 hover:bg-primary/5"><span><span className="block font-semibold text-ink group-hover:text-primary">{exercise.title}</span>{exercise.description && <span className="mt-1 block text-sm leading-relaxed text-ink/60">{exercise.description}</span>}</span><span className="shrink-0 text-sm font-semibold text-primary">{hasAttempt ? 'Praticar novamente' : 'Começar exercício'}</span></Link>;
             })}</div>
           </GlassCard>}

           {checkpointActivities.length > 0 ? <GlassCard hover={false} className="p-6 sm:p-7">
             <div className="flex items-center gap-2"><ClipboardCheck aria-hidden="true" className="h-5 w-5 text-primary" /><h2 className="font-heading text-2xl font-bold text-ink">Questionário da aula</h2></div>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">Este checkpoint é opcional e reúne o que foi estudado até aqui.</p>
            <div className="mt-5 grid gap-3">{checkpointActivities.map((activity) => <Link key={activity.id} to={`/atividades/${activity.id}`} className="group flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-mist px-5 py-4 transition-colors hover:border-primary/35 hover:bg-primary/5"><span><span className="block font-semibold text-ink group-hover:text-primary">{activity.title}</span>{activity.description && <span className="mt-1 block text-sm leading-relaxed text-ink/60">{activity.description}</span>}</span><ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" /></Link>)}</div>
          </GlassCard> : null}

          {(lessonViewData.previousLesson || lessonViewData.nextLesson) && <nav aria-label="Navegação entre aulas" className="flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-stretch sm:justify-between">
            {lessonViewData.previousLesson ? <Link to={`/aulas/${lessonViewData.previousLesson.id}`} className="group flex w-full items-center gap-3 rounded-2xl border border-ink/10 bg-white px-5 py-4 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 sm:max-w-[48%]"><ArrowLeft aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" /><span><span className="block text-xs font-bold uppercase tracking-[0.12em] text-ink/50">Aula anterior</span><span className="mt-1 block font-semibold text-ink group-hover:text-primary">{lessonViewData.previousLesson.title}</span></span></Link> : <span className="hidden sm:block" />}
            {lessonViewData.nextLesson ? <Link to={`/aulas/${lessonViewData.nextLesson.id}`} className="group flex w-full items-center justify-end gap-3 rounded-2xl border border-ink/10 bg-white px-5 py-4 text-right transition-colors hover:border-primary/30 hover:bg-primary/5 sm:ml-auto sm:max-w-[48%]"><span><span className="block text-xs font-bold uppercase tracking-[0.12em] text-ink/50">Próxima aula</span><span className="mt-1 block font-semibold text-ink group-hover:text-primary">{lessonViewData.nextLesson.title}</span></span><ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" /></Link> : <span className="hidden sm:block" />}
          </nav>}
        </article>
      </>}
    </PageFrame>
  );
}
