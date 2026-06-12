import { NativeModules, Platform } from 'react-native';
import type { AppGroupNotificationEntry } from './NotificationDB';

const { AppGroupNotifications } = NativeModules as {
  AppGroupNotifications?: { getAndClear(): Promise<string> };
};

/**
 * iOS only: drains notifications the NotificationServiceExtension stashed in
 * shared App Group storage while the app was killed/backgrounded.
 */
export async function getAndClearAppGroupNotifications(): Promise<AppGroupNotificationEntry[]> {
  if (Platform.OS !== 'ios' || !AppGroupNotifications) {
    return [];
  }
  try {
    const json = await AppGroupNotifications.getAndClear();
    const list = JSON.parse(json);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.warn('[AppGroupNotifications] getAndClear failed:', e);
    return [];
  }
}
