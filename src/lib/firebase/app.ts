import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';

/**
 * Integração Firebase Web SDK: inicializa a aplicação cliente com variáveis VITE_ públicas.
 * Esses identificadores permitem conectar Auth, Firestore e Storage ao projeto, mas não concedem
 * privilégios administrativos. Credenciais do Firebase Admin permanecem exclusivamente em api/.
 */

type RequiredFirebaseEnvironmentVariable =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID';

const requiredVariables: RequiredFirebaseEnvironmentVariable[] = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

function getEnvironmentValue(name: RequiredFirebaseEnvironmentVariable): string {
  return import.meta.env[name]?.trim() ?? '';
}

export const firebaseConfigurationMissing: string[] = requiredVariables.filter((name) => !getEnvironmentValue(name));
export const isFirebaseConfigured = firebaseConfigurationMissing.length === 0;

export const firebaseConfig: FirebaseOptions = {
  apiKey: getEnvironmentValue('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvironmentValue('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvironmentValue('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvironmentValue('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvironmentValue('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvironmentValue('VITE_FIREBASE_APP_ID'),
};

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;
