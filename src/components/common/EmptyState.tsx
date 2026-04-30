import React from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <View
          style={[
            styles.circle,
            styles.circleOuter,
            { borderColor: colors.border },
          ]}
        />
        <View
          style={[
            styles.circle,
            styles.circleMiddle,
            { borderColor: colors.accent + '44' },
          ]}
        />
        <View
          style={[styles.circle, styles.circleInner, { backgroundColor: colors.accent + '22' }]}
        />
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
          ]}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  iconWrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  circleOuter: {
    width: 96,
    height: 96,
  },
  circleMiddle: {
    width: 68,
    height: 68,
  },
  circleInner: {
    width: 44,
    height: 44,
    borderWidth: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.6,
    marginBottom: Spacing.lg,
  },
  button: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
  },
  buttonText: {
    color: 'white',
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
  },
});
