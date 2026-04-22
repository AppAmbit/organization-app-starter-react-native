/**
 * HorizontalCarousel — Reusable horizontal scrolling section
 */

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
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  onSeeAll?: () => void;
  itemSpacing?: number;
  showSeeAll?: boolean;
}

export function HorizontalCarousel<T>({
  title,
  data,
  renderItem,
  keyExtractor,
  onSeeAll,
  itemSpacing = Spacing.md,
  showSeeAll = true,
}: HorizontalCarouselProps<T>) {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);

  return (
    <View style={styles.section}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        {showSeeAll && onSeeAll && (
          <Pressable onPress={onSeeAll} hitSlop={8}>
            <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
          </Pressable>
        )}
      </View>

      {/* Horizontal list */}
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
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPaddingH,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  list: {
    paddingBottom: 4,
  },
});
