import { cert, getApp, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const ADMIN_APP_NAME = 'learndev-admin';

export function getRequiredEnvironmentValue(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error('Configuração de servidor indisponível.');
  return value;
}

/**
 * Integração exclusiva do servidor: reutiliza uma instância Firebase Admin por execução da Vercel.
 * FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY são obtidos apenas de process.env
 * e não são importados por src/, portanto não podem ser incluídos no bundle do navegador.
 */
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
