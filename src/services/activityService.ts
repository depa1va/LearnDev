import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
} from 'firebase/firestore';
import { auth } from '../lib/firebase/auth';
import { db } from '../lib/firebase/firestore';
import type {
  Activity,
  ActivityAnswerValue,
  ActivityAnswers,
  ActivityAttempt,
  ActivityFeedback,
  ActivityQuestion,
  ActivityResult,
  Concept,
  ConceptMastery,
  MultipleChoiceActivityQuestion,
  SubmittedActivityAttempt,
} from '../types/education';
import { getTimestampMilliseconds } from '../utils/date';
import { getActivityById, getConceptsByIds } from './educationService';

const OBJECTIVE_QUESTION_TYPES: ReadonlySet<ActivityQuestion['type']> = new Set(['multiple-choice', 'true-false']);

interface ValidatedMultipleChoiceQuestion extends MultipleChoiceActivityQuestion {
  optionIds: ReadonlySet<string>;
}

type ValidatedActivityQuestion = ValidatedMultipleChoiceQuestion | Exclude<ActivityQuestion, MultipleChoiceActivityQuestion>;

interface ConceptOutcome {
  correct: number;
  incorrect: number;
}

interface ConceptMasteryDiagnostic {
  conceptId: string;
  operation: 'create' | 'update';
  hasCreatedAt: boolean;
  lastLessonId: string;
  correctAnswers: { previous: number; next: number };
  incorrectAnswers: { previous: number; next: number };
  needsReview: boolean;
}

export interface ConceptNeedingReview extends Concept {
  mastery: ConceptMastery;
}

function requireActivityAccess(uid: string | undefined): Firestore {
  if (!db) throw new Error('A configuração do Firebase ainda não está disponível.');
  if (!uid || auth?.currentUser?.uid !== uid) throw new Error('Sua sessão não permite acessar estas atividades.');
  return db;
}

function isDocumentData(value: unknown): value is DocumentData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function safeText(value: unknown, fallback: string): string {
  return isNonEmptyText(value) ? value.trim() : fallback;
}

function getActivityQuestions(activity: Activity): ValidatedActivityQuestion[] {
  if (!activity.id || !activity.lessonId || !activity.courseId || !activity.moduleId || !Array.isArray(activity.questions) || activity.questions.length === 0) {
    throw new Error('Esta atividade está indisponível no momento.');
  }

  const questionIds = new Set<string>();
  return activity.questions.map((question) => {
    if (!isNonEmptyText(question.id) || questionIds.has(question.id) || !OBJECTIVE_QUESTION_TYPES.has(question.type) || !isNonEmptyText(question.prompt) || !Array.isArray(question.conceptIds) || question.conceptIds.length === 0 || !question.conceptIds.every(isNonEmptyText)) {
      throw new Error('Esta atividade possui uma questão inválida.');
    }
    questionIds.add(question.id);
    const conceptIds = [...new Set(question.conceptIds)];

    if (question.type === 'true-false') {
      if (typeof question.correctAnswer !== 'boolean') throw new Error('Esta atividade possui uma resposta de correção inválida.');
      return { ...question, conceptIds };
    }

    if (!Array.isArray(question.options) || question.options.length < 2 || typeof question.correctAnswer !== 'string') {
      throw new Error('Esta atividade possui alternativas inválidas.');
    }

    const optionIds = new Set<string>();
    question.options.forEach((option) => {
      if (!isNonEmptyText(option.id) || !isNonEmptyText(option.label) || optionIds.has(option.id)) {
        throw new Error('Esta atividade possui alternativas inválidas.');
      }
      optionIds.add(option.id);
    });
    if (!optionIds.has(question.correctAnswer)) throw new Error('Esta atividade possui uma resposta de correção inválida.');

    return { ...question, conceptIds, optionIds };
  });
}

function getValidatedAnswers(questions: ValidatedActivityQuestion[], answers: unknown): ActivityAnswers {
  if (!isDocumentData(answers)) throw new Error('Responda todas as questões antes de enviar.');

  const answerIds = Object.keys(answers);
  if (answerIds.length !== questions.length || answerIds.some((id) => !questions.some((question) => question.id === id))) {
    throw new Error('Responda todas as questões antes de enviar.');
  }

  const validatedAnswers: ActivityAnswers = {};
  questions.forEach((question) => {
    const answer: unknown = answers[question.id];
    if (question.type === 'multiple-choice') {
      if (typeof answer !== 'string' || !question.optionIds.has(answer)) throw new Error('Uma das respostas selecionadas não é válida.');
      validatedAnswers[question.id] = answer;
      return;
    }
    if (typeof answer !== 'boolean') throw new Error('Uma das respostas selecionadas não é válida.');
    validatedAnswers[question.id] = answer;
  });

  return validatedAnswers;
}

export function correctActivityLocally(activity: Activity, answers: unknown): ActivityResult {
  const questions = getActivityQuestions(activity);
  const validatedAnswers = getValidatedAnswers(questions, answers);
  const feedback: ActivityFeedback[] = questions.map((question) => {
    const selectedAnswer: ActivityAnswerValue = validatedAnswers[question.id];
    const isCorrect = selectedAnswer === question.correctAnswer;
    const selectedOption = question.type === 'multiple-choice' && typeof selectedAnswer === 'string'
      ? question.options.find((option) => option.id === selectedAnswer)
      : undefined;
    return {
      questionId: question.id,
      isCorrect,
      conceptIds: question.conceptIds,
      message: isCorrect
        ? safeText(question.correctFeedback, 'Resposta correta. Continue praticando este conceito.')
        : safeText(selectedOption?.feedback, safeText(question.incorrectFeedback, 'Esta resposta precisa de revisão.')),
      ...(isCorrect ? {} : { hint: safeText(question.hint, 'Revise o conceito relacionado e tente novamente.') }),
    };
  });

  return {
    answers: validatedAnswers,
    feedback,
    correctCount: feedback.filter((item) => item.isCorrect).length,
    totalQuestions: questions.length,
  };
}

function getCounter(value: unknown): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : 0;
}

function hasOwnField(data: DocumentData, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, field);
}

function getOutcomesByConcept(feedback: ActivityFeedback[]): Map<string, ConceptOutcome> {
  return feedback.reduce<Map<string, ConceptOutcome>>((outcomes, item) => {
    item.conceptIds.forEach((conceptId) => {
      const current = outcomes.get(conceptId) ?? { correct: 0, incorrect: 0 };
      if (item.isCorrect) current.correct += 1;
      else current.incorrect += 1;
      outcomes.set(conceptId, current);
    });
    return outcomes;
  }, new Map<string, ConceptOutcome>());
}

function getConceptOutcome(outcomes: Map<string, ConceptOutcome>, conceptId: string): ConceptOutcome {
  const outcome = outcomes.get(conceptId);
  if (!outcome) throw new Error('Esta atividade possui resultados de conceito inconsistentes.');
  return outcome;
}

function getErrorCode(error: unknown): string | null {
  return isDocumentData(error) && typeof error.code === 'string' ? error.code : null;
}

function mapActivityAttempt(snapshot: DocumentSnapshot<DocumentData>): ActivityAttempt | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const activityId = data.activityId;
  const lessonId = data.lessonId;
  const courseId = data.courseId;
  const moduleId = data.moduleId;
  const answers = data.answers;
  const correctCount = data.correctCount;
  const totalQuestions = data.totalQuestions;
  if (typeof activityId !== 'string' || typeof lessonId !== 'string' || typeof courseId !== 'string' || typeof moduleId !== 'string' || data.status !== 'submitted' || !isDocumentData(answers) || !Number.isInteger(correctCount) || !Number.isInteger(totalQuestions)) return null;

  const normalizedAnswers: ActivityAnswers = {};
  for (const [questionId, answer] of Object.entries(answers)) {
    if (typeof answer !== 'string' && typeof answer !== 'boolean') return null;
    normalizedAnswers[questionId] = answer;
  }

  return {
    ...data,
    id: snapshot.id,
    activityId,
    lessonId,
    courseId,
    moduleId,
    status: 'submitted',
    answers: normalizedAnswers,
    correctCount,
    totalQuestions,
  };
}

function mapConceptMastery(snapshot: DocumentSnapshot<DocumentData>): ConceptMastery | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const conceptId = data.conceptId;
  const lastLessonId = data.lastLessonId;
  if (typeof conceptId !== 'string' || typeof lastLessonId !== 'string' || typeof data.needsReview !== 'boolean') return null;
  return {
    ...data,
    id: snapshot.id,
    conceptId,
    lastLessonId,
    needsReview: data.needsReview,
    correctAnswers: getCounter(data.correctAnswers),
    incorrectAnswers: getCounter(data.incorrectAnswers),
  };
}

export function getActivity(activityId: string | undefined): Promise<Activity | null> {
  return activityId ? getActivityById(activityId) : Promise.resolve(null);
}

export async function submitActivityAttempt(activity: Activity, answers: unknown): Promise<SubmittedActivityAttempt> {
  const uid = auth?.currentUser?.uid;
  const firestore = requireActivityAccess(uid);
  const result = correctActivityLocally(activity, answers);
  const attemptReference = doc(collection(firestore, 'users', uid, 'activityAttempts'));
  const outcomesByConcept = getOutcomesByConcept(result.feedback);
  const masteryReferences = [...outcomesByConcept.keys()].map((conceptId) => doc(firestore, 'users', uid, 'conceptMastery', conceptId));
  let transactionStage = 'starting';
  let masteryDiagnostics: ConceptMasteryDiagnostic[] = [];

  try {
    await runTransaction(firestore, async (transaction) => {
      transactionStage = 'reading-concept-mastery';
      const masterySnapshots = await Promise.all(masteryReferences.map((reference) => transaction.get(reference)));
      masteryDiagnostics = masterySnapshots.map((snapshot, index) => {
        const previous: DocumentData = snapshot.exists() ? snapshot.data() : {};
        const reference = masteryReferences[index];
        const outcome = getConceptOutcome(outcomesByConcept, reference.id);
        const previousCorrectAnswers = getCounter(previous.correctAnswers);
        const previousIncorrectAnswers = getCounter(previous.incorrectAnswers);
        return {
          conceptId: reference.id,
          operation: snapshot.exists() ? 'update' : 'create',
          hasCreatedAt: hasOwnField(previous, 'createdAt'),
          lastLessonId: activity.lessonId,
          correctAnswers: { previous: previousCorrectAnswers, next: previousCorrectAnswers + outcome.correct },
          incorrectAnswers: { previous: previousIncorrectAnswers, next: previousIncorrectAnswers + outcome.incorrect },
          needsReview: outcome.incorrect > 0,
        };
      });

      transactionStage = 'writing-attempt-and-concept-mastery';
      transaction.set(attemptReference, {
        activityId: activity.id,
        lessonId: activity.lessonId,
        courseId: activity.courseId,
        moduleId: activity.moduleId,
        status: 'submitted',
        answers: result.answers,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      masteryReferences.forEach((reference, index) => {
        const snapshot = masterySnapshots[index];
        const previous: DocumentData = snapshot.exists() ? snapshot.data() : {};
        const outcome = getConceptOutcome(outcomesByConcept, reference.id);
        const payload: DocumentData = {
          conceptId: reference.id,
          correctAnswers: getCounter(previous.correctAnswers) + outcome.correct,
          incorrectAnswers: getCounter(previous.incorrectAnswers) + outcome.incorrect,
          needsReview: outcome.incorrect > 0,
          lastLessonId: activity.lessonId,
          updatedAt: serverTimestamp(),
        };

        if (!snapshot.exists() || !hasOwnField(previous, 'createdAt')) payload.createdAt = serverTimestamp();
        transaction.set(reference, payload, { merge: true });
      });

      transactionStage = 'committing';
    });
  } catch (error: unknown) {
    console.error('[Activity submit] Falha ao registrar a tentativa.', {
      code: getErrorCode(error),
      message: error instanceof Error ? error.message : String(error),
      activityId: activity.id,
      transactionStage,
      attemptPath: attemptReference.path,
      conceptMastery: masteryDiagnostics,
    });
    throw new Error('Não foi possível registrar esta tentativa agora. Tente novamente em alguns instantes.');
  }

  return { id: attemptReference.id, activityId: activity.id, status: 'submitted', ...result };
}

export async function getActivityAttempts(uid: string, activityId: string | undefined): Promise<ActivityAttempt[]> {
  const firestore = requireActivityAccess(uid);
  if (!activityId) return [];
  const snapshot = await getDocs(query(
    collection(firestore, 'users', uid, 'activityAttempts'),
    where('activityId', '==', activityId),
  ));
  return snapshot.docs
    .map(mapActivityAttempt)
    .filter((attempt): attempt is ActivityAttempt => attempt !== null)
    .sort((first, second) => getTimestampMilliseconds(second.submittedAt) - getTimestampMilliseconds(first.submittedAt));
}

export async function getUserActivityAttempts(uid: string): Promise<ActivityAttempt[]> {
  const firestore = requireActivityAccess(uid);
  const snapshot = await getDocs(collection(firestore, 'users', uid, 'activityAttempts'));
  return snapshot.docs
    .map(mapActivityAttempt)
    .filter((attempt): attempt is ActivityAttempt => attempt !== null)
    .sort((first, second) => getTimestampMilliseconds(second.submittedAt) - getTimestampMilliseconds(first.submittedAt));
}

export async function getUserConceptMastery(uid: string): Promise<ConceptMastery[]> {
  const firestore = requireActivityAccess(uid);
  const snapshot = await getDocs(collection(firestore, 'users', uid, 'conceptMastery'));
  return snapshot.docs
    .map(mapConceptMastery)
    .filter((mastery): mastery is ConceptMastery => mastery !== null);
}

export async function getConceptsNeedingReview(uid: string): Promise<ConceptNeedingReview[]> {
  const mastery = await getUserConceptMastery(uid);
  return getConceptsNeedingReviewFromMastery(mastery);
}

export async function getConceptsNeedingReviewFromMastery(mastery: ConceptMastery[] = []): Promise<ConceptNeedingReview[]> {
  const needsReview = mastery.filter((item) => item.needsReview === true);
  const concepts = await getConceptsByIds(needsReview.map((item) => item.conceptId));
  const masteryByConcept = new Map(needsReview.map((item) => [item.conceptId, item]));
  return concepts.flatMap((concept) => {
    const conceptMastery = masteryByConcept.get(concept.id);
    return conceptMastery ? [{ ...concept, mastery: conceptMastery }] : [];
  });
}
