import { motion } from 'framer-motion';
import type { ReactElement, SVGProps } from 'react';

type DoodleProps = Pick<SVGProps<SVGSVGElement>, 'className'>;

interface UnderlineSquiggleProps extends DoodleProps {
  delay?: number;
}

export function Star({ className }: DoodleProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2z" fill="currentColor" />
    </svg>
  );
}

export function Dots({ className }: DoodleProps): ReactElement {
  return (
    <svg viewBox="0 0 60 20" fill="none" className={className}>
      {[6, 30, 54].map((cx) => (
        <circle key={cx} cx={cx} cy={10} r={3} fill="currentColor" />
      ))}
    </svg>
  );
}

export function Squiggle({ className }: DoodleProps): ReactElement {
  return (
    <svg viewBox="0 0 100 20" fill="none" className={className}>
      <path
        d="M2 14C12 4 22 4 32 14C42 24 52 24 62 14C72 4 82 4 92 14"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Blob({ className }: DoodleProps): ReactElement {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      <path
        fill="currentColor"
        d="M45.3,-58.3C58.7,-49.8,69.6,-35.7,73.6,-19.9C77.6,-4.1,74.7,13.4,66.4,27.6C58.1,41.8,44.4,52.7,29.3,60.1C14.2,67.5,-2.3,71.4,-18.6,68.6C-34.9,65.8,-51,56.3,-61.2,42.4C-71.4,28.5,-75.7,10.2,-73.1,-6.8C-70.5,-23.8,-61,-39.5,-47.8,-48.1C-34.6,-56.7,-17.3,-58.2,0.3,-58.6C17.9,-59,35.9,-58.3,45.3,-58.3Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

export function UnderlineSquiggle({ className, delay = 0 }: UnderlineSquiggleProps): ReactElement {
  return (
    <svg viewBox="0 0 200 20" fill="none" preserveAspectRatio="none" className={className}>
      <motion.path
        d="M2 14C40 4 80 20 100 10C120 2 160 16 198 8"
        stroke="#FACC15"
        strokeWidth="7"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay, ease: 'easeInOut' }}
      />
    </svg>
  );
}

export function CodeBracket({ className }: DoodleProps): ReactElement {
  return (
    <svg viewBox="0 0 40 24" fill="none" className={className}>
      <path d="M14 3L4 12l10 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 3l10 9-10 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
