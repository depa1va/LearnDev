import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import type { HTMLMotionProps } from 'framer-motion';
import type { ReactElement, ReactNode } from 'react';

const tones = {
  light: 'border-white/60 bg-white/70',
  dark: 'border-white/10 bg-white/5',
};

type GlassCardTone = keyof typeof tones;

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  tone?: GlassCardTone;
  hover?: boolean;
}

export default function GlassCard({ children, className, tone = 'light', hover = true, ...props }: GlassCardProps): ReactElement {
  return (
    <motion.div
      whileHover={hover ? { y: -8, rotate: -1, boxShadow: '0 20px 45px -12px rgba(15,23,42,0.18)' } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={cn('rounded-2xl border backdrop-blur-md shadow-soft', tones[tone], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
