import { AlertCircle, BookOpenText, ChevronDown, CircleCheck, Lightbulb, ListChecks } from 'lucide-react';
import type { ReactNode } from 'react';
import type {
  CommonMistakesLessonSection,
  ExampleLessonSection,
  GuidedPracticeLessonSection,
  LessonSection,
  NextStepsLessonSection,
  ReflectionLessonSection,
  SummaryLessonSection,
  TextLessonSection,
} from '../../types/education';
import GlassCard from '../ui/GlassCard';

interface ContentCardProps {
  children: ReactNode;
  className?: string;
}

function ContentCard({ children, className = '' }: ContentCardProps) {
  return <GlassCard hover={false} className={`p-6 sm:p-8 ${className}`}>{children}</GlassCard>;
}

interface TextSectionProps {
  section: TextLessonSection;
}

function TextSection({ section }: TextSectionProps) {
  const Icon = section.type === 'callout' ? Lightbulb : BookOpenText;
  return (
    <ContentCard className={section.type === 'callout' ? 'border-primary/15 bg-primary/[0.03]' : ''}>
      <div className="flex items-start gap-3"><Icon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h2 className="font-heading text-2xl font-bold text-ink">{section.title}</h2><p className="mt-5 whitespace-pre-line text-base leading-8 text-ink/70">{section.content}</p></div></div>
    </ContentCard>
  );
}

interface ExampleSectionProps {
  section: ExampleLessonSection;
}

function ExampleSection({ section }: ExampleSectionProps) {
  return (
    <ContentCard>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{section.label || 'Exemplo'}</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-ink">{section.title}</h2>
      <pre aria-label={`${section.label || 'Exemplo'}: ${section.title}`} className="mt-5 overflow-x-auto rounded-2xl bg-ink px-5 py-4 font-mono text-sm leading-7 text-slate-100 shadow-inner"><code>{section.content}</code></pre>
      <p className="mt-5 whitespace-pre-line text-base leading-8 text-ink/70">{section.explanation}</p>
    </ContentCard>
  );
}

type ListLessonSection = CommonMistakesLessonSection | SummaryLessonSection | NextStepsLessonSection;

interface ListSectionProps {
  section: ListLessonSection;
}

function ListSection({ section }: ListSectionProps) {
  const isMistakes = section.type === 'common-mistakes';
  const Icon = isMistakes ? AlertCircle : ListChecks;
  return (
    <ContentCard className={isMistakes ? 'border-amber-200/70 bg-amber-50/45' : ''}>
      <div className="flex items-center gap-3"><Icon aria-hidden="true" className={`h-5 w-5 ${isMistakes ? 'text-amber-700' : 'text-primary'}`} /><h2 className="font-heading text-2xl font-bold text-ink">{section.title}</h2></div>
      <ul className="mt-5 space-y-4">
        {section.items.map((item, index) => typeof item === 'string' ? <li key={`${item}-${index}`} className="flex gap-3 text-base leading-7 text-ink/70"><CircleCheck aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-primary" />{item}</li> : <li key={`${item.title}-${index}`} className="rounded-2xl bg-white/70 p-4"><h3 className="font-semibold text-ink">{item.title}</h3><p className="mt-2 text-sm leading-7 text-ink/65">{item.description}</p></li>)}
      </ul>
    </ContentCard>
  );
}

interface ReflectionSectionProps {
  section: ReflectionLessonSection;
}

function ReflectionSection({ section }: ReflectionSectionProps) {
  return (
    <ContentCard className="border-grape/15 bg-grape/[0.03]">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-grape">Pausa para pensar</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-ink">{section.title}</h2>
      <p className="mt-5 text-base leading-8 text-ink/70">{section.prompt}</p>
      <details className="group mt-5 rounded-2xl border border-ink/10 bg-white px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-primary">Ver uma resposta sugerida <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
        <p className="mt-3 border-t border-ink/10 pt-3 text-sm leading-7 text-ink/65">{section.suggestedAnswer}</p>
      </details>
    </ContentCard>
  );
}

interface GuidedPracticeSectionProps {
  section: GuidedPracticeLessonSection;
}

function GuidedPracticeSection({ section }: GuidedPracticeSectionProps) {
  return (
    <ContentCard className="border-primary/20 bg-mint/25">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Prática guiada</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-ink">{section.title}</h2>
      <p className="mt-4 rounded-2xl bg-white/75 p-4 text-sm leading-7 text-ink/70"><span className="font-semibold text-ink">Problema: </span>{section.problem}</p>
      <ol className="mt-5 space-y-3">{section.steps.map((step, index) => <li key={`${section.id}-${index}`} className="flex gap-3 text-sm leading-7 text-ink/70"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{index + 1}</span>{step}</li>)}</ol>
      <p className="mt-5 border-t border-primary/15 pt-4 text-sm leading-7 text-ink/70"><span className="font-semibold text-ink">Confira: </span>{section.check}</p>
    </ContentCard>
  );
}

interface LessonContentProps {
  sections?: LessonSection[];
}

export default function LessonContent({ sections = [] }: LessonContentProps) {
  if (sections.length === 0) return null;

  return sections.map((section) => {
    switch (section.type) {
      case 'text':
      case 'callout':
        return <TextSection key={section.id} section={section} />;
      case 'example':
        return <ExampleSection key={section.id} section={section} />;
      case 'reflection':
        return <ReflectionSection key={section.id} section={section} />;
      case 'guided-practice':
        return <GuidedPracticeSection key={section.id} section={section} />;
      case 'common-mistakes':
      case 'summary':
      case 'next-steps':
        return <ListSection key={section.id} section={section} />;
    }
  });
}
