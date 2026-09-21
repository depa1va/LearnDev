import { motion } from 'framer-motion';
import type { ReactElement } from 'react';

const lines = [
  { text: 'npm run dev', color: 'text-sky-300' },
  { text: '✔ conectando à sua trilha...', color: 'text-mint' },
  { text: '✔ preparando sua próxima aula', color: 'text-mint' },
  { text: '> pronto para aprender 🚀', color: 'text-primary' },
];

interface TerminalWindowProps {
  className?: string;
}

export default function TerminalWindow({ className }: TerminalWindowProps): ReactElement {
  return (
    <div className={`rounded-2xl bg-ink shadow-2xl overflow-hidden ${className ?? ''}`}>
      <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border-b border-white/10">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-white/40 font-medium">terminal</span>
      </div>
      <div className="p-5 font-mono text-sm space-y-2">
        {lines.map((line, i) => (
          <motion.p
            key={line.text}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.25, duration: 0.4 }}
            className={line.color}
          >
            {line.text}
          </motion.p>
        ))}
        <span className="inline-block w-2 h-4 bg-white/70 animate-blink align-middle" />
      </div>
    </div>
  );
}
