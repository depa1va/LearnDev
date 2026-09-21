import type { ReactElement, ReactNode } from 'react';

interface AuthCardProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  notice?: ReactNode;
}

export default function AuthCard({ eyebrow, title, description, children, footer, notice }: AuthCardProps): ReactElement {
  return (
    <div className="w-full max-w-[34rem]">
      <section className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white shadow-soft sm:rounded-[2rem]">
        <header className="border-b border-ink/10 px-6 pb-6 pt-7 sm:px-9 sm:pb-7 sm:pt-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-ink sm:text-[2rem]">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">{description}</p>
        </header>
        <div className="px-6 py-7 sm:px-9 sm:py-8">
          {notice && <div role="status" className="mb-6 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-primary">{notice}</div>}
          {children}
        </div>
      </section>
      {footer && <div className="mt-5 text-center text-sm leading-relaxed text-ink/60">{footer}</div>}
    </div>
  );
}
