import { motion } from 'framer-motion';
import type { ReactElement, SVGProps } from 'react';

interface RobotMascotProps extends Pick<SVGProps<SVGSVGElement>, 'className'> {
  floating?: boolean;
  partyMode?: boolean;
}

export default function RobotMascot({ className, floating = true, partyMode = false }: RobotMascotProps): ReactElement {
  const eyeAnimate = partyMode
    ? { fill: ['#FACC15', '#8B5CF6', '#22C55E', '#FACC15'], opacity: [1, 1, 1, 1] }
    : { opacity: [1, 0.2, 1] };

  return (
    <motion.svg
      viewBox="0 0 160 160"
      className={className}
      animate={floating ? { y: [0, -10, 0], rotate: partyMode ? [0, -5, 5, 0] : [0, 0, 0] } : undefined}
      transition={{ duration: partyMode ? 0.6 : 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* antena */}
      <line x1="80" y1="18" x2="80" y2="34" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      <motion.circle
        cx="80"
        cy="14"
        r="6"
        fill="#FACC15"
        animate={partyMode ? { scale: [1, 1.3, 1] } : undefined}
        transition={{ duration: 0.5, repeat: Infinity }}
      />

      {/* cabeça */}
      <rect x="38" y="34" width="84" height="62" rx="22" fill="#2563EB" />

      {/* tela do rosto */}
      <rect x="52" y="48" width="56" height="34" rx="12" fill="#0F172A" />
      <motion.circle cx="70" cy="65" r="5" animate={eyeAnimate} transition={{ duration: partyMode ? 0.5 : 2.6, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.circle
        cx="90"
        cy="65"
        r="5"
        animate={eyeAnimate}
        transition={{ duration: partyMode ? 0.5 : 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
      />
      <path d="M72 74c4 4 12 4 16 0" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* orelhas */}
      <rect x="26" y="54" width="12" height="22" rx="6" fill="#1D4ED8" />
      <rect x="122" y="54" width="12" height="22" rx="6" fill="#1D4ED8" />

      {/* corpo */}
      <rect x="48" y="98" width="64" height="46" rx="18" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />
      <rect x="68" y="112" width="24" height="18" rx="6" fill="#FACC15" />

      {/* braços */}
      <line x1="48" y1="112" x2="30" y2="128" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
      <line x1="112" y1="112" x2="130" y2="128" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
    </motion.svg>
  );
}
