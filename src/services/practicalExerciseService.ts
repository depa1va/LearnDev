import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
} from 'firebase/firestore';
import { auth } from '../lib/firebase/auth';
import { db } from '../lib/firebase/firestore';
import type {
  PracticalAttempt,
  PracticalExercise,
  PracticalExerciseResponse,
  PracticalExerciseResult,
  PracticalExerciseViewData,
  PracticeResultStatus,
  SubmittedPracticalAttempt,
} from '../types/education';
import { getTimestampMilliseconds } from '../utils/date';
import { getConceptsByIds, getPracticalExerciseById } from './educationService';
import { evaluatePracticalExercise } from './practicalExerciseValidation';

function requirePracticeAccess(uid: string | undefined): Firestore {
  if (!db) throw new Error('A configuração do Firebase ainda não está disponível.');
  if (!uid || auth?.currentUser?.uid !== uid) throw new Error('Sua sessão não permite acessar estas práticas.');
  return db;
}

function isDocumentData(value: unknown): value is DocumentData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPracticeResultStatus(value: unknown): value is PracticeResultStatus {
  return value === 'correct' || value === 'partially_correct' || value === 'needs_revision';
}

function mapPracticalResponse(value: unknown): PracticalExerciseResponse | null {
  if (!isDocumentData(value) || typeof value.kind !== 'string') return null;
  if (value.kind === 'text' && typeof value.text === 'string') return { kind: 'text', text: value.text };
  if (value.kind === 'ordered_steps' && Array.isArray(value.orderedStepIds) && value.orderedStepIds.every((stepId) => typeof stepId === 'string')) {
    return { kind: 'ordered_steps', orderedStepIds: [...value.orderedStepIds] };
  }
  return null;
}

function mapPracticalAttempt(snapshot: DocumentSnapshot<DocumentData>): PracticalAttempt | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const exerciseId = data.exerciseId;
  const lessonId = data.lessonId;
  const courseId = data.courseId;
  const moduleId = data.moduleId;
  const type = data.type;
  const response = mapPracticalResponse(data.response);
  const resultStatus = data.resultStatus;
  const feedback = data.feedback;
  const hint = data.hint;
  const conceptIds = data.conceptIds;
  const validType = type === 'complete_code' || type === 'order_steps' || type === 'write_code';
  if (typeof exerciseId !== 'string' || typeof lessonId !== 'string' || typeof courseId !== 'string' || typeof moduleId !== 'string' || !validType || !response || !isPracticeResultStatus(resultStatus) || typeof feedback !== 'string' || typeof hint !== 'string' || !Array.isArray(conceptIds) || !conceptIds.every((conceptId) => typeof conceptId === 'string')) return null;

  return {
    ...data,
    id: snapshot.id,
    exerciseId,
    lessonId,
    courseId,
    moduleId,
    type,
    response,
    resultStatus,
    feedback,
    hint,
    conceptIds: [...conceptIds],
  };
}

function getErrorCode(error: unknown): string | null {
  return isDocumentData(error) && typeof error.code === 'string' ? error.code : null;
}

export function getPracticalExercise(exerciseId: string | undefined): Promise<PracticalExercise | null> {
  return exerciseId ? getPracticalExerciseById(exerciseId) : Promise.resolve(null);
}

export async function getPracticalExerciseViewData(exerciseId: string | undefined): Promise<PracticalExerciseViewData | null> {
  const exercise = await getPracticalExercise(exerciseId);
  if (!exercise) return null;

  const concepts = await getConceptsByIds(exercise.conceptIds);
  return { exercise, concepts };
}

export async function submitPracticalAttempt(exercise: PracticalExercise, response: unknown): Promise<SubmittedPracticalAttempt> {
  const uid = auth?.currentUser?.uid;
  const firestore = requirePracticeAccess(uid);
  const evaluation: PracticalExerciseResult = evaluatePracticalExercise(exercise, response);
  const attemptReference = doc(collection(firestore, 'users', uid, 'practicalAttempts'));
  const payload: DocumentData = {
    exerciseId: exercise.id,
    lessonId: exercise.lessonId,
    courseId: exercise.courseId,
    moduleId: exercise.moduleId,
    type: exercise.type,
    response: evaluation.response,
    resultStatus: evaluation.status,
    feedback: evaluation.message,
    hint: evaluation.hint,
    conceptIds: exercise.conceptIds,
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(attemptReference, payload);
  } catch (error: unknown) {
    console.error('[Practical exercise] Falha ao registrar tentativa.', {
      code: getErrorCode(error),
      message: error instanceof Error ? error.message : String(error),
      exerciseId: exercise.id,
      attemptPath: attemptReference.path,
    });
    throw new Error('Não foi possível registrar esta prática agora. Tente novamente em alguns instantes.');
  }

  return {
    id: attemptReference.id,
    exerciseId: exercise.id,
    lessonId: exercise.lessonId,
    courseId: exercise.courseId,
    moduleId: exercise.moduleId,
    type: exercise.type,
    conceptIds: exercise.conceptIds,
    ...evaluation,
  };
}

export async function getPracticalAttempts(uid: string, exerciseId: string | undefined): Promise<PracticalAttempt[]> {
  const firestore = requirePracticeAccess(uid);
  if (!exerciseId) return [];
  const snapshot = await getDocs(query(
    collection(firestore, 'users', uid, 'practicalAttempts'),
    where('exerciseId', '==', exerciseId),
  ));

  return snapshot.docs
    .map(mapPracticalAttempt)
    .filter((attempt): attempt is PracticalAttempt => attempt !== null)
    .sort((first, second) => getTimestampMilliseconds(second.submittedAt) - getTimestampMilliseconds(first.submittedAt));
}

export async function getUserPracticalAttempts(uid: string): Promise<PracticalAttempt[]> {
  const firestore = requirePracticeAccess(uid);
  const snapshot = await getDocs(collection(firestore, 'users', uid, 'practicalAttempts'));
  return snapshot.docs
    .map(mapPracticalAttempt)
    .filter((attempt): attempt is PracticalAttempt => attempt !== null)
    .sort((first, second) => getTimestampMilliseconds(second.submittedAt) - getTimestampMilliseconds(first.submittedAt));
}
