import { Check, ThumbsUp } from 'lucide-react';
import type { MouseEventHandler } from 'react';

interface HelpfulButtonProps {
  isHelpful?: boolean;
  count?: number | null;
  isLoading?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

function helpfulCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'pessoa marcou como útil' : 'pessoas marcaram como útil'}`;
}

export default function HelpfulButton({ isHelpful = false, count = null, isLoading = false, onClick, className = '' }: HelpfulButtonProps) {
  const hasCount = Number.isInteger(count) && count >= 0;

  return (
    <button
      type="button"
      aria-pressed={isHelpful}
      aria-label={isHelpful ? 'Remover marcação útil' : 'Marcar como útil'}
      disabled={isLoading}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 ${isHelpful ? 'border-primary bg-primary/10 text-primary' : 'border-ink/10 bg-white text-ink/70 hover:border-primary/40 hover:text-primary'} ${className}`}
    >
      {isHelpful ? <Check aria-hidden="true" className="h-4 w-4" /> : <ThumbsUp aria-hidden="true" className="h-4 w-4" />}
      <span>{isHelpful ? 'Útil · marcado' : 'Útil'}</span>
      {hasCount && <span className="border-l border-current/20 pl-2 text-xs font-bold" aria-label={helpfulCountLabel(count)}>{count}</span>}
    </button>
  );
}
