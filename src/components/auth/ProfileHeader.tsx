import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { getInitials } from '../../utils/formatting';

interface ProfileHeaderProps {
  name: string;
  email: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, email }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);

  return (
    <View style={[styles.card, Shadow.md, { backgroundColor: colors.surface }]}>
      <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
        <Text style={[styles.avatarText, { color: colors.white }]}>{getInitials(name)}</Text>
      </View>
      <Text style={[styles.name, { color: colors.textPrimary }]}>{name}</Text>
      <Text style={[styles.email, { color: colors.textSecondary }]}>{email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs / 2,
  },
  email: {
    fontSize: FontSize.sm,
  },
});
