import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cms } from 'appambit';
import { FeedModel } from '../models/FeedModel';
import { getColors, Palette } from '../theme/colors';
import { FontSize, FontWeight } from '../theme/typography';
import { Layout, Radius, Spacing } from '../theme/spacing';
import { FeaturedCard } from '../components/cards/FeaturedCard';
import { LargeCard } from '../components/cards/LargeCard';
import { SmallCard } from '../components/cards/SmallCard';
import { HorizontalCarousel } from '../components/carousels/HorizontalCarousel';
import { FeaturedCardSkeleton, LargeCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { RootStackParamList } from '../navigation/AppNavigator';

Dimensions.get('window');

const ALL_CATEGORIES: Array<string> = [
  'All', 'Design', 'Technology', 'Business', 'Lifestyle', 'Development',
];
function extractModules(raw: any): FeedModel[] {
  if (!raw) return [];
  const list: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
    ? raw.data
    : typeof raw === 'object' && typeof raw?.length === 'number'
    ? Array.from({ length: raw.length }, (_, i) => raw[i])
    : [];

  return list
    .filter((item: any) => item?.enabled !== false)
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)) as FeedModel[];
}

interface FeedSection {
  module: FeedModel;
  items: FeedModel[];
}

function groupIntoSections(modules: FeedModel[]): FeedSection[] {
  const sections: FeedSection[] = [];

  for (const mod of modules) {
    const article = mod;
    const last = sections[sections.length - 1];

    if (
      last &&
      last.module.card_type === mod.card_type &&
      !mod.module_title
    ) {
      last.items.push(article);
    } else {
      sections.push({ module: mod, items: [article] });
    }
  }

  return sections;
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'>;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
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
          .content('organization_app_starter')
          .getList();

        if (cancelled) return;

        const modules = extractModules(raw);

        const built = groupIntoSections(modules);
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

  const filteredSections = useMemo<FeedSection[]>(() => {
    if (selectedCategory === 'All') return sections;
    return sections
      .map(section => ({
        ...section,
        items:
          section.module.card_type === 'featured'
            ? section.items
            : section.items.filter(a => a.source_content_type === selectedCategory),
      }))
      .filter(s => s.items.length > 0);
  }, [sections, selectedCategory]);

  const renderSection = (section: FeedSection, index: number) => {
    const { module, items } = section;
    const title = module.module_title ?? '';

    switch (module.card_type) {
      case 'featured':
        return (
          <View key={`${module.id}-${index}`} style={styles.featuredBannerSection}>
            <HorizontalCarousel
              title={title}
              data={items}
              keyExtractor={item => item.id}
              onSeeAll={() => {}}
              renderItem={({ item }) => (
                <FeaturedCard article={item} onPress={() => {}} />
              )}
            />
          </View>
        );

      case 'small':
        return (
          <View key={`${module.id}-${index}`} style={styles.sectionGap}>
            <HorizontalCarousel
              title={title}
              data={items}
              keyExtractor={item => item.id}
              onSeeAll={() => {}}
              itemSpacing={Spacing.md}
              renderItem={({ item }) => (
                <SmallCard article={item} onPress={() => {}} />
              )}
            />
          </View>
        );

      case 'large':
      default:
        return (
          <View key={`${module.id}-${index}`} style={styles.sectionGap}>
            <HorizontalCarousel
              title={title}
              data={items}
              keyExtractor={item => item.id}
              onSeeAll={() => {}}
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
          },
        ]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Content App
          </Text>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </View>

        <FlatList
          horizontal
          data={ALL_CATEGORIES}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => {
            const isActive = item === selectedCategory;
            const catColor =
              item === 'All'
                ? colors.accent
                : (Palette.categories as Record<string, string>)[item] ?? colors.accent;
            return (
              <Pressable
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? catColor : colors.surfaceElevated,
                    borderColor: isActive ? catColor : colors.border,
                  },
                ]}>
                <Text style={[styles.chipText, { color: isActive ? '#fff' : colors.textSecondary }]}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </Animated.View>

      {isLoading ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonSection}><FeaturedCardSkeleton /></View>
          {[0, 1, 2].map(i => (
            <View key={i} style={styles.skeletonItem}><LargeCardSkeleton /></View>
          ))}
        </ScrollView>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            Oops, something went wrong
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={[styles.scroll, { opacity: contentOpacity }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag">

          {filteredSections.length > 0
            ? filteredSections.map((s, i) => renderSection(s, i))
            : (
              <EmptyState
                title="No content found"
                message="There is no content available right now."
                actionLabel="Show All"
                onAction={() => setSelectedCategory('All')}
              />
            )}

          <View style={styles.bottomPad} />
        </Animated.ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  stickyHeader: {
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPaddingH,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extraBold,
    letterSpacing: -0.5,
  } as any,
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  chips: {
    paddingHorizontal: Layout.screenPaddingH,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: Spacing.xl },
  featuredBannerSection: {},
  sectionGap: { marginTop: Spacing.xl },
  skeletonSection: { paddingHorizontal: Layout.screenPaddingH },
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
  bottomPad: { height: Spacing.xxxl },
});
