import { CheckCircle2, ClipboardCheck, Lightbulb, RotateCcw, Send } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import GlassCard from '../../components/ui/GlassCard';
import { PageFrame, PageIntro } from '../../components/ui/PageFrame';
import { useAuth } from '../../providers/AuthProvider';
import { getActivity, getActivityAttempts, submitActivityAttempt } from '../../services/activityService';
import type {
  Activity,
  ActivityAnswerValue,
  ActivityAnswers,
  ActivityAttempt,
  ActivityFeedback,
  ActivityQuestion,
  ActivityResult,
  SubmittedActivityAttempt,
} from '../../types/education';
import { formatStudyDateTime } from '../../utils/date';

interface ActivityPageState {
  loading: boolean;
  activity: Activity | null;
  attempts: ActivityAttempt[];
  error: boolean;
}

interface QuestionProps {
  question: ActivityQuestion;
  index: number;
  answers: ActivityAnswers;
  onChange: (questionId: string, answer: ActivityAnswerValue) => void;
  disabled: boolean;
  result: ActivityResult | null;
}

const TRUE_FALSE_OPTIONS: ReadonlyArray<{ value: boolean; label: string }> = [
  { value: true, label: 'Verdadeiro' },
  { value: false, label: 'Falso' },
];

function isAnswered(question: ActivityQuestion, answers: ActivityAnswers): boolean {
  return Object.prototype.hasOwnProperty.call(answers, question.id);
}

function getQuestionFeedback(result: ActivityResult | null, questionId: string): ActivityFeedback | null {
  if (!result) return null;
  return result.feedback.find((item) => item.questionId === questionId && typeof item.isCorrect === 'boolean') ?? null;
}

function AnswerResult({ feedback }: { feedback: ActivityFeedback }): JSX.Element {
  return (
    <div className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-relaxed ${feedback.isCorrect ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'}`}>
      <p className="font-semibold">{feedback.isCorrect ? 'Correto' : 'Revise este conceito'}</p>
      {feedback.message && <p className="mt-1">{feedback.message}</p>}
      {!feedback.isCorrect && feedback.hint && <p className="mt-2 flex gap-2"><Lightbulb aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{feedback.hint}</p>}
    </div>
  );
}

function Question({ question, index, answers, onChange, disabled, result }: QuestionProps): JSX.Element {
  const fieldName = `question-${question.id}`;
  const feedback = getQuestionFeedback(result, question.id);

  return (
    <fieldset disabled={disabled} className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
      <legend className="max-w-full pr-1 font-heading text-lg font-bold leading-relaxed text-ink"><span className="mr-2 text-primary">{String(index + 1).padStart(2, '0')}</span>{question.prompt}</legend>
      <div className="mt-5 grid gap-3">
        {question.type === 'multiple-choice' && question.options.map((option) => {
          const checked = answers[question.id] === option.id;
          return <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed transition-colors ${checked ? 'border-primary bg-primary/5 text-ink' : 'border-ink/10 text-ink/75 hover:border-primary/35'} ${disabled ? 'cursor-default opacity-80' : ''}`}>
            <input type="radio" name={fieldName} value={option.id} checked={checked} onChange={() => onChange(question.id, option.id)} className="mt-0.5 h-4 w-4 accent-primary" />
            <span>{option.label}</span>
          </label>;
        })}
        {question.type === 'true-false' && TRUE_FALSE_OPTIONS.map((option) => {
          const checked = answers[question.id] === option.value;
          return <label key={String(option.value)} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-medium transition-colors ${checked ? 'border-primary bg-primary/5 text-ink' : 'border-ink/10 text-ink/75 hover:border-primary/35'} ${disabled ? 'cursor-default opacity-80' : ''}`}>
            <input type="radio" name={fieldName} value={String(option.value)} checked={checked} onChange={() => onChange(question.id, option.value)} className="h-4 w-4 accent-primary" />
            <span>{option.label}</span>
          </label>;
        })}
      </div>
      {feedback && <AnswerResult feedback={feedback} />}
    </fieldset>
  );
}

function AttemptHistory({ attempts }: { attempts: ActivityAttempt[] }): JSX.Element | null {
  if (attempts.length === 0) return null;

  return (
    <GlassCard hover={false} className="p-6 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Histórico</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-ink">Tentativas anteriores</h2>
      <ol className="mt-5 space-y-3">
        {attempts.map((attempt, index) => {
          const percentage = Number.isInteger(attempt.totalQuestions) && attempt.totalQuestions > 0
            ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100)
            : null;

          return <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-3 text-sm">
            <div>
              <span className="font-semibold text-ink">{index === 0 ? 'Tentativa mais recente' : `Tentativa anterior ${index}`}</span>
              <p className="mt-1 text-xs text-ink/50">{formatStudyDateTime(attempt.submittedAt)}</p>
            </div>
            <span className="text-ink/65">{attempt.correctCount} de {attempt.totalQuestions} respostas corretas{percentage !== null ? ` · ${percentage}%` : ''}</span>
          </li>;
        })}
      </ol>
    </GlassCard>
  );
}

export default function ActivityPage(): JSX.Element {
  const { activityId } = useParams<{ activityId: string }>();
  const { user } = useAuth();
  const [state, setState] = useState<ActivityPageState>({ loading: true, activity: null, attempts: [], error: false });
  const [answers, setAnswers] = useState<ActivityAnswers>({});
  const [result, setResult] = useState<SubmittedActivityAttempt | null>(null);
  const [formError, setFormError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!user?.uid) return undefined;
    if (!activityId) {
      setState({ loading: false, activity: null, attempts: [], error: false });
      return undefined;
    }

    let active = true;
    setState({ loading: true, activity: null, attempts: [], error: false });
    setAnswers({});
    setResult(null);
    setFormError('');
    setSubmitError('');

    async function loadActivity(): Promise<void> {
      try {
        const activity = await getActivity(activityId);
        if (!activity) {
          if (active) setState({ loading: false, activity: null, attempts: [], error: false });
          return;
        }

        const attempts = await getActivityAttempts(user.uid, activityId);
        if (active) setState({ loading: false, activity, attempts, error: false });
      } catch {
        if (active) setState({ loading: false, activity: null, attempts: [], error: true });
      }
    }

    void loadActivity();
    return () => {
      active = false;
    };
  }, [activityId, retry, user?.uid]);

  const activity = state.activity;
  const backTo = activity?.lessonId ? `/aulas/${activity.lessonId}` : '/trilhas';

  function updateAnswer(questionId: string, answer: ActivityAnswerValue): void {
    if (result || isSubmitting) return;
    setAnswers((current) => ({ ...current, [questionId]: answer }));
    setFormError('');
    setSubmitError('');
  }

  async function refreshAttempts(): Promise<void> {
    if (!user?.uid || !activityId) return;
    try {
      const attempts = await getActivityAttempts(user.uid, activityId);
      setState((current) => ({ ...current, attempts }));
    } catch {
      // A correção já foi exibida; o histórico poderá ser carregado ao abrir a página novamente.
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!activity || isSubmitting || result) return;

    const unanswered = activity.questions.find((question) => !isAnswered(question, answers));
    if (unanswered) {
      setFormError('Responda todas as questões antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const attempt = await submitActivityAttempt(activity, answers);
      setResult(attempt);
      void refreshAttempts();
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível enviar a atividade agora.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetry(): void {
    setAnswers({});
    setResult(null);
    setFormError('');
    setSubmitError('');
  }

  return (
    <PageFrame className="max-w-4xl">
      {state.loading ? <><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Atividade" title="Carregando atividade" /><div className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-ink/55 shadow-sm">Preparando as questões...</div></> : state.error ? <><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Atividade" title="Atividade indisponível" /><EmptyState icon={ClipboardCheck} title="Não foi possível carregar esta atividade." description="Tente novamente em alguns instantes." action={<button type="button" onClick={() => setRetry((value) => value + 1)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Tentar novamente</button>} /></> : !activity ? <><PageIntro backTo="/trilhas" backLabel="Voltar para trilhas" eyebrow="Atividade" title="Atividade não encontrada" /><EmptyState icon={ClipboardCheck} title="Atividade não encontrada." description="Este endereço não corresponde a uma atividade publicada." /></> : <>
        <PageIntro backTo={backTo} backLabel="Voltar para a aula" eyebrow="Atividade" title={activity.title} description={activity.description} />
        <div className="mx-auto max-w-3xl space-y-6">
          <GlassCard hover={false} className="p-6 sm:p-7">
            <p className="text-sm leading-relaxed text-ink/70">{activity.instructions}</p>
            <p className="mt-3 text-sm text-ink/55">Esta atividade não é obrigatória para concluir a aula.</p>
          </GlassCard>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {activity.questions.map((question, index) => <Question key={question.id} question={question} index={index} answers={answers} onChange={updateAnswer} disabled={isSubmitting || Boolean(result)} result={result} />)}
            {formError && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>}
            {submitError && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</p>}

            {result ? <GlassCard hover={false} className="p-6 sm:p-7">
              <div className="flex items-center gap-3"><CheckCircle2 aria-hidden="true" className="h-6 w-6 text-emerald-600" /><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Resultado registrado</p><h2 className="mt-1 font-heading text-2xl font-bold text-ink">Você acertou {result.correctCount} de {result.totalQuestions} questões</h2></div></div>
              <p className="mt-4 text-sm leading-relaxed text-ink/65">Use o feedback acima para retomar os conceitos que precisarem de mais atenção. Você pode tentar novamente quando quiser.</p>
              <button type="button" onClick={handleRetry} className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white"><RotateCcw aria-hidden="true" className="h-4 w-4" />Tentar novamente</button>
            </GlassCard> : <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-mint sm:w-auto"><Send aria-hidden="true" className="h-4 w-4" />{isSubmitting ? 'Enviando respostas...' : 'Enviar respostas'}</button>}
          </form>

          <AttemptHistory attempts={state.attempts} />
          <Link to={backTo} className="inline-flex text-sm font-semibold text-primary hover:text-primary-700">Voltar para a aula</Link>
        </div>
      </>}
    </PageFrame>
  );
}
