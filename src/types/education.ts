import type { FirestoreDocument, TimestampedDocument } from './common';
import type { Timestamp } from 'firebase/firestore';

export type PublicationStatus = 'published' | 'draft';
export type LessonProgressStatus = 'in_progress' | 'completed';

export interface Track extends FirestoreDocument, TimestampedDocument {
  slug: string;
  title: string;
  description?: string;
  order?: number;
  status: PublicationStatus;
}

export interface TrackWithCourseCount extends Track {
  courseCount: number;
}

export interface Course extends FirestoreDocument, TimestampedDocument {
  trackId: string;
  slug: string;
  title: string;
  description?: string;
  order?: number;
  status: PublicationStatus;
  estimatedMinutes?: number;
}

export interface CourseModule extends FirestoreDocument, TimestampedDocument {
  courseId: string;
  title: string;
  description?: string;
  order?: number;
  status: PublicationStatus;
}

/** Dados de aula expostos exclusivamente pela ementa pública courseCatalogs. */
export interface CatalogLesson {
  id: string;
  title: string;
  description?: string;
  order?: number;
  estimatedMinutes?: number;
}

/** Módulo sanitizado: não contém courseId, status ou conteúdo interno de aula. */
export interface CourseCatalogModule {
  id: string;
  title: string;
  description?: string;
  order?: number;
  lessons: CatalogLesson[];
}

/** Documento público preparado pelo seed sem conteúdo, atividades ou respostas internas. */
export interface CourseCatalog extends FirestoreDocument, TimestampedDocument {
  courseId: string;
  courseSlug: string;
  trackId: string;
  status: 'published';
  moduleCount: number;
  lessonCount: number;
  modules: CourseCatalogModule[];
}

export interface PublicCourseCatalog extends CourseCatalog {
  course: Course;
  track: Track | null;
  lessons: CatalogLesson[];
}

export interface CatalogOverview {
  tracks: TrackWithCourseCount[];
  courses: Course[];
}

export interface TrackCatalog {
  track: TrackWithCourseCount;
  courses: Course[];
}

export interface CourseModuleWithLessons extends CourseModule {
  lessons: Lesson[];
}

export interface CourseStructure {
  course: Course;
  track: Track | null;
  lessons: Lesson[];
  lessonCount: number;
  modules: CourseModuleWithLessons[];
}

export interface LessonProgress extends FirestoreDocument, TimestampedDocument {
  lessonId: string;
  courseId: string;
  moduleId: string;
  status: LessonProgressStatus;
  currentStep?: number;
  completedSteps?: number;
  /** Marcador transitório gerado ao normalizar documentos concluídos antes das etapas interativas. */
  legacyInteractiveCompletion?: boolean;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  lastAccessedAt?: Timestamp;
}

/** Estado retornado pelos serviços de progresso para uma aula aberta, inclusive antes de haver um documento completo. */
export interface LessonProgressState {
  status: LessonProgressStatus;
  currentStep?: number;
  completedSteps?: number;
  legacyInteractiveCompletion?: boolean;
}

export interface LessonExample {
  title?: string;
  content: string;
}

export interface LessonContentData {
  introduction?: string;
  explanation?: string;
  examples?: LessonExample[];
}

interface LessonSectionBase {
  id: string;
  title: string;
}

export interface TextLessonSection extends LessonSectionBase {
  type: 'text' | 'callout';
  content: string;
}

export interface ExampleLessonSection extends LessonSectionBase {
  type: 'example';
  label?: string;
  content: string;
  explanation: string;
}

export interface ReflectionLessonSection extends LessonSectionBase {
  type: 'reflection';
  prompt: string;
  suggestedAnswer: string;
}

export interface GuidedPracticeLessonSection extends LessonSectionBase {
  type: 'guided-practice';
  problem: string;
  steps: string[];
  check: string;
}

export interface LessonMistake {
  title: string;
  description: string;
}

export interface CommonMistakesLessonSection extends LessonSectionBase {
  type: 'common-mistakes';
  items: LessonMistake[];
}

export interface SummaryLessonSection extends LessonSectionBase {
  type: 'summary';
  items: string[];
}

export interface NextStepsLessonSection extends LessonSectionBase {
  type: 'next-steps';
  items: string[];
}

export type LessonSection =
  | TextLessonSection
  | ExampleLessonSection
  | ReflectionLessonSection
  | GuidedPracticeLessonSection
  | CommonMistakesLessonSection
  | SummaryLessonSection
  | NextStepsLessonSection;

export interface LessonVideo {
  provider: 'youtube';
  videoId: string;
  title?: string;
  channelName?: string;
  language?: string;
  educationalRole?: string;
}

interface InteractiveStepBase {
  id: string;
  title: string;
  conceptIds: string[];
  content?: string;
  prompt?: string;
  code?: string;
}

export interface ExplanationStep extends InteractiveStepBase {
  type: 'explanation';
  content: string;
}

export interface InteractiveOption {
  id: string;
  label: string;
  feedback: string;
  code?: string;
}

export interface OptionInteractiveStepBase extends InteractiveStepBase {
  prompt: string;
  code?: string;
  options: InteractiveOption[];
  correctAnswer: string;
  correctFeedback: string;
  incorrectFeedback: string;
  hint: string;
}

export interface ChooseCodeStep extends OptionInteractiveStepBase {
  type: 'choose_code';
}

export interface PredictOutputStep extends OptionInteractiveStepBase {
  type: 'predict_output';
}

export interface FindErrorStep extends OptionInteractiveStepBase {
  type: 'find_error';
}

export interface ChooseOutputStep extends OptionInteractiveStepBase {
  type: 'choose_output';
}

export interface TextInteractiveStepBase extends InteractiveStepBase {
  prompt: string;
  code?: string;
  acceptedAnswers: string[];
  correctFeedback: string;
  incorrectFeedback: string;
  hint: string;
  placeholder?: string;
}

export interface FillCodeStep extends TextInteractiveStepBase {
  type: 'fill_code';
}

export interface CompleteLineStep extends TextInteractiveStepBase {
  type: 'complete_line';
}

export type TextInteractiveStep = FillCodeStep | CompleteLineStep;

export interface OrderCodeItem {
  id: string;
  content: string;
}

export interface OrderCodeStep extends InteractiveStepBase {
  type: 'order_code';
  prompt: string;
  items: OrderCodeItem[];
  correctOrder: string[];
  correctFeedback: string;
  incorrectFeedback: string;
  hint: string;
}

interface WriteCodeCheckBase {
  id: string;
  message: string;
}

export interface ContainsIfCheck extends WriteCodeCheckBase {
  type: 'contains_if';
}

export interface ComparesVariableToValueCheck extends WriteCodeCheckBase {
  type: 'compares_variable_to_value';
  variable: string;
  operator: string;
  value: string | number;
}

export interface LogsMessageCheck extends WriteCodeCheckBase {
  type: 'logs_message';
  value: string | number;
}

export interface ForCounterRangeCheck extends WriteCodeCheckBase {
  type: 'for_counter_range';
  counter: string;
  start: string | number;
  end: string | number;
}

export interface LogsVariableCheck extends WriteCodeCheckBase {
  type: 'logs_variable';
  variable: string;
}

export interface DefinesFunctionCheck extends WriteCodeCheckBase {
  type: 'defines_function';
  name: string;
  parameters: string[];
}

export interface ReturnsMultiplicationCheck extends WriteCodeCheckBase {
  type: 'returns_multiplication';
  variable: string;
  factor: string | number;
}

export interface DeclaresValueCheck extends WriteCodeCheckBase {
  type: 'declares_value';
  value: string | number;
}

export interface DeclaresSumCheck extends WriteCodeCheckBase {
  type: 'declares_sum';
  variable: string;
}

export interface ContainsFragmentCheck extends WriteCodeCheckBase {
  type: 'contains_fragment';
  fragment: string;
}

export type WriteCodeCheck =
  | ContainsIfCheck
  | ComparesVariableToValueCheck
  | LogsMessageCheck
  | ForCounterRangeCheck
  | LogsVariableCheck
  | DefinesFunctionCheck
  | ReturnsMultiplicationCheck
  | DeclaresValueCheck
  | DeclaresSumCheck
  | ContainsFragmentCheck;

export interface WriteCodeStep extends InteractiveStepBase {
  type: 'write_code';
  prompt: string;
  requiredChecks?: WriteCodeCheck[];
  requiredFragments?: string[];
  correctFeedback: string;
  incorrectFeedback: string;
  hint: string;
  placeholder?: string;
}

export type InteractiveLessonStep =
  | ExplanationStep
  | ChooseCodeStep
  | PredictOutputStep
  | FillCodeStep
  | OrderCodeStep
  | FindErrorStep
  | ChooseOutputStep
  | WriteCodeStep
  | CompleteLineStep;

export type InteractiveQuestionStep = Exclude<InteractiveLessonStep, ExplanationStep>;

export interface OrderedStepAnswer {
  orderedStepIds: string[];
}

export type InteractiveStepAnswer = string | OrderedStepAnswer;

export interface InteractiveStepResult {
  isCorrect: boolean;
  message: string;
  hint?: string;
}

export interface InteractiveStepProgress {
  currentStep: number;
  completedSteps: number;
}

export interface NormalizedInteractiveLessonProgress extends InteractiveStepProgress {
  legacyInteractiveCompletion: boolean;
}

export interface StoredInteractiveLessonProgress {
  status?: LessonProgressStatus;
  currentStep?: number;
  completedSteps?: number;
}

/** Documento interno de aula. Não confundir com CatalogLesson, que é uma ementa pública sem conteúdo. */
export interface Lesson extends FirestoreDocument, TimestampedDocument {
  courseId: string;
  courseSlug?: string;
  moduleId: string;
  slug: string;
  title: string;
  description?: string;
  order: number;
  status: PublicationStatus;
  estimatedMinutes?: number;
  objectives?: string[];
  content?: LessonContentData;
  sections?: LessonSection[];
  conceptIds: string[];
  video?: LessonVideo;
  checkpointActivity?: boolean;
  steps?: InteractiveLessonStep[];
}

export interface Concept extends FirestoreDocument, TimestampedDocument {
  name: string;
  description?: string;
  status: PublicationStatus;
}

export type ActivityQuestionType = 'multiple-choice' | 'true-false';
export type ActivityQuestionDifficulty = 'basic' | 'intermediate' | 'application';
export type ActivityAnswerValue = string | boolean;
export type ActivityAnswers = Record<string, ActivityAnswerValue>;

export interface ActivityQuestionOption {
  id: string;
  label: string;
  feedback: string;
}

interface ActivityQuestionBase {
  id: string;
  prompt: string;
  conceptIds: string[];
  correctFeedback: string;
  incorrectFeedback: string;
  hint: string;
  difficulty?: ActivityQuestionDifficulty;
}

export interface MultipleChoiceActivityQuestion extends ActivityQuestionBase {
  type: 'multiple-choice';
  options: ActivityQuestionOption[];
  correctAnswer: string;
}

export interface TrueFalseActivityQuestion extends ActivityQuestionBase {
  type: 'true-false';
  correctAnswer: boolean;
}

export type ActivityQuestion = MultipleChoiceActivityQuestion | TrueFalseActivityQuestion;

export interface ActivityFeedback {
  questionId: string;
  isCorrect: boolean;
  conceptIds: string[];
  message: string;
  hint?: string;
}

export interface ActivityResult {
  answers: ActivityAnswers;
  feedback: ActivityFeedback[];
  correctCount: number;
  totalQuestions: number;
}

export interface LessonActivity extends FirestoreDocument, TimestampedDocument {
  lessonId: string;
  courseId: string;
  moduleId: string;
  slug: string;
  title: string;
  description?: string;
  type: string;
  order: number;
  conceptIds: string[];
  status: PublicationStatus;
}

export interface Activity extends LessonActivity {
  type: 'multiple-choice';
  instructions: string;
  questions: ActivityQuestion[];
}

export interface SubmittedActivityAttempt extends ActivityResult {
  id: string;
  activityId: string;
  status: 'submitted';
}

export type PracticalExerciseType = 'complete_code' | 'order_steps' | 'write_code';
export type PracticeResultStatus = 'correct' | 'partially_correct' | 'needs_revision';

export interface PracticalExerciseFeedback {
  correct: string;
  partiallyCorrect: string;
  needsRevision: string;
  hint: string;
  explanation: string;
}

export interface PracticalExerciseStep {
  id: string;
  content: string;
}

interface PracticalExerciseBase extends FirestoreDocument, TimestampedDocument {
  lessonId: string;
  courseId: string;
  moduleId: string;
  slug: string;
  title: string;
  description?: string;
  order: number;
  conceptIds: string[];
  status: PublicationStatus;
  instructions: string;
  difficulty?: ActivityQuestionDifficulty;
  starterCode?: string;
  possibleSolution: string;
  feedback: PracticalExerciseFeedback;
}

export interface CompleteCodeExercise extends PracticalExerciseBase {
  type: 'complete_code';
  validation: {
    acceptedAnswers: string[];
  };
}

export interface OrderStepsExercise extends PracticalExerciseBase {
  type: 'order_steps';
  steps: PracticalExerciseStep[];
  validation: {
    correctOrder: string[];
  };
}

interface PracticalWriteCodeCheckBase {
  id: string;
  message: string;
}

export interface MinimumInputOperationsPracticalCheck extends PracticalWriteCodeCheckBase {
  type: 'minimum_input_operations';
  minimum: number;
}

export interface ContainsAssignmentPracticalCheck extends PracticalWriteCodeCheckBase {
  type: 'contains_assignment' | 'contains_addition' | 'contains_conditional' | 'contains_else' | 'contains_output_operation';
}

export interface ContainsDivisionByPracticalCheck extends PracticalWriteCodeCheckBase {
  type: 'contains_division_by';
  value: string | number;
}

export interface ContainsTextPracticalCheck extends PracticalWriteCodeCheckBase {
  type: 'contains_text';
  value: string;
}

export type PracticalWriteCodeCheck =
  | MinimumInputOperationsPracticalCheck
  | ContainsAssignmentPracticalCheck
  | ContainsDivisionByPracticalCheck
  | ContainsTextPracticalCheck;

export interface WriteCodeExercise extends PracticalExerciseBase {
  type: 'write_code';
  validation: {
    requiredChecks: PracticalWriteCodeCheck[];
  };
}

export type PracticalExercise = CompleteCodeExercise | OrderStepsExercise | WriteCodeExercise;

export interface TextPracticalResponse {
  kind: 'text';
  text: string;
}

export interface OrderedStepsPracticalResponse {
  kind: 'ordered_steps';
  orderedStepIds: string[];
}

export type PracticalExerciseResponse = TextPracticalResponse | OrderedStepsPracticalResponse;

export interface PracticalExerciseResult {
  status: PracticeResultStatus;
  response: PracticalExerciseResponse;
  message: string;
  hint: string;
  explanation: string;
  matchedCriteria: string[];
  missingCriteria: string[];
}

export interface PracticalAttempt extends FirestoreDocument, TimestampedDocument {
  exerciseId: string;
  lessonId: string;
  courseId: string;
  moduleId: string;
  type: PracticalExerciseType;
  response: PracticalExerciseResponse;
  resultStatus: PracticeResultStatus;
  feedback: string;
  hint: string;
  conceptIds: string[];
  submittedAt?: Timestamp;
}

export interface SubmittedPracticalAttempt extends PracticalExerciseResult {
  id: string;
  exerciseId: string;
  lessonId: string;
  courseId: string;
  moduleId: string;
  type: PracticalExerciseType;
  conceptIds: string[];
}

export interface PracticalExerciseViewData {
  exercise: PracticalExercise;
  concepts: Concept[];
}

export interface ActivityAttempt extends FirestoreDocument, TimestampedDocument {
  activityId: string;
  lessonId: string;
  courseId: string;
  moduleId: string;
  status: 'submitted';
  answers: ActivityAnswers;
  correctCount: number;
  totalQuestions: number;
  submittedAt?: Timestamp;
}

export interface ConceptMastery extends FirestoreDocument, TimestampedDocument {
  conceptId: string;
  correctAnswers: number;
  incorrectAnswers: number;
  needsReview: boolean;
  lastLessonId: string;
}

export interface LessonViewData {
  lesson: Lesson;
  course: Course | null;
  concepts: Concept[];
  activities: LessonActivity[];
  practicalExercises: PracticalExercise[];
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  startedLessons: number;
  percentage: number | null;
  isCompleted: boolean;
  progressByLessonId: Map<string, LessonProgress>;
}

export interface LastAccessedLesson<TLesson extends FirestoreDocument = CatalogLesson> {
  lesson: TLesson;
  progress: LessonProgress;
}

export type LastAccessedCourseLesson = LastAccessedLesson<CatalogLesson>;

export interface CourseProgressOverview extends Course {
  progress: CourseProgress;
  lastAccessed: LastAccessedLesson<Lesson> | null;
}

export interface LearningSummary {
  completedLessons: number;
  totalLessons: number;
  activitiesPerformed: number;
  conceptsNeedingReview: number;
}

export interface LessonCompletedStudyActivity {
  id: string;
  type: 'lesson_completed';
  lesson: Lesson;
  timestamp: Timestamp;
}

export interface LessonAccessedStudyActivity {
  id: string;
  type: 'lesson_accessed';
  lesson: Lesson;
  timestamp: Timestamp;
}

export interface ActivitySubmittedStudyActivity {
  id: string;
  type: 'activity_submitted';
  activity: LessonActivity | null;
  lesson: Lesson | null;
  attempt: ActivityAttempt;
  timestamp: Timestamp;
}

export type RecentStudyActivity =
  | LessonCompletedStudyActivity
  | LessonAccessedStudyActivity
  | ActivitySubmittedStudyActivity;
