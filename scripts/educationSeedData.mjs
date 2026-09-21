import { fundamentalsCurriculum } from './curriculum/fundamentalsCurriculum.mjs';

function sortByOrder(items) {
  return [...items].sort((first, second) => {
    const orderDifference = (first.order ?? 0) - (second.order ?? 0);
    return orderDifference || first.id.localeCompare(second.id);
  });
}

function createPublicCourseCatalogs({ courses, modules, lessons }) {
  return Object.fromEntries(
    Object.entries(courses)
      .filter(([, course]) => course.status === 'published')
      .map(([courseId, course]) => {
        const publishedModules = sortByOrder(
          Object.entries(modules)
            .filter(([, module]) => module.courseId === courseId && module.status === 'published')
            .map(([id, module]) => ({ id, ...module }))
        );

        const catalogModules = publishedModules.map((module) => {
          const catalogLessons = sortByOrder(
            Object.entries(lessons)
              .filter(([, lesson]) => lesson.courseId === courseId && lesson.moduleId === module.id && lesson.status === 'published')
              .map(([id, lesson]) => ({
                id,
                title: lesson.title,
                description: lesson.description,
                order: lesson.order,
                estimatedMinutes: lesson.estimatedMinutes,
              }))
          );

          return {
            id: module.id,
            title: module.title,
            description: module.description,
            order: module.order,
            lessons: catalogLessons,
          };
        });

        return [courseId, {
          courseId,
          courseSlug: course.slug,
          trackId: course.trackId,
          status: 'published',
          moduleCount: catalogModules.length,
          lessonCount: catalogModules.reduce((total, module) => total + module.lessons.length, 0),
          modules: catalogModules,
        }];
      })
  );
}

export const educationSeedData = {
  tracks: {
    'fundamentos-desenvolvimento': {
      slug: 'fundamentos-desenvolvimento',
      title: 'Fundamentos do Desenvolvimento',
      description: 'Uma formação progressiva para compreender lógica, Web e JavaScript a partir dos primeiros princípios.',
      order: 1,
      status: 'published',
    },
  },
  courses: fundamentalsCurriculum.courses,
  modules: fundamentalsCurriculum.modules,
  lessons: fundamentalsCurriculum.lessons,
  concepts: fundamentalsCurriculum.concepts,
  activities: fundamentalsCurriculum.activities,
  practicalExercises: fundamentalsCurriculum.practicalExercises,
  courseCatalogs: createPublicCourseCatalogs(fundamentalsCurriculum),
};
