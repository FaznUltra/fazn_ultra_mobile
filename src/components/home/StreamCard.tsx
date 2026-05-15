import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, spacing, radius } from '../../theme';
import { Avatar } from '../profile/Avatar';
import { WaveformAnim } from './WaveformAnim';
import type { LiveStream } from '../../types/home';

const CARD_HEIGHT = Dimensions.get('window').height * 0.65;

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61C19.32 3.09 16.86 3.09 15.34 4.61L12 7.95L8.66 4.61C7.14 3.09 4.68 3.09 3.16 4.61C1.64 6.13 1.64 8.59 3.16 10.11L12 18.95L20.84 10.11C22.36 8.59 22.36 6.13 20.84 4.61Z"
        stroke={filled ? colors.error : '#fff'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? colors.error : 'none'}
      />
    </Svg>
  );
}

function ShareIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={18} cy={5} r={3} stroke="#fff" strokeWidth={2} />
      <Circle cx={6} cy={12} r={3} stroke="#fff" strokeWidth={2} />
      <Circle cx={18} cy={19} r={3} stroke="#fff" strokeWidth={2} />
      <Path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function EyeIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={12} cy={12} r={3} stroke="#fff" strokeWidth={2} />
    </Svg>
  );
}

function PlayIcon() {
  return (
    <Svg width={34} height={34} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4L20 12L6 20V4Z" fill="#fff" />
    </Svg>
  );
}

interface Props {
  stream: LiveStream;
  isPlaying: boolean;
  onPress: () => void;
  onLike: () => void;
  onShare: () => void;
  onHostPress: () => void;
  testID?: string;
}

export function StreamCard({
  stream,
  isPlaying,
  onPress,
  onLike,
  onShare,
  onHostPress,
  testID,
}: Props) {
  const glow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!isPlaying) {
      glow.stopAnimation();
      glow.setValue(0.4);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isPlaying, glow]);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Watch ${stream.title}`}
      testID={testID}
    >
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: stream.gameBg },
        isPlaying && {
          borderWidth: 2,
          borderColor: colors.primaryLight,
          opacity: glow,
        },
      ]}
    >
      {/* Top overlay */}
      <View style={styles.topOverlay}>
        {stream.isLive && (
          <View style={styles.liveBadge} testID={`stream-live-${stream.id}`}>
            <Text style={styles.liveDot}>●</Text>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <View style={styles.viewerPill}>
          <EyeIcon />
          <Text style={styles.viewerText}>
            {stream.viewerCount.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Center */}
      <View style={styles.center}>
        {isPlaying ? (
          <WaveformAnim isPlaying testID={`stream-waveform-${stream.id}`} />
        ) : (
          <View style={styles.playCircle} testID={`stream-play-${stream.id}`}>
            <PlayIcon />
          </View>
        )}
      </View>

      {/* Bottom overlay */}
      <View style={styles.bottomOverlay}>
        <View style={styles.bottomLeft}>
          <TouchableOpacity
            onPress={onHostPress}
            accessibilityRole="button"
            accessibilityLabel={`View ${stream.host.username}'s profile`}
            testID={`stream-host-${stream.id}`}
            style={styles.hostRow}
          >
            <Avatar
              avatarUrl={stream.host.avatarUrl}
              firstName={stream.host.firstName}
              lastName={stream.host.lastName}
              size={36}
            />
            <Text style={styles.username}>@{stream.host.username}</Text>
          </TouchableOpacity>
          <Text style={styles.streamTitle} numberOfLines={2}>
            {stream.title}
          </Text>
          <View style={styles.streamMeta}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{stream.game}</Text>
            </View>
            <View style={[styles.metaBadge, styles.platformBadge]}>
              <Text style={styles.metaBadgeText}>{stream.platform}</Text>
            </View>
          </View>
          <View style={styles.winRow}>
            <Text style={styles.winLabel}>Win up to </Text>
            <Text style={styles.winAmount}>
              {stream.currency}{stream.potentialWin.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRight}>
          <TouchableOpacity
            onPress={onLike}
            accessibilityRole="button"
            accessibilityLabel="Like stream"
            testID={`stream-like-${stream.id}`}
            style={styles.actionBtn}
          >
            <HeartIcon filled={stream.isLiked} />
            <Text style={styles.actionCount}>
              {stream.likeCount.toLocaleString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShare}
            accessibilityRole="button"
            accessibilityLabel="Share stream"
            testID={`stream-share-${stream.id}`}
            style={styles.actionBtn}
          >
            <ShareIcon />
            <Text style={styles.actionCount}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    zIndex: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  liveDot: { color: '#fff', fontSize: 8 },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  viewerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  viewerText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 2,
  },
  bottomLeft: { flex: 1, paddingRight: spacing.sm },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  username: { color: '#fff', fontSize: 13, fontWeight: '700' },
  streamTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bottomRight: { alignItems: 'center', gap: spacing.md },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionCount: { color: '#fff', fontSize: 11, fontWeight: '600' },
  streamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  metaBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  platformBadge: {
    backgroundColor: 'rgba(139,92,246,0.5)',
  },
  metaBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  winRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  winLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '500',
  },
  winAmount: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '800',
  },
});
