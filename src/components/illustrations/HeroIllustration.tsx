import { motion } from 'framer-motion';
import { BookOpen, RotateCcw } from 'lucide-react';
import TerminalWindow from './TerminalWindow';
import { Dots, Star } from './Doodles';
import type { MotionStyle } from 'framer-motion';
import type { ReactElement } from 'react';

interface HeroIllustrationProps {
  style?: MotionStyle;
}

export default function HeroIllustration({ style }: HeroIllustrationProps): ReactElement {
  return (
    <motion.div style={style} className="relative w-full max-w-md mx-auto [transform-style:preserve-3d]">
      <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 to-grape/10 rounded-[3rem] -z-10" />

      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
        <TerminalWindow />
      </motion.div>

      <motion.div
        className="absolute -top-8 -right-6 bg-white rounded-2xl shadow-soft p-3"
        animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      >
        <BookOpen className="w-7 h-7 text-primary" />
      </motion.div>

      <motion.div
        className="absolute top-1/3 -left-10 bg-white rounded-full shadow-soft px-4 py-2 flex items-center gap-2"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-mint" />
        <span className="text-xs font-bold text-ink">No seu ritmo</span>
      </motion.div>

      <motion.div
        className="absolute -bottom-6 right-4 bg-ink text-white rounded-2xl shadow-soft px-4 py-3 flex items-center gap-2"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      >
        <RotateCcw className="w-5 h-5 text-primary" />
        <div>
          <p className="text-[10px] text-white/60 leading-none">quando precisar</p>
          <p className="text-sm font-bold leading-tight">Revisão guiada</p>
        </div>
      </motion.div>

      <Star className="w-5 h-5 text-primary absolute -top-4 left-10 animate-float" />
      <Star className="w-3 h-3 text-grape absolute bottom-10 -left-6 animate-floatSlow" />
      <Dots className="w-12 h-4 text-primary/40 absolute -bottom-10 left-1/3" />
    </motion.div>
  );
}
