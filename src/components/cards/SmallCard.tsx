import React, { useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { CollectionItemModel } from '../../models/FeedModel';
import { resolveImageUri } from '../../utils/image';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';

const CARD_WIDTH = 160;
const IMAGE_HEIGHT = CARD_WIDTH * (9 / 16); // 16:9 aspect ratio

interface SmallCardProps {
  article: CollectionItemModel;
  onPress: (article: CollectionItemModel) => void;
}

export const SmallCard: React.FC<SmallCardProps> = ({ article, onPress }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 220, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 220, friction: 10 }).start();
  };

  return (
    <Pressable
      onPress={() => onPress(article)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View style={[styles.card, { width: CARD_WIDTH, transform: [{ scale }] }]}>
        <View style={[styles.imageContainer, Shadow.sm, { backgroundColor: colors.surface }]}>
          {resolveImageUri(article.image_url) ? (
            <Image
              source={{ uri: resolveImageUri(article.image_url) }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : null}
        </View>
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={2}>
            {article.title ?? ''}
          </Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
            {article.subtitle ?? ''}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: Spacing.xs,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFill as any,
  },
  content: {
    paddingHorizontal: 2,
    gap: 2,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.sm * 1.3,
    letterSpacing: -0.1,
  },
  meta: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
});
