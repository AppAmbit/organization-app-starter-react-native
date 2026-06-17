import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as AppAmbit from 'appambit';
import {
  login as loginRequest,
  register as registerRequest,
  type AuthUser,
} from '../services/AuthDB';
import {
  createSession,
  saveSessionLocally,
  getLocalSession,
  deleteSession,
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
          result.onInvalidated.then(valid => {
            if (!valid) {
              setUser(null);
            }
          });
        }
      })
      .catch(() => {})
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
      await deleteSession(local.token).catch(() => {});
    }
    await clearLocalSession();
    AppAmbit.trackEvent('User Logged Out', {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: user !== null, loading, login, register, logout }}>
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
