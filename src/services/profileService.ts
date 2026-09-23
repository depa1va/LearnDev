import { updateProfile as updateAuthenticationProfile } from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
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
import { isLearnDevCloudinaryAvatarUrl } from './avatarService';
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
const PROFILE_SEARCH_LIMIT = 10;
const USERNAME_SEARCH_PATTERN = /^[a-z0-9_]{1,20}$/;

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
  const showLearningInfo = typeof data.showLearningInfo === 'boolean' ? data.showLearningInfo : undefined;
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
    ...(showLearningInfo === undefined ? {} : { showLearningInfo }),
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
  const showLearningInfo = typeof data.showLearningInfo === 'boolean' ? data.showLearningInfo : undefined;
  const experienceLevel = isExperienceLevel(data.experienceLevel) ? data.experienceLevel : undefined;
  const learningGoal = isLearningGoal(data.learningGoal) ? data.learningGoal : undefined;
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
    ...(showLearningInfo === undefined ? {} : { showLearningInfo }),
    ...(showLearningInfo !== true || experienceLevel === undefined ? {} : { experienceLevel }),
    ...(showLearningInfo !== true || learningGoal === undefined ? {} : { learningGoal }),
    ...(createdAt === undefined ? {} : { createdAt }),
    ...(updatedAt === undefined ? {} : { updatedAt }),
  };
}

export function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function isUsernameSearchPrefix(value: string): boolean {
  return USERNAME_SEARCH_PATTERN.test(normalizeUsername(value));
}

export function normalizeBio(value: string): string {
  return value.trim().replace(/\s{2,}/g, ' ');
}

export function validateProfileFields({ displayName, bio, showLearningInfo }: ProfileFormValues): ProfileFieldValidation {
  const normalizedDisplayName = normalizeDisplayName(displayName);
  const normalizedBio = normalizeBio(bio);

  if (normalizedDisplayName.length < 2 || normalizedDisplayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return { error: `Use um nome entre 2 e ${MAX_DISPLAY_NAME_LENGTH} caracteres.` };
  }

  if (normalizedBio.length > MAX_BIO_LENGTH) {
    return { error: `A bio pode ter no máximo ${MAX_BIO_LENGTH} caracteres.` };
  }

  if (typeof showLearningInfo !== 'boolean') {
    return { error: 'Escolha uma preferência válida para as informações de aprendizado.' };
  }

  return { data: { displayName: normalizedDisplayName, bio: normalizedBio, showLearningInfo } };
}

export function getAvatarInitials(displayName?: string, username = ''): string {
  const words = (displayName || username).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'DQ';
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('');
}

/** Aceita somente a URL HTTPS do asset de avatar previsto no Cloudinary. */
export function isCloudinaryAvatarUrl(value: string, uid: string): boolean {
  if (value === '') return true;
  return isLearnDevCloudinaryAvatarUrl(value, uid);
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

export async function searchPublicProfiles(queryText: string): Promise<PublicUserProfile[]> {
  const firestore = requireFirestore();
  const normalizedQuery = normalizeUsername(queryText);
  if (!isUsernameSearchPrefix(normalizedQuery)) return [];

  const snapshot = await getDocs(query(
    collection(firestore, 'profiles'),
    where('usernameNormalized', '>=', normalizedQuery),
    where('usernameNormalized', '<=', `${normalizedQuery}\uf8ff`),
    orderBy('usernameNormalized'),
    limit(PROFILE_SEARCH_LIMIT),
  ));

  return snapshot.docs.map(mapPublicProfile).filter((profile): profile is PublicUserProfile => profile !== null);
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
  const createdAt = currentProfile.createdAt;
  if (!createdAt) throw new Error('Não foi possível identificar a data de criação da sua conta.');

  const showLearningInfo = validation.data.showLearningInfo;
  const experienceLevel = currentProfile.experienceLevel;
  const learningGoal = currentProfile.learningGoal;
  if (showLearningInfo && (!isExperienceLevel(experienceLevel) || !isLearningGoal(learningGoal))) {
    throw new Error('Conclua o onboarding antes de exibir suas informações de aprendizado.');
  }

  const userFields = {
    displayName: validation.data.displayName,
    bio: validation.data.bio,
    photoURL,
    showLearningInfo,
    updatedAt: serverTimestamp(),
  };
  const publicFields = {
    displayName: validation.data.displayName,
    bio: validation.data.bio,
    photoURL,
    showLearningInfo,
    createdAt,
    updatedAt: serverTimestamp(),
  };

  const batch = writeBatch(firestore);
  batch.update(userRef, userFields);

  if (publicSnapshot.exists()) {
    batch.update(profileRef, showLearningInfo
      ? { ...publicFields, experienceLevel, learningGoal }
      : { ...publicFields, experienceLevel: deleteField(), learningGoal: deleteField() });
  } else {
    batch.set(profileRef, {
      uid,
      username,
      usernameNormalized,
      ...publicFields,
      ...(showLearningInfo ? { experienceLevel, learningGoal } : {}),
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

/** Atualiza o avatar privado e público no mesmo batch para manter os perfis consistentes. */
export async function updateUserAvatar(uid: string, photoURL: string): Promise<UserAccount> {
  const firestore = requireFirestore();
  const currentUser = auth?.currentUser;
  if (!currentUser || currentUser.uid !== uid) throw new Error('Sua sessão não permite editar este perfil.');
  if (!isCloudinaryAvatarUrl(photoURL, uid)) throw new Error('A URL da foto de perfil não é válida.');

  const userRef = doc(firestore, 'users', uid);
  const currentProfile = mapPrivateProfile(await getDoc(userRef));
  if (!currentProfile) throw new Error('Não foi possível encontrar os dados da sua conta.');

  const username = currentProfile.username;
  const usernameNormalized = currentProfile.usernameNormalized;
  const createdAt = currentProfile.createdAt;
  if (!username || !usernameNormalized || !createdAt || validateUsername(usernameNormalized)) {
    throw new Error('Os dados públicos deste perfil estão inválidos.');
  }

  const profileRef = doc(firestore, 'profiles', usernameNormalized);
  const publicSnapshot = await getDoc(profileRef);
  const batch = writeBatch(firestore);
  batch.update(userRef, { photoURL, updatedAt: serverTimestamp() });

  if (publicSnapshot.exists()) {
    batch.update(profileRef, { photoURL, updatedAt: serverTimestamp() });
  } else {
    batch.set(profileRef, {
      uid,
      displayName: currentProfile.displayName ?? username,
      username,
      usernameNormalized,
      photoURL,
      bio: currentProfile.bio ?? '',
      showLearningInfo: currentProfile.showLearningInfo ?? false,
      createdAt,
      updatedAt: serverTimestamp(),
      ...(currentProfile.showLearningInfo && isExperienceLevel(currentProfile.experienceLevel) && isLearningGoal(currentProfile.learningGoal)
        ? { experienceLevel: currentProfile.experienceLevel, learningGoal: currentProfile.learningGoal }
        : {}),
    });
  }

  await batch.commit();

  try {
    await updateAuthenticationProfile(currentUser, { photoURL: photoURL || null });
  } catch {
    // O Firestore continua como fonte de verdade; a próxima atualização de sessão reconcilia o Auth.
  }

  return { ...currentProfile, photoURL };
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
