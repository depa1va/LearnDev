import { ArrowRight, BookOpen, CheckCircle2, Circle, CircleDashed, Clock3, Layers3, LibraryBig, LockKeyhole } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createCourseStructuredData, SEO } from '../../components/SEO';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import ProgressBar from '../../components/ui/ProgressBar';
import { useAuth } from '../../providers/AuthProvider';
import { getPublicCourseCatalogBySlug } from '../../services/educationService';
import { getCourseProgress, getLastAccessedLesson } from '../../services/progressService';
import type { User } from 'firebase/auth';
import type { LucideIcon } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import type {
  CatalogLesson,
  CourseProgress,
  LastAccessedCourseLesson,
  LessonProgressStatus,
  PublicCourseCatalog,
} from '../../types/education';

interface CourseMetadataProps {
  icon: LucideIcon;
  children: ReactNode;
}

interface LessonProgressStatusProps {
  status?: LessonProgressStatus;
}

interface CourseCallToActionProps {
  lesson: CatalogLesson | null;
  user: User | null;
  isLoading: boolean;
  progress: CourseProgress | null;
}

interface CourseCatalogState {
  loading: boolean;
  catalog: PublicCourseCatalog | null;
  error: boolean;
}

interface CourseProgressState {
  loading: boolean;
  progress: CourseProgress | null;
  error: boolean;
}

function CourseMetadata({ icon: Icon, children }: CourseMetadataProps): ReactElement {
  return <span className="inline-flex items-center gap-2"><Icon aria-hidden="true" className="h-4 w-4 text-primary" />{children}</span>;
}

function LessonProgressStatus({ status }: LessonProgressStatusProps): ReactElement {
  if (status === 'completed') return <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-mint"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />Concluída</span>;
  if (status === 'in_progress') return <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><CircleDashed aria-hidden="true" className="h-4 w-4" />Em andamento</span>;
  return <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/55"><Circle aria-hidden="true" className="h-4 w-4" />Não iniciada</span>;
}

function getCourseLessonTarget(lessons: CatalogLesson[], progress: CourseProgress | null): CatalogLesson | null {
  if (!lessons.length) return null;
  if (!progress) return lessons[0];

  const lastAccessed: LastAccessedCourseLesson | null = getLastAccessedLesson([...progress.progressByLessonId.values()], lessons);
  if (lastAccessed?.lesson) return lastAccessed.lesson;

  return lessons.find((lesson) => progress.progressByLessonId.get(lesson.id)?.status !== 'completed') ?? lessons[0];
}

function CourseCallToAction({ lesson, user, isLoading, progress }: CourseCallToActionProps): ReactElement {
  if (!lesson) return <p className="text-sm leading-relaxed text-ink/60">As aulas deste curso estarão disponíveis em breve.</p>;

  if (isLoading) return <p role="status" className="text-sm text-ink/60">Verificando seu acesso...</p>;

  if (!user) {
    const lessonPath = `/aulas/${lesson.id}`;
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/cadastro" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700">
          Começar curso <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
        <Link to="/entrar" state={{ from: { pathname: lessonPath } }} className="text-sm font-semibold text-primary hover:text-primary-700">
          Já possui uma conta? Entrar
        </Link>
      </div>
    );
  }

  const hasStarted = progress?.startedLessons > 0;
  return <Link to={`/aulas/${lesson.id}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700">{hasStarted ? 'Continuar curso' : 'Começar curso'} <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>;
}

export default function CoursePage(): ReactElement {
  const { slug } = useParams();
  const pathname = slug ? `/cursos/${slug}` : '/cursos';
  const { user, isLoading } = useAuth();
  const [catalogState, setCatalogState] = useState<CourseCatalogState>({ loading: true, catalog: null, error: false });
  const [progressState, setProgressState] = useState<CourseProgressState>({ loading: false, progress: null, error: false });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setCatalogState({ loading: true, catalog: null, error: false });

    if (!slug) {
      setCatalogState({ loading: false, catalog: null, error: false });
      return () => {
        active = false;
      };
    }

    getPublicCourseCatalogBySlug(slug)
      .then((catalog: PublicCourseCatalog | null) => {
        if (active) setCatalogState({ loading: false, catalog, error: false });
      })
      .catch(() => {
        if (active) setCatalogState({ loading: false, catalog: null, error: true });
      });

    return () => {
      active = false;
    };
  }, [retry, slug]);

  useEffect(() => {
    let active = true;
    const catalog = catalogState.catalog;

    if (!catalog || isLoading) {
      setProgressState({ loading: Boolean(catalog && isLoading), progress: null, error: false });
      return () => {
        active = false;
      };
    }

    if (!user?.uid) {
      setProgressState({ loading: false, progress: null, error: false });
      return () => {
        active = false;
      };
    }

    setProgressState({ loading: true, progress: null, error: false });
    getCourseProgress(user.uid, catalog.course.id, catalog.lessons)
      .then((progress: CourseProgress) => {
        if (active) setProgressState({ loading: false, progress, error: false });
      })
      .catch(() => {
        if (active) setProgressState({ loading: false, progress: null, error: true });
      });

    return () => {
      active = false;
    };
  }, [catalogState.catalog, isLoading, retry, user?.uid]);

  const catalog = catalogState.catalog;
  const course = catalog?.course;
  const track = catalog?.track;
  const entryLesson = useMemo(
    () => getCourseLessonTarget(catalog?.lessons ?? [], progressState.progress),
    [catalog?.lessons, progressState.progress]
  );

  return (
    <PageFrame className="pt-36 sm:pt-40">
      {catalogState.loading ? <><SEO title="Curso de programação | LearnDev" pathname={pathname} robots="index, follow" /><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Curso" title="Carregando curso" /><div role="status" className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Buscando a ementa do curso...</div></> : catalogState.error ? <><SEO title="Curso indisponível | LearnDev" pathname={pathname} robots="noindex, nofollow" /><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Curso" title="Curso indisponível" /><EmptyState icon={LibraryBig} title="Não foi possível carregar este curso." description="Tente novamente em alguns instantes." action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Tentar novamente</button>} /></> : !catalog || !course ? <><SEO title="Curso não encontrado | LearnDev" pathname={pathname} robots="noindex, nofollow" /><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Curso" title="Curso não encontrado" /><EmptyState icon={LibraryBig} title="Curso não encontrado." description="Este endereço não corresponde a um curso publicado e disponível no catálogo." /></> : <>
        <SEO title={`${course.title} | LearnDev`} description={course.description ?? ''} pathname={`/cursos/${course.slug}`} robots="index, follow" structuredData={createCourseStructuredData({ title: course.title, description: course.description ?? '' })} />
        <Breadcrumbs items={[
          { label: 'Trilhas', to: '/trilhas' },
          ...(track ? [{ label: track.title, to: `/trilhas/${track.slug}` }] : []),
          { label: course.title },
        ]} />
        <PageIntro backTo={track ? `/trilhas/${track.slug}` : '/trilhas'} backLabel={track ? `Voltar para ${track.title}` : 'Voltar para trilhas'} eyebrow={track?.title ?? 'Curso'} title={course.title} description={course.description} />
        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-ink/60">
          {Number.isFinite(course.estimatedMinutes) && <CourseMetadata icon={Clock3}>{course.estimatedMinutes} min estimados</CourseMetadata>}
          <CourseMetadata icon={Layers3}>{catalog.moduleCount} {catalog.moduleCount === 1 ? 'módulo' : 'módulos'}</CourseMetadata>
          <CourseMetadata icon={BookOpen}>{catalog.lessonCount} {catalog.lessonCount === 1 ? 'aula' : 'aulas'}</CourseMetadata>
        </div>

        <GlassCard hover={false} className="mb-10 p-6 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Comece por aqui</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-ink">Aprenda passo a passo</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink/65">A ementa abaixo apresenta a sequência do curso. Crie sua conta para abrir as aulas, praticar e registrar o seu progresso.</p>
          <div className="mt-6"><CourseCallToAction lesson={entryLesson} user={user} isLoading={isLoading || progressState.loading} progress={progressState.progress} /></div>
          {progressState.error && user && <p role="status" className="mt-4 text-sm text-ink/55">Não foi possível carregar seu progresso agora. Você ainda pode abrir a primeira aula.</p>}
        </GlassCard>

        {user && progressState.progress && <GlassCard hover={false} className="mb-10 p-6 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Seu progresso</p><h2 className="mt-2 font-heading text-xl font-bold text-ink">{progressState.progress.isCompleted ? 'Curso concluído' : 'Acompanhe suas aulas'}</h2></div><span className="text-lg font-bold text-primary">{progressState.progress.percentage}%</span></div>
          <p className="mt-4 text-sm text-ink/60">{progressState.progress.completedLessons} de {progressState.progress.totalLessons} {progressState.progress.totalLessons === 1 ? 'aula concluída' : 'aulas concluídas'}</p>
          <ProgressBar value={progressState.progress.completedLessons} max={progressState.progress.totalLessons} ariaLabel={`Progresso no curso ${course.title}: ${progressState.progress.completedLessons} de ${progressState.progress.totalLessons} aulas concluídas`} className="mt-4" />
        </GlassCard>}

        <section aria-labelledby="course-modules-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Ementa</p>
            <h2 id="course-modules-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Módulos e aulas</h2>
          </div>
          {catalog.modules.length === 0 ? <EmptyState icon={LibraryBig} title="Este curso ainda não possui módulos publicados." description="As aulas aparecerão aqui quando forem organizadas em módulos." /> : <div className="space-y-6">{catalog.modules.map((module, moduleIndex) => <GlassCard key={module.id} hover={false} className="p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Módulo {String(moduleIndex + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 font-heading text-2xl font-bold text-ink">{module.title}</h3>
            {module.description && <p className="mt-3 max-w-3xl leading-relaxed text-ink/60">{module.description}</p>}
            {module.lessons.length === 0 ? <p className="mt-6 text-sm leading-relaxed text-ink/55">Ainda não há aulas publicadas neste módulo.</p> : <ol className="mt-6 divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8">{module.lessons.map((lesson) => {
              const lessonStatus = progressState.progress?.progressByLessonId.get(lesson.id)?.status;
              const lessonPath = `/aulas/${lesson.id}`;
              const target = user ? lessonPath : '/entrar';
              return <li key={lesson.id}><Link to={target} state={user ? undefined : { from: { pathname: lessonPath } }} className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-mist sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                <span className="flex min-w-0 items-start gap-3"><span className="pt-0.5 text-sm font-bold text-primary">{String(lesson.order ?? 0).padStart(2, '0')}</span><span className="min-w-0"><span className="block font-semibold text-ink group-hover:text-primary">{lesson.title}</span>{lesson.description && <span className="mt-1 block text-sm leading-relaxed text-ink/55">{lesson.description}</span>}</span></span>
                <span className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 self-start text-sm sm:justify-end sm:self-auto">{Number.isFinite(lesson.estimatedMinutes) && <span className="font-semibold text-primary">{lesson.estimatedMinutes} min</span>}{user ? progressState.loading ? <span role="status" className="font-medium text-ink/55">Carregando progresso...</span> : !progressState.error && <LessonProgressStatus status={lessonStatus} /> : <span className="inline-flex items-center gap-1.5 font-semibold text-ink/60"><LockKeyhole aria-hidden="true" className="h-4 w-4" />Entrar para estudar</span>}</span>
              </Link></li>;
            })}</ol>}
          </GlassCard>)}</div>}
        </section>
      </>}
    </PageFrame>
  );
}
