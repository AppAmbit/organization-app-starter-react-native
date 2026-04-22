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
import { Badge } from '../common/Badge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.82;

interface LargeCardProps {
  article: FeedModel;
  onPress: (article: FeedModel) => void;
  fullWidth?: boolean;
}

export const LargeCard: React.FC<LargeCardProps> = ({
  article,
  onPress,
  fullWidth = false,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };

  return (
    <Pressable
      onPress={() => onPress(article)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.card,
          Shadow.md,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            width: fullWidth ? '100%' : CARD_WIDTH,
            transform: [{ scale }],
          },
        ]}>
        {resolveImageUri(article.module_image_url || article.module_image) ? (
          <Image
            source={{ uri: resolveImageUri(article.module_image_url || article.module_image) }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}
        <View style={styles.content}>
          <Badge label={article.source_content_type || 'Category'} size="sm" />
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={2}>
            {article.module_title ?? article.source_content_type}
          </Text>
          <Text
            style={[styles.summary, { color: colors.textSecondary }]}
            numberOfLines={2}>
            {article.module_subtitle ?? ''}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    height: 140,
  },
  image: {
    width: 110,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSize.sm + 1,
    fontWeight: FontWeight.semiBold,
    letterSpacing: -0.1,
    lineHeight: (FontSize.sm + 1) * 1.4,
    marginTop: 4,
  },
  summary: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.55,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  readBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  readBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.semiBold,
  },
});
