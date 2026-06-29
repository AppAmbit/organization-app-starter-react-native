import React, { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View, useColorScheme } from 'react-native';
import { CollectionItemModel } from '../../models/FeedModel';
import { FeaturedCard } from '../cards/FeaturedCard';
import { getColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeaturedCarouselProps {
  items: CollectionItemModel[];
  onPressItem: (item: CollectionItemModel) => void;
}

export function FeaturedCarousel({ items, onPressItem }: FeaturedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);

  return (
    <View>
      <FlatList
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_WIDTH }}>
            <FeaturedCard article={item} onPress={onPressItem} width={SCREEN_WIDTH} />
          </View>
        )}
      />
      {items.length > 1 && (
        <View style={styles.dots}>
          {items.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === activeIndex ? colors.accent : colors.border },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
