import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  type Auth,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import { PRIVACY_VERSION, TERMS_VERSION } from '../config/legal';
import { auth } from '../lib/firebase/auth';
import { db } from '../lib/firebase/firestore';

export interface RegisterUserInput {
  displayName: string;
  username: string;
  email: string;
  password: string;
  hasAcceptedLegalTerms: boolean;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface RegisteredUser {
  user: User;
  verificationEmailSent: boolean;
}

interface FirebaseServices {
  authentication: Auth;
  firestore: Firestore;
}

interface VerificationResponsePayload {
  sent?: boolean;
  code?: string;
  message?: string;
}

class VerificationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function validateUsername(value: string): string | null {
  const normalized = normalizeUsername(value);
  if (!USERNAME_PATTERN.test(normalized)) {
    return 'Use de 3 a 20 caracteres: letras, números ou underscore.';
  }
  return null;
}

/**
 * Consulta pontualmente a reserva pública de username para orientar o cadastro.
 * A transação de registerUser continua sendo a proteção definitiva contra concorrência.
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const normalizedUsername = normalizeUsername(username);
  if (validateUsername(normalizedUsername)) return false;
  if (!db) throw new Error('A configuração do Firebase ainda não está disponível.');

  const usernameSnapshot = await getDoc(doc(db, 'usernames', normalizedUsername));
  return !usernameSnapshot.exists();
}

function requireFirebaseServices(): FirebaseServices {
  if (!auth || !db) throw new Error('A configuração do Firebase ainda não está disponível.');
  return { authentication: auth, firestore: db };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorCode(error: unknown): string | null {
  if (error instanceof FirebaseError) return error.code;
  if (isRecord(error) && typeof error.code === 'string') return error.code;
  return null;
}

function getErrorMessage(error: unknown): string | null {
  return error instanceof Error && error.message ? error.message : null;
}

async function getResponsePayload(response: Response): Promise<VerificationResponsePayload | null> {
  try {
    const payload: unknown = await response.json();
    if (!isRecord(payload)) return null;

    return {
      ...(typeof payload.sent === 'boolean' ? { sent: payload.sent } : {}),
      ...(typeof payload.code === 'string' ? { code: payload.code } : {}),
      ...(typeof payload.message === 'string' ? { message: payload.message } : {}),
    };
  } catch {
    return null;
  }
}

/**
 * API: POST /api/auth/send-verification
 *
 * Objetivo: solicitar o e-mail transacional de verificação sem expor a chave do Resend.
 * Autenticação: Firebase ID Token da sessão no header Authorization; não há corpo de requisição.
 * Funcionamento: o servidor valida o token e define o destinatário a partir da conta autenticada.
 * Retorno: { sent: true } em caso de sucesso; erros possuem code e message seguros para a interface.
 */
async function sendCustomVerificationEmail(user: User | null = auth?.currentUser ?? null): Promise<VerificationResponsePayload> {
  if (!user) {
    throw new VerificationError('verification/unauthenticated', 'Sua sessão expirou. Entre novamente para continuar.');
  }

  let idToken: string;
  try {
    idToken = await user.getIdToken();
  } catch {
    throw new VerificationError('verification/unauthenticated', 'Sua sessão expirou. Entre novamente para continuar.');
  }

  let response: Response;
  try {
    response = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  } catch {
    throw new VerificationError('verification/email-delivery-failed', 'Não foi possível enviar o e-mail de confirmação agora.');
  }

  const payload = await getResponsePayload(response);
  if (response.ok && payload?.sent === true) return payload;

  const errorCode = payload?.code
    ?? (response.status === 401 ? 'verification/unauthenticated' : 'verification/email-delivery-failed');
  const message = payload?.message ?? 'Não foi possível enviar o e-mail de confirmação agora.';
  throw new VerificationError(errorCode, message);
}

function isKnownProvisioningFailure(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === 'username-taken'
    || code === 'permission-denied'
    || code === 'invalid-argument'
    || code === 'failed-precondition';
}

export async function registerUser({
  displayName,
  username,
  email,
  password,
  hasAcceptedLegalTerms,
}: RegisterUserInput): Promise<RegisteredUser> {
  const { authentication, firestore } = requireFirebaseServices();

  if (hasAcceptedLegalTerms !== true) {
    throw new Error('Você precisa aceitar os Termos de Uso e a Política de Privacidade para criar sua conta.');
  }

  const normalizedUsername = normalizeUsername(username);
  const usernameError = validateUsername(normalizedUsername);
  if (usernameError) throw new Error(usernameError);

  const credential: UserCredential = await createUserWithEmailAndPassword(authentication, email.trim(), password);
  const user = credential.user;

  try {
    const userRef = doc(firestore, 'users', user.uid);
    const usernameRef = doc(firestore, 'usernames', normalizedUsername);
    const profileRef = doc(firestore, 'profiles', normalizedUsername);

    // A transação é reexecutada pelo Firestore em caso de concorrência e confirma a reserva antes de gravar os três documentos.
    await runTransaction(firestore, async (transaction) => {
      const usernameSnapshot = await transaction.get(usernameRef);
      if (usernameSnapshot.exists()) {
        throw new VerificationError('username-taken', 'Esse username já está em uso. Escolha outro.');
      }

      transaction.set(usernameRef, {
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      transaction.set(userRef, {
        displayName: displayName.trim(),
        username: normalizedUsername,
        usernameNormalized: normalizedUsername,
        photoURL: '',
        bio: '',
        role: 'student',
        emailVerified: false,
        onboardingCompleted: false,
        experienceLevel: '',
        learningGoal: '',
        showLearningInfo: false,
        termsAcceptedAt: serverTimestamp(),
        termsVersion: TERMS_VERSION,
        privacyAcceptedAt: serverTimestamp(),
        privacyVersion: PRIVACY_VERSION,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      transaction.set(profileRef, {
        uid: user.uid,
        displayName: displayName.trim(),
        username: normalizedUsername,
        usernameNormalized: normalizedUsername,
        photoURL: '',
        bio: '',
        showLearningInfo: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    try {
      await updateProfile(user, { displayName: displayName.trim() });
    } catch {
      // O perfil privado e o perfil público continuam sendo a fonte de verdade desta fase.
    }

    try {
      await sendCustomVerificationEmail(user);
      return { user, verificationEmailSent: true };
    } catch {
      // A conta existe e a tela de verificação permite uma nova tentativa sem ocultar esse estado.
      return { user, verificationEmailSent: false };
    }
  } catch (error: unknown) {
    // Em erros conhecidos, a transação não foi confirmada. A conta recém-criada pode ser removida com segurança.
    if (isKnownProvisioningFailure(error)) {
      try {
        await deleteUser(user);
      } catch {
        // A documentação explica o caso excepcional de falha de limpeza.
      }
    }
    throw error;
  }
}

export async function loginUser({ email, password }: LoginUserInput): Promise<User | null> {
  const { authentication } = requireFirebaseServices();
  const credential: UserCredential = await signInWithEmailAndPassword(authentication, email.trim(), password);
  await credential.user.reload();
  await credential.user.getIdToken(true);
  return authentication.currentUser;
}

export async function resendVerificationEmail(): Promise<void> {
  const { authentication } = requireFirebaseServices();
  await sendCustomVerificationEmail(authentication.currentUser);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { authentication } = requireFirebaseServices();
  try {
    await sendPasswordResetEmail(authentication, email.trim());
  } catch (error: unknown) {
    // Não revela se o endereço possui ou não uma conta cadastrada.
    if (getErrorCode(error) !== 'auth/user-not-found') throw error;
  }
}

export async function syncEmailVerification(user: User | null | undefined): Promise<void> {
  if (!db || !user) return;
  await updateDoc(doc(db, 'users', user.uid), {
    emailVerified: Boolean(user.emailVerified),
    updatedAt: serverTimestamp(),
  });
}

export function getAuthErrorMessage(error: unknown, fallback = 'Não foi possível concluir esta ação. Tente novamente.'): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já está em uso.',
    'auth/invalid-email': 'Informe um e-mail válido.',
    'auth/invalid-credential': 'E-mail ou senha inválidos.',
    'auth/user-not-found': 'E-mail ou senha inválidos.',
    'auth/wrong-password': 'E-mail ou senha inválidos.',
    'auth/weak-password': 'Use uma senha com pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento antes de tentar novamente.',
    'auth/network-request-failed': 'Não foi possível conectar. Verifique sua internet e tente novamente.',
    'username-taken': 'Esse username já está em uso. Escolha outro.',
    'permission-denied': 'Não foi possível reservar esse username. Escolha outro e tente novamente.',
    'verification/unauthenticated': 'Sua sessão expirou. Entre novamente para continuar.',
    'verification/no-email': 'Não foi possível identificar um e-mail para esta conta.',
    'verification/already-verified': 'Este e-mail já foi confirmado.',
    'verification/rate-limited': 'Muitas solicitações de envio. Aguarde um momento antes de tentar novamente.',
    'verification/server-unavailable': 'O serviço de confirmação está indisponível no momento. Tente novamente mais tarde.',
    'verification/link-generation-failed': 'Não foi possível preparar o e-mail de confirmação agora.',
    'verification/email-delivery-failed': 'Não foi possível enviar o e-mail de confirmação agora.',
  };

  const code = getErrorCode(error);
  if (code && messages[code]) return messages[code];

  const message = getErrorMessage(error);
  if (message && (!code || !code.startsWith('auth/'))) return message;
  return fallback;
}
