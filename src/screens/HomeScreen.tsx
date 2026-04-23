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
import { FeedModel } from '../models/FeedModel';
import { getColors } from '../theme/colors';
import { FontSize, FontWeight } from '../theme/typography';
import { Layout, Radius, Spacing } from '../theme/spacing';
import { FeaturedCard } from '../components/cards/FeaturedCard';
import { LargeCard } from '../components/cards/LargeCard';
import { SmallCard } from '../components/cards/SmallCard';
import { HorizontalCarousel } from '../components/carousels/HorizontalCarousel';
import { FeaturedCardSkeleton, LargeCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeaturedCarouselProps {
  items: FeedModel[];
}

function FeaturedCarousel({ items }: FeaturedCarouselProps) {
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
            <FeaturedCard article={item} onPress={() => {}} width={SCREEN_WIDTH} />
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

const featuredStyles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

function toList(raw: any): any[] {
  if (Array.isArray(raw)) { return raw; }
  if (raw && Array.isArray(raw.data)) { return raw.data; }
  if (raw && Array.isArray(raw.items)) { return raw.items; }
  if (raw && Array.isArray(raw.results)) { return raw.results; }
  return [];
}

function resolveString(rawVal: any): string {
  let val = rawVal;
  if (Array.isArray(val)) val = val[0];
  if (val && typeof val === 'object') {
    val = val.value || val.key || val.name || val.title || val.label || val.id || val;
  }
  return String(val ?? '').trim();
}

function resolveNumber(rawVal: any): number {
  const str = resolveString(rawVal);
  return Number(str) || 0;
}

function extractModules(raw: any): FeedModel[] {
  const list = toList(raw);
  return (list as FeedModel[])
    .filter(item => item && item.enabled !== false)
    .sort((a, b) => {
      const aDisp = resolveNumber(a.display_order);
      const bDisp = resolveNumber(b.display_order);
      const dispDiff = aDisp - bDisp;
      
      if (dispDiff !== 0) { return dispDiff; }
      
      const aItem = resolveNumber(a.item_order);
      const bItem = resolveNumber(b.item_order);
      return aItem - bItem;
    });
}

interface FeedSection {
  module: FeedModel;
  items: FeedModel[];
}

function groupByDisplayOrder(modules: FeedModel[]): FeedSection[] {
  const map = new Map<number, FeedSection>();

  for (const mod of modules) {
    const key = resolveNumber(mod.display_order);
    
    const existing = map.get(key);
    if (existing) {
      existing.items.push(mod);
    } else {
      map.set(key, { module: mod, items: [mod] });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => resolveNumber(a.module.display_order) - resolveNumber(b.module.display_order)
  );
}

function resolveCardType(rawType: any): string {
  return resolveString(rawType).toLowerCase();
}

function toCardModel(raw: FeedModel, section: FeedSection): FeedModel {
  return {
    ...raw,
    module_title: raw.card_title ?? raw.module_title ?? null,
    module_subtitle: raw.card_subtitle ?? raw.module_subtitle ?? null,
    card_type: resolveCardType(section.module.card_type) as any,
  };
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'>;
};

export const HomeScreen: React.FC<Props> = ({ navigation: _navigation }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<FeedSection[]>([]);
  const [error, setError] = useState<string | null>(null);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;

    const loadFeed = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const raw = await (cms() as any)
          .content('organization_app_starter_new')
          .getList();

        if (cancelled) { return; }

        const modules = extractModules(raw);
        const built = groupByDisplayOrder(modules);
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

  const renderSection = (section: FeedSection, index: number) => {
    const { module } = section;
    const sectionTitle = module.module_title ?? '';
    const sectionSubtitle = module.module_subtitle ?? null;
    const seeAllLabel = module.see_all_label ?? 'Ver todo';
    const hasSeeAll = !!module.see_all_label;

    const cardItems = section.items.map(item => toCardModel(item, section));

    const safeCardType = resolveCardType(module.card_type);

    switch (safeCardType) {
      case 'featured':
        return (
          <FeaturedCarousel
            key={`${module.id}-${index}`}
            items={cardItems}
          />
        );

      case 'small':
        return (
          <View key={`${module.id}-${index}`} style={styles.sectionGap}>
            <HorizontalCarousel
              title={sectionTitle}
              subtitle={sectionSubtitle}
              data={cardItems}
              keyExtractor={item => item.id}
              onSeeAll={() => {}}
              seeAllLabel={seeAllLabel}
              showSeeAll={hasSeeAll}
              itemSpacing={Spacing.md}
              renderItem={({ item }) => (
                <SmallCard article={item} onPress={() => {}} />
              )}
            />
          </View>
        );

      case 'large':
      case 'showcase':
      default:
        return (
          <View key={`${module.id}-${index}`} style={styles.sectionGap}>
            <HorizontalCarousel
              title={sectionTitle}
              subtitle={sectionSubtitle}
              data={cardItems}
              keyExtractor={item => item.id}
              onSeeAll={() => {}}
              seeAllLabel={seeAllLabel}
              showSeeAll={hasSeeAll}
              renderItem={({ item }) => (
                <LargeCard article={item} onPress={() => {}} />
              )}
            />
          </View>
        );
    }
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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
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
          contentContainerStyle={styles.scrollContent}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  stickyHeader: {
    borderBottomWidth: 1,
    zIndex: 10,
  },
  toolbar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPaddingH,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.xl,
  },
  featuredSection: {},
  sectionGap: {
    marginTop: Spacing.xl,
  },
  skeletonSection: {
    paddingHorizontal: Layout.screenPaddingH,
  },
  skeletonItem: {
    paddingHorizontal: Layout.screenPaddingH,
    marginTop: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  errorTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  errorMessage: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  bottomPad: {
    height: Spacing.xxxl,
  },
});
