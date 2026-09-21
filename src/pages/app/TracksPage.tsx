import { Map } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TrackCard } from '../../components/education/CatalogCards';
import EmptyState from '../../components/ui/EmptyState';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { getCatalogOverview } from '../../services/educationService';
import type { ReactElement } from 'react';
import type { CatalogOverview, TrackWithCourseCount } from '../../types/education';

interface TracksPageState {
  loading: boolean;
  error: boolean;
  tracks: TrackWithCourseCount[];
}

export default function TracksPage(): ReactElement {
  const [state, setState] = useState<TracksPageState>({ loading: true, error: false, tracks: [] });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: false, tracks: [] });

    getCatalogOverview()
      .then(({ tracks }: CatalogOverview) => {
        if (active) setState({ loading: false, error: false, tracks });
      })
      .catch(() => {
        if (active) setState({ loading: false, error: true, tracks: [] });
      });

    return () => {
      active = false;
    };
  }, [retry]);

  return (
    <PageFrame className="pt-36 sm:pt-40">
      <PageIntro eyebrow="Currículo" title="Trilhas de aprendizado" description="As trilhas organizam cursos, módulos e aulas em uma sequência que começa pelos fundamentos e avança progressivamente." />
      {state.loading ? <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Carregando trilhas...</div> : state.error ? <EmptyState icon={Map} title="Não foi possível carregar as trilhas." description="Verifique sua conexão e tente novamente." action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Tentar novamente</button>} /> : state.tracks.length === 0 ? <EmptyState icon={Map} title="Nenhuma trilha foi publicada ainda." description="Assim que houver conteúdo educacional disponível, ele aparecerá aqui." /> : <div className="grid gap-6 md:grid-cols-2">{state.tracks.map((track) => <TrackCard key={track.id} track={track} />)}</div>}
    </PageFrame>
  );
}
