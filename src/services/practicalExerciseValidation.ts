import type {
  CompleteCodeExercise,
  OrderStepsExercise,
  PracticalExercise,
  PracticalExerciseFeedback,
  PracticalExerciseResponse,
  PracticalExerciseResult,
  PracticalExerciseType,
  PracticalWriteCodeCheck,
  PracticeResultStatus,
  TextPracticalResponse,
  WriteCodeExercise,
} from '../types/education';

export const PRACTICAL_EXERCISE_TYPES: ReadonlySet<PracticalExerciseType> = new Set(['complete_code', 'write_code', 'order_steps']);
export const PRACTICE_RESULT_STATUSES: ReadonlySet<PracticeResultStatus> = new Set(['correct', 'partially_correct', 'needs_revision']);
export const WRITE_CODE_CHECK_TYPES: ReadonlySet<PracticalWriteCodeCheck['type']> = new Set([
  'minimum_input_operations',
  'contains_assignment',
  'contains_addition',
  'contains_division_by',
  'contains_conditional',
  'contains_else',
  'contains_output_operation',
  'contains_text',
]);

function isNonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isDocumentData(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeCodeForComparison(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeCompleteCodeAnswer(value: unknown): string {
  return normalizeCodeForComparison(value);
}

function getTextResponse(response: unknown): TextPracticalResponse {
  if (!isDocumentData(response) || !isNonEmptyText(response.text)) {
    throw new Error('Escreva sua solução antes de verificar.');
  }

  const text = response.text.trim();
  if (text.length > 3000) throw new Error('Sua solução está maior do que o limite desta prática.');
  return { kind: 'text', text };
}

function getOrderStepsResponse(exercise: OrderStepsExercise, response: unknown): PracticalExerciseResponse {
  const expectedIds = exercise.steps.map((step) => step.id);
  const orderedStepIds = isDocumentData(response) ? response.orderedStepIds : undefined;
  if (!Array.isArray(orderedStepIds) || orderedStepIds.length !== expectedIds.length || !orderedStepIds.every((stepId) => typeof stepId === 'string')) {
    throw new Error('Organize todas as etapas antes de verificar.');
  }

  const submittedIds = new Set(orderedStepIds);
  if (submittedIds.size !== expectedIds.length || expectedIds.some((id) => !submittedIds.has(id))) {
    throw new Error('A ordem enviada contém etapas inválidas. Tente novamente.');
  }

  return { kind: 'ordered_steps', orderedStepIds: [...orderedStepIds] };
}

export function getValidatedPracticalResponse(exercise: PracticalExercise, response: unknown): PracticalExerciseResponse {
  if (!PRACTICAL_EXERCISE_TYPES.has(exercise.type)) {
    throw new Error('Esta prática está indisponível no momento.');
  }

  return exercise.type === 'order_steps'
    ? getOrderStepsResponse(exercise, response)
    : getTextResponse(response);
}

function getFeedback(
  exercise: PracticalExercise,
  status: PracticeResultStatus,
  missingCriteria: string[] = [],
): Pick<PracticalExerciseResult, 'message' | 'hint' | 'explanation'> {
  const feedback: PracticalExerciseFeedback = exercise.feedback;
  const baseMessage = status === 'correct'
    ? feedback.correct
    : status === 'partially_correct'
      ? feedback.partiallyCorrect
      : feedback.needsRevision;

  const missingMessage = missingCriteria.length > 0
    ? ` Ainda falta: ${missingCriteria.join('; ')}.`
    : '';

  return {
    message: `${baseMessage || 'Revise sua solução e tente novamente.'}${missingMessage}`,
    hint: feedback.hint || 'Retome o exemplo da aula e verifique cada etapa da lógica.',
    explanation: feedback.explanation || '',
  };
}

function evaluateCompleteCode(exercise: CompleteCodeExercise, response: TextPracticalResponse): PracticalExerciseResult {
  const normalizedAnswer = normalizeCompleteCodeAnswer(response.text);
  const acceptedAnswers = exercise.validation.acceptedAnswers.map(normalizeCompleteCodeAnswer);
  const status: PracticeResultStatus = acceptedAnswers.includes(normalizedAnswer) ? 'correct' : 'needs_revision';

  return {
    status,
    response,
    ...getFeedback(exercise, status),
    matchedCriteria: status === 'correct' ? ['lacuna-preenchida'] : [],
    missingCriteria: status === 'correct' ? [] : ['o trecho que completa a lacuna'],
  };
}

function evaluateOrderSteps(exercise: OrderStepsExercise, response: PracticalExerciseResponse): PracticalExerciseResult {
  if (response.kind !== 'ordered_steps') throw new Error('A resposta desta prática não corresponde às etapas solicitadas.');
  const correctOrder = exercise.validation.correctOrder;
  const isCorrect = response.orderedStepIds.every((stepId, index) => stepId === correctOrder[index]);
  const status: PracticeResultStatus = isCorrect ? 'correct' : 'needs_revision';

  return {
    status,
    response,
    ...getFeedback(exercise, status),
    matchedCriteria: isCorrect ? ['ordem-do-algoritmo'] : [],
    missingCriteria: isCorrect ? [] : ['a sequência em que cada etapa depende da anterior'],
  };
}

function countMatches(text: string, expression: RegExp): number {
  return [...text.matchAll(expression)].length;
}

function checkWriteCodeCriterion(text: string, criterion: PracticalWriteCodeCheck): boolean {
  switch (criterion.type) {
    case 'minimum_input_operations':
      return countMatches(text, /\b(read|leia|ler)\b/g) >= criterion.minimum;
    case 'contains_assignment':
      return /←|(?<![<>=!])=(?!=)/.test(text);
    case 'contains_addition':
      return text.includes('+');
    case 'contains_division_by':
      return new RegExp(`\\/\\s*${criterion.value}\\b`).test(text);
    case 'contains_conditional':
      return (/\bif\b/.test(text) && /\bend\s*if\b/.test(text))
        || (/\bse\b/.test(text) && /\bfim\s*se\b|\bfimse\b/.test(text));
    case 'contains_else':
      return /\b(else|senao|senão)\b/.test(text);
    case 'contains_output_operation':
      return /\b(print|escreva|mostrar|mostre)\b/.test(text);
    case 'contains_text':
      return text.includes(normalizeCodeForComparison(criterion.value));
  }
}

function evaluateWriteCode(exercise: WriteCodeExercise, response: TextPracticalResponse): PracticalExerciseResult {
  const normalizedCode = normalizeCodeForComparison(response.text);
  const checks = exercise.validation.requiredChecks;
  const matchedChecks = checks.filter((criterion) => checkWriteCodeCriterion(normalizedCode, criterion));
  const missingCriteria = checks
    .filter((criterion) => !matchedChecks.includes(criterion))
    .map((criterion) => criterion.message);
  const ratio = matchedChecks.length / checks.length;
  const status: PracticeResultStatus = ratio === 1 ? 'correct' : ratio >= 0.5 ? 'partially_correct' : 'needs_revision';

  return {
    status,
    response,
    ...getFeedback(exercise, status, missingCriteria),
    matchedCriteria: matchedChecks.map((criterion) => criterion.id),
    missingCriteria,
  };
}

export function evaluatePracticalExercise(exercise: PracticalExercise, response: unknown): PracticalExerciseResult {
  const validatedResponse = getValidatedPracticalResponse(exercise, response);

  switch (exercise.type) {
    case 'complete_code':
      if (validatedResponse.kind !== 'text') throw new Error('A resposta desta prática não corresponde ao código solicitado.');
      return evaluateCompleteCode(exercise, validatedResponse);
    case 'order_steps':
      return evaluateOrderSteps(exercise, validatedResponse);
    case 'write_code':
      if (validatedResponse.kind !== 'text') throw new Error('A resposta desta prática não corresponde ao código solicitado.');
      return evaluateWriteCode(exercise, validatedResponse);
  }
}

export function getPracticeStatusLabel(status: PracticeResultStatus): string {
  if (status === 'correct') return 'Solução verificada';
  if (status === 'partially_correct') return 'Em desenvolvimento';
  return 'Revisão recomendada';
}
