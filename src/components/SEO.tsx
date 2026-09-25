import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';

export const SITE_URL = 'https://learndev.com.br';

const HOME_DESCRIPTION = 'Aprenda programação do zero com o LearnDev. Estude lógica de programação, desenvolvimento web e JavaScript com aulas interativas e exercícios práticos.';
const DEFAULT_DESCRIPTION = 'LearnDev é uma plataforma educacional para aprender programação desde o início, com aulas interativas, exercícios práticos e acompanhamento de progresso.';

type StructuredDataValue = string | number | boolean | null | StructuredData | StructuredDataValue[];

interface StructuredData {
  [key: string]: StructuredDataValue;
}

interface CourseStructuredDataInput {
  title: string;
  description: string;
}

interface SEOProps {
  title: string;
  description?: string;
  pathname: string;
  robots?: string;
  structuredData?: StructuredData | null;
  type?: string;
}

interface RouteMetadata {
  title: string;
  description?: string;
  robots?: string;
  structuredData?: StructuredData;
}

function canonicalUrl(pathname: string): string {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return new URL(normalizedPath, SITE_URL).href;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  const selector = `meta[${attribute}="${key}"]`;
  const element = document.head.querySelector<HTMLMetaElement>(selector) ?? document.createElement('meta');

  element.setAttribute(attribute, key);
  element.setAttribute('content', content);
  element.dataset.seoManaged = 'true';

  if (!element.parentNode) document.head.appendChild(element);
}

function removeMeta(attribute: 'name' | 'property', key: string): void {
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
}

function upsertCanonical(url: string): void {
  const element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement('link');
  element.setAttribute('rel', 'canonical');
  element.setAttribute('href', url);
  element.dataset.seoManaged = 'true';

  if (!element.parentNode) document.head.appendChild(element);
}

function updateStructuredData(structuredData: StructuredData | null): void {
  const existing = document.querySelector<HTMLScriptElement>('#learndev-structured-data');

  if (!structuredData) {
    existing?.remove();
    return;
  }

  const script = existing ?? document.createElement('script');
  script.id = 'learndev-structured-data';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData).replace(/</g, '\\u003c');

  if (!script.parentNode) document.head.appendChild(script);
}

export function createHomeStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'LearnDev',
        url: `${SITE_URL}/`,
        inLanguage: 'pt-BR',
      },
      {
        '@type': 'Organization',
        name: 'LearnDev',
        url: `${SITE_URL}/`,
      },
    ],
  };
}

export function createCourseStructuredData(course: CourseStructuredDataInput): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'LearnDev',
      url: `${SITE_URL}/`,
    },
  };
}

export function SEO({ title, description = DEFAULT_DESCRIPTION, pathname, robots = 'noindex, nofollow', structuredData = null, type = 'website' }: SEOProps): null {
  useEffect(() => {
    const url = canonicalUrl(pathname);
    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertCanonical(url);

    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', 'LearnDev');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:locale', 'pt_BR');

    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    removeMeta('property', 'og:image');
    removeMeta('name', 'twitter:image');

    updateStructuredData(structuredData);
  }, [description, pathname, robots, structuredData, title, type]);

  return null;
}

function getRouteMetadata(pathname: string): RouteMetadata {
  if (pathname === '/') {
    return {
      title: 'LearnDev — Aprenda programação do zero',
      description: HOME_DESCRIPTION,
      robots: 'index, follow',
      structuredData: createHomeStructuredData(),
    };
  }

  if (pathname === '/termos') {
    return {
      title: 'Termos de Uso | LearnDev',
      description: 'Leia os Termos de Uso do LearnDev e conheça as condições para utilizar a plataforma educacional.',
      robots: 'index, follow',
    };
  }

  if (pathname === '/privacidade') {
    return {
      title: 'Política de Privacidade | LearnDev',
      description: 'Entenda como o LearnDev utiliza e protege os dados necessários para oferecer seus recursos educacionais.',
      robots: 'index, follow',
    };
  }

  if (pathname === '/sobre') {
    return {
      title: 'Sobre | LearnDev',
      description: 'Conheça o LearnDev, seus objetivos, funcionalidades e a equipe responsável pelo desenvolvimento da plataforma.',
      robots: 'index, follow',
    };
  }

  if (pathname === '/entrar') return { title: 'Entrar | LearnDev' };
  if (pathname === '/cadastro') return { title: 'Criar conta | LearnDev' };
  if (pathname === '/recuperar-senha') return { title: 'Recuperar senha | LearnDev' };
  if (pathname === '/verificar-email') return { title: 'Verificar e-mail | LearnDev' };
  if (pathname === '/dashboard') return { title: 'Dashboard | LearnDev' };
  if (pathname === '/progresso') return { title: 'Meu progresso | LearnDev' };
  if (pathname === '/trilhas') {
    return {
      title: 'Trilhas de programação | LearnDev',
      description: 'Explore as trilhas de aprendizado do LearnDev e aprenda programação desde os fundamentos com cursos organizados passo a passo.',
      robots: 'index, follow',
    };
  }
  if (pathname.startsWith('/trilhas/')) {
    return {
      title: 'Trilha de programação | LearnDev',
      robots: 'index, follow',
    };
  }

  if (pathname.startsWith('/cursos/')) {
    return {
      title: 'Curso de programação | LearnDev',
      robots: 'index, follow',
    };
  }
  if (pathname.startsWith('/aulas/')) return { title: 'Aula | LearnDev' };
  if (pathname.startsWith('/atividades/')) return { title: 'Atividade | LearnDev' };
  if (pathname.startsWith('/praticas/')) return { title: 'Prática | LearnDev' };
  if (pathname === '/comunidade' || pathname.startsWith('/comunidade/')) return { title: 'Comunidade | LearnDev' };
  if (pathname.startsWith('/perfil/')) return { title: 'Perfil | LearnDev' };
  if (pathname === '/configuracoes') return { title: 'Configurações | LearnDev' };
  if (pathname === '/onboarding') return { title: 'Boas-vindas | LearnDev' };
  if (pathname === '/moderacao') return { title: 'Moderação | LearnDev' };

  return { title: 'Página não encontrada | LearnDev' };
}

export function RouteSEO(): ReactElement {
  const { pathname } = useLocation();
  const metadata = getRouteMetadata(pathname);

  return <SEO pathname={pathname} {...metadata} />;
}
