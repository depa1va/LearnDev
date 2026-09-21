import type { Timestamp } from 'firebase/firestore';
import type { FirestoreDocument, TimestampedDocument } from './common';

export type UserRole = 'student' | 'moderator' | 'admin';

export type ExperienceLevel = 'never-programmed' | 'some-contact' | 'basic-knowledge';

export type LearningGoal = 'learn-from-zero' | 'web-development' | 'review-knowledge' | 'build-projects';

export interface ProfileFormValues {
  displayName: string;
  bio: string;
}

export type ProfileFieldValidation =
  | { data: ProfileFormValues; error?: never }
  | { error: string; data?: never };

export interface OnboardingSelection {
  experienceLevel: ExperienceLevel;
  learningGoal: LearningGoal;
}

export interface UserAccount extends FirestoreDocument, TimestampedDocument {
  displayName?: string;
  username?: string;
  usernameNormalized?: string;
  photoURL?: string;
  bio?: string;
  role?: UserRole;
  emailVerified?: boolean;
  onboardingCompleted?: boolean;
  experienceLevel?: ExperienceLevel | '';
  learningGoal?: LearningGoal | '';
  termsAcceptedAt?: Timestamp;
  termsVersion?: string;
  privacyAcceptedAt?: Timestamp;
  privacyVersion?: string;
}

export interface PublicUserProfile extends FirestoreDocument, TimestampedDocument {
  uid: string;
  displayName: string;
  username: string;
  usernameNormalized?: string;
  photoURL?: string;
  bio?: string;
}
