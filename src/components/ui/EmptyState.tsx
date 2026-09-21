import { Inbox } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps): ReactElement {
  return (
    <div className="rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-12 text-center shadow-sm sm:px-12">
      <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-7 w-7" /></span>
      <h2 className="font-heading text-xl font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink/60">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
