import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useColorScheme } from 'react-native';
import { getColors } from '../../theme/colors';
import { Radius } from '../../theme/spacing';

interface SkeletonProps {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height,
  borderRadius = Radius.md,
  style,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceElevated,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const FeaturedCardSkeleton: React.FC = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);

  return (
    <View style={[styles.featuredSkeleton, { backgroundColor: colors.surface }]}>
      <Skeleton height={220} borderRadius={Radius.xl} />
      <View style={styles.featuredContent}>
        <Skeleton width="40%" height={16} />
        <Skeleton height={22} style={{ marginTop: 8 }} />
        <Skeleton width="70%" height={22} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
};

export const LargeCardSkeleton: React.FC = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);

  return (
    <View style={[styles.largeCardSkeleton, { backgroundColor: colors.surface }]}>
      <Skeleton width={110} height={140} borderRadius={Radius.lg} />
      <View style={styles.largeCardContent}>
        <Skeleton width="50%" height={14} />
        <Skeleton height={18} style={{ marginTop: 8 }} />
        <Skeleton width="80%" height={18} style={{ marginTop: 4 }} />
        <Skeleton width="60%" height={13} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {},
  featuredSkeleton: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  featuredContent: {
    padding: 16,
    gap: 8,
  },
  largeCardSkeleton: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: 12,
    gap: 14,
  },
  largeCardContent: {
    flex: 1,
    gap: 6,
  },
});
