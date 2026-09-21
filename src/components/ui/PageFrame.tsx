import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import type { ReactElement, ReactNode } from 'react';
import type { To } from 'react-router-dom';

interface PageFrameProps {
  children: ReactNode;
  className?: string;
}

interface PageIntroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  backTo?: To;
  backLabel?: string;
}

export function PageFrame({ children, className }: PageFrameProps): ReactElement {
  return <section className={cn('max-w-6xl mx-auto px-6 py-12 sm:py-16', className)}>{children}</section>;
}

export function PageIntro({ eyebrow, title, description, backTo, backLabel = 'Voltar' }: PageIntroProps): ReactElement {
  return (
    <header className="max-w-3xl mb-10">
      {backTo && <Link to={backTo} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700 mb-6"><ArrowLeft className="w-4 h-4" />{backLabel}</Link>}
      {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>}
      <h1 className="font-heading text-4xl sm:text-5xl font-bold leading-tight text-ink">{title}</h1>
      {description && <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-ink/60">{description}</p>}
    </header>
  );
}
