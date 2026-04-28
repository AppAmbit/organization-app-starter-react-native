import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FeedModel, CollectionItemModel } from '../../models/FeedModel';
import { resolveImageUri } from '../../utils/image';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Layout, Radius, Shadow, Spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SingleLargeCardProps {
  section: FeedModel;
  onPressItem: (item: CollectionItemModel) => void;
}

export function SingleLargeCard({ section, onPressItem }: SingleLargeCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const item: CollectionItemModel | undefined = section.collection?.[0];
  if (!item) { return null; }

  const imageUri = resolveImageUri(item.image_url);
  const hasImage = !!imageUri;
  const CARD_HEIGHT = Math.round((SCREEN_WIDTH - Layout.screenPaddingH * 2) * 0.6);

  return (
    <View style={[styles.container, { marginTop: Spacing.xl }]}>
      <Pressable onPress={() => onPressItem(item)} accessibilityRole="button">
        <View
          style={[
            styles.card,
            Shadow.md,
            { height: CARD_HEIGHT, backgroundColor: colors.surfaceElevated },
          ]}>
          {hasImage && (
            <Image
              source={{ uri: imageUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          )}

          {hasImage ? (
            <View style={styles.overlay}>
              <View style={styles.textBlock}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title ?? ''}
                </Text>
                {!!item.subtitle && (
                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={[styles.overlay, styles.textCenter]}>
              <Text
                style={[styles.cardTitle, { color: colors.textPrimary }]}
                numberOfLines={3}>
                {item.title ?? ''}
              </Text>
              {!!item.subtitle && (
                <Text
                  style={[styles.cardSubtitle, { color: colors.textSecondary }]}
                  numberOfLines={3}>
                  {item.subtitle}
                </Text>
              )}
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Layout.screenPaddingH },
  card: {
    width: '100%',
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
