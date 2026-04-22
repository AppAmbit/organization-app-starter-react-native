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
import LinearGradient from 'react-native-linear-gradient';
import { FeedModel } from '../../models/FeedModel';
import { resolveImageUri } from '../../utils/image';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Layout, Radius, Shadow, Spacing } from '../../theme/spacing';
import { Badge } from '../common/Badge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Layout.screenPaddingH * 2;
const CARD_HEIGHT = 240;

interface FeaturedCardProps {
  article: FeedModel;
  onPress: (article: FeedModel) => void;
  width?: number;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({
  article,
  onPress,
  width = CARD_WIDTH,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  return (
    <Pressable
      onPress={() => onPress(article)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.card,
          Shadow.lg,
          { width, height: CARD_HEIGHT, transform: [{ scale }] },
        ]}>
        {resolveImageUri(article.module_image_url || article.module_image) ? (
          <Image
            source={{ uri: resolveImageUri(article.module_image_url || article.module_image) }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.82)']}
          locations={[0, 0.4, 1]}
          style={styles.gradient}>
          <View style={styles.content}>
            <Badge label={article.source_content_type || 'Category'} size="sm" />
            <Text style={styles.title} numberOfLines={2}>
              {article.module_title ?? article.source_content_type}
            </Text>
            <View style={styles.meta}>
              <Text style={styles.metaText}>{article.module_subtitle ?? ''}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: '#1A1A20',
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  gradient: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: FontSize.lg * 1.35,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: FontWeight.medium,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
