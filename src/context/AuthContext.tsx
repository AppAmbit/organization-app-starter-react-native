import React, { createContext, useCallback, useContext, useState } from 'react';
import * as AppAmbit from 'appambit';
import {
  login as loginRequest,
  register as registerRequest,
  type AuthUser,
} from '../services/AuthDB';

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

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await loginRequest(email, password);
    AppAmbit.trackEvent('User Logged In', { email: loggedInUser.email });
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const newUser = await registerRequest(name, email, password);
    AppAmbit.trackEvent('User Registered', { email: newUser.email });
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    AppAmbit.trackEvent('User Logged Out', {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: user !== null, loading: false, login, register, logout }}>
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
