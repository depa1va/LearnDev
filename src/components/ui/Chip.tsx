import type { ReactElement, ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
}

export default function Chip({ children }: ChipProps): ReactElement {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-ink/10 text-ink/70 hover:border-primary/40 hover:text-primary transition-colors">
      {children}
    </span>
  );
}
