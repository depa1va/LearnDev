import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import type { ElementType, MouseEventHandler, ReactElement, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { To } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'light';
type ButtonSize = 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  className?: string;
  as?: ElementType;
  to?: To;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-soft hover:shadow-glow',
  secondary: 'bg-white text-ink border-2 border-ink/10 hover:border-primary/40',
  outline: 'bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-white',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
  light: 'bg-white text-primary shadow-soft hover:shadow-glow',
};

const sizes: Record<ButtonSize, string> = {
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className,
  as = 'button',
  ...props
}: ButtonProps): ReactElement {
  const Comp = as === 'button' ? motion.button : motion.create(as);

  return (
    <Comp
      type={as === 'button' ? 'button' : undefined}
      whileHover={{ scale: 1.045, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-full font-semibold overflow-hidden group transition-colors duration-300',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative flex items-center gap-2">
        {children}
        {Icon && <Icon className="w-4 h-4" />}
      </span>
    </Comp>
  );
}
