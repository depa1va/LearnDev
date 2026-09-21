import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
  Timestamp,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type FieldValue,
  type Firestore,
} from 'firebase/firestore';
import { auth } from '../lib/firebase/auth';
import { db } from '../lib/firebase/firestore';
import { getTimestampMilliseconds } from '../utils/date';
import {
  getInteractiveStepCount,
  normalizeInteractiveLessonProgress,
  validateInteractiveStepProgress,
} from '../utils/interactiveProgress';
import type {
  ActivityAttempt,
  CatalogLesson,
  ConceptMastery,
  Course,
  CourseProgress,
  CourseProgressOverview,
  InteractiveStepProgress,
  LastAccessedLesson,
  LearningSummary,
  Lesson,
  LessonActivity,
  LessonProgress,
  LessonProgressState,
  RecentStudyActivity,
  StoredInteractiveLessonProgress,
} from '../types/education';

export { normalizeInteractiveLessonProgress, validateInteractiveStepProgress } from '../utils/interactiveProgress';

interface LessonProgressFields {
  lessonId: string;
  courseId: string;
  moduleId: string;
}

interface LessonProgressWritePayload extends LessonProgressFields {
  status: LessonProgress['status'];
  currentStep?: number;
  completedSteps?: number;
  startedAt?: FieldValue;
  completedAt?: FieldValue | Timestamp;
  lastAccessedAt: FieldValue;
  updatedAt: FieldValue;
}

interface ProgressLessonReference {
  id: string;
}

interface RecentStudyActivityOptions {
  progressItems?: LessonProgress[];
  lessons?: Lesson[];
  activityAttempts?: ActivityAttempt[];
  activities?: LessonActivity[];
}

function requireProgressAccess(uid: string): Firestore {
  if (!db) throw new Error('A configuração do Firebase ainda não está disponível.');
  if (!uid || auth?.currentUser?.uid !== uid) throw new Error('Sua sessão não permite acessar este progresso.');
  return db;
}

function isDocumentData(value: unknown): value is DocumentData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(data: DocumentData, key: string): string | null {
  const value: unknown = data[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function readProgressStatus(data: DocumentData): LessonProgress['status'] | null {
  return data.status === 'completed' || data.status === 'in_progress' ? data.status : null;
}

function readNonNegativeInteger(data: DocumentData, key: string): number | undefined {
  const value: unknown = data[key];
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : undefined;
}

function readTimestamp(data: DocumentData, key: string): Timestamp | undefined {
  const value: unknown = data[key];
  return value instanceof Timestamp ? value : undefined;
}

function toStoredInteractiveProgress(data: DocumentData): StoredInteractiveLessonProgress {
  const status = readProgressStatus(data);
  const currentStep = readNonNegativeInteger(data, 'currentStep');
  const completedSteps = readNonNegativeInteger(data, 'completedSteps');
  return {
    ...(status === null ? {} : { status }),
    ...(currentStep === undefined ? {} : { currentStep }),
    ...(completedSteps === undefined ? {} : { completedSteps }),
  };
}

function toProgressDocument(snapshot: DocumentSnapshot<DocumentData>): LessonProgress | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const lessonId = readString(data, 'lessonId');
  const courseId = readString(data, 'courseId');
  const moduleId = readString(data, 'moduleId');
  const status = readProgressStatus(data);
  if (!lessonId || !courseId || !moduleId || !status) return null;

  const currentStep = readNonNegativeInteger(data, 'currentStep');
  const completedSteps = readNonNegativeInteger(data, 'completedSteps');
  const startedAt = readTimestamp(data, 'startedAt');
  const completedAt = readTimestamp(data, 'completedAt');
  const lastAccessedAt = readTimestamp(data, 'lastAccessedAt');
  const updatedAt = readTimestamp(data, 'updatedAt');
  const createdAt = readTimestamp(data, 'createdAt');
  return {
    ...data,
    id: snapshot.id,
    lessonId,
    courseId,
    moduleId,
    status,
    ...(currentStep === undefined ? {} : { currentStep }),
    ...(completedSteps === undefined ? {} : { completedSteps }),
    ...(startedAt === undefined ? {} : { startedAt }),
    ...(completedAt === undefined ? {} : { completedAt }),
    ...(lastAccessedAt === undefined ? {} : { lastAccessedAt }),
    ...(updatedAt === undefined ? {} : { updatedAt }),
    ...(createdAt === undefined ? {} : { createdAt }),
  };
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

function getProgressReference(firestore: Firestore, uid: string, lessonId: string): DocumentReference<DocumentData> {
  return doc(firestore, 'users', uid, 'lessonProgress', lessonId);
}

function getLessonProgressFields(lesson: Lesson): LessonProgressFields {
  if (!lesson.id || !lesson.courseId || !lesson.moduleId) {
    throw new Error('Não foi possível identificar os dados desta aula para registrar o progresso.');
  }

  return { lessonId: lesson.id, courseId: lesson.courseId, moduleId: lesson.moduleId };
}

function getInteractiveProgressDefaults(lesson: Lesson): Partial<InteractiveStepProgress> {
  return lesson.steps && lesson.steps.length > 0 ? { currentStep: 0, completedSteps: 0 } : {};
}

function getStoredStepProgress(snapshot: DocumentSnapshot<DocumentData>, lesson: Lesson) {
  return normalizeInteractiveLessonProgress(snapshot.exists() ? toStoredInteractiveProgress(snapshot.data()) : {}, lesson);
}

export async function getLessonProgress(uid: string, lessonId: string): Promise<LessonProgress | null> {
  const firestore = requireProgressAccess(uid);
  const snapshot = await getDoc(getProgressReference(firestore, uid, lessonId));
  return toProgressDocument(snapshot);
}

export async function getUserLessonProgress(uid: string): Promise<LessonProgress[]> {
  const firestore = requireProgressAccess(uid);
  const snapshot = await getDocs(collection(firestore, 'users', uid, 'lessonProgress'));
  return snapshot.docs.map(toProgressDocument).filter(isDefined);
}

export async function getCourseLessonProgress(uid: string, courseId: string): Promise<LessonProgress[]> {
  const firestore = requireProgressAccess(uid);
  const snapshot = await getDocs(query(
    collection(firestore, 'users', uid, 'lessonProgress'),
    where('courseId', '==', courseId),
  ));
  return snapshot.docs.map(toProgressDocument).filter(isDefined);
}

export async function markLessonStarted(uid: string, lesson: Lesson): Promise<LessonProgressState> {
  const firestore = requireProgressAccess(uid);
  const fields = getLessonProgressFields(lesson);
  const reference = getProgressReference(firestore, uid, fields.lessonId);

  return runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(reference);
    const interactiveDefaults = getInteractiveProgressDefaults(lesson);

    if (!snapshot.exists()) {
      transaction.set(reference, {
        ...fields,
        ...interactiveDefaults,
        status: 'in_progress',
        startedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { status: 'in_progress', ...interactiveDefaults };
    }

    const existingStatus = readProgressStatus(snapshot.data()) === 'completed' ? 'completed' : 'in_progress';
    transaction.update(reference, {
      // courseId e moduleId são metadados derivados da aula publicada. Incluí-los
      // aqui mantém documentos de progresso legados alinhados após uma reorganização
      // curricular, sem alterar lessonId, status ou datas de conclusão.
      ...fields,
      lastAccessedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { status: existingStatus, ...getStoredStepProgress(snapshot, lesson) };
  });
}

export async function markInteractiveLessonStep(
  uid: string,
  lesson: Lesson,
  { currentStep, completedSteps }: InteractiveStepProgress,
): Promise<LessonProgressState> {
  const firestore = requireProgressAccess(uid);
  const fields = getLessonProgressFields(lesson);
  const stepCount = getInteractiveStepCount(lesson);
  validateInteractiveStepProgress(lesson, { currentStep, completedSteps });
  const reference = getProgressReference(firestore, uid, fields.lessonId);

  return runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (snapshot.exists() && readProgressStatus(snapshot.data()) === 'completed') {
      return { status: 'completed', ...getStoredStepProgress(snapshot, lesson) };
    }

    const isCompleted = completedSteps >= stepCount;
    const payload: DocumentData & LessonProgressWritePayload = {
      ...fields,
      status: isCompleted ? 'completed' : 'in_progress',
      currentStep,
      completedSteps,
      lastAccessedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (!snapshot.exists()) {
      payload.startedAt = serverTimestamp();
      if (isCompleted) payload.completedAt = serverTimestamp();
      transaction.set(reference, payload);
      return { status: payload.status, currentStep, completedSteps };
    }

    const previous = snapshot.data();
    const previousSteps = getStoredStepProgress(snapshot, lesson);
    validateInteractiveStepProgress(lesson, { currentStep, completedSteps }, previousSteps);
    if (isCompleted) payload.completedAt = readTimestamp(previous, 'completedAt') ?? serverTimestamp();
    transaction.update(reference, payload);
    return { status: payload.status, currentStep, completedSteps };
  });
}

export function calculateCourseProgress(
  lessons: ProgressLessonReference[] = [],
  progressItems: LessonProgress[] = [],
): CourseProgress {
  const publishedLessonIds = new Set(lessons.map((lesson) => lesson.id));
  const progressByLessonId = new Map(
    progressItems
      .filter((item) => publishedLessonIds.has(item.lessonId))
      .map((item) => [item.lessonId, item]),
  );
  const completedLessons = [...progressByLessonId.values()].filter((item) => item.status === 'completed').length;
  const totalLessons = lessons.length;
  return {
    totalLessons,
    completedLessons,
    startedLessons: progressByLessonId.size,
    percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : null,
    isCompleted: totalLessons > 0 && completedLessons === totalLessons,
    progressByLessonId,
  };
}

export async function getCourseProgress(
  uid: string,
  courseId: string,
  lessons: CatalogLesson[],
): Promise<CourseProgress> {
  const progressItems = await getCourseLessonProgress(uid, courseId);
  return calculateCourseProgress(lessons, progressItems);
}

export function getLastAccessedLesson<TLesson extends ProgressLessonReference>(
  progressItems: LessonProgress[] = [],
  lessons: TLesson[] = [],
): LastAccessedLesson<TLesson> | null {
  const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const lastProgress = progressItems
    .filter((item) => item.lastAccessedAt && lessonsById.has(item.lessonId))
    .sort((first, second) => getTimestampMilliseconds(second.lastAccessedAt) - getTimestampMilliseconds(first.lastAccessedAt))[0];
  if (!lastProgress) return null;

  const lesson = lessonsById.get(lastProgress.lessonId);
  return lesson ? { lesson, progress: lastProgress } : null;
}

export function getCourseProgressOverview(
  courses: Course[] = [],
  lessons: Lesson[] = [],
  progressItems: LessonProgress[] = [],
): CourseProgressOverview[] {
  return courses.map((course) => {
    const courseLessons = lessons.filter((lesson) => lesson.courseId === course.id);
    const courseProgressItems = progressItems.filter((item) => item.courseId === course.id);
    const progress = calculateCourseProgress(courseLessons, courseProgressItems);
    return { ...course, progress, lastAccessed: getLastAccessedLesson(courseProgressItems, courseLessons) };
  });
}

export function getCoursesInProgress(
  courses: Course[] = [],
  lessons: Lesson[] = [],
  progressItems: LessonProgress[] = [],
): CourseProgressOverview[] {
  return getCourseProgressOverview(courses, lessons, progressItems)
    .filter((course) => course.progress.startedLessons > 0 && !course.progress.isCompleted);
}

export function getLearningSummary(
  lessons: Lesson[] = [],
  progressItems: LessonProgress[] = [],
  activityAttempts: ActivityAttempt[] = [],
  conceptMastery: ConceptMastery[] = [],
): LearningSummary {
  const publishedLessonIds = new Set(lessons.map((lesson) => lesson.id));
  const completedLessons = progressItems.filter(
    (item) => item.status === 'completed' && publishedLessonIds.has(item.lessonId),
  ).length;
  return {
    completedLessons,
    totalLessons: lessons.length,
    activitiesPerformed: activityAttempts.length,
    conceptsNeedingReview: conceptMastery.filter((item) => item.needsReview === true).length,
  };
}

export function getStudyStartDate(
  progressItems: LessonProgress[] = [],
  lessons: Lesson[] = [],
): Timestamp | null {
  const publishedLessonIds = new Set(lessons.map((lesson) => lesson.id));
  const startDates = progressItems
    .filter((item) => publishedLessonIds.has(item.lessonId) && item.startedAt)
    .map((item) => item.startedAt)
    .filter((timestamp): timestamp is Timestamp => timestamp !== undefined)
    .sort((first, second) => getTimestampMilliseconds(first) - getTimestampMilliseconds(second));
  return startDates[0] ?? null;
}

export function getRecentStudyActivity({
  progressItems = [],
  lessons = [],
  activityAttempts = [],
  activities = [],
}: RecentStudyActivityOptions = {}): RecentStudyActivity[] {
  const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const activitiesById = new Map(activities.map((activity) => [activity.id, activity]));
  const history: RecentStudyActivity[] = [];

  progressItems.forEach((item) => {
    const lesson = lessonsById.get(item.lessonId);
    const lastAccessedAt = item.lastAccessedAt;
    if (!lesson || !lastAccessedAt) return;

    const completedAt = item.completedAt;
    const accessedAt = getTimestampMilliseconds(lastAccessedAt);
    const completedAtMilliseconds = completedAt ? getTimestampMilliseconds(completedAt) : 0;
    if (completedAt && completedAtMilliseconds === accessedAt) {
      history.push({
        id: `lesson-completed-${item.id ?? item.lessonId}-${completedAtMilliseconds}`,
        type: 'lesson_completed',
        lesson,
        timestamp: completedAt,
      });
      return;
    }

    history.push({
      id: `lesson-accessed-${item.id ?? item.lessonId}-${accessedAt}`,
      type: 'lesson_accessed',
      lesson,
      timestamp: lastAccessedAt,
    });

    if (completedAt) {
      history.push({
        id: `lesson-completed-${item.id ?? item.lessonId}-${completedAtMilliseconds}`,
        type: 'lesson_completed',
        lesson,
        timestamp: completedAt,
      });
    }
  });

  activityAttempts.forEach((attempt) => {
    if (!attempt.submittedAt) return;
    history.push({
      id: `activity-${attempt.id}-${getTimestampMilliseconds(attempt.submittedAt)}`,
      type: 'activity_submitted',
      activity: activitiesById.get(attempt.activityId) ?? null,
      lesson: lessonsById.get(attempt.lessonId) ?? null,
      attempt,
      timestamp: attempt.submittedAt,
    });
  });

  return history.sort((first, second) => getTimestampMilliseconds(second.timestamp) - getTimestampMilliseconds(first.timestamp));
}
