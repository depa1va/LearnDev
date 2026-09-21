import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import type {
  Activity,
  ActivityQuestion,
  ActivityQuestionDifficulty,
  ActivityQuestionOption,
  CatalogLesson,
  CatalogOverview,
  Concept,
  Course,
  CourseCatalog,
  CourseCatalogModule,
  CourseModule,
  CourseStructure,
  CourseModuleWithLessons,
  InteractiveLessonStep,
  InteractiveOption,
  Lesson,
  LessonActivity,
  LessonContentData,
  LessonSection,
  LessonViewData,
  LessonVideo,
  PracticalExercise,
  PracticalExerciseFeedback,
  PracticalExerciseStep,
  PracticalWriteCodeCheck,
  PublicCourseCatalog,
  PublicationStatus,
  Track,
  TrackCatalog,
  TrackWithCourseCount,
  WriteCodeCheck,
} from '../types/education';

const CONCEPT_QUERY_LIMIT = 30;

type DocumentMapper<T> = (snapshot: DocumentSnapshot<DocumentData>) => T | null;

export interface CatalogOverviewOptions {
  includeLessons?: boolean;
  includeActivities?: boolean;
  includePracticalExercises?: boolean;
}

export interface FullCatalogOverview extends CatalogOverview {
  lessons: Lesson[];
  activities: Activity[];
  practicalExercises: PracticalExercise[];
}

function requireFirestore(): Firestore {
  if (!db) throw new Error('A configuração do Firebase ainda não está disponível.');
  return db;
}

function isDocumentData(value: unknown): value is DocumentData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(data: DocumentData, key: string): string | null {
  const value: unknown = data[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function readOptionalString(data: DocumentData, key: string): string | undefined {
  const value: unknown = data[key];
  return typeof value === 'string' ? value : undefined;
}

function readOptionalNumber(data: DocumentData, key: string): number | undefined {
  const value: unknown = data[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function readActivityQuestionDifficulty(data: DocumentData, key: string): ActivityQuestionDifficulty | undefined {
  const value: unknown = data[key];
  return value === 'basic' || value === 'intermediate' || value === 'application' ? value : undefined;
}

function readStringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? [...value] : null;
}

function readOptionalStringArray(data: DocumentData, key: string): string[] | undefined {
  const value: unknown = data[key];
  if (value === undefined) return undefined;
  return readStringArray(value) ?? undefined;
}

function readPublicationStatus(data: DocumentData): PublicationStatus | null {
  const status: unknown = data.status;
  return status === 'published' || status === 'draft' ? status : null;
}

function readPublishedStatus(data: DocumentData): 'published' | null {
  return data.status === 'published' ? 'published' : null;
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

function sortByOrder<T extends { id: string; order?: number }>(items: T[]): T[] {
  return [...items].sort((first, second) => {
    const orderDifference = (first.order ?? 0) - (second.order ?? 0);
    return orderDifference || first.id.localeCompare(second.id);
  });
}

function splitIntoChunks<T>(items: T[], size: number): T[][] {
  return Array.from(
    { length: Math.ceil(items.length / size) },
    (_, index) => items.slice(index * size, index * size + size),
  );
}

function mapTrackDocument(snapshot: DocumentSnapshot<DocumentData>): Track | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const slug = readString(data, 'slug');
  const title = readString(data, 'title');
  const status = readPublicationStatus(data);
  if (!slug || !title || !status) return null;

  const description = readOptionalString(data, 'description');
  const order = readOptionalNumber(data, 'order');
  return { ...data, id: snapshot.id, slug, title, status, ...(description === undefined ? {} : { description }), ...(order === undefined ? {} : { order }) };
}

function mapCourseDocument(snapshot: DocumentSnapshot<DocumentData>): Course | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const trackId = readString(data, 'trackId');
  const slug = readString(data, 'slug');
  const title = readString(data, 'title');
  const status = readPublicationStatus(data);
  if (!trackId || !slug || !title || !status) return null;

  const description = readOptionalString(data, 'description');
  const order = readOptionalNumber(data, 'order');
  const estimatedMinutes = readOptionalNumber(data, 'estimatedMinutes');
  return {
    ...data,
    id: snapshot.id,
    trackId,
    slug,
    title,
    status,
    ...(description === undefined ? {} : { description }),
    ...(order === undefined ? {} : { order }),
    ...(estimatedMinutes === undefined ? {} : { estimatedMinutes }),
  };
}

function mapModuleDocument(snapshot: DocumentSnapshot<DocumentData>): CourseModule | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const courseId = readString(data, 'courseId');
  const title = readString(data, 'title');
  const status = readPublicationStatus(data);
  if (!courseId || !title || !status) return null;

  const description = readOptionalString(data, 'description');
  const order = readOptionalNumber(data, 'order');
  return { ...data, id: snapshot.id, courseId, title, status, ...(description === undefined ? {} : { description }), ...(order === undefined ? {} : { order }) };
}

function mapCatalogLesson(value: unknown): CatalogLesson | null {
  if (!isDocumentData(value)) return null;
  const id = readString(value, 'id');
  const title = readString(value, 'title');
  if (!id || !title) return null;

  const description = readOptionalString(value, 'description');
  const order = readOptionalNumber(value, 'order');
  const estimatedMinutes = readOptionalNumber(value, 'estimatedMinutes');
  return {
    ...value,
    id,
    title,
    ...(description === undefined ? {} : { description }),
    ...(order === undefined ? {} : { order }),
    ...(estimatedMinutes === undefined ? {} : { estimatedMinutes }),
  };
}

function mapCourseCatalogModule(value: unknown): CourseCatalogModule | null {
  if (!isDocumentData(value)) return null;
  const id = readString(value, 'id');
  const title = readString(value, 'title');
  const rawLessons: unknown = value.lessons;
  if (!id || !title || !Array.isArray(rawLessons)) return null;

  const lessons = rawLessons.map(mapCatalogLesson);
  if (!lessons.every(isDefined)) return null;

  const description = readOptionalString(value, 'description');
  const order = readOptionalNumber(value, 'order');
  return {
    ...value,
    id,
    title,
    lessons,
    ...(description === undefined ? {} : { description }),
    ...(order === undefined ? {} : { order }),
  };
}

function mapLessonContent(value: unknown): LessonContentData | undefined {
  if (!isDocumentData(value)) return undefined;
  const introduction = readOptionalString(value, 'introduction');
  const explanation = readOptionalString(value, 'explanation');
  const rawExamples: unknown = value.examples;
  const examples = Array.isArray(rawExamples)
    ? rawExamples.map((example) => {
      if (!isDocumentData(example)) return null;
      const content = readString(example, 'content');
      if (!content) return null;
      const title = readOptionalString(example, 'title');
      return { ...example, content, ...(title === undefined ? {} : { title }) };
    })
    : undefined;

  if (examples && !examples.every(isDefined)) return undefined;
  if (introduction === undefined && explanation === undefined && examples === undefined) return undefined;
  return {
    ...(introduction === undefined ? {} : { introduction }),
    ...(explanation === undefined ? {} : { explanation }),
    ...(examples === undefined ? {} : { examples }),
  };
}

function mapLessonSection(value: unknown): LessonSection | null {
  if (!isDocumentData(value)) return null;
  const id = readString(value, 'id');
  const title = readString(value, 'title');
  const type: unknown = value.type;
  if (!id || !title || typeof type !== 'string') return null;

  switch (type) {
    case 'text':
    case 'callout': {
      const content = readString(value, 'content');
      return content ? { ...value, id, title, type, content } : null;
    }
    case 'example': {
      const content = readString(value, 'content');
      const explanation = readString(value, 'explanation');
      const label = readOptionalString(value, 'label');
      return content && explanation ? { ...value, id, title, type, content, explanation, ...(label === undefined ? {} : { label }) } : null;
    }
    case 'reflection': {
      const prompt = readString(value, 'prompt');
      const suggestedAnswer = readString(value, 'suggestedAnswer');
      return prompt && suggestedAnswer ? { ...value, id, title, type, prompt, suggestedAnswer } : null;
    }
    case 'guided-practice': {
      const problem = readString(value, 'problem');
      const steps = readStringArray(value.steps);
      const check = readString(value, 'check');
      return problem && steps && check ? { ...value, id, title, type, problem, steps, check } : null;
    }
    case 'common-mistakes': {
      const rawItems: unknown = value.items;
      if (!Array.isArray(rawItems)) return null;
      const items = rawItems.map((item) => {
        if (!isDocumentData(item)) return null;
        const itemTitle = readString(item, 'title');
        const description = readString(item, 'description');
        return itemTitle && description ? { ...item, title: itemTitle, description } : null;
      });
      return items.every(isDefined) ? { ...value, id, title, type, items } : null;
    }
    case 'summary':
    case 'next-steps': {
      const items = readStringArray(value.items);
      return items ? { ...value, id, title, type, items } : null;
    }
    default:
      return null;
  }
}

function mapInteractiveOption(value: unknown): InteractiveOption | null {
  if (!isDocumentData(value)) return null;
  const id = readString(value, 'id');
  const label = readString(value, 'label');
  const feedback = readString(value, 'feedback');
  const code = readOptionalString(value, 'code');
  return id && label && feedback ? { ...value, id, label, feedback, ...(code === undefined ? {} : { code }) } : null;
}

function mapWriteCodeCheck(value: unknown): WriteCodeCheck | null {
  if (!isDocumentData(value)) return null;
  const id = readString(value, 'id');
  const message = readString(value, 'message');
  const type: unknown = value.type;
  if (!id || !message || typeof type !== 'string') return null;

  const stringOrNumber = (key: string): string | number | null => {
    const field: unknown = value[key];
    return typeof field === 'string' || typeof field === 'number' ? field : null;
  };

  switch (type) {
    case 'contains_if':
      return { ...value, id, message, type };
    case 'compares_variable_to_value': {
      const variable = readString(value, 'variable');
      const operator = readString(value, 'operator');
      const comparisonValue = stringOrNumber('value');
      return variable && operator && comparisonValue !== null ? { ...value, id, message, type, variable, operator, value: comparisonValue } : null;
    }
    case 'logs_message': {
      const messageValue = stringOrNumber('value');
      return messageValue !== null ? { ...value, id, message, type, value: messageValue } : null;
    }
    case 'for_counter_range': {
      const counter = readString(value, 'counter');
      const start = stringOrNumber('start');
      const end = stringOrNumber('end');
      return counter && start !== null && end !== null ? { ...value, id, message, type, counter, start, end } : null;
    }
    case 'logs_variable': {
      const variable = readString(value, 'variable');
      return variable ? { ...value, id, message, type, variable } : null;
    }
    case 'defines_function': {
      const name = readString(value, 'name');
      const parameters = readStringArray(value.parameters);
      return name && parameters ? { ...value, id, message, type, name, parameters } : null;
    }
    case 'returns_multiplication': {
      const variable = readString(value, 'variable');
      const factor = stringOrNumber('factor');
      return variable && factor !== null ? { ...value, id, message, type, variable, factor } : null;
    }
    case 'declares_value': {
      const declaredValue = stringOrNumber('value');
      return declaredValue !== null ? { ...value, id, message, type, value: declaredValue } : null;
    }
    case 'declares_sum': {
      const variable = readString(value, 'variable');
      return variable ? { ...value, id, message, type, variable } : null;
    }
    case 'contains_fragment': {
      const fragment = readString(value, 'fragment');
      return fragment ? { ...value, id, message, type, fragment } : null;
    }
    default:
      return null;
  }
}

function mapInteractiveStep(value: unknown): InteractiveLessonStep | null {
  if (!isDocumentData(value)) return null;
  const id = readString(value, 'id');
  const title = readString(value, 'title');
  const conceptIds = readStringArray(value.conceptIds);
  const type: unknown = value.type;
  if (!id || !title || !conceptIds || typeof type !== 'string') return null;

  const prompt = readString(value, 'prompt');
  const code = readOptionalString(value, 'code');
  const correctFeedback = readString(value, 'correctFeedback');
  const incorrectFeedback = readString(value, 'incorrectFeedback');
  const hint = readString(value, 'hint');

  switch (type) {
    case 'explanation': {
      const content = readString(value, 'content');
      return content ? { ...value, id, title, conceptIds, type, content } : null;
    }
    case 'choose_code':
    case 'predict_output':
    case 'find_error':
    case 'choose_output': {
      const rawOptions: unknown = value.options;
      const correctAnswer = readString(value, 'correctAnswer');
      if (!prompt || !Array.isArray(rawOptions) || !correctAnswer || !correctFeedback || !incorrectFeedback || !hint) return null;
      const options = rawOptions.map(mapInteractiveOption);
      return options.every(isDefined)
        ? { ...value, id, title, conceptIds, type, prompt, options, correctAnswer, correctFeedback, incorrectFeedback, hint, ...(code === undefined ? {} : { code }) }
        : null;
    }
    case 'fill_code':
    case 'complete_line': {
      const acceptedAnswers = readStringArray(value.acceptedAnswers);
      const placeholder = readOptionalString(value, 'placeholder');
      return prompt && acceptedAnswers && correctFeedback && incorrectFeedback && hint
        ? { ...value, id, title, conceptIds, type, prompt, acceptedAnswers, correctFeedback, incorrectFeedback, hint, ...(code === undefined ? {} : { code }), ...(placeholder === undefined ? {} : { placeholder }) }
        : null;
    }
    case 'order_code': {
      const rawItems: unknown = value.items;
      const correctOrder = readStringArray(value.correctOrder);
      if (!prompt || !Array.isArray(rawItems) || !correctOrder || !correctFeedback || !incorrectFeedback || !hint) return null;
      const items = rawItems.map((item) => {
        if (!isDocumentData(item)) return null;
        const itemId = readString(item, 'id');
        const content = readString(item, 'content');
        return itemId && content ? { ...item, id: itemId, content } : null;
      });
      return items.every(isDefined)
        ? { ...value, id, title, conceptIds, type, prompt, items, correctOrder, correctFeedback, incorrectFeedback, hint }
        : null;
    }
    case 'write_code': {
      const rawChecks: unknown = value.requiredChecks;
      const rawFragments: unknown = value.requiredFragments;
      const requiredChecks = Array.isArray(rawChecks) ? rawChecks.map(mapWriteCodeCheck) : undefined;
      const requiredFragments = rawFragments === undefined ? undefined : readStringArray(rawFragments) ?? undefined;
      const placeholder = readOptionalString(value, 'placeholder');
      if (!prompt || !correctFeedback || !incorrectFeedback || !hint || (requiredChecks && !requiredChecks.every(isDefined))) return null;
      return {
        ...value,
        id,
        title,
        conceptIds,
        type,
        prompt,
        correctFeedback,
        incorrectFeedback,
        hint,
        ...(requiredChecks === undefined ? {} : { requiredChecks }),
        ...(requiredFragments === undefined ? {} : { requiredFragments }),
        ...(placeholder === undefined ? {} : { placeholder }),
      };
    }
    default:
      return null;
  }
}

function mapLessonDocument(snapshot: DocumentSnapshot<DocumentData>): Lesson | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const courseId = readString(data, 'courseId');
  const moduleId = readString(data, 'moduleId');
  const slug = readString(data, 'slug');
  const title = readString(data, 'title');
  const status = readPublicationStatus(data);
  const conceptIds = readStringArray(data.conceptIds);
  if (!courseId || !moduleId || !slug || !title || !status || !conceptIds) return null;

  const description = readOptionalString(data, 'description');
  const courseSlug = readOptionalString(data, 'courseSlug');
  const estimatedMinutes = readOptionalNumber(data, 'estimatedMinutes');
  const objectives = readOptionalStringArray(data, 'objectives');
  const content = mapLessonContent(data.content);
  const rawSections: unknown = data.sections;
  const sections = Array.isArray(rawSections) ? rawSections.map(mapLessonSection) : undefined;
  const rawSteps: unknown = data.steps;
  const steps = Array.isArray(rawSteps) ? rawSteps.map(mapInteractiveStep) : undefined;
  const video = mapLessonVideo(data.video);
  const checkpointActivity: unknown = data.checkpointActivity;
  const order = readOptionalNumber(data, 'order') ?? 0;

  if ((sections && !sections.every(isDefined)) || (steps && !steps.every(isDefined))) return null;
  return {
    ...data,
    id: snapshot.id,
    courseId,
    moduleId,
    slug,
    title,
    status,
    order,
    conceptIds,
    ...(description === undefined ? {} : { description }),
    ...(courseSlug === undefined ? {} : { courseSlug }),
    ...(estimatedMinutes === undefined ? {} : { estimatedMinutes }),
    ...(objectives === undefined ? {} : { objectives }),
    ...(content === undefined ? {} : { content }),
    ...(sections === undefined ? {} : { sections }),
    ...(steps === undefined ? {} : { steps }),
    ...(video === undefined ? {} : { video }),
    ...(typeof checkpointActivity === 'boolean' ? { checkpointActivity } : {}),
  };
}

function mapLessonVideo(value: unknown): LessonVideo | undefined {
  if (!isDocumentData(value) || value.provider !== 'youtube') return undefined;
  const videoId = readString(value, 'videoId');
  if (!videoId) return undefined;
  const title = readOptionalString(value, 'title');
  const channelName = readOptionalString(value, 'channelName');
  const language = readOptionalString(value, 'language');
  const educationalRole = readOptionalString(value, 'educationalRole');
  return {
    ...value,
    provider: 'youtube',
    videoId,
    ...(title === undefined ? {} : { title }),
    ...(channelName === undefined ? {} : { channelName }),
    ...(language === undefined ? {} : { language }),
    ...(educationalRole === undefined ? {} : { educationalRole }),
  };
}

function mapConceptDocument(snapshot: DocumentSnapshot<DocumentData>): Concept | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const name = readString(data, 'name');
  const status = readPublicationStatus(data);
  if (!name || !status) return null;
  const description = readOptionalString(data, 'description');
  return { ...data, id: snapshot.id, name, status, ...(description === undefined ? {} : { description }) };
}

function mapActivityQuestionOption(value: unknown): ActivityQuestionOption | null {
  if (!isDocumentData(value)) return null;
  const id = readString(value, 'id');
  const label = readString(value, 'label');
  const feedback = readString(value, 'feedback');
  return id && label && feedback ? { ...value, id, label, feedback } : null;
}

function mapActivityQuestion(value: unknown): ActivityQuestion | null {
  if (!isDocumentData(value)) return null;
  const id = readString(value, 'id');
  const prompt = readString(value, 'prompt');
  const conceptIds = readStringArray(value.conceptIds);
  const correctFeedback = readString(value, 'correctFeedback');
  const incorrectFeedback = readString(value, 'incorrectFeedback');
  const hint = readString(value, 'hint');
  const difficulty = readActivityQuestionDifficulty(value, 'difficulty');
  const type: unknown = value.type;
  if (!id || !prompt || !conceptIds || !correctFeedback || !incorrectFeedback || !hint) return null;

  if (type === 'multiple-choice') {
    const rawOptions: unknown = value.options;
    const correctAnswer = readString(value, 'correctAnswer');
    if (!Array.isArray(rawOptions) || !correctAnswer) return null;
    const options = rawOptions.map(mapActivityQuestionOption);
    if (!options.every(isDefined) || !options.some((option) => option.id === correctAnswer)) return null;
    return {
      ...value,
      id,
      prompt,
      conceptIds,
      type,
      options,
      correctAnswer,
      correctFeedback,
      incorrectFeedback,
      hint,
      ...(difficulty === undefined ? {} : { difficulty }),
    };
  }

  if (type === 'true-false' && typeof value.correctAnswer === 'boolean') {
    return {
      ...value,
      id,
      prompt,
      conceptIds,
      type,
      correctAnswer: value.correctAnswer,
      correctFeedback,
      incorrectFeedback,
      hint,
      ...(difficulty === undefined ? {} : { difficulty }),
    };
  }

  return null;
}

function mapActivityDocument(snapshot: DocumentSnapshot<DocumentData>): Activity | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const lessonId = readString(data, 'lessonId');
  const courseId = readString(data, 'courseId');
  const moduleId = readString(data, 'moduleId');
  const slug = readString(data, 'slug');
  const title = readString(data, 'title');
  const type = readString(data, 'type');
  const status = readPublicationStatus(data);
  const conceptIds = readStringArray(data.conceptIds);
  const instructions = readString(data, 'instructions');
  const rawQuestions: unknown = data.questions;
  if (!lessonId || !courseId || !moduleId || !slug || !title || type !== 'multiple-choice' || !status || !conceptIds || !instructions || !Array.isArray(rawQuestions)) return null;
  const questions = rawQuestions.map(mapActivityQuestion);
  if (questions.length === 0 || !questions.every(isDefined)) return null;
  const description = readOptionalString(data, 'description');
  const order = readOptionalNumber(data, 'order') ?? 0;
  return {
    ...data,
    id: snapshot.id,
    lessonId,
    courseId,
    moduleId,
    slug,
    title,
    type,
    status,
    conceptIds,
    instructions,
    questions,
    order,
    ...(description === undefined ? {} : { description }),
  };
}

function mapPracticalExerciseFeedback(value: unknown): PracticalExerciseFeedback | null {
  if (!isDocumentData(value)) return null;
  const correct = readString(value, 'correct');
  const partiallyCorrect = readString(value, 'partiallyCorrect');
  const needsRevision = readString(value, 'needsRevision');
  const hint = readString(value, 'hint');
  const explanation = readString(value, 'explanation');
  return correct && partiallyCorrect && needsRevision && hint && explanation
    ? { ...value, correct, partiallyCorrect, needsRevision, hint, explanation }
    : null;
}

function mapPracticalExerciseStep(value: unknown): PracticalExerciseStep | null {
  if (!isDocumentData(value)) return null;
  const id = readString(value, 'id');
  const content = readString(value, 'content');
  return id && content ? { ...value, id, content } : null;
}

function mapPracticalWriteCodeCheck(value: unknown): PracticalWriteCodeCheck | null {
  if (!isDocumentData(value)) return null;
  const id = readString(value, 'id');
  const message = readString(value, 'message');
  const type: unknown = value.type;
  if (!id || !message) return null;

  if (type === 'minimum_input_operations') {
    const minimum = readOptionalNumber(value, 'minimum');
    return minimum === undefined ? null : { ...value, id, message, type, minimum };
  }

  if (type === 'contains_assignment' || type === 'contains_addition' || type === 'contains_conditional' || type === 'contains_else' || type === 'contains_output_operation') {
    return { ...value, id, message, type };
  }

  if (type === 'contains_division_by') {
    const divisor: unknown = value.value;
    return typeof divisor === 'string' || typeof divisor === 'number'
      ? { ...value, id, message, type, value: divisor }
      : null;
  }

  if (type === 'contains_text') {
    const text = readString(value, 'value');
    return text ? { ...value, id, message, type, value: text } : null;
  }

  return null;
}

function mapPracticalExerciseDocument(snapshot: DocumentSnapshot<DocumentData>): PracticalExercise | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const lessonId = readString(data, 'lessonId');
  const courseId = readString(data, 'courseId');
  const moduleId = readString(data, 'moduleId');
  const slug = readString(data, 'slug');
  const title = readString(data, 'title');
  const type = readString(data, 'type');
  const status = readPublicationStatus(data);
  const conceptIds = readStringArray(data.conceptIds);
  const instructions = readString(data, 'instructions');
  const possibleSolution = readString(data, 'possibleSolution');
  const feedback = mapPracticalExerciseFeedback(data.feedback);
  const validation = isDocumentData(data.validation) ? data.validation : null;
  if (!lessonId || !courseId || !moduleId || !slug || !title || !status || !conceptIds || !instructions || !possibleSolution || !feedback || !validation) return null;
  const description = readOptionalString(data, 'description');
  const order = readOptionalNumber(data, 'order') ?? 0;
  const difficulty = readActivityQuestionDifficulty(data, 'difficulty');
  const starterCode = readOptionalString(data, 'starterCode');
  const base = {
    ...data,
    id: snapshot.id,
    lessonId,
    courseId,
    moduleId,
    slug,
    title,
    status,
    conceptIds,
    instructions,
    possibleSolution,
    feedback,
    order,
    ...(description === undefined ? {} : { description }),
    ...(difficulty === undefined ? {} : { difficulty }),
    ...(starterCode === undefined ? {} : { starterCode }),
  };

  if (type === 'complete_code') {
    const acceptedAnswers = readStringArray(validation.acceptedAnswers);
    return acceptedAnswers && acceptedAnswers.length > 0
      ? { ...base, type, validation: { acceptedAnswers } }
      : null;
  }

  if (type === 'order_steps') {
    const rawSteps: unknown = data.steps;
    const correctOrder = readStringArray(validation.correctOrder);
    if (!Array.isArray(rawSteps) || !correctOrder) return null;
    const steps = rawSteps.map(mapPracticalExerciseStep);
    return steps.length > 0 && steps.every(isDefined)
      ? { ...base, type, steps, validation: { correctOrder } }
      : null;
  }

  if (type === 'write_code') {
    const rawChecks: unknown = validation.requiredChecks;
    if (!Array.isArray(rawChecks)) return null;
    const requiredChecks = rawChecks.map(mapPracticalWriteCodeCheck);
    return requiredChecks.length > 0 && requiredChecks.every(isDefined)
      ? { ...base, type, validation: { requiredChecks } }
      : null;
  }

  return null;
}

function mapCourseCatalogDocument(snapshot: DocumentSnapshot<DocumentData>): CourseCatalog | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const courseId = readString(data, 'courseId');
  const courseSlug = readString(data, 'courseSlug');
  const trackId = readString(data, 'trackId');
  const status = readPublishedStatus(data);
  const rawModules: unknown = data.modules;
  if (!courseId || !courseSlug || !trackId || !status || !Array.isArray(rawModules)) return null;

  const modules = rawModules.map(mapCourseCatalogModule);
  if (!modules.every(isDefined)) return null;
  const lessons = modules.flatMap((module) => module.lessons);
  return {
    ...data,
    id: snapshot.id,
    courseId,
    courseSlug,
    trackId,
    status,
    modules,
    moduleCount: modules.length,
    lessonCount: lessons.length,
  };
}

async function getPublishedCollection<T extends { id: string; order?: number }>(
  collectionName: string,
  mapper: DocumentMapper<T>,
  filters: QueryConstraint[] = [],
): Promise<T[]> {
  const firestore = requireFirestore();
  const constraints = [where('status', '==', 'published'), ...filters];
  const snapshot = await getDocs(query(collection(firestore, collectionName), ...constraints));
  return sortByOrder(snapshot.docs.map(mapper).filter(isDefined));
}

async function getPublishedDocument<T>(
  collectionName: string,
  id: string,
  mapper: DocumentMapper<T>,
): Promise<T | null> {
  const firestore = requireFirestore();
  const snapshot = await getDoc(doc(firestore, collectionName, id));
  return snapshot.exists() && readPublishedStatus(snapshot.data()) ? mapper(snapshot) : null;
}

function addCourseCounts(tracks: Track[], courses: Course[]): TrackWithCourseCount[] {
  const courseCountByTrack = new Map<string, number>();
  courses.forEach((course) => courseCountByTrack.set(course.trackId, (courseCountByTrack.get(course.trackId) ?? 0) + 1));
  return tracks.map((track) => ({ ...track, courseCount: courseCountByTrack.get(track.id) ?? 0 }));
}

export function getPublishedTracks(): Promise<Track[]> {
  return getPublishedCollection('tracks', mapTrackDocument);
}

export const getTracks: () => Promise<Track[]> = getPublishedTracks;

export function getPublishedCourses(): Promise<Course[]> {
  return getPublishedCollection('courses', mapCourseDocument);
}

export async function getTrackBySlug(slug: string): Promise<Track | null> {
  const tracks = await getPublishedCollection('tracks', mapTrackDocument, [where('slug', '==', slug)]);
  return tracks[0] ?? null;
}

export function getTrackById(trackId: string): Promise<Track | null> {
  return getPublishedDocument('tracks', trackId, mapTrackDocument);
}

export function getCoursesByTrack(trackId: string): Promise<Course[]> {
  return getPublishedCollection('courses', mapCourseDocument, [where('trackId', '==', trackId)]);
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const courses = await getPublishedCollection('courses', mapCourseDocument, [where('slug', '==', slug)]);
  return courses[0] ?? null;
}

export function getCourseById(courseId: string): Promise<Course | null> {
  return getPublishedDocument('courses', courseId, mapCourseDocument);
}

export function getModulesByCourse(courseId: string): Promise<CourseModule[]> {
  return getPublishedCollection('modules', mapModuleDocument, [where('courseId', '==', courseId)]);
}

export function getLessonsByModule(moduleId: string): Promise<Lesson[]> {
  return getPublishedCollection('lessons', mapLessonDocument, [where('moduleId', '==', moduleId)]);
}

export function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  return getPublishedCollection('lessons', mapLessonDocument, [where('courseId', '==', courseId)]);
}

export function getPublishedLessons(): Promise<Lesson[]> {
  return getPublishedCollection('lessons', mapLessonDocument);
}

export function getLessonById(lessonId: string): Promise<Lesson | null> {
  return getPublishedDocument('lessons', lessonId, mapLessonDocument);
}

export function getActivitiesByLesson(lessonId: string): Promise<Activity[]> {
  return getPublishedCollection('activities', mapActivityDocument, [where('lessonId', '==', lessonId)]);
}

export function getPublishedActivities(): Promise<Activity[]> {
  return getPublishedCollection('activities', mapActivityDocument);
}

export function getActivityById(activityId: string): Promise<Activity | null> {
  return getPublishedDocument('activities', activityId, mapActivityDocument);
}

export function getPracticalExercisesByLesson(lessonId: string): Promise<PracticalExercise[]> {
  return getPublishedCollection('practicalExercises', mapPracticalExerciseDocument, [where('lessonId', '==', lessonId)]);
}

export function getPublishedPracticalExercises(): Promise<PracticalExercise[]> {
  return getPublishedCollection('practicalExercises', mapPracticalExerciseDocument);
}

export function getPracticalExerciseById(exerciseId: string): Promise<PracticalExercise | null> {
  return getPublishedDocument('practicalExercises', exerciseId, mapPracticalExerciseDocument);
}

export async function getConceptsByIds(conceptIds: string[] = []): Promise<Concept[]> {
  const firestore = requireFirestore();
  const uniqueIds = [...new Set(conceptIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const snapshots = await Promise.all(
    splitIntoChunks(uniqueIds, CONCEPT_QUERY_LIMIT).map((ids) => getDocs(query(
      collection(firestore, 'concepts'),
      where('status', '==', 'published'),
      where(documentId(), 'in', ids),
    ))),
  );

  const concepts = snapshots.flatMap((snapshot) => snapshot.docs.map(mapConceptDocument).filter(isDefined));
  const conceptPosition = new Map(uniqueIds.map((id, index) => [id, index]));
  return [...concepts].sort((first, second) => (conceptPosition.get(first.id) ?? 0) - (conceptPosition.get(second.id) ?? 0));
}

export async function getCatalogOverview({
  includeLessons = false,
  includeActivities = false,
  includePracticalExercises = false,
}: CatalogOverviewOptions = {}): Promise<FullCatalogOverview> {
  const [tracks, courses, lessons, activities, practicalExercises] = await Promise.all([
    getPublishedTracks(),
    getPublishedCourses(),
    includeLessons ? getPublishedLessons() : Promise.resolve<Lesson[]>([]),
    includeActivities ? getPublishedActivities() : Promise.resolve<Activity[]>([]),
    includePracticalExercises ? getPublishedPracticalExercises() : Promise.resolve<PracticalExercise[]>([]),
  ]);
  return { tracks: addCourseCounts(tracks, courses), courses, lessons, activities, practicalExercises };
}

export async function getTrackCatalogBySlug(slug: string): Promise<TrackCatalog | null> {
  const track = await getTrackBySlug(slug);
  if (!track) return null;
  const courses = await getCoursesByTrack(track.id);
  return { track: { ...track, courseCount: courses.length }, courses };
}

function buildCourseStructure(
  course: Course,
  track: Track | null,
  modules: CourseModule[],
  lessons: Lesson[],
): CourseStructure {
  const lessonsByModule = new Map<string, Lesson[]>();
  lessons.forEach((lesson) => {
    const group = lessonsByModule.get(lesson.moduleId) ?? [];
    group.push(lesson);
    lessonsByModule.set(lesson.moduleId, group);
  });

  const moduleStructure: CourseModuleWithLessons[] = modules.map((module) => ({
    ...module,
    lessons: lessonsByModule.get(module.id) ?? [],
  }));
  return { course, track, lessons, lessonCount: lessons.length, modules: moduleStructure };
}

function normalizePublicCourseCatalog(catalog: CourseCatalog): CourseCatalog {
  const modules = sortByOrder(catalog.modules.map((module) => ({
    ...module,
    lessons: sortByOrder(module.lessons),
  })));
  const lessons = modules.flatMap((module) => module.lessons);
  return { ...catalog, modules, moduleCount: modules.length, lessonCount: lessons.length };
}

async function getCourseStructureForCourse(course: Course): Promise<CourseStructure> {
  const [track, modules, lessons] = await Promise.all([
    getTrackById(course.trackId),
    getModulesByCourse(course.id),
    getLessonsByCourse(course.id),
  ]);
  return buildCourseStructure(course, track, modules, lessons);
}

export async function getCourseStructure(courseId: string): Promise<CourseStructure | null> {
  const course = await getCourseById(courseId);
  return course ? getCourseStructureForCourse(course) : null;
}

export async function getCourseStructureBySlug(slug: string): Promise<CourseStructure | null> {
  const course = await getCourseBySlug(slug);
  return course ? getCourseStructureForCourse(course) : null;
}

/**
 * Lê somente a ementa pública preparada pelo seed. A coleção courseCatalogs
 * não contém sections, steps, respostas ou outro material interno das aulas.
 */
export async function getPublicCourseCatalogBySlug(slug: string): Promise<PublicCourseCatalog | null> {
  const course = await getCourseBySlug(slug);
  if (!course) return null;

  const [track, catalog] = await Promise.all([
    getTrackById(course.trackId),
    getPublishedDocument('courseCatalogs', course.id, mapCourseCatalogDocument),
  ]);
  if (!catalog || catalog.courseId !== course.id || catalog.courseSlug !== course.slug) return null;

  const normalizedCatalog = normalizePublicCourseCatalog(catalog);
  return { course, track, ...normalizedCatalog, lessons: normalizedCatalog.modules.flatMap((module) => module.lessons) };
}

export async function getLessonViewData(lessonId: string): Promise<LessonViewData | null> {
  const lesson = await getLessonById(lessonId);
  if (!lesson) return null;

  const [course, concepts, activities, practicalExercises] = await Promise.all([
    getCourseById(lesson.courseId),
    getConceptsByIds(lesson.conceptIds),
    getActivitiesByLesson(lesson.id),
    getPracticalExercisesByLesson(lesson.id),
  ]);

  if (!course) return { lesson, course: null, concepts, activities, practicalExercises, previousLesson: null, nextLesson: null };

  const structure = await getCourseStructureForCourse(course);
  const orderedLessons = structure.modules.flatMap((module) => module.lessons);
  const lessonIndex = orderedLessons.findIndex((item) => item.id === lesson.id);
  return {
    lesson,
    course,
    concepts,
    activities,
    practicalExercises,
    previousLesson: lessonIndex > 0 ? orderedLessons[lessonIndex - 1] : null,
    nextLesson: lessonIndex >= 0 && lessonIndex < orderedLessons.length - 1 ? orderedLessons[lessonIndex + 1] : null,
  };
}
