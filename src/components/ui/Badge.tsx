import { cn } from '../../utils/cn';
import type { ReactElement, ReactNode } from 'react';

const styles = {
  blue: 'bg-primary/10 text-primary',
  yellow: 'bg-sunshine/20 text-yellow-700',
  green: 'bg-mint/15 text-green-700',
  purple: 'bg-grape/15 text-purple-700',
  gray: 'bg-ink/5 text-ink/70',
};

type BadgeColor = keyof typeof styles;

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  className?: string;
}

export default function Badge({ children, color = 'blue', className }: BadgeProps): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
        styles[color],
        className
      )}
    >
      {children}
    </span>
  );
}
