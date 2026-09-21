import { motion } from 'framer-motion';
import { BookOpenCheck, Compass, RotateCcw } from 'lucide-react';
import SectionTag from '../ui/SectionTag';
import { fadeUp, staggerContainer, viewportOnce } from '../../utils/motion';
import type { ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StepItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const steps: readonly StepItem[] = [
  { icon: Compass, title: 'Escolha seu ponto de partida', desc: 'Comece pela base e siga uma sequência pensada para quem ainda está aprendendo.' },
  { icon: BookOpenCheck, title: 'Aprenda e pratique', desc: 'Cada aula une explicação, exemplo, prática guiada e uma atividade para aplicar o conceito.' },
  { icon: RotateCcw, title: 'Revise com propósito', desc: 'Os conceitos que precisarem de atenção serão organizados para uma nova tentativa no momento certo.' },
];

export default function HowItWorks(): ReactElement {
  return (
    <section id="como-funciona" className="py-28 px-6 bg-white relative">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <SectionTag>Como funciona</SectionTag>
        <h2 className="font-heading font-bold text-4xl sm:text-5xl text-ink">Uma aula pensada para você entender de verdade.</h2>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.18)}
        className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 relative"
      >
        <div className="hidden md:block absolute top-14 left-[16%] right-[16%] border-t-2 border-dashed border-ink/15 -z-10" />
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            variants={fadeUp}
            whileHover={{ rotate: [0, -2, 2, 0], y: -6 }}
            transition={{ duration: 0.4 }}
            className="bg-mist rounded-2xl p-8 text-center border border-ink/5"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <step.icon className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-primary/60">PASSO 0{i + 1}</span>
            <h3 className="font-heading font-semibold text-xl text-ink mt-2 mb-3">{step.title}</h3>
            <p className="text-ink/60 text-sm leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
