import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Layout, Spacing } from '../../theme/spacing';

interface HorizontalCarouselProps<T> {
  title: string;
  subtitle?: string | null;
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
  itemSpacing?: number;
  showSeeAll?: boolean;
}

export function HorizontalCarousel<T>({
  title,
  subtitle,
  data,
  renderItem,
  keyExtractor,
  onSeeAll,
  seeAllLabel = 'See all',
  itemSpacing = Spacing.md,
  showSeeAll = true,
}: HorizontalCarouselProps<T>) {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);

  return (
    <View style={styles.section}>
      {!!title && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
            {!!subtitle && (
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          {showSeeAll && onSeeAll && (
            <Pressable onPress={onSeeAll} hitSlop={8}>
              <Text style={[styles.seeAll, { color: colors.accent }]}>{seeAllLabel}</Text>
            </Pressable>
          )}
        </View>
      )}
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          { paddingHorizontal: Layout.screenPaddingH, gap: itemSpacing },
        ]}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Layout.screenPaddingH,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: FontSize.xs,
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    paddingTop: 2,
  },
  list: {
    paddingBottom: 4,
  },
});
