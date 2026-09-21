import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Lightbulb, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { evaluateInteractiveStep, getInteractiveSteps, isInteractiveStep } from '../../services/interactiveLessonService';
import type {
  InteractiveLessonStep,
  InteractiveQuestionStep,
  InteractiveStepProgress,
  InteractiveStepResult,
  Lesson,
  LessonProgressState,
  OptionInteractiveStepBase,
  OrderCodeStep,
  TextInteractiveStep,
  WriteCodeStep,
} from '../../types/education';
import GlassCard from '../ui/GlassCard';

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

interface FeedbackProps {
  result: InteractiveStepResult | null;
}

function Feedback({ result }: FeedbackProps) {
  if (!result) return null;
  const style = result.isCorrect
    ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
    : 'border-amber-200 bg-amber-50 text-amber-950';

  return (
    <div role="status" aria-live="polite" className={`mt-5 rounded-2xl border px-4 py-4 text-sm leading-relaxed ${style}`}>
      <p className="font-semibold">{result.isCorrect ? 'Boa resposta' : 'Vamos revisar este passo'}</p>
      {result.message && <p className="mt-1">{result.message}</p>}
      {!result.isCorrect && result.hint && <p className="mt-3 flex gap-2 border-t border-current/15 pt-3"><Lightbulb aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{result.hint}</p>}
    </div>
  );
}

interface CodeBlockProps {
  children: ReactNode;
  ariaLabel?: string;
}

function CodeBlock({ children, ariaLabel = 'Código do exercício' }: CodeBlockProps) {
  if (!children) return null;
  return <pre aria-label={ariaLabel} className="mt-5 overflow-x-auto rounded-2xl bg-ink px-5 py-4 font-mono text-sm leading-7 text-slate-100 shadow-inner"><code>{children}</code></pre>;
}

interface OptionStepProps {
  step: OptionInteractiveStepBase;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

function OptionStep({ step, value, onChange, disabled }: OptionStepProps) {
  return (
    <div className="mt-5 grid gap-3" role="radiogroup" aria-label={step.prompt}>
      {step.options.map((option) => {
        const checked = value === option.id;
        return <label key={option.id} className={`cursor-pointer rounded-2xl border p-4 transition-colors ${checked ? 'border-primary bg-primary/5' : 'border-ink/10 bg-white hover:border-primary/35'} ${disabled ? 'cursor-default opacity-80' : ''}`}>
          <span className="flex items-start gap-3"><input type="radio" name={`step-${step.id}`} checked={checked} value={option.id} onChange={() => onChange(option.id)} disabled={disabled} className="mt-1 h-4 w-4 accent-primary" /><span className="min-w-0 text-sm leading-relaxed text-ink">{option.code ? <code className="block whitespace-pre-wrap rounded-xl bg-ink px-3 py-2 font-mono text-xs leading-6 text-slate-100">{option.code}</code> : option.label}</span></span>
          {option.code && option.label && <span className="mt-2 block pl-7 text-xs leading-relaxed text-ink/60">{option.label}</span>}
        </label>;
      })}
    </div>
  );
}

interface TextStepProps {
  step: TextInteractiveStep | WriteCodeStep;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

function TextStep({ step, value, onChange, disabled }: TextStepProps) {
  const isLongAnswer = step.type === 'write_code';
  const fieldId = `step-${step.id}`;
  return <div className="mt-5"><label htmlFor={fieldId} className="block text-sm font-semibold text-ink">{isLongAnswer ? 'Sua solução em JavaScript' : 'Complete o trecho'}</label>{isLongAnswer ? <textarea id={fieldId} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} rows={8} placeholder={step.placeholder || 'Escreva sua solução aqui'} className="mt-3 block w-full rounded-2xl border border-ink/15 bg-ink px-4 py-3 font-mono text-sm leading-7 text-slate-100 placeholder:text-slate-400 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-80" /> : <input id={fieldId} type="text" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} placeholder={step.placeholder || 'Digite sua resposta'} className="mt-3 block w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 font-mono text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-80" />}</div>;
}

interface OrderCodeStepProps {
  step: OrderCodeStep;
  orderedIds: string[];
  onMove: (index: number, direction: number) => void;
  disabled: boolean;
}

function OrderCodeStepEditor({ step, orderedIds, onMove, disabled }: OrderCodeStepProps) {
  const itemsById = new Map(step.items.map((item) => [item.id, item]));
  return <ol className="mt-5 space-y-3" aria-label="Linhas na ordem atual">{orderedIds.map((itemId, index) => {
    const item = itemsById.get(itemId);
    if (!item) return null;
    return <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4"><span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span><code className="min-w-0 flex-1 break-words font-mono text-sm leading-6 text-ink/80">{item.content}</code><div className="flex shrink-0 gap-2"><button type="button" aria-label={`Mover ${item.content} para cima`} onClick={() => onMove(index, -1)} disabled={disabled || index === 0} className="rounded-lg border border-ink/15 p-2 text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40">↑</button><button type="button" aria-label={`Mover ${item.content} para baixo`} onClick={() => onMove(index, 1)} disabled={disabled || index === orderedIds.length - 1} className="rounded-lg border border-ink/15 p-2 text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40">↓</button></div></li>;
  })}</ol>;
}

interface StepEditorProps {
  step: InteractiveQuestionStep;
  answer: string;
  onChange: (value: string) => void;
  orderedIds: string[];
  onMove: (index: number, direction: number) => void;
  disabled: boolean;
}

function StepEditor({ step, answer, onChange, orderedIds, onMove, disabled }: StepEditorProps) {
  switch (step.type) {
    case 'choose_code':
    case 'predict_output':
    case 'find_error':
    case 'choose_output':
      return <OptionStep step={step} value={answer} onChange={onChange} disabled={disabled} />;
    case 'fill_code':
    case 'complete_line':
    case 'write_code':
      return <TextStep step={step} value={answer} onChange={onChange} disabled={disabled} />;
    case 'order_code':
      return <OrderCodeStepEditor step={step} orderedIds={orderedIds} onMove={onMove} disabled={disabled} />;
  }
}

function isQuestionStep(step: InteractiveLessonStep): step is InteractiveQuestionStep {
  return isInteractiveStep(step);
}

interface InteractiveLessonProps {
  lesson: Lesson;
  progress: LessonProgressState | null;
  onStepResolved: (progress: InteractiveStepProgress) => Promise<void>;
  onStepPositionChanged?: (progress: InteractiveStepProgress) => Promise<void>;
}

export default function InteractiveLesson({ lesson, progress, onStepResolved, onStepPositionChanged }: InteractiveLessonProps) {
  const steps = useMemo<InteractiveLessonStep[]>(() => getInteractiveSteps(lesson), [lesson]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [result, setResult] = useState<InteractiveStepResult | null>(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const locallySavedProgress = useRef<InteractiveStepProgress | null>(null);

  const step = steps[stepIndex] ?? null;
  const isCompleted = progress?.status === 'completed';

  useEffect(() => {
    if (locallySavedProgress.current
      && progress?.currentStep === locallySavedProgress.current.currentStep
      && progress?.completedSteps === locallySavedProgress.current.completedSteps) {
      return;
    }
    const hasInteractiveCompletion = isCompleted
      && progress?.legacyInteractiveCompletion !== true
      && progress?.completedSteps === steps.length;
    const initialIndex = hasInteractiveCompletion
      ? Math.max(steps.length - 1, 0)
      : clamp(progress?.currentStep ?? 0, 0, Math.max(steps.length - 1, 0));
    setStepIndex(initialIndex);
  }, [isCompleted, lesson?.id, progress?.completedSteps, progress?.currentStep, progress?.legacyInteractiveCompletion, steps.length]);

  useEffect(() => {
    setAnswer('');
    setOrderedIds(step?.type === 'order_code' ? step.items.map((item) => item.id) : []);
    setResult(null);
    setResolved(false);
    setFormError('');
  }, [step?.id]);

  if (steps.length === 0 || !step) return null;

  const isLastStep = stepIndex === steps.length - 1;
  const isInteraction = isQuestionStep(step);
  const visualCompletedSteps = isCompleted ? steps.length : Math.min(progress?.completedSteps ?? 0, steps.length);
  const wasPreviouslyResolved = stepIndex < visualCompletedSteps;
  const canContinue = !isInteraction || resolved || wasPreviouslyResolved || isCompleted;

  function updateAnswer(nextAnswer: string) {
    if (isSaving || resolved) return;
    setAnswer(nextAnswer);
    setResult(null);
    setFormError('');
  }

  function moveItem(index: number, direction: number) {
    if (isSaving || resolved) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedIds.length) return;
    setOrderedIds((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    setResult(null);
    setFormError('');
  }

  async function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isInteraction || isSaving || resolved) return;

    try {
      const response = step.type === 'order_code' ? { orderedStepIds: orderedIds } : answer;
      const nextResult = evaluateInteractiveStep(step, response);
      setResult(nextResult);
      if (!nextResult.isCorrect) return;

      if (isCompleted) {
        setResolved(true);
        return;
      }

      setIsSaving(true);
      const nextProgress = {
        currentStep: isLastStep ? stepIndex : stepIndex + 1,
        completedSteps: isLastStep ? steps.length : Math.max(visualCompletedSteps, stepIndex + 1),
      };
      locallySavedProgress.current = nextProgress;
      await onStepResolved(nextProgress);
      setResolved(true);
    } catch (error) {
      locallySavedProgress.current = null;
      setFormError(error instanceof Error ? error.message : 'Não foi possível verificar esta resposta.');
    } finally {
      setIsSaving(false);
    }
  }

  function retryStep() {
    setAnswer('');
    setOrderedIds(step.type === 'order_code' ? step.items.map((item) => item.id) : []);
    setResult(null);
    setFormError('');
  }

  async function goTo(index: number) {
    if (index < 0 || index >= steps.length) return;
    setStepIndex(index);

    if (isCompleted || !onStepPositionChanged) return;

    const nextProgress = { currentStep: index, completedSteps: visualCompletedSteps };
    try {
      setIsSaving(true);
      setFormError('');
      locallySavedProgress.current = nextProgress;
      await onStepPositionChanged(nextProgress);
    } catch (error) {
      locallySavedProgress.current = null;
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar a posição desta aula.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section aria-labelledby="interactive-lesson-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Aprendizado interativo</p><h2 id="interactive-lesson-heading" className="mt-2 font-heading text-2xl font-bold text-ink">Um passo por vez</h2></div>
        <p className="text-sm font-semibold text-ink/60">Etapa {stepIndex + 1} de {steps.length}</p>
      </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-label="Progresso dentro da aula" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={visualCompletedSteps}><div className="h-full rounded-full bg-primary transition-all motion-reduce:transition-none" style={{ width: `${(visualCompletedSteps / steps.length) * 100}%` }} /></div>

      {isCompleted && <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-950"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" /><p>Esta aula já está concluída. Você pode revisar os passos no seu ritmo.</p></div>}

      <GlassCard hover={false} className="p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{isInteraction ? 'Pratique agora' : 'Novo conceito'}</p>
        <h3 className="mt-2 font-heading text-2xl font-bold text-ink">{step.title}</h3>
        {step.content && <p className="mt-4 whitespace-pre-line text-base leading-8 text-ink/75">{step.content}</p>}
        {step.code && <CodeBlock ariaLabel={`Código da etapa: ${step.title}`}>{step.code}</CodeBlock>}
        {step.prompt && <p className="mt-5 text-base font-semibold leading-relaxed text-ink">{step.prompt}</p>}

        {isInteraction ? <form onSubmit={submitStep} noValidate>
          <StepEditor step={step} answer={answer} onChange={updateAnswer} orderedIds={orderedIds} onMove={moveItem} disabled={isSaving || resolved} />
          {formError && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>}
          <Feedback result={result} />
          {!resolved && <button type="submit" disabled={isSaving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-mint sm:w-auto"><Code2 aria-hidden="true" className="h-4 w-4" />{isSaving ? 'Registrando passo...' : 'Verificar resposta'}</button>}
          {result && !result.isCorrect && <button type="button" onClick={retryStep} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700"><RotateCcw aria-hidden="true" className="h-4 w-4" />Tentar novamente</button>}
        </form> : null}
      </GlassCard>

      {isCompleted && isLastStep && <GlassCard hover={false} className="border-emerald-200 bg-emerald-50 p-6"><div className="flex gap-3"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /><div><h3 className="font-heading text-xl font-bold text-emerald-950">Aula concluída</h3><p className="mt-2 text-sm leading-relaxed text-emerald-900">Você pode continuar para a próxima aula quando quiser.</p></div></div></GlassCard>}

      <nav aria-label="Navegação entre etapas" className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => goTo(stepIndex - 1)} disabled={stepIndex === 0 || isSaving} className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink hover:bg-mist disabled:cursor-not-allowed disabled:opacity-45"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Anterior</button>
        {isLastStep ? (isCompleted || (resolved && result?.isCorrect)) ? <span className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />Aula concluída</span> : null : <button type="button" onClick={() => goTo(stepIndex + 1)} disabled={!canContinue || isSaving} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-mint"><span>{isInteraction ? 'Continuar' : 'Entendi, continuar'}</span><ArrowRight aria-hidden="true" className="h-4 w-4" /></button>}
      </nav>
    </section>
  );
}
