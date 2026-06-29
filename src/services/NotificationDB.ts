import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationPayload } from 'appambit-push-notifications';

export type NotificationSource = 'foreground' | 'background' | 'opened';

export interface StoredNotification {
  id: string;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  data: Record<string, string>;
  receivedAt: number;
  isRead: boolean;
  source: NotificationSource;
  dedupeKey: string;
}

const STORAGE_KEY = '@notifications';

let cache: StoredNotification[] = [];
let ready = false;

function persist(): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache)).catch((e) => {
    console.warn('[NotificationDB] persist failed:', e);
  });
}

function buildDedupeKey(
  title: string | null,
  body: string | null,
  imageUrl: string | null,
  data: Record<string, string>,
): string {
  const sortedData = Object.keys(data)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});
  return JSON.stringify({ title, body, imageUrl, data: sortedData });
}

export async function initDB(): Promise<void> {
  if (ready) { return; }
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: StoredNotification[] = raw ? (JSON.parse(raw) as StoredNotification[]) : [];
    // Backfill dedupeKeys for entries persisted before dedup support existed.
    const stored = parsed.map((n) => ({
      ...n,
      dedupeKey: n.dedupeKey ?? buildDedupeKey(n.title, n.body, n.imageUrl, n.data),
    }));
    console.debug('[NotificationDB] initDB loaded from storage:', stored.length, 'items');
    const storedIds = new Set(stored.map((n) => n.id));
    const earlyArrivals = cache.filter((n) => !storedIds.has(n.id));
    cache = [...earlyArrivals, ...stored];
    console.debug('[NotificationDB] cache after merge:', cache.length, 'items');
  } catch (e) {
    console.warn('[NotificationDB] initDB read failed:', e);
  }
  ready = true;
}

export function saveNotification(
  payload: NotificationPayload,
  source: NotificationSource,
): void {
  const title = payload.title ?? null;
  const body = payload.body ?? null;
  const imageUrl = payload.imageUrl ?? null;
  const data = payload.data ?? {};
  const dedupeKey = buildDedupeKey(title, body, imageUrl, data);

  const existing = cache.find((n) => n.dedupeKey === dedupeKey);
  if (existing) {
    if (source === 'opened' && !existing.isRead) {
      cache = cache.map((n) => (n.id === existing.id ? { ...n, isRead: true } : n));
      persist();
    }
    console.debug('[NotificationDB] duplicate notification skipped, source:', source);
    return;
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const notification: StoredNotification = {
    id,
    title,
    body,
    imageUrl,
    data,
    receivedAt: Date.now(),
    isRead: source === 'opened',
    source,
    dedupeKey,
  };
  cache = [notification, ...cache];
  console.debug('[NotificationDB] saved notification, source:', source, '— cache size:', cache.length);
  persist();
}

export interface AppGroupNotificationEntry {
  title?: string;
  body?: string;
  imageUrl?: string;
  data?: Record<string, string>;
  receivedAt: string;
}

export function saveAppGroupNotification(entry: AppGroupNotificationEntry): void {
  const title = entry.title ?? null;
  const body = entry.body ?? null;
  const imageUrl = entry.imageUrl ?? null;
  const data = entry.data ?? {};
  const dedupeKey = buildDedupeKey(title, body, imageUrl, data);

  if (cache.some((n) => n.dedupeKey === dedupeKey)) {
    console.debug('[NotificationDB] duplicate app group notification skipped');
    return;
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const notification: StoredNotification = {
    id,
    title,
    body,
    imageUrl,
    data,
    receivedAt: Date.parse(entry.receivedAt) || Date.now(),
    isRead: false,
    source: 'background',
    dedupeKey,
  };
  cache = [notification, ...cache];
  console.debug('[NotificationDB] saved app group notification — cache size:', cache.length);
  persist();
}

export function getAllNotifications(): StoredNotification[] {
  return cache;
}

export function getUnreadCount(): number {
  return cache.filter((n) => !n.isRead).length;
}

export function markRead(id: string): void {
  cache = cache.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  persist();
}

export function markAllRead(): void {
  cache = cache.map((n) => ({ ...n, isRead: true }));
  persist();
}

export function clearAll(): void {
  cache = [];
  AsyncStorage.setItem(STORAGE_KEY, '[]').catch((e) => {
    console.warn('[NotificationDB] clearAll persist failed:', e);
  });
}
