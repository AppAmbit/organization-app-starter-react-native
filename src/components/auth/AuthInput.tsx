import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, useColorScheme } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon: string;
  error?: string | null;
}

export const AuthInput = forwardRef<TextInput, AuthInputProps>(({ label, icon, error, secureTextEntry, ...textInputProps }, ref) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const borderColor = error ? colors.error : focused ? colors.accent : colors.border;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: colors.surfaceElevated, borderColor },
        ]}>
        <Ionicons name={icon} size={18} color={colors.textTertiary} style={styles.icon} />
        <TextInput
          ref={ref}
          style={[styles.input, { color: colors.textPrimary }]}
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
          onFocus={(e) => {
            setFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
          secureTextEntry={secureTextEntry && hidden}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHidden((prev) => !prev)} hitSlop={8}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={colors.textTertiary}
            />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    paddingVertical: Spacing.sm + 2,
  },
  error: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
});
