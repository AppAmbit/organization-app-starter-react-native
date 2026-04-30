import React from 'react';
import { StyleSheet, View, Text, FlatList, useColorScheme, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getColors } from '../theme/colors';
import { FontSize, FontWeight } from '../theme/typography';
import { Layout, Radius, Shadow, Spacing } from '../theme/spacing';
import * as PushNotifications from "appambit-push-notifications";

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'New Article Available', time: '5 min ago', message: '5 Ways to Improve Productivity at Work', icon: 'document-text-outline', unread: true },
  { id: '2', title: 'Reminder', time: '1 hour ago', message: 'Your saved resource is waiting for you', icon: 'notifications-outline', unread: true },
  { id: '3', title: 'Technology Updated', time: '3 hours ago', message: '3 new resources added today', icon: 'folder-outline', unread: false },
  { id: '4', title: 'Premium Access Offer', time: 'Yesterday', message: 'Unlock exclusive content this week', icon: 'star-outline', unread: false },
  { id: '5', title: 'Account Protected', time: 'Yesterday', message: 'Your account settings were updated successfully', icon: 'shield-checkmark-outline', unread: false },
];

export const NotificationsScreen: React.FC = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();

  PushNotifications.requestNotificationPermission();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
          <Pressable hitSlop={10}>
            <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Stay updated with the latest activity</Text>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, Shadow.sm, { backgroundColor: colors.surface }]}>
            {item.unread && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
            <View style={[styles.iconContainer, { backgroundColor: '#2563EB' }]}>
              <Ionicons name={item.icon} size={20} color="#FFFFFF" />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.cardTime, { color: colors.textTertiary }]}>{item.time}</Text>
              </View>
              <Text style={[styles.cardMessage, { color: colors.textSecondary }]}>{item.message}</Text>
            </View>
          </View>
        )}
      />
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
  subtitle: {
    fontSize: FontSize.sm,
  },
  listContent: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Spacing.xxxl,
    gap: 0,
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
    borderRadius: 22,
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
  },
  cardTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  cardTime: {
    fontSize: FontSize.xs,
  },
  cardMessage: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
});