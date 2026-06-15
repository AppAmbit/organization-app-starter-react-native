import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors } from '../theme/colors';
import { FontSize, FontWeight } from '../theme/typography';
import { Layout, Radius, Shadow, Spacing } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { ProfileHeader } from '../components/auth/ProfileHeader';
import { AuthButton } from '../components/auth/AuthButton';

export const ProfileScreen: React.FC = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

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
        <ProfileHeader name={user.name} email={user.email} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Account</Text>

          <View style={[styles.row, Shadow.sm, { backgroundColor: colors.surface }]}>
            <Ionicons name="person-outline" size={20} color={colors.accent} style={styles.rowIcon} />
            <View>
              <Text style={[styles.rowLabel, { color: colors.textTertiary }]}>Name</Text>
              <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{user.name}</Text>
            </View>
          </View>

          <View style={[styles.row, Shadow.sm, { backgroundColor: colors.surface }]}>
            <Ionicons name="mail-outline" size={20} color={colors.accent} style={styles.rowIcon} />
            <View>
              <Text style={[styles.rowLabel, { color: colors.textTertiary }]}>Email</Text>
              <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{user.email}</Text>
            </View>
          </View>
        </View>

        <AuthButton label="Log Out" variant="destructive" onPress={logout} />
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
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  rowIcon: {
    marginRight: Spacing.sm,
  },
  rowLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
});
