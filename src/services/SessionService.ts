import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from 'appambit';
import { sha256 } from 'js-sha256';
import type { AuthUser } from './AuthDB';

const INSTALLED_KEY = '@session_installed';
const USERS_TABLE = 'users';
const SESSION_EXPIRY_DAYS = 30;

export interface LocalSession {
  token: string;
  userId: number;
  expiresAt: number;
  user: AuthUser;
}

function generateToken(): string {
  const entropy = `${Date.now()}-${Math.random()}-${Math.random()}-${Math.random()}`;
  return sha256(entropy);
}

function hashToken(token: string): string {
  return sha256(token);
}

function toTimestamp(date: Date): string {
  return date.toISOString().replace(/\.(\d{3})Z$/, '.$1000');
}

export async function createSession(user: AuthUser): Promise<LocalSession> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db().from(USERS_TABLE).where('id', user.id).update({
    token: tokenHash,
    expires_at: toTimestamp(expiresAt),
  });

  return { token, userId: user.id, expiresAt: expiresAt.getTime(), user };
}

export async function validateSessionRemote(token: string, userId: number): Promise<boolean> {
  try {
    const tokenHash = hashToken(token);
    const row = await db()
      .from(USERS_TABLE)
      .where('id', userId)
      .first();

    if (!row) { return false; }

    if (row.token !== tokenHash) { return false; }

    const expiresAtStr = row.expires_at as string | null;
    if (!expiresAtStr) { return false; }

    if (new Date(expiresAtStr).getTime() < Date.now()) {
      await clearTokenInDb(userId);
      return false;
    }

    return true;
  } catch (e) {
    console.warn('[SessionService] Remote validation error (optimistic):', e);
    return true;
  }
}

export async function deleteSession(token: string, userId: number): Promise<void> {
  try {
    await clearTokenInDb(userId);
  } catch (e) {
    console.error('[SessionService] Delete session error:', e);
  }
}

export async function deleteAllUserSessions(userId: number): Promise<void> {
  try {
    await clearTokenInDb(userId);
  } catch (e) {
    console.error('[SessionService] Delete all sessions error:', e);
  }
}

async function clearTokenInDb(userId: number): Promise<void> {
  await db().from(USERS_TABLE).where('id', userId).update({
    token: null,
    expires_at: null,
  });
}

export async function saveSessionLocally(session: LocalSession): Promise<void> {
  await Keychain.setGenericPassword('session', JSON.stringify(session));
}

export async function getLocalSession(): Promise<LocalSession | null> {
  try {
    const creds = await Keychain.getGenericPassword();
    if (!creds) { return null; }
    return JSON.parse(creds.password) as LocalSession;
  } catch (e) {
    console.error('[SessionService] Failed to read local session:', e);
    await clearLocalSession();
    return null;
  }
}

export async function clearLocalSession(): Promise<void> {
  try {
    await Keychain.resetGenericPassword();
  } catch (e) {
    console.error('[SessionService] Failed to clear local session:', e);
  }
}

async function clearKeychainOnFreshInstall(): Promise<void> {
  try {
    const installed = await AsyncStorage.getItem(INSTALLED_KEY);
    if (installed) { return; }
    await Keychain.resetGenericPassword();
    await AsyncStorage.setItem(INSTALLED_KEY, '1');
  } catch (e) {
    console.error('[SessionService] Fresh install check error:', e);
  }
}

async function rejuvenateSession(session: LocalSession): Promise<void> {
  try {
    const newToken = generateToken();
    const newTokenHash = hashToken(newToken);
    const newExpiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await db().from(USERS_TABLE).where('id', session.userId).update({
      token: newTokenHash,
      expires_at: toTimestamp(newExpiresAt),
    });
    const rejuvenated: LocalSession = {
      token: newToken,
      userId: session.userId,
      expiresAt: newExpiresAt.getTime(),
      user: session.user,
    };
    await saveSessionLocally(rejuvenated);
  } catch (e) {
    console.warn('[SessionService] Rejuvenate error (non-fatal):', e);
  }
}

export interface RestoreResult {
  user: AuthUser;
  onInvalidated: Promise<boolean>;
}

export async function restoreSession(): Promise<RestoreResult | null> {
  await clearKeychainOnFreshInstall();

  const local = await getLocalSession();
  if (!local) { return null; }

  if (Date.now() > local.expiresAt) {
    await clearTokenInDb(local.userId);
    await clearLocalSession();
    return null;
  }

  const onInvalidated = validateSessionRemote(local.token, local.userId).then(async (valid) => {
    if (valid) {
      await rejuvenateSession(local).catch(() => {});
    }
    return valid;
  });
  return { user: local.user, onInvalidated };
}

export async function validateCurrentSession(): Promise<boolean> {
  const local = await getLocalSession();
  if (!local) { return false; }
  return validateSessionRemote(local.token, local.userId);
}
