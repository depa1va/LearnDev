import { motion } from 'framer-motion';
import SectionTag from '../ui/SectionTag';
import RobotMascot from '../illustrations/RobotMascot';
import { fadeUp, staggerContainer, viewportOnce } from '../../utils/motion';
import type { ReactElement } from 'react';

export default function StatsAbout(): ReactElement {
  return (
    <section id="sobre" className="py-28 px-6 bg-ink relative overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={staggerContainer(0.15)}>
          <motion.div variants={fadeUp}>
            <SectionTag>Sobre o LearnDev</SectionTag>
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-heading font-bold text-4xl sm:text-5xl text-white mb-6">
            Feito para quem aprende fazendo.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 leading-relaxed mb-10 max-w-lg">
            O LearnDev é um projeto educacional criado para tornar os primeiros passos em programação mais claros. A jornada
            combina explicação, prática, avaliação diagnóstica e revisão direcionada, respeitando o ritmo de cada pessoa.
          </motion.p>
          <motion.p variants={fadeUp} className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
            Aprender, praticar, entender e revisar.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6 }}
          className="flex justify-center relative"
        >
          <RobotMascot className="w-56 h-56 sm:w-64 sm:h-64" />
        </motion.div>
      </div>
    </section>
  );
}
