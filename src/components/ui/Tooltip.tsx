import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactElement, ReactNode } from 'react';

interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
}

export default function Tooltip({ label, children }: TooltipProps): ReactElement {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex w-full" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink text-white text-xs font-medium px-3 py-1.5 shadow-soft z-20"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
