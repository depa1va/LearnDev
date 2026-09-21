import { browserLocalPersistence, onAuthStateChanged, setPersistence, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { auth } from '../lib/firebase/auth';
import { firebaseConfigurationMissing, isFirebaseConfigured } from '../lib/firebase/app';
import { db } from '../lib/firebase/firestore';
import type { AuthContextValue } from '../types/auth';
import type { UserAccount, UserRole } from '../types/user';

const AuthContext = createContext<AuthContextValue | null>(null);
const MODERATION_ROLES = new Set<UserRole>(['moderator', 'admin']);

interface AuthProviderProps {
  children: ReactNode;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error('Não foi possível concluir a operação de autenticação.');
}

async function loadAccount(user: User | null): Promise<UserAccount | null> {
  if (!db || !user?.uid) return null;
  const snapshot = await getDoc(doc(db, 'users', user.uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured);
  const [isAccountLoading, setIsAccountLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState<Error | null>(null);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!auth?.currentUser) {
      setUser(null);
      return null;
    }

    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    const refreshedUser = auth.currentUser;
    setUser(refreshedUser);
    setIsAccountLoading(true);
    try {
      setAccount(await loadAccount(refreshedUser));
    } finally {
      setIsAccountLoading(false);
    }
    return refreshedUser;
  }, []);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      setIsAccountLoading(false);
      return undefined;
    }

    let unsubscribe;
    let cancelled = false;

    async function observeSession() {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        if (!cancelled) setAuthError(toError(error));
      }

      if (cancelled) return;

      unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
        if (!nextUser) {
          setUser(null);
          setAccount(null);
          setIsLoading(false);
          setIsAccountLoading(false);
          return;
        }

        setIsAccountLoading(true);
        try {
          await nextUser.reload();
          const currentUser = auth.currentUser;
          setUser(currentUser);
          setAccount(await loadAccount(currentUser));
        } catch (error) {
          setAuthError(toError(error));
          setUser(nextUser);
          setAccount(null);
        } finally {
          setIsLoading(false);
          setIsAccountLoading(false);
        }
      });
    }

    observeSession();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    if (!auth) return;
    await signOut(auth);
  }, []);

  const value = useMemo(
    (): AuthContextValue => {
      const role = account?.role ?? null;

      return {
        user,
        account,
        role,
        canModerate: role !== null && MODERATION_ROLES.has(role),
        isLoading,
        isAccountLoading,
        isConfigured: isFirebaseConfigured,
        isEmailVerified: Boolean(user?.emailVerified),
        authError,
        configurationMissing: firebaseConfigurationMissing,
        refreshUser,
        logout,
      };
    },
    [account, authError, isLoading, isAccountLoading, logout, refreshUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
