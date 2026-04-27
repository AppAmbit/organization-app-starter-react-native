import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cms } from 'appambit';
import { FeedModel, CollectionItemModel } from '../models/FeedModel';
import { getColors } from '../theme/colors';
import { FontSize, FontWeight } from '../theme/typography';
import { Layout, Spacing } from '../theme/spacing';
import { FeaturedCard } from '../components/cards/FeaturedCard';
import { LargeCard } from '../components/cards/LargeCard';
import { SingleLargeCard } from '../components/cards/SingleLargeCard';
import { SmallCard } from '../components/cards/SmallCard';
import { HorizontalCarousel } from '../components/carousels/HorizontalCarousel';
import { FeaturedCardSkeleton, LargeCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function toList(raw: any): any[] {
  if (Array.isArray(raw)) { return raw; }
  if (raw && Array.isArray(raw.data)) { return raw.data; }
  if (raw && Array.isArray(raw.items)) { return raw.items; }
  if (raw && Array.isArray(raw.results)) { return raw.results; }
  return [];
}

function resolveString(rawVal: any): string {
  let val = rawVal;
  if (Array.isArray(val)) { val = val[0]; }
  if (val && typeof val === 'object') {
    val = val.value ?? val.key ?? val.name ?? val.title ?? val.label ?? val.id ?? val;
  }
  return String(val ?? '').trim();
}

function resolveCardType(rawType: any): 'featured' | 'large' | 'small' {
  const t = resolveString(rawType).toLowerCase();
  if (t === 'featured' || t === 'large' || t === 'small') { return t; }
  return 'large';
}

function resolveRelationId(raw: any): string | null {
  if (!raw) { return null; }
  if (typeof raw === 'string') { return raw; }
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item) { return null; }
  if (typeof item === 'string') { return item; }
  if (item.id) { return String(item.id); }
  if (item.data?.id) { return String(item.data.id); }
  return null;
}

function parseCollectionItem(raw: any): CollectionItemModel {
  return {
    id: raw.id ?? '',
    lookup_key: resolveString(raw.lookup_key) || null,
    title: resolveString(raw.title) || null,
    subtitle: resolveString(raw.subtitle) || null,
    body: resolveString(raw.body) || null,
    image_url: raw.image_url ?? raw.image ?? null,
    badge: resolveString(raw.badge) || null,
    content_detail_id: resolveRelationId(raw.content_detail),
    _raw: raw,
  };
}

function buildSections(raw: any): FeedModel[] {
  const entries = toList(raw).sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );

  const featuredItems: CollectionItemModel[] = [];
  const nonFeatured: FeedModel[] = [];

  entries.forEach((entry) => {
    const cardType = resolveCardType(entry.card_type);
    const items = toList(entry.carousel).map(parseCollectionItem);

    if (cardType === 'featured') {
      featuredItems.push(...items);
    } else {
      nonFeatured.push({
        id: entry.id,
        title: resolveString(entry.title) || null,
        subtitle: resolveString(entry.subtitle) || null,
        card_type: cardType,
        is_collection: !!entry.is_collection,
        collection: entry.is_collection ? items : [parseCollectionItem(entry)],
      });
    }
  });

  const result: FeedModel[] = [];

  if (featuredItems.length > 0) {
    result.push({
      id: 'featured-merged',
      title: null,
      subtitle: null,
      card_type: 'featured',
      is_collection: true,
      collection: featuredItems,
    });
  }

  result.push(...nonFeatured);
  return result;
}

interface FeaturedCarouselProps {
  items: CollectionItemModel[];
  onPressItem: (item: CollectionItemModel) => void;
}

function FeaturedCarousel({ items, onPressItem }: FeaturedCarouselProps) {
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
        <View style={featuredStyles.dots}>
          {items.map((_, i) => (
            <View
              key={i}
              style={[
                featuredStyles.dot,
                { backgroundColor: i === activeIndex ? colors.accent : colors.border },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}


type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'>;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<FeedModel[]>([]);
  const [error, setError] = useState<string | null>(null);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;

    const loadFeed = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const raw = await cms()
          .content('feed_carousel')
          .getList();

        if (cancelled) { return; }

        const built = buildSections(raw);
        setSections(built);
        setIsLoading(false);

        Animated.parallel([
          Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(contentOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
      } catch (e: any) {
        if (!cancelled) {
          console.error('[HomeFeed] Error:', e);
          setError(e?.message ?? 'Failed to load content');
          setIsLoading(false);
        }
      }
    };

    loadFeed();
    return () => { cancelled = true; };
  }, [headerOpacity, contentOpacity]);

  const navigateToDetail = (item: CollectionItemModel) => {
    navigation.navigate('ItemDetail', { item });
  };

  const renderSection = (section: FeedModel, index: number) => {
    const { card_type: cardType, is_collection: isCollection, collection } = section;
    const items: CollectionItemModel[] = collection || [];

    if (cardType === 'featured') {
      return (
        <FeaturedCarousel
          key={`${section.id}-${index}`}
          items={items}
          onPressItem={navigateToDetail}
        />
      );
    }

    if (cardType === 'large') {
      if (!isCollection) {
        return (
          <SingleLargeCard
            key={`${section.id}-${index}`}
            section={section}
            onPressItem={navigateToDetail}
          />
        );
      }

      return (
        <View key={`${section.id}-${index}`} style={styles.sectionGap}>
          <HorizontalCarousel
            title=""
            data={items}
            keyExtractor={item => item.id}
            onSeeAll={() => {}}
            showSeeAll={false}
            renderItem={({ item }) => (
              <LargeCard article={item} onPress={navigateToDetail} />
            )}
          />
        </View>
      );
    }

    return (
      <View key={`${section.id}-${index}`} style={styles.sectionGap}>
        <HorizontalCarousel
          title={section.title ?? ''}
          subtitle={section.subtitle}
          data={items}
          keyExtractor={item => item.id}
          onSeeAll={() => {}}
          showSeeAll={false}
          itemSpacing={Spacing.md}
          renderItem={({ item }) => (
            <SmallCard article={item} onPress={navigateToDetail} />
          )}
        />
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            opacity: headerOpacity,
            paddingTop: insets.top,
          },
        ]}>
        <View style={styles.toolbar}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            MyApp
          </Text>
        </View>
      </Animated.View>

      {isLoading ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonSection}>
            <FeaturedCardSkeleton />
          </View>
          {[0, 1].map(i => (
            <View key={i} style={styles.skeletonItem}>
              <LargeCardSkeleton />
            </View>
          ))}
        </ScrollView>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            Oops, something went wrong
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={[styles.scroll, { opacity: contentOpacity }]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag">
          {sections.length > 0
            ? sections.map((s, i) => renderSection(s, i))
            : (
              <EmptyState
                title="No content found"
                message="There is no content available right now."
                actionLabel="Retry"
                onAction={() => {}}
              />
            )}
          <View style={styles.bottomPad} />
        </Animated.ScrollView>
      )}
    </View>
  );
};

const featuredStyles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

const styles = StyleSheet.create({
  screen: { flex: 1 },
  stickyHeader: { borderBottomWidth: 1, zIndex: 10 },
  toolbar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  sectionGap: { marginTop: Spacing.xl },
  skeletonSection: { paddingHorizontal: Layout.screenPaddingH },
  skeletonItem: { paddingHorizontal: Layout.screenPaddingH, marginTop: Spacing.lg },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  errorTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  errorMessage: { fontSize: FontSize.sm, textAlign: 'center' },
  bottomPad: { height: Spacing.xxxl },
});
