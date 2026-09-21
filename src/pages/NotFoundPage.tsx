import { SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { PageFrame, PageIntro } from '../components/ui/PageFrame';
import type { ReactElement } from 'react';

export default function NotFoundPage(): ReactElement {
  return (
    <PageFrame className="pt-36 sm:pt-40">
      <PageIntro eyebrow="Erro 404" title="Esta página não foi encontrada." description="O endereço pode estar incorreto ou a página ainda não existe." />
      <EmptyState icon={SearchX} title="Não encontramos o que você procura." description="Volte para a página inicial e escolha um dos caminhos disponíveis." action={<Link to="/" className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700">Ir para o início</Link>} />
    </PageFrame>
  );
}
