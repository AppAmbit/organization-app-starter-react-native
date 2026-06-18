import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from 'appambit';
import { sha256 } from 'js-sha256';
import type { AuthUser } from './AuthDB';

const INSTALLED_KEY = '@session_installed';

const SESSION_EXPIRY_DAYS = 5;

interface LocalSession {
  token: string;
  userId: number;
  expiresAt: number;
  user: AuthUser;
}

function generateToken(): string {
  const entropy = `${Date.now()}-${Math.random()}-${Math.random()}-${Math.random()}`;
  return sha256(entropy);
}

export async function createSession(user: AuthUser): Promise<LocalSession> {
  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db().from('sessions').insert({
    token,
    user_id: user.id,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  return { token, userId: user.id, expiresAt: expiresAt.getTime(), user };
}

export async function validateSessionRemote(token: string, userId: number): Promise<boolean> {
  try {
    const session = await db()
      .from('sessions')
      .where('token', token)
      .where('user_id', userId)
      .first();

    if (!session) {
      return false;
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      await db().from('sessions').where('token', token).delete();
      return false;
    }

    return true;
  } catch (e) {
    console.error('[SessionService] session validation failed:', e);
    return false;
  }
}

export async function deleteSession(token: string): Promise<void> {
  await db().from('sessions').where('token', token).delete();
}

export async function deleteAllUserSessions(userId: number): Promise<void> {
  await db().from('sessions').where('user_id', userId).delete();
}

export async function saveSessionLocally(session: LocalSession): Promise<void> {
  await Keychain.setGenericPassword('session', JSON.stringify(session));
}

export async function getLocalSession(): Promise<LocalSession | null> {
  const creds = await Keychain.getGenericPassword();
  if (!creds) {
    return null;
  }
  try {
    return JSON.parse(creds.password) as LocalSession;
  } catch {
    await Keychain.resetGenericPassword();
    return null;
  }
}

export async function clearLocalSession(): Promise<void> {
  await Keychain.resetGenericPassword();
}

export interface RestoreResult {
  user: AuthUser;
  remoteValidation: Promise<boolean>;
}

async function clearKeychainOnFreshInstall(): Promise<void> {
  const installed = await AsyncStorage.getItem(INSTALLED_KEY);
  if (!installed) {
    await Keychain.resetGenericPassword();
    await AsyncStorage.setItem(INSTALLED_KEY, '1');
  }
}

export async function restoreSession(): Promise<RestoreResult | null> {
  await clearKeychainOnFreshInstall();

  const local = await getLocalSession();
  if (!local) {
    return null;
  }

  if (Date.now() > local.expiresAt) {
    await clearLocalSession();
    deleteSession(local.token).catch(() => {});
    return null;
  }

  const remoteValidation = validateSessionRemote(local.token, local.userId).then(valid => {
    if (!valid) {
      clearLocalSession();
    }
    return valid;
  });

  return { user: local.user, remoteValidation };
}
