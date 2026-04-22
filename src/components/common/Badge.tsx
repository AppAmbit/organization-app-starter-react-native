import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Palette } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface BadgeProps {
  label: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, size = 'md' }) => {
  const color = (Palette.categories as Record<string, string>)[label] ?? Palette.categories.Default;
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }, isSmall && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: color }, isSmall && styles.dotSm]} />
      <Text
        style={[styles.label, { color }, isSmall && styles.labelSm]}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 5,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotSm: {
    width: 5,
    height: 5,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.4,
  },
  labelSm: {
    fontSize: 10,
  },
});
