import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { Squiggle, Star } from '../illustrations/Doodles';
import { fadeUp, staggerContainer, viewportOnce } from '../../utils/motion';
import type { ReactElement } from 'react';

export default function FinalCTA(): ReactElement {
  return (
    <section id="comecar" className="py-28 px-6">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.15)}
        className="relative max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-primary to-grape px-8 sm:px-16 py-20 text-center overflow-hidden"
      >
        <Star className="w-8 h-8 text-primary-100 absolute top-10 left-12 animate-float" />
        <Star className="w-5 h-5 text-white/70 absolute bottom-14 right-16 animate-floatSlow" />
        <Squiggle className="w-32 h-6 text-white/30 absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block" />

        <motion.h2 variants={fadeUp} className="font-heading font-bold text-4xl sm:text-5xl text-white mb-5">
          Pronto para começar a aprender?
        </motion.h2>
        <motion.p variants={fadeUp} className="text-white/80 max-w-lg mx-auto mb-10">
          Crie sua conta para acompanhar seu aprendizado e retomar cada aula com tranquilidade.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Button as={Link} to="/cadastro" variant="light" icon={ArrowRight}>Criar conta</Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
