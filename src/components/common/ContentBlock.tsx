import React, { useRef, useState } from 'react';
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
import * as AppAmbit from 'appambit';
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
    if (!url) { return; }
    AppAmbit.trackEvent('Resource Opened', { url, label });
    Linking.openURL(url).catch(() => {});
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
  // Prefer the fully-resolved URL from the CMS; fall back to resolveImageUri for local assets
  const uri = block.banner_image_url || resolveImageUri(block.banner_image);
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

function VideoBlock({ block }: { block: ContentDetailItem }) {
  const uri = block.banner_video ?? '';
  const [paused, setPaused] = useState(true);
  
  if (!uri) { return null; }
  const videoH = Math.round(CONTENT_WIDTH * (9 / 16));

  return (
    <View style={[styles.videoWrapper, { height: videoH }]}>
      <Video
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        controls={!paused}
        resizeMode={ResizeMode.CONTAIN}
        paused={paused}
        ignoreSilentSwitch={IgnoreSilentSwitchType.IGNORE}
        playInBackground={false}
        playWhenInactive={false}
        onEnd={() => setPaused(true)}
      />
      {paused && (
        <Pressable
          style={styles.playOverlay}
          onPress={() => {
            AppAmbit.trackEvent('Video Played', { url: uri });
            setPaused(false);
          }}
        >
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>▶</Text>
          </View>
        </Pressable>
      )}
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
    position: 'relative',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 32,
    color: '#000',
    marginLeft: 4,
  },
});
