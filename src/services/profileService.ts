import { updateProfile as updateAuthenticationProfile } from 'firebase/auth';
import {
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
} from 'firebase/firestore';
import { auth } from '../lib/firebase/auth';
import { db } from '../lib/firebase/firestore';
import type {
  ExperienceLevel,
  LearningGoal,
  OnboardingSelection,
  ProfileFieldValidation,
  ProfileFormValues,
  PublicUserProfile,
  UserAccount,
  UserRole,
} from '../types/user';
import { normalizeUsername, validateUsername } from './authService';

export const EXPERIENCE_LEVELS: readonly ExperienceLevel[] = [
  'never-programmed',
  'some-contact',
  'basic-knowledge',
];

export const LEARNING_GOALS: readonly LearningGoal[] = [
  'learn-from-zero',
  'web-development',
  'review-knowledge',
  'build-projects',
];

const MAX_DISPLAY_NAME_LENGTH = 80;
const MAX_BIO_LENGTH = 280;

function requireFirestore(): Firestore {
  if (!db) throw new Error('A configuração do Firebase ainda não está disponível.');
  return db;
}

function isDocumentData(value: unknown): value is DocumentData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readOptionalText(data: DocumentData, field: string): string | undefined {
  const value: unknown = data[field];
  return typeof value === 'string' ? value : undefined;
}

function readTimestamp(data: DocumentData, field: string): Timestamp | undefined {
  const value: unknown = data[field];
  return value instanceof Timestamp ? value : undefined;
}

function readUserRole(value: unknown): UserRole | undefined {
  return value === 'student' || value === 'moderator' || value === 'admin' ? value : undefined;
}

export function isExperienceLevel(value: unknown): value is ExperienceLevel {
  return value === 'never-programmed' || value === 'some-contact' || value === 'basic-knowledge';
}

export function isLearningGoal(value: unknown): value is LearningGoal {
  return value === 'learn-from-zero' || value === 'web-development' || value === 'review-knowledge' || value === 'build-projects';
}

function mapPrivateProfile(snapshot: DocumentSnapshot<DocumentData>): UserAccount | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const displayName = readOptionalText(data, 'displayName');
  const username = readOptionalText(data, 'username');
  const usernameNormalized = readOptionalText(data, 'usernameNormalized');
  const photoURL = readOptionalText(data, 'photoURL');
  const bio = readOptionalText(data, 'bio');
  const role = readUserRole(data.role);
  const emailVerified = typeof data.emailVerified === 'boolean' ? data.emailVerified : undefined;
  const onboardingCompleted = typeof data.onboardingCompleted === 'boolean' ? data.onboardingCompleted : undefined;
  const experienceLevel = isExperienceLevel(data.experienceLevel) || data.experienceLevel === '' ? data.experienceLevel : undefined;
  const learningGoal = isLearningGoal(data.learningGoal) || data.learningGoal === '' ? data.learningGoal : undefined;
  const termsAcceptedAt = readTimestamp(data, 'termsAcceptedAt');
  const termsVersion = readOptionalText(data, 'termsVersion');
  const privacyAcceptedAt = readTimestamp(data, 'privacyAcceptedAt');
  const privacyVersion = readOptionalText(data, 'privacyVersion');
  const createdAt = readTimestamp(data, 'createdAt');
  const updatedAt = readTimestamp(data, 'updatedAt');

  return {
    id: snapshot.id,
    ...(displayName === undefined ? {} : { displayName }),
    ...(username === undefined ? {} : { username }),
    ...(usernameNormalized === undefined ? {} : { usernameNormalized }),
    ...(photoURL === undefined ? {} : { photoURL }),
    ...(bio === undefined ? {} : { bio }),
    ...(role === undefined ? {} : { role }),
    ...(emailVerified === undefined ? {} : { emailVerified }),
    ...(onboardingCompleted === undefined ? {} : { onboardingCompleted }),
    ...(experienceLevel === undefined ? {} : { experienceLevel }),
    ...(learningGoal === undefined ? {} : { learningGoal }),
    ...(termsAcceptedAt === undefined ? {} : { termsAcceptedAt }),
    ...(termsVersion === undefined ? {} : { termsVersion }),
    ...(privacyAcceptedAt === undefined ? {} : { privacyAcceptedAt }),
    ...(privacyVersion === undefined ? {} : { privacyVersion }),
    ...(createdAt === undefined ? {} : { createdAt }),
    ...(updatedAt === undefined ? {} : { updatedAt }),
  };
}

function mapPublicProfile(snapshot: DocumentSnapshot<DocumentData>): PublicUserProfile | null {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const uid = readOptionalText(data, 'uid');
  const displayName = readOptionalText(data, 'displayName');
  const username = readOptionalText(data, 'username');
  if (!uid || !displayName || !username) return null;

  const usernameNormalized = readOptionalText(data, 'usernameNormalized');
  const photoURL = readOptionalText(data, 'photoURL');
  const bio = readOptionalText(data, 'bio');
  const createdAt = readTimestamp(data, 'createdAt');
  const updatedAt = readTimestamp(data, 'updatedAt');
  return {
    id: snapshot.id,
    uid,
    displayName,
    username,
    ...(usernameNormalized === undefined ? {} : { usernameNormalized }),
    ...(photoURL === undefined ? {} : { photoURL }),
    ...(bio === undefined ? {} : { bio }),
    ...(createdAt === undefined ? {} : { createdAt }),
    ...(updatedAt === undefined ? {} : { updatedAt }),
  };
}

export function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeBio(value: string): string {
  return value.trim().replace(/\s{2,}/g, ' ');
}

export function validateProfileFields({ displayName, bio }: ProfileFormValues): ProfileFieldValidation {
  const normalizedDisplayName = normalizeDisplayName(displayName);
  const normalizedBio = normalizeBio(bio);

  if (normalizedDisplayName.length < 2 || normalizedDisplayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return { error: `Use um nome entre 2 e ${MAX_DISPLAY_NAME_LENGTH} caracteres.` };
  }

  if (normalizedBio.length > MAX_BIO_LENGTH) {
    return { error: `A bio pode ter no máximo ${MAX_BIO_LENGTH} caracteres.` };
  }

  return { data: { displayName: normalizedDisplayName, bio: normalizedBio } };
}

export function getAvatarInitials(displayName?: string, username = ''): string {
  const words = (displayName || username).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'DQ';
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('');
}

export async function getPrivateProfile(uid: string): Promise<UserAccount | null> {
  const firestore = requireFirestore();
  const snapshot = await getDoc(doc(firestore, 'users', uid));
  return mapPrivateProfile(snapshot);
}

export async function getPublicProfile(username: string | undefined): Promise<PublicUserProfile | null> {
  const firestore = requireFirestore();
  const normalizedUsername: string = normalizeUsername(username ?? '');
  if (validateUsername(normalizedUsername)) return null;

  const snapshot = await getDoc(doc(firestore, 'profiles', normalizedUsername));
  return mapPublicProfile(snapshot);
}

export async function updateUserProfile(uid: string, values: ProfileFormValues): Promise<UserAccount> {
  const firestore = requireFirestore();
  const currentUser = auth?.currentUser;
  if (!currentUser || currentUser.uid !== uid) throw new Error('Sua sessão não permite editar este perfil.');

  const validation = validateProfileFields(values);
  if (validation.error) throw new Error(validation.error);

  const userRef = doc(firestore, 'users', uid);
  const userSnapshot = await getDoc(userRef);
  const currentProfile = mapPrivateProfile(userSnapshot);
  if (!currentProfile) throw new Error('Não foi possível encontrar os dados da sua conta.');

  const username = currentProfile.username;
  const usernameNormalized = currentProfile.usernameNormalized;
  if (!username || !usernameNormalized || validateUsername(usernameNormalized)) {
    throw new Error('O username da conta está inválido.');
  }

  const profileRef = doc(firestore, 'profiles', usernameNormalized);
  const publicSnapshot = await getDoc(profileRef);
  const photoURL = currentProfile.photoURL ?? '';
  const sharedFields = {
    displayName: validation.data.displayName,
    bio: validation.data.bio,
    photoURL,
    updatedAt: serverTimestamp(),
  };

  const batch = writeBatch(firestore);
  batch.update(userRef, sharedFields);

  if (publicSnapshot.exists()) {
    batch.update(profileRef, sharedFields);
  } else {
    batch.set(profileRef, {
      uid,
      username,
      usernameNormalized,
      ...sharedFields,
    });
  }

  await batch.commit();

  try {
    await updateAuthenticationProfile(currentUser, { displayName: validation.data.displayName });
  } catch {
    // O Firestore continua como fonte de verdade do perfil; a próxima sessão tenta atualizar o Auth novamente.
  }

  return { ...currentProfile, ...validation.data, photoURL };
}

export async function completeOnboarding(uid: string, { experienceLevel, learningGoal }: OnboardingSelection): Promise<void> {
  const firestore = requireFirestore();
  if (auth?.currentUser?.uid !== uid) throw new Error('Sua sessão não permite concluir o onboarding.');
  if (!isExperienceLevel(experienceLevel) || !isLearningGoal(learningGoal)) {
    throw new Error('Escolha uma experiência e um objetivo válidos para continuar.');
  }

  await updateDoc(doc(firestore, 'users', uid), {
    experienceLevel,
    learningGoal,
    onboardingCompleted: true,
    updatedAt: serverTimestamp(),
  });
}
