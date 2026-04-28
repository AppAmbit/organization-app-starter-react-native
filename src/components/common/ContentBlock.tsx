import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Video, {
  ResizeMode,
  IgnoreSilentSwitchType,
} from 'react-native-video';
import { RichTextRenderer } from './RichTextRenderer';
import { resolveImageUri } from '../../utils/image';
import { getColors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Layout, Shadow, Spacing } from '../../theme/spacing';
import { ContentDetailItem } from '../../models/FeedModel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = SCREEN_WIDTH - Layout.screenPaddingH * 2;

export interface ContentBlockProps {
  block: ContentDetailItem;
  colors: ReturnType<typeof getColors>;
}

function TextBlock({
  block,
  colors,
}: {
  block: ContentDetailItem;
  colors: ReturnType<typeof getColors>;
}) {
  return (
    <RichTextRenderer
      html={block.text ?? ''}
      contentWidth={CONTENT_WIDTH}
      colors={colors}
    />
  );
}

function ButtonBlock({
  block,
  colors,
}: {
  block: ContentDetailItem;
  colors: ReturnType<typeof getColors>;
}) {
  const label = block.button_text || 'Tap';
  const url = block.button_url ?? '';
  const bgColor =
    block.button_color && block.button_color.startsWith('#')
      ? block.button_color
      : colors.accent;

  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();

  const handlePress = () => {
    if (url) { Linking.openURL(url).catch(() => {}); }
  };

  return (
    <Animated.View style={[styles.btnWrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.btn, { backgroundColor: bgColor }, Shadow.sm]}>
        <Text style={styles.btnText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function ImageBlock({ block }: { block: ContentDetailItem }) {
  const uri = resolveImageUri(block.banner_image);
  if (!uri) { return null; }
  const imgH = Math.round(SCREEN_WIDTH * 0.6);
  return (
    <Animated.Image
      source={{ uri }}
      style={[styles.blockImage, { height: imgH }]}
      resizeMode="cover"
    />
  );
}

function isHostedVideo(uri: string): boolean {
  return (
    uri.includes('youtube.com') ||
    uri.includes('youtu.be') ||
    uri.includes('vimeo.com')
  );
}

function VideoBlock({ block }: { block: ContentDetailItem }) {
  const uri = block.banner_video ?? '';
  if (!uri) { return null; }
  const videoH = Math.round(CONTENT_WIDTH * (9 / 16));
  return (
    <View style={[styles.videoWrapper, { height: videoH }]}>
      <Video
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        controls
        resizeMode={ResizeMode.CONTAIN}
        paused
        ignoreSilentSwitch={IgnoreSilentSwitchType.IGNORE}
        playInBackground={false}
        playWhenInactive={false}
      />
    </View>
  );
}

export function ContentBlock({ block, colors }: ContentBlockProps) {
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

const styles = StyleSheet.create({
  btnWrapper: {
    marginTop: Spacing.md,
    alignSelf: 'stretch',
  },
  btn: {
    borderRadius: 0,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.3,
  },
  blockImage: {
    width: SCREEN_WIDTH,
    marginHorizontal: -Layout.screenPaddingH,
    borderRadius: 0,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  videoWrapper: {
    width: SCREEN_WIDTH,
    marginHorizontal: -Layout.screenPaddingH,
    borderRadius: 0,
    marginTop: Spacing.md,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
});
