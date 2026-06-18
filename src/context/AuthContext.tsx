import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
} from '../services/SessionService';

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

  useEffect(() => {
    restoreSession()
      .then(result => {
        if (result) {
          setUser(result.user);
          result.remoteValidation.then(valid => {
            if (!valid) {
              setUser(null);
            }
          });
        }
      })
      .catch(e => console.error('[Auth] restore failed:', e))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await loginRequest(email, password);
    const session = await createSession(loggedInUser);
    await saveSessionLocally(session);
    AppAmbit.trackEvent('User Logged In', { email: loggedInUser.email });
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const newUser = await registerRequest(name, email, password);
    const session = await createSession(newUser);
    await saveSessionLocally(session);
    AppAmbit.trackEvent('User Registered', { email: newUser.email });
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    const local = await getLocalSession();
    if (local) {
      await deleteSession(local.token).catch(e => console.error('[Auth] delete session failed:', e));
    }
    await clearLocalSession();
    AppAmbit.trackEvent('User Logged Out', {});
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    const currentUser = user;
    if (!currentUser) { return; }
    await deleteAllUserSessions(currentUser.id).catch(e => console.error('[Auth] delete all sessions failed:', e));
    await deleteUser(currentUser.id);
    await clearLocalSession();
    AppAmbit.trackEvent('Account Deleted', { email: currentUser.email });
    setUser(null);
  }, [user]);

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
