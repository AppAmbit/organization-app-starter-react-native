import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';

type AuthButtonVariant = 'primary' | 'ghost' | 'destructive';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  variant?: AuthButtonVariant;
  loading?: boolean;
  disabled?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const isDisabled = disabled || loading;

  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}>
        <Text style={[styles.ghostLabel, { color: colors.accent }]}>{label}</Text>
      </Pressable>
    );
  }

  const backgroundColor = variant === 'destructive' ? colors.error : colors.accent;
  const shadow = variant === 'destructive' ? Shadow.sm : Shadow.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        shadow,
        { backgroundColor, opacity: isDisabled ? 0.6 : pressed ? 0.9 : 1 },
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={[styles.label, { color: colors.white }]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
  },
  ghost: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  ghostLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  pressed: {
    opacity: 0.6,
  },
});
