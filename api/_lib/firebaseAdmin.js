import { cert, getApp, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const ADMIN_APP_NAME = 'learndev-admin';

export function getRequiredEnvironmentValue(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error('Configuração de servidor indisponível.');
  return value;
}

/** Reutiliza uma única instância Firebase Admin por execução da função Vercel. */
export function getAdminApp() {
  try {
    return getApp(ADMIN_APP_NAME);
  } catch {
    const projectId = getRequiredEnvironmentValue('FIREBASE_PROJECT_ID');
    const clientEmail = getRequiredEnvironmentValue('FIREBASE_CLIENT_EMAIL');
    const privateKey = getRequiredEnvironmentValue('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }, ADMIN_APP_NAME);
  }
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
