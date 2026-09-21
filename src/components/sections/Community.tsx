import { motion } from 'framer-motion';
import { MessageCircleHeart, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionTag from '../ui/SectionTag';
import type { ReactElement } from 'react';

export default function Community(): ReactElement {
  return (
    <section id="comunidade" className="py-28 px-6 bg-mist">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <SectionTag>Comunidade</SectionTag>
        <h2 className="font-heading font-bold text-4xl sm:text-5xl text-ink">Ninguém aprende sozinho.</h2>
        <p className="text-ink/60 mt-4 max-w-xl mx-auto">Um espaço de apoio para perguntar, compartilhar descobertas e aprender com respeito.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto bg-white rounded-3xl border border-ink/5 shadow-soft p-8 sm:p-12">
        <div className="grid sm:grid-cols-3 gap-7 text-center mb-10">
          <div><UsersRound className="w-7 h-7 text-primary mx-auto mb-3" /><p className="font-semibold text-ink">Perguntas e apoio</p></div>
          <div><MessageCircleHeart className="w-7 h-7 text-grape mx-auto mb-3" /><p className="font-semibold text-ink">Conversas construtivas</p></div>
          <div><ShieldCheck className="w-7 h-7 text-mint mx-auto mb-3" /><p className="font-semibold text-ink">Ambiente respeitoso</p></div>
        </div>
        <div className="text-center border-t border-ink/5 pt-8">
          <p className="text-sm text-ink/60 mb-4">A comunidade será ativada nas próximas etapas do projeto. Ainda não há publicações disponíveis.</p>
          <Link to="/comunidade" className="text-sm font-semibold text-primary hover:text-primary-700">Conhecer a comunidade →</Link>
        </div>
      </motion.div>
    </section>
  );
}
