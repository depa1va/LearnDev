import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';
import { auth } from './auth';
import { db } from './firestore';
import { storage } from './storage';

let connected = false;

export function connectFirebaseEmulators(): void {
  const useEmulators = import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
  if (!useEmulators || connected || !auth || !db || !storage) return;

  const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST?.trim() || '127.0.0.1';
  connected = true;
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectStorageEmulator(storage, host, 9199);
}
