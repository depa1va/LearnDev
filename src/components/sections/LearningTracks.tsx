import { motion } from 'framer-motion';
import { Code2, Compass, Layout, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionTag from '../ui/SectionTag';
import { learningPath } from '../../data/content';
import { fadeUp, staggerContainer, viewportOnce } from '../../utils/motion';
import type { ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react';

const icons: Record<(typeof learningPath)[number]['icon'], LucideIcon> = { Code2, Compass, Layout, Lightbulb };

export default function LearningTracks(): ReactElement {
  return (
    <section className="py-28 px-6 bg-mist">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <SectionTag>Trilhas de aprendizado</SectionTag>
        <h2 className="font-heading font-bold text-4xl sm:text-5xl text-ink">Escolha por onde começar.</h2>
        <p className="text-ink/60 mt-4 max-w-xl mx-auto">
          A primeira versão do LearnDev começa por lógica e avança até um projeto com JavaScript, sempre com foco em fundamentos.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.08)}
        className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {learningPath.map((track) => {
          const Icon = icons[track.icon];
          return (
            <motion.div
              key={track.id}
              variants={fadeUp}
              whileHover={{ y: -8, rotate: -1 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18 }}
              className="group bg-white rounded-2xl p-6 border border-ink/5 shadow-soft hover:shadow-glow transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center mb-5 text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-ink mb-1">{track.title}</h3>
              <p className="text-sm text-ink/60 leading-relaxed mb-5">{track.description}</p>
              <Link to="/trilhas" className="text-sm font-semibold text-primary hover:text-primary-700 transition-colors">
                Ver trilhas →
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
