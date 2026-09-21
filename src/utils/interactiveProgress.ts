import type {
  InteractiveStepProgress,
  Lesson,
  NormalizedInteractiveLessonProgress,
  StoredInteractiveLessonProgress,
} from '../types/education';

type InteractiveLessonSource = Pick<Lesson, 'steps'> | null | undefined;

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

export function getInteractiveStepCount(lesson: InteractiveLessonSource): number {
  return lesson?.steps?.length ?? 0;
}

export function normalizeInteractiveLessonProgress(
  data: StoredInteractiveLessonProgress = {},
  lesson: InteractiveLessonSource,
): NormalizedInteractiveLessonProgress {
  const stepCount = getInteractiveStepCount(lesson);
  const lastStepIndex = Math.max(stepCount - 1, 0);

  if (data.status === 'completed' && !isInteger(data.completedSteps)) {
    return {
      currentStep: 0,
      completedSteps: stepCount,
      legacyInteractiveCompletion: true,
    };
  }

  return {
    currentStep: isInteger(data.currentStep) ? Math.min(Math.max(data.currentStep, 0), lastStepIndex) : 0,
    completedSteps: isInteger(data.completedSteps) ? Math.min(Math.max(data.completedSteps, 0), stepCount) : 0,
    legacyInteractiveCompletion: false,
  };
}

export function validateInteractiveStepProgress(
  lesson: InteractiveLessonSource,
  { currentStep, completedSteps }: InteractiveStepProgress,
  previousProgress: InteractiveStepProgress | null = null,
): InteractiveStepProgress {
  const stepCount = getInteractiveStepCount(lesson);
  if (stepCount === 0) throw new Error('Esta aula não possui uma sequência interativa disponível.');

  const lastStepIndex = stepCount - 1;
  if (!isInteger(currentStep)
    || !isInteger(completedSteps)
    || currentStep < 0
    || completedSteps < 0
    || currentStep > lastStepIndex
    || completedSteps > stepCount) {
    throw new Error('O progresso desta aula não é válido.');
  }

  if (previousProgress && completedSteps < previousProgress.completedSteps) {
    throw new Error('O progresso concluído desta aula não pode diminuir.');
  }

  return { currentStep, completedSteps };
}
