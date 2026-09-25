import { z } from 'zod';

const POST_TYPES = ['question', 'discussion'] as const;
const REPORT_REASONS = ['spam', 'harassment', 'offensive', 'dangerous', 'other'] as const;

const COMMUNITY_LIMITS = {
  title: { min: 5, max: 140 },
  postBody: { min: 10, max: 5000 },
  replyBody: { min: 2, max: 3000 },
  tags: { max: 5, tagMax: 30 },
} as const;

function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeBody(value: string): string {
  return value.trim();
}

function normalizeTags(value: string): string[] {
  const tags = value
    .split(',')
    .map((tag) => tag
      .trim()
      .toLowerCase()
      .replace(/^#/, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''))
    .filter(Boolean);
  return [...new Set(tags)];
}

const postTitleSchema = z
  .string()
  .transform(normalizeSpaces)
  .pipe(z.string().min(COMMUNITY_LIMITS.title.min, `O título deve ter entre ${COMMUNITY_LIMITS.title.min} e ${COMMUNITY_LIMITS.title.max} caracteres.`).max(COMMUNITY_LIMITS.title.max, `O título deve ter entre ${COMMUNITY_LIMITS.title.min} e ${COMMUNITY_LIMITS.title.max} caracteres.`));

const postBodySchema = z
  .string()
  .transform(normalizeBody)
  .pipe(z.string().min(COMMUNITY_LIMITS.postBody.min, `O conteúdo deve ter entre ${COMMUNITY_LIMITS.postBody.min} e ${COMMUNITY_LIMITS.postBody.max} caracteres.`).max(COMMUNITY_LIMITS.postBody.max, `O conteúdo deve ter entre ${COMMUNITY_LIMITS.postBody.min} e ${COMMUNITY_LIMITS.postBody.max} caracteres.`));

const replyBodySchema = z
  .string()
  .transform(normalizeBody)
  .pipe(z.string().min(COMMUNITY_LIMITS.replyBody.min, `A resposta deve ter entre ${COMMUNITY_LIMITS.replyBody.min} e ${COMMUNITY_LIMITS.replyBody.max} caracteres.`).max(COMMUNITY_LIMITS.replyBody.max, `A resposta deve ter entre ${COMMUNITY_LIMITS.replyBody.min} e ${COMMUNITY_LIMITS.replyBody.max} caracteres.`));

const tagsSchema = z
  .string()
  .max(180)
  .superRefine((value, context) => {
    const tags = normalizeTags(value);
    if (tags.length > COMMUNITY_LIMITS.tags.max) {
      context.addIssue({ code: 'custom', message: `Use no máximo ${COMMUNITY_LIMITS.tags.max} tags.` });
    }
    if (tags.some((tag) => tag.length > COMMUNITY_LIMITS.tags.tagMax)) {
      context.addIssue({ code: 'custom', message: `Cada tag pode ter no máximo ${COMMUNITY_LIMITS.tags.tagMax} caracteres.` });
    }
  });

export const communityPostSchema = z.object({
  type: z.enum(POST_TYPES, { message: 'Escolha se esta publicação é uma pergunta ou uma discussão.' }),
  title: postTitleSchema,
  body: postBodySchema,
  tags: tagsSchema,
});

export const replySchema = z.object({
  body: replyBodySchema,
});

export const reportSchema = z
  .object({
    reason: z.enum(REPORT_REASONS, { message: 'Escolha um motivo para a denúncia.' }),
    details: z
      .string()
      .transform(normalizeBody)
      .pipe(z.string().max(1000, 'Os detalhes podem ter no máximo 1000 caracteres.')),
  })
  .refine((values) => values.reason !== 'other' || values.details.length >= 5, {
    path: ['details'],
    message: 'Explique o motivo da denúncia em pelo menos 5 caracteres.',
  });

export const moderationReviewSchema = z.object({
  resolutionNote: z
    .string()
    .transform(normalizeBody)
    .pipe(z.string().max(1000, 'A observação da moderação pode ter no máximo 1000 caracteres.')),
});

export type CommunityPostFormValues = z.infer<typeof communityPostSchema>;
export type ReplyFormValues = z.infer<typeof replySchema>;
export type ReportFormValues = z.infer<typeof reportSchema>;
export type ModerationReviewFormValues = z.infer<typeof moderationReviewSchema>;
