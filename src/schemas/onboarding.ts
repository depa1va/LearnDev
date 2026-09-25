import { z } from 'zod';

export const onboardingSchema = z.object({
  experienceLevel: z.enum(['never-programmed', 'some-contact', 'basic-knowledge'], {
    message: 'Escolha sua experiência atual para continuar.',
  }),
  learningGoal: z.enum(['learn-from-zero', 'web-development', 'review-knowledge', 'build-projects'], {
    message: 'Escolha seu objetivo principal para continuar.',
  }),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
