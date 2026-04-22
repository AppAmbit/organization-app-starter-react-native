/**
 * SearchBar — Animated search input component
 */

import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { getColors } from '../../theme/colors';
import { FontSize } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search articles...',
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(borderAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 120,
      friction: 8,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(borderAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 120,
      friction: 8,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.accent],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor,
        },
      ]}>
      {/* Search icon SVG-less implementation using text */}
      <View style={styles.iconWrapper}>
        <View style={[styles.searchCircle, { borderColor: colors.textTertiary }]} />
        <View style={[styles.searchHandle, { backgroundColor: colors.textTertiary }]} />
      </View>

      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          style={[styles.clearBtn, { backgroundColor: colors.textTertiary }]}>
          <View style={styles.clearInner} />
        </Pressable>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    height: 46,
    gap: Spacing.sm,
  },
  iconWrapper: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  searchCircle: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  searchHandle: {
    width: 2,
    height: 5,
    borderRadius: 1,
    position: 'absolute',
    bottom: 0,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearInner: {
    width: 8,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
});
