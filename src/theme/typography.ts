/**
 * Typography scale for Content App Starter
 */

import { StyleSheet, TextStyle } from 'react-native';

export const FontFamily = {
  // React Native uses system fonts; these map to San Francisco (iOS) and Roboto (Android)
  regular: undefined,
  medium: undefined,
  semiBold: undefined,
  bold: undefined,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  display: 38,
};

export const FontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
};

export const typography = StyleSheet.create({
  display: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.extraBold,
    letterSpacing: -1,
    lineHeight: FontSize.display * 1.2,
  },
  headlineLarge: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    lineHeight: FontSize.xxl * 1.25,
  },
  headlineMedium: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
    lineHeight: FontSize.xl * 1.3,
  },
  headlineSmall: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    letterSpacing: -0.2,
    lineHeight: FontSize.lg * 1.35,
  },
  titleLarge: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    letterSpacing: -0.1,
    lineHeight: FontSize.md * 1.4,
  },
  titleMedium: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.base * 1.4,
  },
  bodyLarge: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.base * 1.65,
  },
  bodyMedium: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.sm * 1.6,
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.2,
    lineHeight: FontSize.xs * 1.5,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    lineHeight: FontSize.xs * 1.5,
  },
});
