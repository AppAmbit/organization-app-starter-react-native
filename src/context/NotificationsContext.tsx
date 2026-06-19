import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';
import * as PushNotifications from 'appambit-push-notifications';
import * as AppAmbit from 'appambit';
import {
  initDB,
  getAllNotifications,
  markAllRead,
  markRead,
  clearAll,
  saveNotification,
  saveAppGroupNotification,
  type StoredNotification,
} from '../services/NotificationDB';
import { getAndClearAppGroupNotifications } from '../services/AppGroupNotifications';

interface NotificationsContextValue {
  notifications: StoredNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  refresh: () => {},
  markNotificationRead: () => {},
  markAllNotificationsRead: () => {},
  clearAllNotifications: () => {},
});

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const all = getAllNotifications();
    console.debug('[NotificationsContext] refresh — items:', all.length);
    setNotifications([...all]);
    setUnreadCount(all.filter((n) => !n.isRead).length);
  }, []);

  // Drains notifications the iOS NotificationServiceExtension stashed in
  // shared App Group storage while the app was killed/backgrounded.
  const drainAppGroupNotifications = useCallback(async () => {
    if (Platform.OS !== 'ios') { return; }
    const entries = await getAndClearAppGroupNotifications();
    if (entries.length === 0) { return; }
    console.debug('[NotificationsContext] draining app group notifications:', entries.length);
    // Oldest first, so the newest ends up on top of the cache after each prepend.
    [...entries].reverse().forEach(saveAppGroupNotification);
    refresh();
  }, [refresh]);

  // Load from storage on mount and request push permission immediately at startup
  useEffect(() => {
    initDB().then(async () => {
      const granted = await PushNotifications.requestNotificationPermissionWithResult();
      if (granted) {
        PushNotifications.setNotificationsEnabled(true);
      }
      await drainAppGroupNotifications();
      refresh();
      setLoading(false);
    });
  }, [refresh, drainAppGroupNotifications]);

  // Register SDK listeners directly inside the context so refresh() is called immediately
  // without going through the onChangeCallback indirection that could be null on timing edge cases
  useEffect(() => {
    const unsubForeground = PushNotifications.setForegroundListener((payload) => {
      console.debug('[NotificationsContext] foreground notification received');
      saveNotification(payload, 'foreground');
      refresh();
    });

    const unsubOpened = PushNotifications.setOpenedListener((payload) => {
      console.debug('[NotificationsContext] opened notification received');
      AppAmbit.trackEvent('Notification Opened', {
        title: payload.title ?? '',
        body: payload.body ?? '',
      });
      saveNotification(payload, 'opened');
      refresh();
    });

    const unsubBackground = PushNotifications.Android.setBackgroundListener(
      async (payload) => {
        console.debug('[NotificationsContext] background notification received');
        saveNotification(payload, 'background');
        refresh();
      },
    );

    return () => {
      unsubForeground();
      unsubOpened();
      unsubBackground();
    };
  }, [refresh]);

  // Re-sync when app returns to foreground (catches HeadlessJS/killed-app background
  // notifications on Android, and NSE-captured notifications on iOS)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        drainAppGroupNotifications().then(refresh);
      }
    });
    return () => sub.remove();
  }, [refresh, drainAppGroupNotifications]);

  const markNotificationRead = useCallback(
    (id: string) => {
      markRead(id);
      refresh();
    },
    [refresh],
  );

  const markAllNotificationsRead = useCallback(() => {
    markAllRead();
    refresh();
  }, [refresh]);

  const clearAllNotifications = useCallback(() => {
    clearAll();
    refresh();
  }, [refresh]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refresh,
        markNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
      }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  return useContext(NotificationsContext);
}
