import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { FeedModel } from '../../models/FeedModel';
import { resolveImageUri } from '../../utils/image';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 2:3 aspect ratio portrait card
const CARD_WIDTH = SCREEN_WIDTH * 0.55;
const IMAGE_HEIGHT = CARD_WIDTH * 1.5;

interface LargeCardProps {
  article: FeedModel;
  onPress: (article: FeedModel) => void;
  fullWidth?: boolean;
}

export const LargeCard: React.FC<LargeCardProps> = ({
  article,
  onPress,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };

  return (
    <Pressable
      onPress={() => onPress(article)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View style={[styles.card, { width: CARD_WIDTH, transform: [{ scale }] }]}>
        <View style={[styles.imageContainer, Shadow.md, { backgroundColor: colors.surface }]}>
          {resolveImageUri(article.module_image_url || article.module_image) ? (
            <Image
              source={{ uri: resolveImageUri(article.module_image_url || article.module_image) }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : null}
        </View>
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={1}>
            {article.module_title ?? article.card_title ?? ''}
          </Text>
          <Text
            style={[styles.summary, { color: colors.textSecondary }]}
            numberOfLines={1}>
            {article.module_subtitle ?? ''}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderRadius: Radius.lg,
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
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
  },
  summary: {
    fontSize: FontSize.sm,
  },
});
