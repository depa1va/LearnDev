import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail.')
  .email('Informe um e-mail válido.');

const passwordSchema = z
  .string()
  .min(6, 'Use uma senha com pelo menos 6 caracteres.');

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe sua senha.'),
});

export const signUpSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Informe um nome entre 2 e 80 caracteres.')
      .max(80, 'Informe um nome entre 2 e 80 caracteres.'),
    username: z
      .string()
      .trim()
      .min(3, 'Use de 3 a 20 caracteres: letras, números ou underscore.')
      .max(20, 'Use de 3 a 20 caracteres: letras, números ou underscore.')
      .regex(/^[a-zA-Z0-9_]+$/, 'Use de 3 a 20 caracteres: letras, números ou underscore.'),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, 'Confirme sua senha.'),
    hasAcceptedLegalTerms: z.boolean().refine((value) => value, {
      message: 'Você precisa aceitar os Termos de Uso e a Política de Privacidade.',
    }),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'A confirmação de senha não corresponde à senha informada.',
  });

export const passwordRecoverySchema = z.object({
  email: emailSchema,
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type PasswordRecoveryFormValues = z.infer<typeof passwordRecoverySchema>;
