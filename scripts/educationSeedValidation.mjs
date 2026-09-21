const COLLECTIONS = ['tracks', 'courses', 'modules', 'lessons', 'concepts', 'activities', 'practicalExercises', 'courseCatalogs'];
const ALLOWED_STATUSES = new Set(['draft', 'published', 'archived']);
const ACTIVITY_TYPES = new Set([
  'multiple-choice',
  'true-false',
  'order-steps',
  'code-gap',
  'identify-error',
  'predict-output',
  'structured-short-answer',
]);
const OBJECTIVE_QUESTION_TYPES = new Set(['multiple-choice', 'true-false']);
const QUESTION_DIFFICULTIES = new Set(['basic', 'intermediate', 'application']);
const INTERACTIVE_STEP_TYPES = new Set([
  'explanation', 'choose_code', 'fill_code', 'predict_output',
  'order_code', 'find_error', 'choose_output', 'write_code', 'complete_line',
]);
// O validador é executado diretamente pelo Node e não carrega módulos TypeScript.
// Mantemos a mesma lista estável usada pela validação local das etapas interativas.
const INTERACTIVE_WRITE_CODE_CHECK_TYPES = new Set([
  'contains_if', 'compares_variable_to_value', 'logs_message', 'for_counter_range',
  'logs_variable', 'defines_function', 'returns_multiplication', 'declares_value',
  'declares_sum', 'contains_fragment',
]);
const OPTION_INTERACTIVE_STEP_TYPES = new Set(['choose_code', 'predict_output', 'find_error', 'choose_output']);
const TEXT_INTERACTIVE_STEP_TYPES = new Set(['fill_code', 'complete_line']);
// O validador é executado diretamente pelo Node e não carrega módulos TypeScript.
// Mantemos a mesma lista estável usada pela validação local dos exercícios práticos.
const PRACTICAL_EXERCISE_TYPES = new Set(['complete_code', 'write_code', 'order_steps']);
const WRITE_CODE_CHECK_TYPES = new Set([
  'minimum_input_operations', 'contains_assignment', 'contains_addition', 'contains_division_by',
  'contains_conditional', 'contains_else', 'contains_output_operation', 'contains_text',
]);
// Uma tentativa é gravada junto dos documentos de conceptMastery em uma transação.
// Com a validação das Rules, até nove conceitos distintos mantêm a operação abaixo
// do limite de acessos a documentos do Firestore sem depender de cache de Rules.
const MAX_MASTERY_CONCEPTS_PER_ACTIVITY = 9;

function seedError(message) {
  throw new Error(`Manifesto educacional inválido: ${message}`);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getCollection(manifest, collectionName) {
  const collection = manifest?.[collectionName];
  if (!isRecord(collection)) seedError(`a coleção "${collectionName}" deve ser um objeto.`);
  return collection;
}

function requireText(value, field, documentPath) {
  if (typeof value !== 'string' || !value.trim()) seedError(`${documentPath}.${field} deve ser um texto não vazio.`);
}

function requireOrder(value, documentPath) {
  if (!Number.isFinite(value) || value < 0) seedError(`${documentPath}.order deve ser um número válido maior ou igual a zero.`);
}

function requireStatus(value, documentPath) {
  if (!ALLOWED_STATUSES.has(value)) seedError(`${documentPath}.status deve ser um dos valores: draft, published ou archived.`);
}

function requireReference(referenceId, collection, field, documentPath) {
  requireText(referenceId, field, documentPath);
  if (!Object.hasOwn(collection, referenceId)) seedError(`${documentPath}.${field} referencia "${referenceId}", que não existe no manifesto.`);
}

function validateConceptIds(conceptIds, concepts, documentPath) {
  if (!Array.isArray(conceptIds)) seedError(`${documentPath}.conceptIds deve ser uma lista.`);
  conceptIds.forEach((conceptId) => requireReference(conceptId, concepts, 'conceptId', documentPath));
}

function validateExamples(content, documentPath) {
  if (!isRecord(content)) seedError(`${documentPath}.content deve ser um objeto.`);
  requireText(content.introduction, 'content.introduction', documentPath);
  requireText(content.explanation, 'content.explanation', documentPath);
  if (!Array.isArray(content.examples)) seedError(`${documentPath}.content.examples deve ser uma lista.`);

  content.examples.forEach((example, index) => {
    const examplePath = `${documentPath}.content.examples[${index}]`;
    if (!isRecord(example)) seedError(`${examplePath} deve ser um objeto.`);
    requireText(example.title, 'title', examplePath);
    requireText(example.content, 'content', examplePath);
  });
}

function validateLessonSections(sections, documentPath) {
  if (!Array.isArray(sections) || sections.length < 5) {
    seedError(`${documentPath}.sections deve conter uma sequência pedagógica com pelo menos cinco seções.`);
  }

  const sectionIds = new Set();
  const allowedTypes = new Set(['text', 'callout', 'example', 'reflection', 'guided-practice', 'common-mistakes', 'summary', 'next-steps']);
  sections.forEach((section, index) => {
    const sectionPath = `${documentPath}.sections[${index}]`;
    if (!isRecord(section)) seedError(`${sectionPath} deve ser um objeto.`);
    requireText(section.id, 'id', sectionPath);
    if (sectionIds.has(section.id)) seedError(`${sectionPath}.id está duplicado.`);
    sectionIds.add(section.id);
    requireText(section.type, 'type', sectionPath);
    if (!allowedTypes.has(section.type)) seedError(`${sectionPath}.type não é suportado.`);
    requireText(section.title, 'title', sectionPath);

    if (['text', 'callout'].includes(section.type)) requireText(section.content, 'content', sectionPath);
    if (section.type === 'example') {
      requireText(section.label, 'label', sectionPath);
      requireText(section.content, 'content', sectionPath);
      requireText(section.explanation, 'explanation', sectionPath);
    }
    if (section.type === 'reflection') {
      requireText(section.prompt, 'prompt', sectionPath);
      requireText(section.suggestedAnswer, 'suggestedAnswer', sectionPath);
    }
    if (section.type === 'guided-practice') {
      requireText(section.problem, 'problem', sectionPath);
      if (!Array.isArray(section.steps) || section.steps.length < 3) seedError(`${sectionPath}.steps deve conter pelo menos três passos.`);
      section.steps.forEach((step, stepIndex) => requireText(step, `steps[${stepIndex}]`, sectionPath));
      requireText(section.check, 'check', sectionPath);
    }
    if (['common-mistakes', 'summary', 'next-steps'].includes(section.type)) {
      if (!Array.isArray(section.items) || section.items.length === 0) seedError(`${sectionPath}.items deve conter pelo menos um item.`);
      section.items.forEach((item, itemIndex) => {
        const itemPath = `${sectionPath}.items[${itemIndex}]`;
        if (typeof item === 'string') return requireText(item, 'item', itemPath);
        if (!isRecord(item)) seedError(`${itemPath} deve ser um texto ou objeto.`);
        requireText(item.title, 'title', itemPath);
        requireText(item.description, 'description', itemPath);
      });
    }
  });
}

function validateVideo(video, documentPath) {
  if (video === undefined) return;
  if (!isRecord(video)) seedError(`${documentPath}.video deve ser um objeto.`);
  if (video.provider !== 'youtube') seedError(`${documentPath}.video.provider deve ser youtube.`);
  if (typeof video.videoId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(video.videoId)) seedError(`${documentPath}.video.videoId deve ser um ID válido do YouTube.`);
  requireText(video.title, 'video.title', documentPath);
  requireText(video.channelName, 'video.channelName', documentPath);
  requireText(video.language, 'video.language', documentPath);
  requireText(video.educationalRole, 'video.educationalRole', documentPath);
}

function validateInteractiveWriteCodeChecks(requiredChecks, documentPath) {
  if (!Array.isArray(requiredChecks) || requiredChecks.length < 2) {
    seedError(`${documentPath}.requiredChecks deve conter ao menos dois critérios.`);
  }

  const checkIds = new Set();
  requiredChecks.forEach((check, index) => {
    const checkPath = `${documentPath}.requiredChecks[${index}]`;
    if (!isRecord(check)) seedError(`${checkPath} deve ser um objeto.`);
    requireText(check.id, 'id', checkPath);
    if (checkIds.has(check.id)) seedError(`${checkPath}.id está duplicado.`);
    checkIds.add(check.id);
    requireText(check.type, 'type', checkPath);
    if (!INTERACTIVE_WRITE_CODE_CHECK_TYPES.has(check.type)) seedError(`${checkPath}.type não é suportado.`);
    requireText(check.message, 'message', checkPath);

    if (['compares_variable_to_value', 'logs_variable', 'returns_multiplication', 'declares_sum'].includes(check.type)) {
      requireText(check.variable, 'variable', checkPath);
    }
    if (check.type === 'compares_variable_to_value') {
      requireText(check.operator, 'operator', checkPath);
      requireText(check.value, 'value', checkPath);
    }
    if (check.type === 'logs_message' || check.type === 'declares_value') requireText(check.value, 'value', checkPath);
    if (check.type === 'for_counter_range') {
      requireText(check.counter, 'counter', checkPath);
      if (!Number.isFinite(check.start) || !Number.isFinite(check.end)) {
        seedError(`${checkPath}.start e ${checkPath}.end devem ser números válidos.`);
      }
    }
    if (check.type === 'defines_function') {
      requireText(check.name, 'name', checkPath);
      if (!Array.isArray(check.parameters)) seedError(`${checkPath}.parameters deve ser uma lista.`);
      check.parameters.forEach((parameter, parameterIndex) => requireText(parameter, `parameters[${parameterIndex}]`, checkPath));
    }
    if (check.type === 'returns_multiplication' && !Number.isFinite(check.factor)) {
      seedError(`${checkPath}.factor deve ser um número válido.`);
    }
    if (check.type === 'contains_fragment') requireText(check.fragment, 'fragment', checkPath);
  });
}

function validateInteractiveSteps(steps, concepts, lessonConceptIds, documentPath) {
  if (!Array.isArray(steps) || steps.length < 3 || steps.length > 8) {
    seedError(`${documentPath}.steps deve conter entre três e oito passos.`);
  }

  const stepIds = new Set();
  let interactionCount = 0;
  let explanationCount = 0;

  steps.forEach((step, index) => {
    const stepPath = `${documentPath}.steps[${index}]`;
    if (!isRecord(step)) seedError(`${stepPath} deve ser um objeto.`);
    requireText(step.id, 'id', stepPath);
    if (stepIds.has(step.id)) seedError(`${stepPath}.id está duplicado.`);
    stepIds.add(step.id);
    requireText(step.type, 'type', stepPath);
    if (!INTERACTIVE_STEP_TYPES.has(step.type)) seedError(`${stepPath}.type não é suportado.`);
    requireText(step.title, 'title', stepPath);
    validateConceptIds(step.conceptIds, concepts, stepPath);
    if (step.conceptIds.length === 0) seedError(`${stepPath}.conceptIds deve conter ao menos um conceito.`);
    step.conceptIds.forEach((conceptId) => {
      if (!lessonConceptIds.includes(conceptId)) seedError(`${stepPath}.conceptIds contém "${conceptId}", que não pertence aos conceptIds da aula.`);
    });

    if (step.type === 'explanation') {
      explanationCount += 1;
      requireText(step.content, 'content', stepPath);
      return;
    }

    interactionCount += 1;
    requireText(step.prompt, 'prompt', stepPath);
    requireText(step.correctFeedback, 'correctFeedback', stepPath);
    requireText(step.incorrectFeedback, 'incorrectFeedback', stepPath);
    requireText(step.hint, 'hint', stepPath);

    if (OPTION_INTERACTIVE_STEP_TYPES.has(step.type)) {
      if (!Array.isArray(step.options) || step.options.length < 2) seedError(`${stepPath}.options deve conter ao menos duas alternativas.`);
      const optionIds = new Set();
      step.options.forEach((option, optionIndex) => {
        const optionPath = `${stepPath}.options[${optionIndex}]`;
        if (!isRecord(option)) seedError(`${optionPath} deve ser um objeto.`);
        requireText(option.id, 'id', optionPath);
        if (optionIds.has(option.id)) seedError(`${optionPath}.id está duplicado.`);
        optionIds.add(option.id);
        requireText(option.label, 'label', optionPath);
        requireText(option.feedback, 'feedback', optionPath);
      });
      if (typeof step.correctAnswer !== 'string' || !optionIds.has(step.correctAnswer)) seedError(`${stepPath}.correctAnswer deve apontar para uma alternativa existente.`);
      return;
    }

    if (TEXT_INTERACTIVE_STEP_TYPES.has(step.type)) {
      requireText(step.code, 'code', stepPath);
      if (!Array.isArray(step.acceptedAnswers) || step.acceptedAnswers.length === 0) seedError(`${stepPath}.acceptedAnswers deve conter ao menos uma resposta.`);
      step.acceptedAnswers.forEach((answer, answerIndex) => requireText(answer, `acceptedAnswers[${answerIndex}]`, stepPath));
      return;
    }

    if (step.type === 'order_code') {
      if (!Array.isArray(step.items) || step.items.length < 2 || step.items.length > 8) seedError(`${stepPath}.items deve conter entre duas e oito linhas.`);
      const itemIds = new Set();
      step.items.forEach((item, itemIndex) => {
        const itemPath = `${stepPath}.items[${itemIndex}]`;
        if (!isRecord(item)) seedError(`${itemPath} deve ser um objeto.`);
        requireText(item.id, 'id', itemPath);
        if (itemIds.has(item.id)) seedError(`${itemPath}.id está duplicado.`);
        itemIds.add(item.id);
        requireText(item.content, 'content', itemPath);
      });
      if (!Array.isArray(step.correctOrder) || step.correctOrder.length !== step.items.length || new Set(step.correctOrder).size !== step.items.length || step.correctOrder.some((itemId) => !itemIds.has(itemId))) {
        seedError(`${stepPath}.correctOrder deve conter cada linha exatamente uma vez.`);
      }
      return;
    }

    if (step.type === 'write_code') {
      if (Array.isArray(step.requiredChecks)) {
        validateInteractiveWriteCodeChecks(step.requiredChecks, stepPath);
        return;
      }
      if (!Array.isArray(step.requiredFragments) || step.requiredFragments.length < 2) seedError(`${stepPath} precisa de requiredChecks ou requiredFragments.`);
      step.requiredFragments.forEach((fragment, fragmentIndex) => requireText(fragment, `requiredFragments[${fragmentIndex}]`, stepPath));
    }
  });

  if (explanationCount === 0) seedError(`${documentPath}.steps deve incluir ao menos uma explicação.`);
  if (interactionCount < 2 || interactionCount > 5) seedError(`${documentPath}.steps deve incluir entre duas e cinco interações.`);
}

function validateObjectiveQuestions(questions, concepts, lessonConceptIds, documentPath) {
  if (!Array.isArray(questions) || questions.length === 0) seedError(`${documentPath}.questions deve conter pelo menos uma questão.`);
  if (!Array.isArray(lessonConceptIds)) seedError(`${documentPath}.lesson.conceptIds deve ser uma lista.`);

  const questionIds = new Set();
  questions.forEach((question, index) => {
    const questionPath = `${documentPath}.questions[${index}]`;
    if (!isRecord(question)) seedError(`${questionPath} deve ser um objeto.`);
    requireText(question.id, 'id', questionPath);
    if (questionIds.has(question.id)) seedError(`${questionPath}.id está duplicado.`);
    questionIds.add(question.id);
    requireText(question.type, 'type', questionPath);
    if (!OBJECTIVE_QUESTION_TYPES.has(question.type)) seedError(`${questionPath}.type deve ser multiple-choice ou true-false.`);
    requireText(question.prompt, 'prompt', questionPath);
    requireText(question.difficulty, 'difficulty', questionPath);
    if (!QUESTION_DIFFICULTIES.has(question.difficulty)) seedError(`${questionPath}.difficulty deve ser basic, intermediate ou application.`);
    validateConceptIds(question.conceptIds, concepts, questionPath);
    if (!Object.hasOwn(question, 'correctAnswer')) seedError(`${questionPath}.correctAnswer é obrigatório.`);
    requireText(question.correctFeedback, 'correctFeedback', questionPath);
    requireText(question.incorrectFeedback, 'incorrectFeedback', questionPath);
    requireText(question.hint, 'hint', questionPath);

    if (question.type === 'multiple-choice') {
      if (!Array.isArray(question.options) || question.options.length < 2) seedError(`${questionPath}.options deve conter pelo menos duas alternativas.`);
      const optionIds = new Set();
      question.options.forEach((option, optionIndex) => {
        const optionPath = `${questionPath}.options[${optionIndex}]`;
        if (!isRecord(option)) seedError(`${optionPath} deve ser um objeto.`);
        requireText(option.id, 'id', optionPath);
        if (optionIds.has(option.id)) seedError(`${optionPath}.id está duplicado.`);
        optionIds.add(option.id);
        requireText(option.label, 'label', optionPath);
        requireText(option.feedback, 'feedback', optionPath);
      });
      if (typeof question.correctAnswer !== 'string' || !optionIds.has(question.correctAnswer)) {
        seedError(`${questionPath}.correctAnswer deve ser uma alternativa existente.`);
      }
      if (question.options.filter((option) => option.id === question.correctAnswer).length !== 1) {
        seedError(`${questionPath}.correctAnswer deve corresponder a exatamente uma alternativa.`);
      }
    } else if (typeof question.correctAnswer !== 'boolean') {
      seedError(`${questionPath}.correctAnswer deve ser true ou false.`);
    }

    question.conceptIds.forEach((conceptId) => {
      if (!lessonConceptIds.includes(conceptId)) {
        seedError(`${questionPath}.conceptIds contém "${conceptId}", que não pertence aos conceptIds da aula associada.`);
      }
    });
  });
}

function validatePracticeFeedback(feedback, documentPath) {
  if (!isRecord(feedback)) seedError(`${documentPath}.feedback deve ser um objeto.`);
  ['correct', 'partiallyCorrect', 'needsRevision', 'hint', 'explanation'].forEach((field) => requireText(feedback[field], `feedback.${field}`, documentPath));
}

function validateOrderStepsExercise(data, documentPath) {
  if (!Array.isArray(data.steps) || data.steps.length < 3 || data.steps.length > 8) {
    seedError(`${documentPath}.steps deve conter entre três e oito etapas.`);
  }

  const stepIds = new Set();
  data.steps.forEach((step, index) => {
    const stepPath = `${documentPath}.steps[${index}]`;
    if (!isRecord(step)) seedError(`${stepPath} deve ser um objeto.`);
    requireText(step.id, 'id', stepPath);
    if (stepIds.has(step.id)) seedError(`${stepPath}.id está duplicado.`);
    stepIds.add(step.id);
    requireText(step.content, 'content', stepPath);
  });

  if (!isRecord(data.validation) || !Array.isArray(data.validation.correctOrder)) {
    seedError(`${documentPath}.validation.correctOrder deve ser uma lista.`);
  }
  const { correctOrder } = data.validation;
  if (correctOrder.length !== data.steps.length || new Set(correctOrder).size !== data.steps.length || correctOrder.some((stepId) => !stepIds.has(stepId))) {
    seedError(`${documentPath}.validation.correctOrder deve conter cada etapa exatamente uma vez.`);
  }
}

function validateCompleteCodeExercise(data, documentPath) {
  requireText(data.starterCode, 'starterCode', documentPath);
  if (!data.starterCode.includes('{{blank}}')) seedError(`${documentPath}.starterCode deve conter a lacuna {{blank}}.`);
  if (!isRecord(data.validation) || !Array.isArray(data.validation.acceptedAnswers) || data.validation.acceptedAnswers.length === 0) {
    seedError(`${documentPath}.validation.acceptedAnswers deve conter ao menos uma resposta.`);
  }
  data.validation.acceptedAnswers.forEach((answer, index) => requireText(answer, `validation.acceptedAnswers[${index}]`, documentPath));
}

function validateWriteCodeExercise(data, documentPath) {
  requireText(data.starterCode, 'starterCode', documentPath);
  if (!isRecord(data.validation) || !Array.isArray(data.validation.requiredChecks) || data.validation.requiredChecks.length < 3) {
    seedError(`${documentPath}.validation.requiredChecks deve conter ao menos três critérios.`);
  }

  const checkIds = new Set();
  data.validation.requiredChecks.forEach((check, index) => {
    const checkPath = `${documentPath}.validation.requiredChecks[${index}]`;
    if (!isRecord(check)) seedError(`${checkPath} deve ser um objeto.`);
    requireText(check.id, 'id', checkPath);
    if (checkIds.has(check.id)) seedError(`${checkPath}.id está duplicado.`);
    checkIds.add(check.id);
    requireText(check.type, 'type', checkPath);
    if (!WRITE_CODE_CHECK_TYPES.has(check.type)) seedError(`${checkPath}.type não é suportado.`);
    requireText(check.message, 'message', checkPath);
    if (check.type === 'minimum_input_operations' && (!Number.isInteger(check.minimum) || check.minimum < 1)) {
      seedError(`${checkPath}.minimum deve ser um inteiro positivo.`);
    }
    if (check.type === 'contains_division_by' && (!Number.isInteger(check.value) || check.value < 1)) {
      seedError(`${checkPath}.value deve ser um inteiro positivo.`);
    }
    if (check.type === 'contains_text') requireText(check.value, 'value', checkPath);
  });
}

function validatePracticalExercises(practicalExercises, courses, modules, lessons, concepts) {
  Object.entries(practicalExercises).forEach(([id, data]) => {
    const path = `practicalExercises/${id}`;
    validateBaseDocument(data, path);
    requireReference(data.lessonId, lessons, 'lessonId', path);
    requireReference(data.courseId, courses, 'courseId', path);
    requireReference(data.moduleId, modules, 'moduleId', path);
    if (lessons[data.lessonId].courseId !== data.courseId) seedError(`${path}.courseId não corresponde à aula informada.`);
    if (lessons[data.lessonId].moduleId !== data.moduleId) seedError(`${path}.moduleId não corresponde à aula informada.`);
    if (data.status === 'published' && (lessons[data.lessonId].status !== 'published' || courses[data.courseId].status !== 'published' || modules[data.moduleId].status !== 'published')) {
      seedError(`${path} publicada deve pertencer a aula, curso e módulo publicados.`);
    }
    requireText(data.slug, 'slug', path);
    requireText(data.title, 'title', path);
    requireText(data.description, 'description', path);
    requireText(data.instructions, 'instructions', path);
    requireText(data.type, 'type', path);
    if (!PRACTICAL_EXERCISE_TYPES.has(data.type)) seedError(`${path}.type deve ser complete_code, write_code ou order_steps.`);
    requireText(data.difficulty, 'difficulty', path);
    if (!QUESTION_DIFFICULTIES.has(data.difficulty)) seedError(`${path}.difficulty deve ser basic, intermediate ou application.`);
    validateConceptIds(data.conceptIds, concepts, path);
    if (data.conceptIds.length === 0) seedError(`${path}.conceptIds deve conter ao menos um conceito.`);
    data.conceptIds.forEach((conceptId) => {
      if (!lessons[data.lessonId].conceptIds.includes(conceptId)) seedError(`${path}.conceptIds contém "${conceptId}", que não pertence à aula associada.`);
      if (data.status === 'published' && concepts[conceptId].status !== 'published') seedError(`${path}.conceptIds contém "${conceptId}", que não está publicado.`);
    });
    validatePracticeFeedback(data.feedback, path);
    requireText(data.possibleSolution, 'possibleSolution', path);

    if (data.type === 'complete_code') validateCompleteCodeExercise(data, path);
    if (data.type === 'order_steps') validateOrderStepsExercise(data, path);
    if (data.type === 'write_code') validateWriteCodeExercise(data, path);
  });
}

function getCorrectAnswerPositionSummary(activities) {
  const positions = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const byOptionCount = {};
  let totalMultipleChoice = 0;

  Object.values(activities).forEach((activity) => {
    activity.questions.forEach((question) => {
      if (question.type !== 'multiple-choice') return;

      const position = question.options.findIndex((option) => option.id === question.correctAnswer) + 1;
      if (position <= 0) seedError(`activities/${activity.slug}.questions/${question.id}.correctAnswer não foi encontrado nas alternativas.`);

      totalMultipleChoice += 1;
      positions[position] = (positions[position] ?? 0) + 1;

      const optionCount = question.options.length;
      if (!byOptionCount[optionCount]) {
        byOptionCount[optionCount] = Object.fromEntries(Array.from({ length: optionCount }, (_, index) => [index + 1, 0]));
      }
      byOptionCount[optionCount][position] += 1;
    });
  });

  return { totalMultipleChoice, positions, byOptionCount };
}

function validateBaseDocument(data, documentPath) {
  if (!isRecord(data)) seedError(`${documentPath} deve ser um objeto.`);
  requireOrder(data.order, documentPath);
  requireStatus(data.status, documentPath);
}

function validatePublicCourseCatalogs(courseCatalogs, courses, modules, lessons) {
  const publishedCourseIds = Object.entries(courses)
    .filter(([, course]) => course.status === 'published')
    .map(([courseId]) => courseId);

  if (Object.keys(courseCatalogs).length !== publishedCourseIds.length) {
    seedError('courseCatalogs deve conter exatamente uma ementa pública para cada curso publicado.');
  }

  publishedCourseIds.forEach((courseId) => {
    if (!Object.hasOwn(courseCatalogs, courseId)) {
      seedError(`courseCatalogs/${courseId} está ausente para o curso publicado.`);
    }
  });

  Object.entries(courseCatalogs).forEach(([catalogId, data]) => {
    const path = `courseCatalogs/${catalogId}`;
    if (!isRecord(data)) seedError(`${path} deve ser um objeto.`);

    const allowedKeys = new Set(['courseId', 'courseSlug', 'trackId', 'status', 'moduleCount', 'lessonCount', 'modules']);
    if (Object.keys(data).some((key) => !allowedKeys.has(key))) {
      seedError(`${path} contém campos que não pertencem à ementa pública.`);
    }

    requireReference(data.courseId, courses, 'courseId', path);
    if (catalogId !== data.courseId) seedError(`${path}.courseId deve corresponder ao ID do documento.`);
    if (courses[data.courseId].status !== 'published') seedError(`${path} deve pertencer a um curso publicado.`);
    requireText(data.courseSlug, 'courseSlug', path);
    if (data.courseSlug !== courses[data.courseId].slug) seedError(`${path}.courseSlug não corresponde ao curso.`);
    requireText(data.trackId, 'trackId', path);
    if (data.trackId !== courses[data.courseId].trackId) seedError(`${path}.trackId não corresponde ao curso.`);
    if (data.status !== 'published') seedError(`${path}.status deve ser published.`);
    if (!Number.isInteger(data.moduleCount) || data.moduleCount < 0) seedError(`${path}.moduleCount deve ser um inteiro não negativo.`);
    if (!Number.isInteger(data.lessonCount) || data.lessonCount < 0) seedError(`${path}.lessonCount deve ser um inteiro não negativo.`);
    if (!Array.isArray(data.modules)) seedError(`${path}.modules deve ser uma lista.`);

    const expectedModules = Object.entries(modules)
      .filter(([, module]) => module.courseId === data.courseId && module.status === 'published')
      .map(([id, module]) => ({ id, ...module }))
      .sort((first, second) => first.order - second.order || first.id.localeCompare(second.id));

    if (data.moduleCount !== expectedModules.length || data.modules.length !== expectedModules.length) {
      seedError(`${path}.modules não corresponde aos módulos publicados do curso.`);
    }

    const catalogLessonIds = [];
    data.modules.forEach((catalogModule, index) => {
      const modulePath = `${path}.modules[${index}]`;
      const expectedModule = expectedModules[index];
      if (!isRecord(catalogModule)) seedError(`${modulePath} deve ser um objeto.`);
      const allowedModuleKeys = new Set(['id', 'title', 'description', 'order', 'lessons']);
      if (Object.keys(catalogModule).some((key) => !allowedModuleKeys.has(key))) seedError(`${modulePath} contém dados internos da aula.`);
      if (!expectedModule || catalogModule.id !== expectedModule.id) seedError(`${modulePath}.id não corresponde à ordem dos módulos publicados.`);
      if (catalogModule.title !== expectedModule.title || catalogModule.description !== expectedModule.description || catalogModule.order !== expectedModule.order) {
        seedError(`${modulePath} não corresponde aos metadados do módulo publicado.`);
      }
      if (!Array.isArray(catalogModule.lessons)) seedError(`${modulePath}.lessons deve ser uma lista.`);

      const expectedLessons = Object.entries(lessons)
        .filter(([, lesson]) => lesson.courseId === data.courseId && lesson.moduleId === expectedModule.id && lesson.status === 'published')
        .map(([id, lesson]) => ({ id, ...lesson }))
        .sort((first, second) => first.order - second.order || first.id.localeCompare(second.id));

      if (catalogModule.lessons.length !== expectedLessons.length) seedError(`${modulePath}.lessons não corresponde às aulas publicadas do módulo.`);
      catalogModule.lessons.forEach((catalogLesson, lessonIndex) => {
        const lessonPath = `${modulePath}.lessons[${lessonIndex}]`;
        const expectedLesson = expectedLessons[lessonIndex];
        if (!isRecord(catalogLesson)) seedError(`${lessonPath} deve ser um objeto.`);
        const allowedLessonKeys = new Set(['id', 'title', 'description', 'order', 'estimatedMinutes']);
        if (Object.keys(catalogLesson).some((key) => !allowedLessonKeys.has(key))) seedError(`${lessonPath} contém conteúdo interno da aula.`);
        if (!expectedLesson || catalogLesson.id !== expectedLesson.id) seedError(`${lessonPath}.id não corresponde à ordem das aulas publicadas.`);
        if (catalogLesson.title !== expectedLesson.title || catalogLesson.description !== expectedLesson.description || catalogLesson.order !== expectedLesson.order || catalogLesson.estimatedMinutes !== expectedLesson.estimatedMinutes) {
          seedError(`${lessonPath} não corresponde aos metadados públicos da aula.`);
        }
        catalogLessonIds.push(catalogLesson.id);
      });
    });

    const expectedLessonCount = expectedModules.reduce((total, module) => total + Object.values(lessons)
      .filter((lesson) => lesson.courseId === data.courseId && lesson.moduleId === module.id && lesson.status === 'published').length, 0);
    if (data.lessonCount !== expectedLessonCount || catalogLessonIds.length !== expectedLessonCount) {
      seedError(`${path}.lessonCount não corresponde às aulas publicadas do curso.`);
    }
  });
}

export function validateEducationSeedData(manifest) {
  COLLECTIONS.forEach((collectionName) => getCollection(manifest, collectionName));

  const tracks = getCollection(manifest, 'tracks');
  const courses = getCollection(manifest, 'courses');
  const modules = getCollection(manifest, 'modules');
  const lessons = getCollection(manifest, 'lessons');
  const concepts = getCollection(manifest, 'concepts');
  const activities = getCollection(manifest, 'activities');
  const practicalExercises = getCollection(manifest, 'practicalExercises');
  const courseCatalogs = getCollection(manifest, 'courseCatalogs');

  Object.entries(tracks).forEach(([id, data]) => {
    const path = `tracks/${id}`;
    validateBaseDocument(data, path);
    requireText(data.slug, 'slug', path);
    requireText(data.title, 'title', path);
    requireText(data.description, 'description', path);
  });

  Object.entries(courses).forEach(([id, data]) => {
    const path = `courses/${id}`;
    validateBaseDocument(data, path);
    requireReference(data.trackId, tracks, 'trackId', path);
    requireText(data.slug, 'slug', path);
    requireText(data.title, 'title', path);
    requireText(data.description, 'description', path);
    if (data.estimatedMinutes !== undefined && (!Number.isFinite(data.estimatedMinutes) || data.estimatedMinutes < 0)) {
      seedError(`${path}.estimatedMinutes deve ser um número válido maior ou igual a zero.`);
    }
  });

  Object.entries(modules).forEach(([id, data]) => {
    const path = `modules/${id}`;
    validateBaseDocument(data, path);
    requireReference(data.courseId, courses, 'courseId', path);
    if (data.status === 'published' && courses[data.courseId].status !== 'published') {
      seedError(`${path} publicada deve pertencer a um curso publicado.`);
    }
    requireText(data.title, 'title', path);
    requireText(data.description, 'description', path);
  });

  Object.entries(lessons).forEach(([id, data]) => {
    const path = `lessons/${id}`;
    validateBaseDocument(data, path);
    requireReference(data.courseId, courses, 'courseId', path);
    requireReference(data.moduleId, modules, 'moduleId', path);
    if (modules[data.moduleId].courseId !== data.courseId) seedError(`${path}.moduleId não pertence ao curso informado.`);
    if (data.status === 'published' && courses[data.courseId].status !== 'published') {
      seedError(`${path} publicada deve pertencer a um curso publicado.`);
    }
    if (data.status === 'published' && modules[data.moduleId].status !== 'published') {
      seedError(`${path} publicada deve pertencer a um módulo publicado.`);
    }
    requireText(data.slug, 'slug', path);
    if (data.courseSlug !== undefined) {
      requireText(data.courseSlug, 'courseSlug', path);
      if (data.courseSlug !== courses[data.courseId].slug) seedError(`${path}.courseSlug não corresponde ao curso informado.`);
    }
    requireText(data.title, 'title', path);
    requireText(data.description, 'description', path);
    const hasInteractiveSteps = Array.isArray(data.steps) && data.steps.length > 0;
    if (data.status === 'published') {
      if (!Array.isArray(data.objectives) || data.objectives.length < (hasInteractiveSteps ? 1 : 3)) seedError(`${path}.objectives deve conter objetivos pedagógicos suficientes para a aula publicada.`);
      data.objectives.forEach((objective, index) => requireText(objective, `objectives[${index}]`, path));
      validateExamples(data.content, path);
      if (hasInteractiveSteps) validateInteractiveSteps(data.steps, concepts, data.conceptIds, path);
      else validateLessonSections(data.sections, path);
    } else {
      if (data.objectives !== undefined) {
        if (!Array.isArray(data.objectives)) seedError(`${path}.objectives deve ser uma lista quando informado.`);
        data.objectives.forEach((objective, index) => requireText(objective, `objectives[${index}]`, path));
      }
      if (data.content !== undefined) validateExamples(data.content, path);
      if (data.sections !== undefined) validateLessonSections(data.sections, path);
      if (data.steps !== undefined) validateInteractiveSteps(data.steps, concepts, data.conceptIds ?? [], path);
    }
    validateVideo(data.video, path);
    validateConceptIds(data.conceptIds, concepts, path);
    if (data.status === 'published') {
      data.conceptIds.forEach((conceptId) => {
        if (concepts[conceptId].status !== 'published') {
          seedError(`${path}.conceptIds contém "${conceptId}", que não está publicado.`);
        }
      });
    }
  });

  Object.entries(concepts).forEach(([id, data]) => {
    const path = `concepts/${id}`;
    validateBaseDocument(data, path);
    requireText(data.name, 'name', path);
    requireText(data.description, 'description', path);
    requireText(data.category, 'category', path);
  });

  Object.entries(activities).forEach(([id, data]) => {
    const path = `activities/${id}`;
    validateBaseDocument(data, path);
    requireReference(data.lessonId, lessons, 'lessonId', path);
    requireReference(data.courseId, courses, 'courseId', path);
    requireReference(data.moduleId, modules, 'moduleId', path);
    if (lessons[data.lessonId].courseId !== data.courseId) seedError(`${path}.courseId não corresponde à aula informada.`);
    if (lessons[data.lessonId].moduleId !== data.moduleId) seedError(`${path}.moduleId não corresponde à aula informada.`);
    if (data.status === 'published' && courses[data.courseId].status !== 'published') {
      seedError(`${path} publicada deve pertencer a um curso publicado.`);
    }
    if (data.status === 'published' && modules[data.moduleId].status !== 'published') {
      seedError(`${path} publicada deve pertencer a um módulo publicado.`);
    }
    requireText(data.slug, 'slug', path);
    requireText(data.type, 'type', path);
    if (!ACTIVITY_TYPES.has(data.type)) seedError(`${path}.type possui um tipo não suportado.`);
    requireText(data.title, 'title', path);
    requireText(data.description, 'description', path);
    requireText(data.instructions, 'instructions', path);
    validateConceptIds(data.conceptIds, concepts, path);
    if (data.status === 'published') {
      data.conceptIds.forEach((conceptId) => {
        if (concepts[conceptId].status !== 'published') {
          seedError(`${path}.conceptIds contém "${conceptId}", que não está publicado.`);
        }
      });
    }
    validateObjectiveQuestions(data.questions, concepts, lessons[data.lessonId].conceptIds, path);
    const masteryConceptIds = new Set(data.questions.flatMap((question) => question.conceptIds));
    if (data.status === 'published' && masteryConceptIds.size > MAX_MASTERY_CONCEPTS_PER_ACTIVITY) {
      seedError(`${path}.questions usa ${masteryConceptIds.size} conceitos distintos; o máximo seguro por atividade publicada é ${MAX_MASTERY_CONCEPTS_PER_ACTIVITY}.`);
    }
    if (data.status === 'published' && data.questions.length < 6) seedError(`${path}.questions deve conter pelo menos seis questões em uma atividade publicada.`);
    if (data.status === 'published' && lessons[data.lessonId].status !== 'published') seedError(`${path}.lessonId deve apontar para uma aula publicada.`);
  });

  validatePracticalExercises(practicalExercises, courses, modules, lessons, concepts);
  validatePublicCourseCatalogs(courseCatalogs, courses, modules, lessons);

  Object.entries(lessons).filter(([, lesson]) => lesson.status === 'published' && !Array.isArray(lesson.steps)).forEach(([lessonId]) => {
    const hasActivity = Object.values(activities).some((activity) => activity.status === 'published' && activity.lessonId === lessonId);
    if (!hasActivity) seedError(`lessons/${lessonId} publicada deve possuir ao menos uma atividade publicada.`);
  });

  const difficultyCounts = Object.values(activities).flatMap((activity) => activity.questions).reduce((counts, question) => ({ ...counts, [question.difficulty]: counts[question.difficulty] + 1 }), { basic: 0, intermediate: 0, application: 0 });
  const correctAnswerPositions = getCorrectAnswerPositionSummary(activities);
  return { ...Object.fromEntries(COLLECTIONS.map((collectionName) => [collectionName, Object.keys(manifest[collectionName]).length])), questionDifficulties: difficultyCounts, applicationTargetMet: difficultyCounts.application >= 20, correctAnswerPositions };
}
