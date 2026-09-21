import { Layers3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { CourseCard } from '../../components/education/CatalogCards';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import EmptyState from '../../components/ui/EmptyState';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { getTrackCatalogBySlug } from '../../services/educationService';
import type { ReactElement } from 'react';
import type { Course, TrackCatalog, TrackWithCourseCount } from '../../types/education';

interface TrackDetailPageState {
  loading: boolean;
  track: TrackWithCourseCount | null;
  courses: Course[];
  error: boolean;
}

export default function TrackDetailPage(): ReactElement {
  const { slug } = useParams();
  const pathname = slug ? `/trilhas/${slug}` : '/trilhas';
  const [state, setState] = useState<TrackDetailPageState>({ loading: true, track: null, courses: [], error: false });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ loading: true, track: null, courses: [], error: false });

    if (!slug) {
      setState({ loading: false, track: null, courses: [], error: false });
      return () => {
        active = false;
      };
    }

    getTrackCatalogBySlug(slug)
      .then((catalog: TrackCatalog | null) => {
        if (!active) return;
        setState(catalog
          ? { loading: false, track: catalog.track, courses: catalog.courses, error: false }
          : { loading: false, track: null, courses: [], error: false });
      })
      .catch(() => {
        if (active) setState({ loading: false, track: null, courses: [], error: true });
      });

    return () => {
      active = false;
    };
  }, [retry, slug]);

  return (
    <PageFrame className="pt-36 sm:pt-40">
      {state.loading ? <><SEO title="Trilha de programação | LearnDev" pathname={pathname} robots="index, follow" /><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Trilha" title="Carregando trilha" /><div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Buscando cursos...</div></> : state.error ? <><SEO title="Trilha indisponível | LearnDev" pathname={pathname} robots="noindex, nofollow" /><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Trilha" title="Trilha indisponível" /><EmptyState icon={Layers3} title="Não foi possível carregar esta trilha." description="Tente novamente em alguns instantes." action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Tentar novamente</button>} /></> : !state.track ? <><SEO title="Trilha não encontrada | LearnDev" pathname={pathname} robots="noindex, nofollow" /><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Trilha" title="Trilha não encontrada" /><EmptyState icon={Layers3} title="Trilha não encontrada." description="Este endereço não corresponde a uma trilha publicada." /></> : <>
        <SEO title={`${state.track.title} | LearnDev`} description={state.track.description ?? ''} pathname={`/trilhas/${state.track.slug}`} robots="index, follow" />
        <Breadcrumbs items={[{ label: 'Trilhas', to: '/trilhas' }, { label: state.track.title }]} />
        <PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Trilha" title={state.track.title} description={state.track.description} />
        <section aria-labelledby="track-courses-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Cursos da trilha</p>
              <h2 id="track-courses-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Conteúdos organizados para estudar</h2>
            </div>
            <p className="text-sm font-medium text-ink/55">{state.track.courseCount} {state.track.courseCount === 1 ? 'curso publicado' : 'cursos publicados'}</p>
          </div>
          {state.courses.length === 0 ? <EmptyState icon={Layers3} title="Ainda não há cursos nesta trilha." description="Os cursos serão exibidos aqui quando forem publicados." /> : <div className="grid gap-6 md:grid-cols-2">{state.courses.map((course) => <CourseCard key={course.id} course={course} />)}</div>}
        </section>
      </>}
    </PageFrame>
  );
}
