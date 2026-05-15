import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, radius } from '../../theme';
import type { Challenge } from '../../types/home';

interface Props {
  challenge: Challenge;
  variant?: 'featured' | 'hot';
  onPress: () => void;
  onJoinPress: () => void;
}

function statusColor(status: Challenge['status']) {
  if (status === 'live') return colors.error;
  if (status === 'open') return colors.success;
  return colors.textMuted;
}

function statusLabel(status: Challenge['status']) {
  if (status === 'live') return 'LIVE';
  if (status === 'open') return 'OPEN';
  return 'ENDED';
}

export function ChallengeCard({
  challenge,
  variant = 'featured',
  onPress,
  onJoinPress,
}: Props) {
  const isHot = variant === 'hot';
  const containerStyle: ViewStyle = isHot ? styles.hotCard : styles.featuredCard;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={challenge.title}
      style={[containerStyle, { backgroundColor: challenge.gameBg }]}
      testID={`${isHot ? 'hot' : 'featured'}-card-${challenge.id}`}
    >
      {/* gradient-like overlay (bottom darkening) */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <View style={styles.gameBadge}>
            <Text style={styles.gameBadgeText} numberOfLines={1}>
              {challenge.game}
            </Text>
          </View>
          <View style={styles.platformBadge}>
            <Text style={styles.platformBadgeText} numberOfLines={1}>
              {challenge.platform}
            </Text>
          </View>
        </View>
        {!isHot && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor(challenge.status) + '33' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusColor(challenge.status) },
              ]}
            >
              {statusLabel(challenge.status)}
            </Text>
          </View>
        )}
      </View>

      {challenge.isHot && (
        <View style={styles.hotBadge} testID={`hot-flag-${challenge.id}`}>
          <Text style={styles.hotBadgeText}>🔥 Hot</Text>
        </View>
      )}

      {/* Spacer */}
      <View style={styles.flexFill} />

      {/* Title */}
      <Text
        style={isHot ? styles.hotTitle : styles.featuredTitle}
        numberOfLines={2}
      >
        {challenge.title}
      </Text>

      {isHot ? (
        <>
          <Text style={styles.hotPrize}>
            {challenge.currency}
            {challenge.prize.toLocaleString()}
          </Text>
          <View style={styles.hotBottomRow}>
            <View style={styles.participantPill}>
              <Text style={styles.participantPillText}>
                {challenge.participantCount}/{challenge.maxParticipants} joined
              </Text>
            </View>
            <TouchableOpacity
              onPress={onJoinPress}
              accessibilityRole="button"
              accessibilityLabel={`Join ${challenge.title}`}
              style={styles.joinBtnSmall}
              testID={`join-btn-${challenge.id}`}
            >
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.featuredBottomRow}>
          <View style={styles.featuredMeta}>
            <Text style={styles.prizeText} testID={`prize-${challenge.id}`}>
              {challenge.currency}
              {challenge.prize.toLocaleString()}
            </Text>
            <Text style={styles.metaSub}>
              Entry {challenge.currency}
              {challenge.entryFee.toLocaleString()} ·{' '}
              {challenge.participantCount}/{challenge.maxParticipants}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onJoinPress}
            accessibilityRole="button"
            accessibilityLabel={`Join ${challenge.title}`}
            style={styles.joinBtn}
            testID={`join-btn-${challenge.id}`}
          >
            <Text style={styles.joinBtnText}>Join</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  featuredCard: {
    width: '100%',
    height: 190,
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  hotCard: {
    width: 210,
    height: 165,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  gameBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    maxWidth: 110,
  },
  gameBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  platformBadge: {
    backgroundColor: 'rgba(139,92,246,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  platformBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hotBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  hotBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  flexFill: { flex: 1 },
  featuredTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  hotTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  hotPrize: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  hotBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    flexShrink: 1,
  },
  participantPillText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  featuredBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  featuredMeta: { flex: 1 },
  prizeText: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '800',
  },
  metaSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  joinBtnSmall: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  joinBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
