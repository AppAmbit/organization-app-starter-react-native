import { sha256 } from 'js-sha256';
import { db } from 'appambit';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super('Email already exists');
    this.name = 'EmailAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

function hashPassword(password: string): string {
  return sha256(password);
}

function toAuthUser(row: Record<string, any>): AuthUser {
  return { id: row.id, name: row.name, email: row.email };
}

export async function register(name: string, email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db().from('users').where('email', normalizedEmail).first();
  if (existing) {
    throw new EmailAlreadyExistsError();
  }

  await db().from('users').insert({
    name: name.trim(),
    email: normalizedEmail,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
  });

  const created = await db().from('users').where('email', normalizedEmail).first();
  if (!created) {
    throw new Error('Failed to create user');
  }

  return toAuthUser(created);
}

export async function deleteUser(userId: number): Promise<void> {
  await db().from('users').where('id', userId).delete();
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await db().from('users').where('email', normalizedEmail).first();
  if (!user || user.password_hash !== hashPassword(password)) {
    throw new InvalidCredentialsError();
  }

  return toAuthUser(user);
}
