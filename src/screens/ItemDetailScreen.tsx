import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import RenderHtml, {
  HTMLElementModel,
  HTMLContentModel,
  defaultSystemFonts,
} from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import { cms } from 'appambit';
import { resolveImageUri } from '../utils/image';
import { getColors } from '../theme/colors';
import { FontSize, FontWeight, typography } from '../theme/typography';
import { Layout, Radius, Shadow, Spacing } from '../theme/spacing';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ContentDetailItem } from '../models/FeedModel';
import * as AppAmbit from 'appambit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(SCREEN_WIDTH * 1.1);
const CONTENT_WIDTH = SCREEN_WIDTH - Layout.screenPaddingH * 2;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ItemDetail'>;
  route: RouteProp<RootStackParamList, 'ItemDetail'>;
};

// ─── iframe support for rich-text blocks ────────────────────────────────────

const iframeModel = HTMLElementModel.fromCustomModel({
  tagName: 'iframe',
  mixedUAStyles: { alignSelf: 'stretch' },
  contentModel: HTMLContentModel.block,
});

function IframeRenderer({ tnode }: { tnode: any }) {
  const src: string = tnode?.attributes?.src ?? '';
  const aspectH = CONTENT_WIDTH * (9 / 16);
  return (
    <WebView
      source={{ uri: src }}
      style={{ width: CONTENT_WIDTH, height: aspectH, marginVertical: Spacing.md }}
      allowsFullscreenVideo
      javaScriptEnabled
    />
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function toList(raw: any): any[] {
  if (Array.isArray(raw)) { return raw; }
  if (raw && Array.isArray(raw.data)) { return raw.data; }
  if (raw && Array.isArray(raw.items)) { return raw.items; }
  if (raw && Array.isArray(raw.results)) { return raw.results; }
  return [];
}

function resolveString(v: any): string {
  if (!v) { return ''; }
  if (Array.isArray(v)) { v = v[0]; }
  if (v && typeof v === 'object') {
    v = v.value ?? v.key ?? v.name ?? v.title ?? v.label ?? v.id ?? v;
  }
  return String(v ?? '').trim();
}

function parseBlock(raw: any): ContentDetailItem | null {
  if (!raw || typeof raw !== 'object') { return null; }
  const type = resolveString(raw.type) as ContentDetailItem['type'];
  if (!['button', 'text', 'image', 'video'].includes(type)) { return null; }
  return {
    id: raw.id ?? String(Math.random()),
    lookup_key: resolveString(raw.lookup_key) || null,
    type,
    text: resolveString(raw.text) || null,
    button_text: resolveString(raw.button_text) || null,
    button_color: resolveString(raw.button_color) || null,
    button_url: resolveString(raw.button_url) || null,
    banner_video: resolveString(raw.banner_video) || null,
    banner_image: raw.banner_image ?? null,
  };
}

/** Extract a CMS relation id from various possible shapes: string, {id}, {data:{id}} */
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

/** Returns true if `raw` looks like a plain relation reference (id only, not embedded data) */
function isRelationId(raw: any): boolean {
  if (typeof raw === 'string') { return true; }
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item || typeof item !== 'object') { return false; }
  const keys = Object.keys(item);
  return keys.length <= 2 && keys.includes('id');
}

function useHtmlStyles(colors: ReturnType<typeof getColors>) {
  return {
    body: {
      color: colors.textSecondary,
      fontSize: FontSize.base,
      lineHeight: FontSize.base * 1.65,
    },
    p: { marginTop: 0, marginBottom: Spacing.md, color: colors.textSecondary },
    strong: { color: colors.textPrimary, fontWeight: FontWeight.bold },
    b: { color: colors.textPrimary, fontWeight: FontWeight.bold },
    em: { fontStyle: 'italic', color: colors.textSecondary },
    i: { fontStyle: 'italic', color: colors.textSecondary },
    h1: {
      color: colors.textPrimary,
      fontSize: FontSize.xxl,
      fontWeight: FontWeight.extraBold,
      marginBottom: Spacing.sm,
    },
    h2: {
      color: colors.textPrimary,
      fontSize: FontSize.xl,
      fontWeight: FontWeight.bold,
      marginBottom: Spacing.sm,
    },
    h3: {
      color: colors.textPrimary,
      fontSize: FontSize.lg,
      fontWeight: FontWeight.semiBold,
      marginBottom: Spacing.xs,
    },
    ul: { paddingLeft: Spacing.md, marginBottom: Spacing.md },
    ol: { paddingLeft: Spacing.md, marginBottom: Spacing.md },
    li: { color: colors.textSecondary, marginBottom: Spacing.xs },
    a: { color: colors.accent, textDecorationLine: 'underline' },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      paddingLeft: Spacing.md,
      marginLeft: 0,
      color: colors.textTertiary,
      fontStyle: 'italic',
    },
    img: { borderRadius: Radius.md, marginVertical: Spacing.sm },
    hr: {
      backgroundColor: colors.border,
      height: StyleSheet.hairlineWidth,
      marginVertical: Spacing.lg,
    },
  } as Record<string, object>;
}

interface TextBlockProps {
  block: ContentDetailItem;
  colors: ReturnType<typeof getColors>;
}
function TextBlock({ block, colors }: TextBlockProps) {
  const tagsStyles = useHtmlStyles(colors);
  const html = block.text ?? '';
  const isHtml = /[<>]/.test(html);

  if (!html) { return null; }

  return isHtml ? (
    <View style={blockStyles.textBlock}>
      <RenderHtml
        contentWidth={CONTENT_WIDTH}
        source={{ html }}
        tagsStyles={tagsStyles}
        systemFonts={defaultSystemFonts}
        customHTMLElementModels={{ iframe: iframeModel }}
        renderers={{ iframe: IframeRenderer }}
        renderersProps={{ img: { enableExperimentalPercentWidth: true } }}
        enableExperimentalBRCollapsing
        enableExperimentalGhostLinesPrevention
      />
    </View>
  ) : (
    <Text style={[blockStyles.plainText, { color: colors.textSecondary }]}>{html}</Text>
  );
}

interface ButtonBlockProps {
  block: ContentDetailItem;
  colors: ReturnType<typeof getColors>;
}
function ButtonBlock({ block, colors }: ButtonBlockProps) {
  const label = block.button_text || 'Tap';
  const url = block.button_url ?? '';
  const bgColor = block.button_color && block.button_color.startsWith('#')
    ? block.button_color
    : colors.accent;

  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 200, friction: 10 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();

  const handlePress = () => {
    if (url) { Linking.openURL(url).catch(() => {}); }
  };

  return (
    <Animated.View style={[blockStyles.btnWrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[blockStyles.btn, { backgroundColor: bgColor }, Shadow.sm]}>
        <Text style={blockStyles.btnText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

interface ImageBlockProps {
  block: ContentDetailItem;
}
function ImageBlock({ block }: ImageBlockProps) {
  const uri = resolveImageUri(block.banner_image);
  if (!uri) { return null; }
  const imgH = Math.round(CONTENT_WIDTH * 0.6);
  return (
    <Animated.Image
      source={{ uri }}
      style={[blockStyles.blockImage, { height: imgH }]}
      resizeMode="cover"
    />
  );
}

interface VideoBlockProps {
  block: ContentDetailItem;
}
function VideoBlock({ block }: VideoBlockProps) {
  const uri = block.banner_video ?? '';
  if (!uri) { return null; }
  const videoH = Math.round(CONTENT_WIDTH * (9 / 16));
  return (
    <View style={[blockStyles.videoWrapper, { height: videoH }]}>
      <WebView
        source={{ uri }}
        style={{ width: CONTENT_WIDTH, height: videoH }}
        allowsFullscreenVideo
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

// ─── main block dispatcher ────────────────────────────────────────────────────

interface ContentBlockProps {
  block: ContentDetailItem;
  colors: ReturnType<typeof getColors>;
}
function ContentBlock({ block, colors }: ContentBlockProps) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} colors={colors} />;
    case 'button':
      return <ButtonBlock block={block} colors={colors} />;
    case 'image':
      return <ImageBlock block={block} />;
    case 'video':
      return <VideoBlock block={block} />;
    default:
      return null;
  }
}

export const ItemDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { item } = route.params;
  const scheme = useColorScheme() ?? 'light';
  const colors = getColors(scheme);
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;

  const [blocks, setBlocks] = useState<ContentDetailItem[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);

  const title = item.title ?? 'No title';
  const imageUri = resolveImageUri(item.image_url);

  // Legacy fallback: use body/subtitle if no blocks come back
  const legacyContent = item.body ?? item.subtitle ?? null;
  const legacyIsHtml = legacyContent ? /[<>]/.test(legacyContent) : false;
  const tagsStyles = useHtmlStyles(colors);

  useEffect(() => {
    AppAmbit.trackEvent('Content Opened');
  }, []);

  // Fetch content_detail_items for this item using precise CMS queries
  const fetchBlocks = useCallback(async () => {
    setLoadingBlocks(true);
    try {
      // Strategy 1 — inline: the CMS already embedded the relation object in the item
      const inlineDetail = (item as any).content_detail;
      if (inlineDetail && !isRelationId(inlineDetail)) {
        const parsed = toList(inlineDetail)
          .map(parseBlock)
          .filter(Boolean) as ContentDetailItem[];
        setBlocks(parsed);
        return;
      }

      // Strategy 2 — targeted query by content_detail_id (relation id stored on the item)
      const detailId = item.content_detail_id ?? resolveRelationId(inlineDetail);
      if (detailId) {
        const raw = await cms()
          .content('content_detail_items')
          .equals('id', detailId)
          .getList();
        const parsed = toList(raw).map(parseBlock).filter(Boolean) as ContentDetailItem[];
        setBlocks(parsed);
        return;
      }

      // Strategy 3 — fallback: filter by item lookup_key
      if (item.lookup_key) {
        const raw = await cms()
          .content('content_detail_items')
          .equals('lookup_key', item.lookup_key)
          .getList();
        const parsed = toList(raw).map(parseBlock).filter(Boolean) as ContentDetailItem[];
        setBlocks(parsed);
        return;
      }

      // Nothing matched
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

        {/* ── Hero image ── */}
        <View style={styles.heroContainer}>
          {imageUri ? (
            <Animated.Image
              source={{ uri: imageUri }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.surfaceElevated }]} />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'transparent']}
            style={styles.topGradient}
          />
        </View>

        {/* ── Body ── */}
        <View style={[styles.body, { backgroundColor: colors.background }]}>
          <Text style={[typography.headlineLarge, { color: colors.textPrimary, letterSpacing: -0.5 }]}>
            {title}
          </Text>

          {/* ── content_detail blocks ── */}
          {loadingBlocks ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          ) : blocks.length > 0 ? (
            <View style={styles.blocksContainer}>
              {blocks.map((block) => (
                <ContentBlock key={block.id} block={block} colors={colors} />
              ))}
            </View>
          ) : legacyContent ? (
            /* ── Legacy fallback: body / subtitle ── */
            legacyIsHtml ? (
              <View style={styles.richTextContainer}>
                <RenderHtml
                  contentWidth={CONTENT_WIDTH}
                  source={{ html: legacyContent }}
                  tagsStyles={tagsStyles}
                  systemFonts={defaultSystemFonts}
                  customHTMLElementModels={{ iframe: iframeModel }}
                  renderers={{ iframe: IframeRenderer }}
                  renderersProps={{ img: { enableExperimentalPercentWidth: true } }}
                  enableExperimentalBRCollapsing
                  enableExperimentalGhostLinesPrevention
                />
              </View>
            ) : (
              <Text style={[typography.bodyLarge, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                {legacyContent}
              </Text>
            )
          ) : null}
        </View>
      </ScrollView>

      {/* ── Back button ── */}
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

// ─── styles ───────────────────────────────────────────────────────────────────

const blockStyles = StyleSheet.create({
  textBlock: {
    marginTop: Spacing.sm,
  },
  plainText: {
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.65,
    marginTop: Spacing.sm,
  },
  btnWrapper: {
    marginTop: Spacing.md,
    alignSelf: 'stretch',
  },
  btn: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.3,
  },
  blockImage: {
    width: CONTENT_WIDTH,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  videoWrapper: {
    width: CONTENT_WIDTH,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  topGradient: {
    ...StyleSheet.absoluteFill,
    height: 120,
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
