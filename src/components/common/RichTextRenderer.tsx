import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import RenderHtml, {
  HTMLContentModel,
  HTMLElementModel,
  defaultSystemFonts,
} from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Layout, Radius, Spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_CONTENT_WIDTH = SCREEN_WIDTH - Layout.screenPaddingH * 2;

const iframeModel = HTMLElementModel.fromCustomModel({
  tagName: 'iframe',
  mixedUAStyles: { alignSelf: 'stretch' },
  contentModel: HTMLContentModel.block,
});

function IframeRenderer({
  tnode,
  contentWidth,
}: {
  tnode: any;
  contentWidth: number;
}) {
  const src: string = tnode?.attributes?.src ?? '';
  const aspectH = contentWidth * (9 / 16);
  return (
    <WebView
      source={{ uri: src }}
      style={{ width: contentWidth, height: aspectH, marginVertical: Spacing.md }}
      allowsFullscreenVideo
      javaScriptEnabled
    />
  );
}

function buildTagsStyles(
  colors: ReturnType<typeof getColors>,
): Record<string, object> {
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
      letterSpacing: -0.5,
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
    },
    h2: {
      color: colors.textPrimary,
      fontSize: FontSize.xl + 2,
      fontWeight: FontWeight.bold,
      letterSpacing: -0.3,
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
    },
    h3: {
      color: colors.textPrimary,
      fontSize: FontSize.lg + 1,
      fontWeight: FontWeight.semiBold,
      letterSpacing: -0.1,
      marginTop: Spacing.sm + 4,
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
  };
}

export interface RichTextRendererProps {
  html: string;
  contentWidth?: number;
  colors: ReturnType<typeof getColors>;
  style?: object;
}

export function RichTextRenderer({
  html,
  contentWidth = DEFAULT_CONTENT_WIDTH,
  colors,
  style,
}: RichTextRendererProps) {
  if (!html) { return null; }

  let cleanHtml = html;

  if (cleanHtml.startsWith('"') && cleanHtml.endsWith('"') && cleanHtml.length > 1) {
    cleanHtml = cleanHtml.substring(1, cleanHtml.length - 1);
  }
  cleanHtml = cleanHtml.replace(/\\"/g, '"');
  cleanHtml = cleanHtml.replace(/<p>\s*(<img\b[^>]*>)\s*<\/p>/gi, '$1');

  const isHtml = /[<>]/.test(cleanHtml);
  const tagsStyles = buildTagsStyles(colors);

  if (!isHtml) {
    return (
      <Text style={[styles.plainText, { color: colors.textSecondary }]}>
        {cleanHtml}
      </Text>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <RenderHtml
        contentWidth={contentWidth}
        source={{ html: cleanHtml }}
        tagsStyles={tagsStyles}
        systemFonts={defaultSystemFonts}
        customHTMLElementModels={{ iframe: iframeModel }}
        renderers={{
          iframe: (props: any) => (
            <IframeRenderer tnode={props.tnode} contentWidth={contentWidth} />
          ),
        }}
        renderersProps={{ img: { enableExperimentalPercentWidth: true } }}
        enableExperimentalBRCollapsing
        enableExperimentalGhostLinesPrevention
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: Spacing.sm,
  },
  plainText: {
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.65,
    marginTop: Spacing.sm,
  },
});
