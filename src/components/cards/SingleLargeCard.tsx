import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { FeedModel, CollectionItemModel } from '../../models/FeedModel';
import { LargeCard } from './LargeCard';
import { Layout, Spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SingleLargeCardProps {
  section: FeedModel;
  onPressItem: (item: CollectionItemModel) => void;
}

export function SingleLargeCard({ section, onPressItem }: SingleLargeCardProps) {
  const item: CollectionItemModel | undefined = section.collection?.[0];
  if (!item) { return null; }

  const cardWidth = SCREEN_WIDTH - Layout.screenPaddingH * 2;
  const cardHeight = Math.round(cardWidth * 0.6);

  return (
    <View style={styles.container}>
      <LargeCard
        article={item}
        onPress={onPressItem}
        width={cardWidth}
        height={cardHeight}
        style={styles.fullWidth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Layout.screenPaddingH, marginTop: Spacing.xl },
  fullWidth: { width: '100%' as any },
});
