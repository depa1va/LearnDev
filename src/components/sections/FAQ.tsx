import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import SectionTag from '../ui/SectionTag';
import { faqs } from '../../data/content';
import { fadeUp, staggerContainer, viewportOnce } from '../../utils/motion';
import type { ReactElement } from 'react';

type FaqItemData = (typeof faqs)[number];

interface FaqItemProps {
  item: FaqItemData;
  open: boolean;
  onToggle: () => void;
}

function FaqItem({ item, open, onToggle }: FaqItemProps): ReactElement {
  return (
    <motion.div variants={fadeUp} className="border-b border-ink/10 py-5">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between text-left gap-4">
        <span className="font-heading font-medium text-ink">{item.question}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 text-primary">
          <Plus className="w-5 h-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-ink/60 text-sm leading-relaxed pt-4 pr-8">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ(): ReactElement {
  const [openId, setOpenId] = useState<number | null>(faqs[0].id);

  return (
    <section className="py-28 px-6 bg-white">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <SectionTag>Perguntas frequentes</SectionTag>
        <h2 className="font-heading font-bold text-4xl sm:text-5xl text-ink">Ainda com dúvidas?</h2>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.06)}
        className="max-w-2xl mx-auto"
      >
        {faqs.map((item) => (
          <FaqItem key={item.id} item={item} open={openId === item.id} onToggle={() => setOpenId(openId === item.id ? null : item.id)} />
        ))}
      </motion.div>
    </section>
  );
}
