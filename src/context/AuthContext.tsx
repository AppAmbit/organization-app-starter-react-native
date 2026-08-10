import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as AppAmbit from 'appambit';
import {
  login as loginRequest,
  register as registerRequest,
  deleteUser,
  type AuthUser,
} from '../services/AuthDB';
import {
  createSession,
  saveSessionLocally,
  getLocalSession,
  deleteSession,
  deleteAllUserSessions,
  clearLocalSession,
  restoreSession,
  validateCurrentSession,
} from '../services/SessionService';
import { clearAll as clearNotifications } from '../services/NotificationDB';

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<AuthUser | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    restoreSession()
      .then(result => {
        if (result) {
          setUser(result.user);
          result.onInvalidated.then(valid => {
            if (!valid) {
              clearLocalSession();
              clearNotifications();
              setUser(null);
            }
          });
        }
      })
      .catch(e => console.error('[Auth] restore failed:', e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && userRef.current) {
        checkSessionOnResume();
      }
    });
    return () => subscription.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkSessionOnResume = useCallback(async () => {
    let shouldLogout = false;
    try {
      const isValid = await validateCurrentSession();
      if (!isValid) {
        shouldLogout = true;
      }
    } catch (e) {
      console.error('[Auth] checkSessionOnResume error:', e);
      shouldLogout = true;
    }
    if (shouldLogout) {
      await clearLocalSession();
      clearNotifications();
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await loginRequest(email, password);
    const session = await createSession(loggedInUser);
    await Promise.all([
      saveSessionLocally(session),
      Promise.resolve(AppAmbit.trackEvent('User Logged In', { email: loggedInUser.email })),
      Promise.resolve(AppAmbit.setUserId(loggedInUser.id.toString())),
      Promise.resolve(AppAmbit.setUserEmail(loggedInUser.email)),
    ]);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const newUser = await registerRequest(name, email, password);
    const session = await createSession(newUser);
    await Promise.all([
      saveSessionLocally(session),
      Promise.resolve(AppAmbit.trackEvent('User Registered', { email: newUser.email })),
      Promise.resolve(AppAmbit.setUserId(newUser.id.toString())),
      Promise.resolve(AppAmbit.setUserEmail(newUser.email)),
    ]);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    const local = await getLocalSession();
    await Promise.all([
      clearLocalSession(),
      local ? deleteSession(local.token, local.userId).catch(e => console.error('[Auth] delete session:', e)) : Promise.resolve(),
      Promise.resolve(clearNotifications()),
      Promise.resolve().then(() => { try { AppAmbit.clearToken(); } catch { /* best-effort */ } }),
      Promise.resolve(AppAmbit.trackEvent('User Logged Out', {})),
    ]);
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) { return; }
    await deleteAllUserSessions(currentUser.id);
    await deleteUser(currentUser.id);
    await Promise.all([
      clearLocalSession(),
      Promise.resolve(clearNotifications()),
      Promise.resolve().then(() => { try { AppAmbit.clearToken(); } catch { /* best-effort */ } }),
      Promise.resolve(AppAmbit.trackEvent('Account Deleted', { email: currentUser.email })),
    ]);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: user !== null, loading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
