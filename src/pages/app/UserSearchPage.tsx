import { Search, UserRound } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { normalizeUsername } from '../../services/authService';
import { getAvatarInitials, isUsernameSearchPrefix, searchPublicProfiles } from '../../services/profileService';
import { formatStudyDate } from '../../utils/date';
import type { PublicUserProfile } from '../../types/user';

interface UserSearchState {
  loading: boolean;
  error: string;
  results: PublicUserProfile[];
}

const initialSearchState = (): UserSearchState => ({ loading: false, error: '', results: [] });

function UserSearchResult({ profile }: { profile: PublicUserProfile }): ReactElement {
  return (
    <li>
      <Link to={`/perfil/${encodeURIComponent(profile.username)}`} className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5 transition-colors hover:border-primary/30 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Avatar initials={getAvatarInitials(profile.displayName, profile.username)} photoURL={profile.photoURL} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-heading text-lg font-bold text-ink">{profile.displayName}</span>
          <span className="mt-1 block truncate text-sm font-semibold text-primary">@{profile.username}</span>
          {profile.bio && <span className="mt-2 block line-clamp-2 text-sm leading-relaxed text-ink/60">{profile.bio}</span>}
          {profile.createdAt && <span className="mt-3 block text-xs text-ink/45">Membro desde {formatStudyDate(profile.createdAt)}</span>}
        </span>
      </Link>
    </li>
  );
}

export default function UserSearchPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);
  const [state, setState] = useState<UserSearchState>(initialSearchState);

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    let active = true;
    if (!query) {
      setState(initialSearchState());
      return () => {
        active = false;
      };
    }

    setState({ loading: true, error: '', results: [] });
    void searchPublicProfiles(query)
      .then((results) => {
        if (active) setState({ loading: false, error: '', results });
      })
      .catch(() => {
        if (active) setState({ loading: false, error: 'Não foi possível pesquisar usuários agora. Tente novamente.', results: [] });
      });

    return () => {
      active = false;
    };
  }, [query]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const normalizedQuery = normalizeUsername(input);

    if (!normalizedQuery) {
      setSearchParams({});
      return;
    }

    if (!isUsernameSearchPrefix(normalizedQuery)) {
      setState({ loading: false, error: 'Use de 1 a 20 caracteres: letras, números ou underscore.', results: [] });
      return;
    }

    setSearchParams({ q: normalizedQuery });
  }

  return (
    <PageFrame>
      <PageIntro eyebrow="Pessoas" title="Encontre estudantes" description="Pesquise pelo username para conhecer quem participa da comunidade." />
      <div className="max-w-3xl">
        <GlassCard hover={false} className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="username-search">Buscar por username</label>
            <div className="relative flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/45" />
              <input id="username-search" value={input} onChange={(event) => setInput(event.target.value)} maxLength={20} autoComplete="off" placeholder="Ex.: andre_dev" className="h-12 w-full rounded-xl border border-ink/10 bg-mist pl-12 pr-4 text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
            </div>
            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><Search aria-hidden="true" className="h-4 w-4" />Buscar</button>
          </form>
          <p className="mt-3 text-xs leading-relaxed text-ink/50">A pesquisa encontra usernames que começam com o termo informado.</p>
        </GlassCard>

        <section aria-live="polite" className="mt-7">
          {!query ? <EmptyState icon={UserRound} title="Busque uma pessoa" description="Digite um username para encontrar perfis públicos na comunidade." /> : state.loading ? <div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Buscando usuários...</div> : state.error ? <EmptyState icon={UserRound} title="Não foi possível concluir a busca." description={state.error} /> : state.results.length === 0 ? <EmptyState icon={UserRound} title="Nenhum perfil encontrado." description={`Não encontramos usernames que começam com @${query}.`} /> : <>
            <p className="mb-4 text-sm text-ink/60">{state.results.length} {state.results.length === 1 ? 'perfil encontrado' : 'perfis encontrados'}</p>
            <ol className="space-y-3">{state.results.map((profile) => <UserSearchResult key={profile.id} profile={profile} />)}</ol>
          </>}
        </section>
      </div>
    </PageFrame>
  );
}
