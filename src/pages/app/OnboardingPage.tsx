import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Lightbulb, Sparkles, type LucideIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../../components/ui/ThemeControls';
import { useAuth } from '../../providers/AuthProvider';
import {
  completeOnboarding,
  getPrivateProfile,
  isExperienceLevel,
  isLearningGoal,
} from '../../services/profileService';
import type { ExperienceLevel, LearningGoal } from '../../types/user';

interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

const experienceOptions: ChoiceOption<ExperienceLevel>[] = [
  { value: 'never-programmed', label: 'Nunca programei', description: 'Quero começar com explicações simples e sem pressa.' },
  { value: 'some-contact', label: 'Já tive algum contato', description: 'Já vi alguns conceitos, mas preciso organizar a base.' },
  { value: 'basic-knowledge', label: 'Já conheço o básico', description: 'Quero reforçar fundamentos e seguir com mais segurança.' },
];

const goalOptions: ChoiceOption<LearningGoal>[] = [
  { value: 'learn-from-zero', label: 'Aprender programação do zero' },
  { value: 'web-development', label: 'Aprender desenvolvimento web' },
  { value: 'review-knowledge', label: 'Reforçar conhecimentos' },
  { value: 'build-projects', label: 'Criar projetos' },
];

interface ChoiceCardProps<T extends string> {
  option: ChoiceOption<T>;
  selected: boolean;
  onChange: (value: T) => void;
}

function ChoiceCard<T extends string>({ option, selected, onChange }: ChoiceCardProps<T>) {
  return (
    <label className={`block cursor-pointer rounded-2xl border p-5 transition-colors ${selected ? 'border-primary bg-primary/5 shadow-soft' : 'border-ink/10 bg-white hover:border-primary/40'}`}>
      <input className="sr-only" type="radio" name="onboarding-choice" value={option.value} checked={selected} onChange={() => onChange(option.value)} />
      <span className="flex items-start gap-3">
        <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary text-white' : 'border-ink/20 bg-white'}`}>
          {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
        </span>
        <span>
          <span className="block font-heading font-semibold text-ink">{option.label}</span>
          {option.description && <span className="mt-1 block text-sm leading-relaxed text-ink/60">{option.description}</span>}
        </span>
      </span>
    </label>
  );
}

interface OnboardingStep {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  content: ReactNode;
  nextLabel: string;
}

type OnboardingStepIndex = 0 | 1 | 2;

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStepIndex>(0);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('');
  const [learningGoal, setLearningGoal] = useState<LearningGoal | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) return undefined;

    void getPrivateProfile(user.uid)
      .then((profile) => {
        if (!active) return;
        if (profile?.onboardingCompleted === true) {
          setCompleted(true);
          return;
        }
        setExperienceLevel(isExperienceLevel(profile?.experienceLevel) ? profile.experienceLevel : '');
        setLearningGoal(isLearningGoal(profile?.learningGoal) ? profile.learningGoal : '');
        setIsLoading(false);
      })
      .catch(() => {
        if (active) {
          setLoadError('Não foi possível carregar este início agora. Atualize a página e tente novamente.');
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (completed) return <Navigate to="/dashboard" replace />;

  async function finishOnboarding(): Promise<void> {
    if (!user || !isExperienceLevel(experienceLevel) || !isLearningGoal(learningGoal) || isSaving) return;
    setSaveError('');
    setIsSaving(true);
    try {
      await completeOnboarding(user.uid, { experienceLevel, learningGoal });
      navigate('/dashboard', { replace: true });
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar suas escolhas. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  const steps: [OnboardingStep, OnboardingStep, OnboardingStep] = [
    {
      icon: Sparkles,
      eyebrow: 'Boas-vindas',
      title: `Que bom ter você aqui${user?.displayName ? `, ${user.displayName}` : ''}.`,
      description: 'O LearnDev organiza seu estudo em explicações, prática e revisão. Você não precisa ter experiência prévia para começar.',
      content: <p className="rounded-2xl bg-mist px-5 py-4 text-sm leading-relaxed text-ink/70">Vamos fazer duas perguntas rápidas para deixar a experiência inicial mais adequada ao seu momento.</p>,
      nextLabel: 'Continuar',
    },
    {
      icon: Compass,
      eyebrow: 'Sua experiência',
      title: 'Como está sua relação com programação?',
      description: 'Isso é apenas uma referência inicial para o seu aprendizado. Ela não classifica nem compara estudantes.',
      content: <fieldset className="space-y-3"><legend className="sr-only">Escolha sua experiência atual</legend>{experienceOptions.map((option) => <ChoiceCard<ExperienceLevel> key={option.value} option={option} selected={experienceLevel === option.value} onChange={(value) => setExperienceLevel(value)} />)}</fieldset>,
      nextLabel: 'Continuar',
    },
    {
      icon: Lightbulb,
      eyebrow: 'Seu objetivo',
      title: 'O que você quer conquistar primeiro?',
      description: 'Você poderá ajustar seus caminhos de estudo conforme o LearnDev evoluir.',
      content: <fieldset className="space-y-3"><legend className="sr-only">Escolha seu objetivo principal</legend>{goalOptions.map((option) => <ChoiceCard<LearningGoal> key={option.value} option={option} selected={learningGoal === option.value} onChange={(value) => setLearningGoal(value)} />)}</fieldset>,
      nextLabel: 'Concluir e ir ao painel',
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const canContinue = step === 0 || (step === 1 && Boolean(experienceLevel)) || (step === 2 && Boolean(learningGoal));

  function goBack(): void {
    setStep((current) => current === 2 ? 1 : 0);
  }

  function goForward(): void {
    setStep((current) => current === 0 ? 1 : 2);
  }

  return (
    <main className="min-h-screen bg-mist px-6 py-10 sm:py-16">
      <section className="mx-auto max-w-2xl rounded-3xl border border-ink/5 bg-white p-6 shadow-soft sm:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <span className="font-heading text-lg font-bold text-primary">LearnDev</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-ink/45">Passo {step + 1} de 3</span>
            <ThemeToggle />
          </div>
        </div>

        {isLoading ? <p className="py-16 text-center text-sm text-ink/55">Preparando seu onboarding...</p> : loadError ? <div className="rounded-2xl bg-red-50 p-5 text-sm leading-relaxed text-red-700">{loadError}</div> : <>
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-7 w-7" /></span>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">{currentStep.eyebrow}</p>
          <h1 className="font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">{currentStep.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-ink/60">{currentStep.description}</p>
          <div className="mt-8">{currentStep.content}</div>
          {saveError && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</p>}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? <button type="button" onClick={goBack} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-ink/65 hover:bg-mist disabled:opacity-50"><ArrowLeft className="h-4 w-4" />Voltar</button> : <span />}
            <button type="button" onClick={step === 2 ? finishOnboarding : goForward} disabled={!canContinue || isSaving} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? 'Salvando...' : currentStep.nextLabel}<ArrowRight className="h-4 w-4" /></button>
          </div>
        </>}
      </section>
    </main>
  );
}
