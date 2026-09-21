import { normalizeCompleteCodeAnswer } from './practicalExerciseValidation';
import type {
  InteractiveLessonStep,
  InteractiveOption,
  InteractiveQuestionStep,
  InteractiveStepAnswer,
  InteractiveStepResult,
  Lesson,
  OptionInteractiveStepBase,
  OrderCodeStep,
  TextInteractiveStep,
  WriteCodeCheck,
  WriteCodeStep,
} from '../types/education';

export const INTERACTIVE_STEP_TYPES = new Set<InteractiveLessonStep['type']>([
  'explanation',
  'choose_code',
  'fill_code',
  'predict_output',
  'order_code',
  'find_error',
  'choose_output',
  'write_code',
  'complete_line',
]);

export const WRITE_CODE_CHECK_TYPES = new Set<WriteCodeCheck['type']>([
  'contains_if',
  'compares_variable_to_value',
  'logs_message',
  'for_counter_range',
  'logs_variable',
  'defines_function',
  'returns_multiplication',
  'declares_value',
  'declares_sum',
  'contains_fragment',
]);

function normalizeCode(value: string): string {
  return normalizeCompleteCodeAnswer(value)
    .replace(/[;]+$/g, '')
    .replace(/\s*([=+\-*/<>])\s*/g, '$1');
}

function validateTextAnswer(answer: InteractiveStepAnswer): string {
  if (typeof answer !== 'string' || !answer.trim()) {
    throw new Error('Preencha sua resposta antes de verificar.');
  }

  return answer.trim();
}

function getOption(step: OptionInteractiveStepBase, answer: InteractiveStepAnswer): InteractiveOption {
  if (typeof answer !== 'string' || !answer) throw new Error('Escolha uma alternativa antes de verificar.');
  const option = step.options.find((item) => item.id === answer);
  if (!option) throw new Error('A alternativa escolhida não é válida.');
  return option;
}

function getOrderedStepIds(step: OrderCodeStep, answer: InteractiveStepAnswer): string[] {
  if (typeof answer === 'string') throw new Error('Organize todas as linhas antes de verificar.');

  const expectedIds = step.items.map((item) => item.id);
  const receivedIds = answer.orderedStepIds;
  if (receivedIds.length !== expectedIds.length) {
    throw new Error('Organize todas as linhas antes de verificar.');
  }

  const received = new Set(receivedIds);
  if (received.size !== expectedIds.length || expectedIds.some((id) => !received.has(id))) {
    throw new Error('A ordem enviada contém linhas inválidas. Tente novamente.');
  }

  return [...receivedIds];
}

function result(isCorrect: boolean, message: string, hint = ''): InteractiveStepResult {
  return {
    isCorrect,
    message,
    ...(isCorrect || !hint ? {} : { hint }),
  };
}

function evaluateOptionStep(step: OptionInteractiveStepBase, answer: InteractiveStepAnswer): InteractiveStepResult {
  const option = getOption(step, answer);
  const isCorrect = option.id === step.correctAnswer;
  return result(
    isCorrect,
    isCorrect ? step.correctFeedback : option.feedback || step.incorrectFeedback,
    step.hint,
  );
}

function evaluateTextStep(step: TextInteractiveStep, answer: InteractiveStepAnswer): InteractiveStepResult {
  const text = validateTextAnswer(answer);
  const acceptedAnswers = step.acceptedAnswers.map(normalizeCode);
  const isCorrect = acceptedAnswers.includes(normalizeCode(text));
  return result(isCorrect, isCorrect ? step.correctFeedback : step.incorrectFeedback, step.hint);
}

function evaluateOrderStep(step: OrderCodeStep, answer: InteractiveStepAnswer): InteractiveStepResult {
  const orderedStepIds = getOrderedStepIds(step, answer);
  const isCorrect = orderedStepIds.every((id, index) => id === step.correctOrder[index]);
  return result(isCorrect, isCorrect ? step.correctFeedback : step.incorrectFeedback, step.hint);
}

function escapeRegularExpression(value: string | number): string {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesWriteCodeCheck(normalizedText: string, check: WriteCodeCheck): boolean {
  switch (check.type) {
    case 'contains_if':
      return /\bif\s*\(/.test(normalizedText);
    case 'compares_variable_to_value': {
      const value = typeof check.value === 'string' ? normalizeCode(check.value) : String(check.value);
      const variable = escapeRegularExpression(check.variable);
      const operator = escapeRegularExpression(check.operator);
      return new RegExp(`\\b${variable}\\s*${operator}\\s*\\(*\\s*${escapeRegularExpression(value)}\\b`).test(normalizedText);
    }
    case 'logs_message': {
      const value = typeof check.value === 'string' ? normalizeCode(check.value) : String(check.value);
      return new RegExp(`\\bconsole\\s*\\.\\s*log\\s*\\(\\s*['\"]${escapeRegularExpression(value)}['\"]\\s*\\)`).test(normalizedText);
    }
    case 'for_counter_range': {
      const counter = escapeRegularExpression(check.counter);
      const start = escapeRegularExpression(check.start);
      const end = escapeRegularExpression(check.end);
      return new RegExp(`\\bfor\\s*\\(\\s*(?:let|var)\\s+${counter}\\s*=\\s*${start}\\s*;\\s*${counter}\\s*<=\\s*${end}\\s*;\\s*(?:${counter}\\s*\\+\\+|${counter}\\s*\\+=\\s*1|${counter}\\s*=\\s*${counter}\\s*\\+\\s*1)\\s*\\)`).test(normalizedText);
    }
    case 'logs_variable':
      return new RegExp(`\\bconsole\\s*\\.\\s*log\\s*\\(\\s*${escapeRegularExpression(check.variable)}\\s*\\)`).test(normalizedText);
    case 'defines_function': {
      const parameters = check.parameters.map(escapeRegularExpression).join('\\s*,\\s*');
      return new RegExp(`\\bfunction\\s+${escapeRegularExpression(check.name)}\\s*\\(\\s*${parameters}\\s*\\)\\s*\\{`).test(normalizedText);
    }
    case 'returns_multiplication':
      return new RegExp(`\\breturn\\s+\\(*\\s*${escapeRegularExpression(check.variable)}\\s*\\*\\s*${escapeRegularExpression(check.factor)}\\b\\s*\\)*`).test(normalizedText);
    case 'declares_value':
      return new RegExp(`\\b(?:let|const)\\s+[a-z_$][\\w$]*\\s*=\\s*${escapeRegularExpression(check.value)}\\b`).test(normalizedText);
    case 'declares_sum':
      return new RegExp(`\\b(?:let|const)\\s+${escapeRegularExpression(check.variable)}\\s*=\\s*[a-z_$][\\w$]*\\s*\\+\\s*[a-z_$][\\w$]*\\b`).test(normalizedText);
    case 'contains_fragment':
      return normalizedText.includes(normalizeCode(check.fragment));
  }
}

function getWriteCodeChecks(step: WriteCodeStep): WriteCodeCheck[] {
  if (step.requiredChecks && step.requiredChecks.length > 0) return step.requiredChecks;

  return (step.requiredFragments ?? []).map((fragment, index) => ({
    id: `fragment-${index + 1}`,
    type: 'contains_fragment',
    fragment,
    message: `inclua ${fragment}`,
  }));
}

function evaluateWriteCodeStep(step: WriteCodeStep, answer: InteractiveStepAnswer): InteractiveStepResult {
  const text = validateTextAnswer(answer);
  if (text.length > 2000) throw new Error('Sua resposta está maior do que o limite desta atividade.');

  const normalizedText = normalizeCode(text);
  const requiredChecks = getWriteCodeChecks(step);
  const missing = requiredChecks.filter((check) => !matchesWriteCodeCheck(normalizedText, check));
  const isCorrect = missing.length === 0;
  const missingMessage = missing.length > 0 ? ` ${missing[0].message}` : '';
  return result(
    isCorrect,
    `${isCorrect ? step.correctFeedback : step.incorrectFeedback}${missingMessage}`,
    step.hint,
  );
}

export function isInteractiveStep(
  step: InteractiveLessonStep | null | undefined,
): step is InteractiveQuestionStep {
  return Boolean(step && step.type !== 'explanation');
}

export function getInteractiveSteps(
  lesson: Pick<Lesson, 'steps'> | null | undefined,
): InteractiveLessonStep[] {
  return lesson?.steps?.filter((step) => INTERACTIVE_STEP_TYPES.has(step.type)) ?? [];
}

export function evaluateInteractiveStep(
  step: InteractiveLessonStep | null | undefined,
  answer: InteractiveStepAnswer,
): InteractiveStepResult {
  if (!step || !INTERACTIVE_STEP_TYPES.has(step.type)) {
    throw new Error('Este passo interativo está indisponível.');
  }

  switch (step.type) {
    case 'explanation':
      return result(true, 'Conteúdo apresentado.');
    case 'choose_code':
    case 'predict_output':
    case 'find_error':
    case 'choose_output':
      return evaluateOptionStep(step, answer);
    case 'fill_code':
    case 'complete_line':
      return evaluateTextStep(step, answer);
    case 'order_code':
      return evaluateOrderStep(step, answer);
    case 'write_code':
      return evaluateWriteCodeStep(step, answer);
  }
}
