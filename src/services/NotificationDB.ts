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
}

const STORAGE_KEY = '@notifications';

let cache: StoredNotification[] = [];
let ready = false;

function persist(): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache)).catch((e) => {
    console.warn('[NotificationDB] persist failed:', e);
  });
}

export async function initDB(): Promise<void> {
  if (ready) { return; }
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const stored: StoredNotification[] = raw ? (JSON.parse(raw) as StoredNotification[]) : [];
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
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const notification: StoredNotification = {
    id,
    title: payload.title ?? null,
    body: payload.body ?? null,
    imageUrl: payload.imageUrl ?? null,
    data: payload.data ?? {},
    receivedAt: Date.now(),
    isRead: source === 'opened',
    source,
  };
  cache = [notification, ...cache];
  console.debug('[NotificationDB] saved notification, source:', source, '— cache size:', cache.length);
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
