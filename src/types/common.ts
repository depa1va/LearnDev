import type { Timestamp } from 'firebase/firestore';

export type Nullable<T> = T | null;

export interface FirestoreDocument {
  id: string;
}

export interface TimestampedDocument {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = Exclude<ThemeMode, 'system'>;

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
}
