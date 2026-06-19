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

function hashPassword(password: string, email: string): string {
  const salted = `${email.trim().toLowerCase()}:${password}`;
  return sha256(salted);
}

function toTimestamp(date: Date): string {
  return date.toISOString().replace(/\.(\d{3})Z$/, '.$1000');
}

function toAuthUser(row: Record<string, any>): AuthUser {
  return { id: row.id, name: row.name, email: row.email };
}

export async function register(name: string, email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const createdAt = toTimestamp(new Date());

  const result = await db().execute(
    'INSERT INTO "users" ("name", "email", "password_hash", "created_at") '
    + 'SELECT ?, ?, ?, ? WHERE NOT EXISTS '
    + '(SELECT 1 FROM "users" WHERE "email" = ?)',
    [name.trim(), normalizedEmail, hashPassword(password, email), createdAt, normalizedEmail],
  );

  if (result.rowsWritten === 0) {
    throw new EmailAlreadyExistsError();
  }

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
  if (!user || user.password_hash !== hashPassword(password, email)) {
    throw new InvalidCredentialsError();
  }

  return toAuthUser(user);
}
