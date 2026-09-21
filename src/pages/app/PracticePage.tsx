import { ArrowDown, ArrowUp, CheckCircle2, Code2, Lightbulb, ListOrdered, RotateCcw, Send } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { useAuth } from '../../providers/AuthProvider';
import { getPracticalAttempts, getPracticalExerciseViewData, submitPracticalAttempt } from '../../services/practicalExerciseService';
import { getPracticeStatusLabel } from '../../services/practicalExerciseValidation';
import type {
  OrderStepsExercise,
  PracticalAttempt,
  PracticalExercise,
  PracticalExerciseResponse,
  PracticalExerciseViewData,
  SubmittedPracticalAttempt,
} from '../../types/education';
import { formatStudyDateTime } from '../../utils/date';

interface PracticePageState {
  loading: boolean;
  data: PracticalExerciseViewData | null;
  attempts: PracticalAttempt[];
  error: boolean;
}

interface PseudocodePreviewProps {
  code: string | undefined;
  hasBlank?: boolean;
}

interface OrderStepsEditorProps {
  steps: OrderStepsExercise['steps'];
  order: string[];
  onMove: (index: number, direction: number) => void;
  disabled: boolean;
}

function PseudocodePreview({ code, hasBlank = false }: PseudocodePreviewProps): JSX.Element | null {
  if (!code) return null;
  const fragments = hasBlank ? code.split('{{blank}}') : [code];

  return (
    <pre className="mt-5 overflow-x-auto rounded-2xl bg-ink px-5 py-4 font-mono text-sm leading-7 text-slate-100 shadow-inner"><code>{fragments.map((fragment, index) => <span key={`${fragment}-${index}`}>{fragment}{hasBlank && index < fragments.length - 1 && <mark className="rounded bg-primary px-1.5 py-0.5 font-semibold text-white">[ lacuna ]</mark>}</span>)}</code></pre>
  );
}

function PracticeFeedback({ result }: { result: SubmittedPracticalAttempt }): JSX.Element {
  const isCorrect = result.status === 'correct';
  const isPartial = result.status === 'partially_correct';
  const styles = isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : isPartial ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-red-200 bg-red-50 text-red-950';

  return (
    <div role="status" aria-live="polite" className={`rounded-3xl border p-5 sm:p-6 ${styles}`}>
      <div className="flex items-start gap-3"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">{getPracticeStatusLabel(result.status)}</p><p className="mt-2 text-sm leading-relaxed">{result.message}</p></div></div>
      {!isCorrect && result.hint && <p className="mt-4 flex gap-2 border-t border-current/15 pt-4 text-sm leading-relaxed"><Lightbulb aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{result.hint}</p>}
      {result.explanation && <p className="mt-4 text-sm leading-relaxed"><span className="font-semibold">Por que isso importa: </span>{result.explanation}</p>}
    </div>
  );
}

function PracticeHistory({ attempts }: { attempts: PracticalAttempt[] }): JSX.Element | null {
  if (attempts.length === 0) return null;

  return (
    <GlassCard hover={false} className="p-6 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Histórico</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-ink">Tentativas anteriores</h2>
      <ol className="mt-5 space-y-3">{attempts.map((attempt, index) => <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-3 text-sm"><div><p className="font-semibold text-ink">{index === 0 ? 'Tentativa mais recente' : `Tentativa anterior ${index}`}</p><p className="mt-1 text-xs text-ink/55">{formatStudyDateTime(attempt.submittedAt)}</p></div><span className="font-medium text-ink/70">{getPracticeStatusLabel(attempt.resultStatus)}</span></li>)}</ol>
    </GlassCard>
  );
}

function OrderStepsEditor({ steps, order, onMove, disabled }: OrderStepsEditorProps): JSX.Element {
  const stepById = new Map(steps.map((step) => [step.id, step]));
  return (
    <ol className="mt-5 space-y-3" aria-label="Etapas na ordem atual">{order.map((stepId, index) => {
      const step = stepById.get(stepId);
      if (!step) return null;
      return <li key={step.id} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4"><span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span><code className="min-w-0 flex-1 break-words font-mono text-sm leading-6 text-ink/80">{step.content}</code><div className="flex shrink-0 gap-2"><button type="button" aria-label={`Mover ${step.content} para cima`} onClick={() => onMove(index, -1)} disabled={disabled || index === 0} className="rounded-lg border border-ink/15 p-2 text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp aria-hidden="true" className="h-4 w-4" /></button><button type="button" aria-label={`Mover ${step.content} para baixo`} onClick={() => onMove(index, 1)} disabled={disabled || index === order.length - 1} className="rounded-lg border border-ink/15 p-2 text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"><ArrowDown aria-hidden="true" className="h-4 w-4" /></button></div></li>;
    })}</ol>
  );
}

export default function PracticePage(): JSX.Element {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const { user } = useAuth();
  const [state, setState] = useState<PracticePageState>({ loading: true, data: null, attempts: [], error: false });
  const [textAnswer, setTextAnswer] = useState('');
  const [orderedStepIds, setOrderedStepIds] = useState<string[]>([]);
  const [result, setResult] = useState<SubmittedPracticalAttempt | null>(null);
  const [formError, setFormError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!user?.uid) return undefined;
    if (!exerciseId) {
      setState({ loading: false, data: null, attempts: [], error: false });
      return undefined;
    }

    let active = true;
    setState({ loading: true, data: null, attempts: [], error: false });
    setTextAnswer('');
    setOrderedStepIds([]);
    setResult(null);
    setFormError('');
    setSubmitError('');
    setShowSolution(false);

    async function loadPractice(): Promise<void> {
      try {
        const data = await getPracticalExerciseViewData(exerciseId);
        if (!data) {
          if (active) setState({ loading: false, data: null, attempts: [], error: false });
          return;
        }

        const attempts = await getPracticalAttempts(user.uid, exerciseId);
        if (!active) return;
        setOrderedStepIds(data.exercise.type === 'order_steps' ? data.exercise.steps.map((step) => step.id) : []);
        setState({ loading: false, data, attempts, error: false });
      } catch {
        if (active) setState({ loading: false, data: null, attempts: [], error: true });
      }
    }

    void loadPractice();
    return () => {
      active = false;
    };
  }, [exerciseId, retry, user?.uid]);

  const exercise = state.data?.exercise;
  const backTo = exercise?.lessonId ? `/aulas/${exercise.lessonId}` : '/trilhas';

  function moveStep(index: number, direction: number): void {
    if (result || isSubmitting) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= orderedStepIds.length) return;
    setOrderedStepIds((current) => {
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
    setFormError('');
    setSubmitError('');
  }

  function getResponse(currentExercise: PracticalExercise): PracticalExerciseResponse {
    return currentExercise.type === 'order_steps'
      ? { kind: 'ordered_steps', orderedStepIds }
      : { kind: 'text', text: textAnswer };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const uid = user?.uid;
    if (!exercise || !uid || result || isSubmitting) return;
    setIsSubmitting(true);
    setFormError('');
    setSubmitError('');

    try {
      const attempt = await submitPracticalAttempt(exercise, getResponse(exercise));
      setResult(attempt);
      const attempts = await getPracticalAttempts(uid, exercise.id);
      setState((current) => ({ ...current, attempts }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível verificar esta prática agora.';
      if (message.startsWith('Escreva') || message.startsWith('Organize') || message.startsWith('A ordem enviada')) setFormError(message);
      else setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetry(): void {
    setTextAnswer('');
    setOrderedStepIds(exercise?.type === 'order_steps' ? exercise.steps.map((step) => step.id) : []);
    setResult(null);
    setFormError('');
    setSubmitError('');
    setShowSolution(false);
  }

  return (
    <PageFrame className="max-w-4xl">
      {state.loading ? <><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Prática" title="Carregando prática" /><div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Preparando o exercício...</div></> : state.error ? <><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Prática" title="Prática indisponível" /><EmptyState icon={Code2} title="Não foi possível carregar esta prática." description="Tente novamente em alguns instantes." action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Tentar novamente</button>} /></> : !exercise ? <><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Prática" title="Prática não encontrada" /><EmptyState icon={Code2} title="Prática não encontrada." description="Este endereço não corresponde a uma prática publicada." /></> : <>
        <Breadcrumbs items={[{ label: 'Trilhas', to: '/trilhas' }, { label: 'Aula', to: backTo }, { label: exercise.title }]} />
        <PageIntro backTo={backTo} backLabel="Voltar para a aula" eyebrow="Pratique" title={exercise.title} description={exercise.description} />
        <div className="mx-auto max-w-3xl space-y-6">
          <GlassCard hover={false} className="p-6 sm:p-7"><div className="flex items-start gap-3"><Code2 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h2 className="font-heading text-xl font-bold text-ink">Instruções</h2><p className="mt-3 text-sm leading-relaxed text-ink/70">{exercise.instructions}</p></div></div>{exercise.starterCode && <PseudocodePreview code={exercise.starterCode} hasBlank={exercise.type === 'complete_code'} />}</GlassCard>

          {state.data?.concepts.length > 0 && <GlassCard hover={false} className="p-6 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Conceitos trabalhados</p><ul className="mt-4 flex flex-wrap gap-2">{state.data.concepts.map((concept) => <li key={concept.id} className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">{concept.name}</li>)}</ul></GlassCard>}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <GlassCard hover={false} className="p-6 sm:p-7"><div className="flex items-center gap-2"><ListOrdered aria-hidden="true" className="h-5 w-5 text-primary" /><h2 className="font-heading text-2xl font-bold text-ink">Sua solução</h2></div>
              {exercise.type === 'order_steps' ? <><p className="mt-3 text-sm leading-relaxed text-ink/65">Use os botões para mover cada etapa. A ordem pode ser definida sem arrastar itens.</p><OrderStepsEditor steps={exercise.steps} order={orderedStepIds} onMove={moveStep} disabled={isSubmitting || Boolean(result)} /></> : <div className="mt-5"><label htmlFor="practice-answer" className="block text-sm font-semibold text-ink">{exercise.type === 'complete_code' ? 'Trecho para a lacuna' : 'Pseudocódigo da sua solução'}</label><textarea id="practice-answer" value={textAnswer} onChange={(event) => { if (!result && !isSubmitting) { setTextAnswer(event.target.value); setFormError(''); setSubmitError(''); } }} disabled={isSubmitting || Boolean(result)} placeholder={exercise.type === 'complete_code' ? 'Digite o trecho que falta' : 'LEIA nota1\nLEIA nota2\n...'} rows={exercise.type === 'complete_code' ? 3 : 12} className="mt-3 block w-full rounded-2xl border border-ink/15 bg-ink px-4 py-3 font-mono text-sm leading-7 text-slate-100 placeholder:text-slate-400 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-80" /></div>}
            </GlassCard>
            {formError && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>}
            {submitError && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</p>}
            {result ? <><PracticeFeedback result={result} /><div className="flex flex-wrap gap-3"><button type="button" onClick={handleRetry} className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white"><RotateCcw aria-hidden="true" className="h-4 w-4" />Tentar novamente</button><button type="button" onClick={() => setShowSolution((current) => !current)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">{showSolution ? 'Ocultar solução possível' : 'Ver uma solução possível'}</button></div>{showSolution && <GlassCard hover={false} className="p-6 sm:p-7"><h2 className="font-heading text-2xl font-bold text-ink">Uma solução possível</h2><PseudocodePreview code={exercise.possibleSolution} /></GlassCard>}</> : <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-mint sm:w-auto"><Send aria-hidden="true" className="h-4 w-4" />{isSubmitting ? 'Verificando solução...' : 'Verificar solução'}</button>}
          </form>
          <PracticeHistory attempts={state.attempts} />
          <Link to={backTo} className="inline-flex text-sm font-semibold text-primary hover:text-primary-700">Voltar para a aula</Link>
        </div>
      </>}
    </PageFrame>
  );
}
