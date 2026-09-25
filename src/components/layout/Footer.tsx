import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import Brand from './Brand';

interface PlatformLink {
  label: string;
  to: string;
}

const platformLinks: readonly PlatformLink[] = [
  { label: 'Início', to: '/' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Comunidade', to: '/comunidade' },
  { label: 'Como funciona', to: '/#como-funciona' },
  { label: 'Sobre', to: '/sobre' },
];

export default function Footer(): ReactElement {
  return (
    <footer className="bg-ink text-white/60 pt-16 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 mb-14">
        <div className="md:col-span-2">
          <Brand light />
          <p className="text-sm mt-4 max-w-sm leading-relaxed">
            Uma plataforma educacional para aprender programação com clareza, prática e acompanhamento individual.
          </p>
        </div>

        <div>
          <p className="text-white font-semibold text-sm mb-4">Navegação</p>
          <ul className="space-y-3 text-sm">
            {platformLinks.map((link) => (
              <li key={link.to}><Link to={link.to} className="hover:text-white transition-colors">{link.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 text-xs flex flex-col sm:flex-row justify-between gap-3">
        <p>© {new Date().getFullYear()} LearnDev. Todos os direitos reservados.</p>
        <p className="flex gap-4">
          <Link to="/termos" className="hover:text-white">Termos de uso</Link>
          <Link to="/privacidade" className="hover:text-white">Privacidade</Link>
        </p>
      </div>
    </footer>
  );
}
