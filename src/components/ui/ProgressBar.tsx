import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import type { ReactElement } from 'react';

interface ProgressBarProps {
  value?: number;
  max?: number;
  ariaLabel?: string;
  trackClassName?: string;
  barClassName?: string;
  className?: string;
}

export default function ProgressBar({ value = 0, max = 100, ariaLabel = 'Progresso', trackClassName = 'bg-ink/8', barClassName, className }: ProgressBarProps): ReactElement {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const numericValue = Number.isFinite(value) ? value : 0;
  const safeValue = safeMax ? Math.min(safeMax, Math.max(0, numericValue)) : 0;
  const pct = safeMax ? Math.round((safeValue / safeMax) * 100) : 0;

  return (
    <div role="progressbar" aria-label={ariaLabel} aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={safeValue} aria-valuetext={`${pct}%`} className={cn('h-2.5 w-full rounded-full overflow-hidden', trackClassName, className)}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className={cn('h-full rounded-full bg-gradient-to-r from-primary to-grape relative overflow-hidden', barClassName)}
      >
        <span className="absolute inset-0 bg-white/25 animate-shine" />
      </motion.div>
    </div>
  );
}
