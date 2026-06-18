import React, { useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CollectionItemModel } from '../../models/FeedModel';
import { resolveImageUri } from '../../utils/image';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';

interface LargeCardProps {
  article: CollectionItemModel;
  onPress: (article: CollectionItemModel) => void;
  width: number;
  height: number;
  style?: ViewStyle;
}

export const LargeCard: React.FC<LargeCardProps> = ({ article, onPress, width, height, style }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const scale = useRef(new Animated.Value(1)).current;

  const imageUri = resolveImageUri(article.image_url);
  const hasImage = !!imageUri;
  const hasText = !!article.title || !!article.subtitle;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 200, friction: 10 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();

  return (
    <Pressable
      onPress={() => onPress(article)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={article.title ?? ''}>
      <Animated.View
        style={[
          styles.card,
          Shadow.md,
          { width, height, transform: [{ scale }], backgroundColor: colors.surfaceElevated },
          style,
        ]}>

        {hasImage && (
          <Image
            source={{ uri: imageUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
        {hasImage && hasText && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            locations={[0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
        )}
        {hasImage ? (
          hasText ? (
            <View style={styles.overlay}>
              <View style={styles.textBlock}>
                {!!article.title && (
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                )}
                {!!article.subtitle && (
                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {article.subtitle}
                  </Text>
                )}
              </View>
            </View>
          ) : null
        ) : (
          <View style={[styles.overlay, styles.textCenter]}>
            {!!article.title && (
              <Text
                style={[styles.cardTitle, { color: colors.textPrimary }]}
                numberOfLines={3}>
                {article.title}
              </Text>
            )}
            {!!article.subtitle && (
              <Text
                style={[styles.cardSubtitle, { color: colors.textSecondary }]}
                numberOfLines={3}>
                {article.subtitle}
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  textCenter: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: Spacing.lg,
  },
  textBlock: {
    padding: Spacing.lg,
    gap: 4,
  },
  cardTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: FontSize.xl * 1.2,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: FontSize.sm * 1.4,
  },
});
