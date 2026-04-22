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
import { FeedModel } from '../../models/FeedModel';
import { resolveImageUri } from '../../utils/image';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';
import { Badge } from '../common/Badge';

const CARD_WIDTH = 170;
const IMAGE_HEIGHT = 110;

interface SmallCardProps {
  article: FeedModel;
  onPress: (article: FeedModel) => void;
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
      <Animated.View
        style={[
          styles.card,
          Shadow.sm,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ scale }],
          },
        ]}>
        {/* Thumbnail */}
        {resolveImageUri(article.module_image_url || article.module_image) ? (
          <Image
            source={{ uri: resolveImageUri(article.module_image_url || article.module_image) }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}

        {/* Content */}
        <View style={styles.content}>
          <Badge label={article.source_content_type || 'Category'} size="sm" />
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={2}>
            {article.module_title ?? article.source_content_type}
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.meta, { color: colors.textTertiary }]} numberOfLines={1}>
              {article.module_subtitle ?? ''}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  image: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
  },
  content: {
    padding: Spacing.sm + 2,
    gap: 6,
  },
  title: {
    fontSize: FontSize.xs + 1,
    fontWeight: FontWeight.semiBold,
    lineHeight: (FontSize.xs + 1) * 1.4,
    letterSpacing: -0.1,
  },
  footer: {
    marginTop: 2,
  },
  meta: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },
});
