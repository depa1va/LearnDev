import { ReCaptchaV3Provider, initializeAppCheck, type AppCheck } from 'firebase/app-check';
import { firebaseApp } from './app';

let initialized = false;

export function initializeFirebaseAppCheck(): AppCheck | null {
  const siteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY?.trim();
  if (!firebaseApp || !siteKey || initialized) return null;

  initialized = true;
  return initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}
