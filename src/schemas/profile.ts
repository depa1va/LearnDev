import { z } from 'zod';

function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeBio(value: string): string {
  return value.trim().replace(/\s{2,}/g, ' ');
}

export const profileSchema = z.object({
  displayName: z
    .string()
    .transform(normalizeDisplayName)
    .pipe(z.string().min(2, 'Use um nome entre 2 e 80 caracteres.').max(80, 'Use um nome entre 2 e 80 caracteres.')),
  bio: z
    .string()
    .transform(normalizeBio)
    .pipe(z.string().max(280, 'A bio pode ter no máximo 280 caracteres.')),
  showLearningInfo: z.boolean(),
});

export const usernameSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .toLowerCase()
    .max(20, 'Use de 1 a 20 caracteres: letras, números ou underscore.')
    .regex(/^[a-z0-9_]*$/, 'Use de 1 a 20 caracteres: letras, números ou underscore.'),
});

export type ProfileFormSchemaValues = z.infer<typeof profileSchema>;
export type UsernameSearchFormValues = z.infer<typeof usernameSearchSchema>;
