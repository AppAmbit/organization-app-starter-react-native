import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { cms } from 'appambit';
import * as AppAmbit from 'appambit';
import { getColors } from '../theme/colors';
import { FontWeight } from '../theme/typography';
import { Layout, Radius, Shadow, Spacing } from '../theme/spacing';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ContentDetailItem } from '../models/FeedModel';
import { ContentBlock } from '../components/common/ContentBlock';
import { RichTextRenderer } from '../components/common/RichTextRenderer';
import {
  toList,
  parseBlock,
  resolveRelationId,
  isRelationId,
} from '../utils/contentBlockParser';

const USE_MOCK_BLOCKS = false;

const MOCK_BLOCKS: ContentDetailItem[] = [
  {
    id: 'mock-text-1',
    type: 'text',
    text: `<h2>Welcome to the Experience</h2>
    <p>This is a <strong>rich-text block</strong> that supports <em>HTML formatting</em>, lists, and more. All content here will eventually come from the CMS.</p>
    <ul>
    <li>Fully configurable via the dashboard</li>
    <li>Supports <strong>bold</strong>, <em>italic</em> and links</li>
    <li>Renders HTML natively on iOS &amp; Android</li>
    </ul>`,
  },
  {
    id: 'mock-image-1',
    type: 'image',
    banner_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    id: 'mock-text-2',
    type: 'text',
    text: `<p>Images, videos and interactive buttons can appear in <strong>any order</strong> — the layout is driven entirely by the CMS block sequence. The section below shows an embedded video.</p>`,
  },
  {
    id: 'mock-video-1',
    type: 'video',
    banner_video: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: 'mock-button-1',
    type: 'button',
    button_text: 'Get Started Now',
    button_color: '#191ea8ff',
    button_url: 'https://appambit.com',
  },
  {
    id: 'mock-text-3',
    type: 'text',
    text: `<h3>Why Choose Us?</h3>
    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80" alt="Team working" />
    <p>Our platform provides a seamless experience for managing your organization's content. With modular blocks, you can create engaging layouts without touching code.</p>
    <blockquote>"The new modular design system is a game changer for our content team." - Satisfied User</blockquote>`,
  },
  {
    id: 'mock-image-2',
    type: 'image',
    banner_image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
  },
  {
    id: 'mock-text-4',
    type: 'text',
    text: `<p>We also support <em>custom styling</em> and deep integrations with analytics. Ready to take the next step?</p>`,
  },
  {
    id: 'mock-button-2',
    type: 'button',
    button_text: 'Learn More →',
    button_color: '#00BFA5',
    button_url: 'https://appambit.com',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = SCREEN_WIDTH - Layout.screenPaddingH * 2;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ItemDetail'>;
  route: RouteProp<RootStackParamList, 'ItemDetail'>;
};

export const ItemDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { item } = route.params;
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;

  const [blocks, setBlocks] = useState<ContentDetailItem[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);

  const legacyContent = item.body ?? item.subtitle ?? null;

  useEffect(() => {
    AppAmbit.trackEvent('Content Opened');
  }, []);

  const fetchBlocks = useCallback(async () => {
    if (USE_MOCK_BLOCKS) {
      setBlocks(MOCK_BLOCKS);
      setLoadingBlocks(false);
      return;
    }

    setLoadingBlocks(true);
    try {
      const inlineDetail = item.content_detail;

      // ── Case 1: content_detail is a fully-expanded object with typed blocks ──
      // e.g. travel_largecard_content — content array has {type, text, …}
      if (
        inlineDetail &&
        Array.isArray(inlineDetail.content) &&
        inlineDetail.content.length > 0 &&
        !isRelationId(inlineDetail.content[0])
      ) {
        const parsed = inlineDetail.content
          .map(parseBlock)
          .filter(Boolean) as ContentDetailItem[];
        setBlocks(parsed);
        return;
      }

      // ── Case 2: content_detail has reference IDs (objects OR plain strings) ──
      // Variants:
      //   a) [{entry_id: "uuid"}…]  → carousel_items with content_detail
      //   b) ["uuid", "uuid", …]    → feed_carousel entries with `content` field
      if (
        inlineDetail &&
        Array.isArray(inlineDetail.content) &&
        inlineDetail.content.length > 0 &&
        isRelationId(inlineDetail.content[0])
      ) {
        // Handles both plain strings and {entry_id} / {id} objects
        const entryIds: string[] = inlineDetail.content
          .map((e: any) => (typeof e === 'string' ? e : (e.entry_id ?? e.id)))
          .filter(Boolean);

        const fetched = await Promise.all(
          entryIds.map((eid) =>
            cms()
              .content('content_detail_items')
              .equals('id', eid)
              .getList()
              .then((r) => toList(r))
              .catch(() => [] as any[])
          )
        );
        // fetched is an array-of-arrays; flatten and parse in order
        const parsed = fetched
          .flat()
          .map(parseBlock)
          .filter(Boolean) as ContentDetailItem[];
        setBlocks(parsed);
        return;
      }

      const detailId = item.content_detail_id ?? resolveRelationId(inlineDetail);
      if (detailId) {
        const detailRaw = await cms()
          .content('content_details')
          .equals('id', detailId)
          .getList();
        const detailList = toList(detailRaw);
        if (detailList.length > 0) {
          const detail = detailList[0];
          // content array may be plain strings OR {entry_id} objects
          const entryIds: string[] = toList(detail.content)
            .map((e: any) => (typeof e === 'string' ? e : (e.entry_id ?? e.id)))
            .filter(Boolean);

          if (entryIds.length > 0) {
            const fetched = await Promise.all(
              entryIds.map((eid) =>
                cms()
                  .content('content_detail_items')
                  .equals('id', eid)
                  .getList()
                  .then((r) => toList(r))
                  .catch(() => [] as any[])
              )
            );
            const parsed = fetched
              .flat()
              .map(parseBlock)
              .filter(Boolean) as ContentDetailItem[];
            setBlocks(parsed);
            return;
          }
        }
      }

      // ── Case 4: fallback by lookup_key ──
      if (item.lookup_key) {
        const raw = await cms()
          .content('content_detail_items')
          .equals('lookup_key', item.lookup_key)
          .getList();
        const parsed = toList(raw).map(parseBlock).filter(Boolean) as ContentDetailItem[];
        setBlocks(parsed);
        return;
      }

      setBlocks([]);
    } catch (e) {
      console.warn('[ItemDetail] Failed to fetch content blocks:', e);
      setBlocks([]);
    } finally {
      setLoadingBlocks(false);
    }
  }, [item]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, tension: 200, friction: 10 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxxl }}>

        <View style={[styles.body, { backgroundColor: colors.background }]}>
          {loadingBlocks ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          ) : blocks.length > 0 ? (
            <View
              style={[
                styles.blocksContainer,
                blocks[0].type !== 'image' && blocks[0].type !== 'video'
                  ? styles.blocksContainerTextFirst
                  : undefined,
              ]}>
              {blocks.map((block) => (
                <ContentBlock key={block.id} block={block} colors={colors} />
              ))}
            </View>
          ) : legacyContent ? (
            <RichTextRenderer
              html={legacyContent}
              contentWidth={CONTENT_WIDTH}
              colors={colors}
              style={styles.richTextContainer}
            />
          ) : null}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => navigation.goBack()}
        onPressIn={pressIn}
        onPressOut={pressOut}
        hitSlop={8}
        accessibilityLabel="Go Back"
        accessibilityRole="button"
        style={[
          styles.backBtn,
          { top: insets.top + (Platform.OS === 'android' ? 12 : 8) },
        ]}>
        <Animated.View
          style={[
            styles.backBtnInner,
            { transform: [{ scale }] },
            Shadow.sm,
          ]}>
          <Text style={styles.backBtnText}>{'←'}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  blocksContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  blocksContainerTextFirst: {
    marginTop: Spacing.xl,
  },
  richTextContainer: {
    marginTop: Spacing.sm,
  },
  loadingRow: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: Layout.screenPaddingH,
    zIndex: 20,
  },
  backBtnInner: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: FontWeight.bold,
    lineHeight: 22,
  },
});
