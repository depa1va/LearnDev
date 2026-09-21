import type { ReactElement, ReactNode } from 'react';

interface SectionTagProps {
  children: ReactNode;
}

export default function SectionTag({ children }: SectionTagProps): ReactElement {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      {children}
    </span>
  );
}
