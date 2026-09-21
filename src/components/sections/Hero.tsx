import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Compass, GraduationCap } from 'lucide-react';
import Button from '../ui/Button';
import HeroIllustration from '../illustrations/HeroIllustration';
import { Star } from '../illustrations/Doodles';
import { fadeUp, staggerContainer } from '../../utils/motion';
import type { MouseEvent, ReactElement } from 'react';

export default function Hero(): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  function handleMouseMove(event: MouseEvent<HTMLDivElement>): void {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave(): void {
    x.set(0);
    y.set(0);
  }

  return (
    <section id="inicio" className="relative overflow-hidden bg-mist pt-36 pb-24 px-6">
      <div className="absolute top-24 left-10 text-primary/20 hidden md:block">
        <Star className="w-10 h-10" />
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial="hidden" animate="show" variants={staggerContainer()}>
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 bg-white border border-ink/10 rounded-full px-4 py-1.5 mb-6 shadow-sm"
          >
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-ink/70">Aprendizado estruturado para iniciantes</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="font-heading font-bold text-5xl sm:text-6xl leading-[1.1] text-ink mb-6">
            Sua jornada para dominar{' '}
            <span className="text-primary">programação</span>{' '}
            começa aqui.
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-ink/60 max-w-lg mb-10">
            O LearnDev é uma plataforma de programação para iniciantes: aprenda lógica de programação, desenvolvimento web, HTML, CSS e JavaScript com aulas interativas e exercícios práticos.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <Button as={Link} to="/cadastro" icon={ArrowRight}>Começar agora</Button>
            <Button as={Link} to="/trilhas" variant="secondary" icon={Compass}>Explorar trilhas</Button>
          </motion.div>
        </motion.div>

        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 1000 }}
        >
          <HeroIllustration style={{ rotateX, rotateY }} />
        </motion.div>
      </div>
    </section>
  );
}
