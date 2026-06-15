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
import { Spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = 480;

interface FeaturedCardProps {
  article: CollectionItemModel;
  onPress: (article: CollectionItemModel) => void;
  width?: number;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({
  article,
  onPress,
  width = SCREEN_WIDTH,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
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

  const bgColor = scheme === 'dark' ? '#000000' : colors.background;

  return (
    <Pressable
      onPress={() => onPress(article)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.card,
          { width, height: CARD_HEIGHT, transform: [{ scale }] },
        ]}>
        {resolveImageUri(article.image_url) ? (
          <Image
            source={{ uri: resolveImageUri(article.image_url) }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}
        <LinearGradient
          colors={[bgColor, 'transparent']}
          locations={[0, 1]}
          style={styles.topGradient}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)', bgColor]}
          locations={[0, 0.5, 1]}
          style={styles.bottomGradient}>
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {article.title ?? ''}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {article.subtitle ?? ''}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#000',
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.8,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    justifyContent: 'flex-end',
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: FontSize.xxl * 1.1,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
