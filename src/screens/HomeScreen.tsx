import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.85);
const CAROUSEL_CARD_HEIGHT = Math.round(CAROUSEL_CARD_WIDTH * 0.6);
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cms } from 'appambit';
import * as AppAmbit from 'appambit';
import { FeedModel, CollectionItemModel } from '../models/FeedModel';
import { getColors } from '../theme/colors';
import { FontSize, FontWeight } from '../theme/typography';
import { Layout, Spacing } from '../theme/spacing';
import { LargeCard } from '../components/cards/LargeCard';
import { SingleLargeCard } from '../components/cards/SingleLargeCard';
import { SmallCard } from '../components/cards/SmallCard';
import { HorizontalCarousel } from '../components/carousels/HorizontalCarousel';
import { FeaturedCarousel } from '../components/carousels/FeaturedCarousel';
import { FeaturedCardSkeleton, LargeCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { RootStackParamList } from '../navigation/AppNavigator';
import { buildSections } from '../utils/feedParser';

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

    const onPressItemInSection = (item: CollectionItemModel) => {
      if (section.title) {
        AppAmbit.trackEvent('Category Selected', { category: section.title });
      }
      navigateToDetail(item);
    };

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
            onPressItem={onPressItemInSection}
          />
        );
      }

      return (
        <View key={`${section.id}-${index}`} style={styles.sectionGap}>
          <HorizontalCarousel
            title=""
            data={items}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <LargeCard article={item} onPress={onPressItemInSection} width={CAROUSEL_CARD_WIDTH} height={CAROUSEL_CARD_HEIGHT} />
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
          itemSpacing={Spacing.md}
          renderItem={({ item }) => (
            <SmallCard article={item} onPress={onPressItemInSection} />
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
