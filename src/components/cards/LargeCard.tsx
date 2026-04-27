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
import { CollectionItemModel } from '../../models/FeedModel';
import { resolveImageUri } from '../../utils/image';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Shadow, Spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH * 0.55;
const IMAGE_HEIGHT = CARD_WIDTH * 1.4;

interface LargeCardProps {
  article: CollectionItemModel;
  onPress: (article: CollectionItemModel) => void;
}

export const LargeCard: React.FC<LargeCardProps> = ({ article, onPress }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const scale = useRef(new Animated.Value(1)).current;

  const imageUri = resolveImageUri(article.image_url);
  const hasImage = !!imageUri;

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
          { width: CARD_WIDTH, transform: [{ scale }], backgroundColor: colors.surface },
        ]}>

        {hasImage && (
          <Image
            source={{ uri: imageUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
        {hasImage ? (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
            locations={[0.35, 0.7, 1]}
            style={styles.overlay}>
            <CardText article={article} textColor="#FFFFFF" />
          </LinearGradient>
        ) : (
          <View style={[styles.overlay, styles.textOnly]}>
            <CardText
              article={article}
              textColor={colors.textPrimary}
            />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

interface CardTextProps {
  article: CollectionItemModel;
  textColor: string;
  subtitleColor: string;
}
function CardText({ article, textColor }: Omit<CardTextProps, 'subtitleColor'>) {
  return (
    <View style={styles.textContent}>
      {!!article.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{article.badge.toUpperCase()}</Text>
        </View>
      )}
      <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
        {article.title ?? ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  textOnly: {
    justifyContent: 'center',
    padding: Spacing.md,
  },
  textContent: {
    padding: Spacing.md,
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
    lineHeight: FontSize.md * 1.25,
  },
  subtitle: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.4,
  },
});
