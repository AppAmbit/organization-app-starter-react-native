import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors, type AppColors } from '../theme/colors';
import { FontSize, FontWeight } from '../theme/typography';
import { Layout, Radius, Shadow, Spacing } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/formatting';

interface MenuRowProps {
  icon: string;
  label: string;
  value?: string;
  colors: AppColors;
  iconColor?: string;
  labelColor?: string;
  isLast?: boolean;
  onPress?: () => void;
}

const MenuRow: React.FC<MenuRowProps> = ({
  icon,
  label,
  value,
  colors,
  iconColor,
  labelColor,
  isLast = false,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    style={({ pressed }) => [
      styles.menuRow,
      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      onPress && pressed && { opacity: 0.6 },
    ]}>
    <View style={[styles.menuIconWrap, { backgroundColor: (iconColor ?? colors.accent) + '15' }]}>
      <Ionicons name={icon} size={18} color={iconColor ?? colors.accent} />
    </View>
    <Text style={[styles.menuLabel, { color: labelColor ?? colors.textPrimary }]}>{label}</Text>
    {value && (
      <Text style={[styles.menuValue, { color: colors.textSecondary }]} numberOfLines={1}>{value}</Text>
    )}
    {onPress && (
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    )}
  </Pressable>
);

export const ProfileScreen: React.FC = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();
  const { user, logout, deleteAccount } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
              console.warn('[ProfileScreen] delete account failed:', e);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xxxl },
        ]}>
        <View style={styles.headerSection}>
          <View style={[styles.avatar, Shadow.accent, { backgroundColor: colors.accent }]}>
            <Text style={[styles.avatarText, { color: colors.white }]}>
              {getInitials(user.name)}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{user.name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Account Info</Text>
          <View style={[styles.card, Shadow.sm, { backgroundColor: colors.surface }]}>
            <MenuRow icon="person-outline" label="Name" value={user.name} colors={colors} />
            <MenuRow icon="mail-outline" label="Email" value={user.email} colors={colors} isLast />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Session</Text>
          <View style={[styles.card, Shadow.sm, { backgroundColor: colors.surface }]}>
            <MenuRow
              icon="log-out-outline"
              label="Log Out"
              colors={colors}
              onPress={logout}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Danger Zone</Text>
          <View style={[styles.card, Shadow.sm, { backgroundColor: colors.surface }]}>
            <MenuRow
              icon="trash-outline"
              label={deleting ? 'Deleting...' : 'Delete Account'}
              colors={colors}
              iconColor={colors.error}
              labelColor={colors.error}
              onPress={deleting ? undefined : handleDeleteAccount}
              isLast
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    gap: Spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  email: {
    fontSize: FontSize.sm,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: Spacing.xs,
  },
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm + 2,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  menuValue: {
    fontSize: FontSize.sm,
    maxWidth: '45%',
    textAlign: 'right',
  },
});
