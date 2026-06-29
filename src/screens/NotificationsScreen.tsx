import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as PushNotifications from 'appambit-push-notifications';
import { getColors } from '../theme/colors';
import { FontSize, FontWeight } from '../theme/typography';
import { Layout, Radius, Shadow, Spacing } from '../theme/spacing';
import { useNotifications } from '../context/NotificationsContext';
import type { StoredNotification, NotificationSource } from '../services/NotificationDB';

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) { return 'Just now'; }
  if (mins < 60) { return `${mins} min ago`; }
  const hours = Math.floor(mins / 60);
  if (hours < 24) { return `${hours}h ago`; }
  const days = Math.floor(hours / 24);
  if (days === 1) { return 'Yesterday'; }
  return `${days} days ago`;
}

function iconForSource(source: NotificationSource): string {
  if (source === 'opened') { return 'notifications'; }
  return 'notifications-outline';
}

export const NotificationsScreen: React.FC = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, loading, markNotificationRead, markAllNotificationsRead, clearAllNotifications } =
    useNotifications();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    PushNotifications.isNotificationsEnabled().then(setNotificationsEnabled);
  }, []);

  const handleToggleNotifications = async (value: boolean) => {
    PushNotifications.setNotificationsEnabled(value);
    setNotificationsEnabled(value);
  };

  const renderItem = ({ item }: { item: StoredNotification }) => (
    <Pressable
      onPress={() => markNotificationRead(item.id)}
      style={[styles.card, Shadow.sm, { backgroundColor: colors.surface }]}>
      {!item.isRead && (
        <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
      )}
      <View style={[styles.iconContainer, { backgroundColor: '#2563EB' }]}>
        <Ionicons name={iconForSource(item.source)} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text
            style={[styles.cardTitle, { color: colors.textPrimary }]}
            numberOfLines={1}>
            {item.title ?? 'Notification'}
          </Text>
          <Text style={[styles.cardTime, { color: colors.textTertiary }]}>
            {formatRelativeTime(item.receivedAt)}
          </Text>
        </View>
        <Text
          style={[styles.cardMessage, { color: colors.textSecondary }]}
          numberOfLines={2}>
          {item.body ?? ''}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Notifications
          </Text>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <Pressable hitSlop={10} onPress={markAllNotificationsRead}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={24}
                  color={colors.accent}
                />
              </Pressable>
            )}
            <Pressable hitSlop={10} onPress={() => setSettingsVisible(true)}>
              <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
        <View style={styles.subtitleRow}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Stay updated with the latest activity
          </Text>
          {notifications.length > 0 && (
            <Pressable hitSlop={8} onPress={clearAllNotifications}>
              <Text style={[styles.clearAllText, { color: colors.accent }]}>
                Clear All
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconWrap,
                  { backgroundColor: colors.surfaceElevated },
                ]}>
                <Ionicons
                  name="notifications-off-outline"
                  size={40}
                  color={colors.textTertiary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No notifications yet
              </Text>
              <Text
                style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                Push notifications will appear here once received.
              </Text>
            </View>
          )
        }
      />

      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSettingsVisible(false)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.surface }]}
            onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Notification Settings
              </Text>
              <Pressable hitSlop={10} onPress={() => setSettingsVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <View
              style={[styles.modalDivider, { backgroundColor: colors.surfaceElevated }]}
            />
            <View style={styles.modalRow}>
              <View style={styles.modalRowContent}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.modalRowIcon}
                />
                <View>
                  <Text style={[styles.modalRowLabel, { color: colors.textPrimary }]}>
                    Push Notifications
                  </Text>
                  <Text style={[styles.modalRowSub, { color: colors.textTertiary }]}>
                    Receive alerts for new activity
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.surfaceElevated, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  subtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.sm,
  },
  clearAllText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  listContent: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Spacing.xxxl,
  },
  listEmpty: {
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 0,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  unreadDot: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  cardTime: {
    fontSize: FontSize.xs,
    flexShrink: 0,
  },
  cardMessage: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  emptyMessage: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    ...Shadow.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  modalDivider: {
    height: 1,
    marginBottom: Spacing.sm,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  modalRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalRowIcon: {
    marginRight: Spacing.md,
  },
  modalRowLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  modalRowSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
