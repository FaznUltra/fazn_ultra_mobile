import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';
import { Avatar } from '../profile/Avatar';
import { ClockIcon } from './ArenaIcons';
import type { ArenaChallenge, ChallengeStatus } from '../../types/arena';

const AMBER = '#f59e0b';

interface Props {
  challenge: ArenaChallenge;
  variant: 'marketplace' | 'my-bet' | 'live' | 'invited';
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onSubmitResult?: () => void;
  testID?: string;
}

// ── Time formatting helper ────────────────────────────────────────────────
function formatTime(iso: string): { label: string; urgent: boolean } {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = target - now;
  const absMin = Math.round(Math.abs(diffMs) / 60_000);

  if (diffMs <= 0) {
    return { label: 'Ended', urgent: false };
  }
  if (absMin < 60) {
    return { label: `${absMin}m remaining`, urgent: true };
  }
  if (absMin < 24 * 60) {
    const h = Math.floor(absMin / 60);
    const m = absMin % 60;
    return { label: `${h}h ${m}m`, urgent: false };
  }

  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const now0 = new Date();
  const today = new Date(now0.getFullYear(), now0.getMonth(), now0.getDate());
  const targetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round(
    (targetDay.getTime() - today.getTime()) / 86_400_000,
  );
  if (dayDiff === 0) return { label: `Today ${hh}:${mm}`, urgent: false };
  if (dayDiff === 1) return { label: `Tomorrow ${hh}:${mm}`, urgent: false };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return {
    label: `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${hh}:${mm}`,
    urgent: false,
  };
}

function statusVisual(
  status: ChallengeStatus,
  outcome: ArenaChallenge['outcome'],
): { color: string; label: string; pulse?: boolean } {
  switch (status) {
    case 'open':
      return { color: colors.success, label: 'OPEN' };
    case 'pending_acceptance':
      return { color: AMBER, label: 'PENDING' };
    case 'accepted':
      return { color: colors.primaryLight, label: 'ACCEPTED' };
    case 'live':
      return { color: colors.error, label: 'LIVE', pulse: true };
    case 'awaiting_result':
      return { color: AMBER, label: 'AWAITING RESULT' };
    case 'disputed':
      return { color: colors.error, label: 'DISPUTED' };
    case 'completed':
      if (outcome === 'win') return { color: colors.success, label: 'WON' };
      if (outcome === 'loss') return { color: colors.error, label: 'LOST' };
      return { color: colors.textMuted, label: 'DRAW' };
    case 'cancelled':
      return { color: colors.textMuted, label: 'CANCELLED' };
    case 'rejected':
      return { color: colors.textMuted, label: 'REJECTED' };
    case 'expired':
      return { color: colors.textMuted, label: 'EXPIRED' };
    case 'void':
      return { color: colors.textMuted, label: 'VOID' };
    case 'refunded':
      return { color: colors.textMuted, label: 'REFUNDED' };
    default:
      return { color: colors.textMuted, label: status };
  }
}

const naira = (n: number) => `₦${n.toLocaleString()}`;

export function ArenaChallengeCard({
  challenge,
  variant,
  onPress,
  onAccept,
  onReject,
  onCancel,
  onSubmitResult,
  testID,
}: Props) {
  const sv = statusVisual(challenge.status, challenge.outcome);
  const showCreatorRow =
    variant === 'marketplace' || variant === 'live' || variant === 'invited';
  const showVsRow =
    challenge.opponent != null &&
    ['accepted', 'live', 'awaiting_result', 'disputed', 'completed'].includes(
      challenge.status,
    );

  const startLabel = (() => {
    if (challenge.status === 'live') return 'LIVE';
    if (challenge.gameEndTime || challenge.status === 'awaiting_result')
      return 'Ended';
    return formatTime(challenge.gameStartTime).label;
  })();

  const acceptBy = formatTime(challenge.acceptanceDue);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${challenge.game} challenge, ${sv.label}`}
      testID={testID}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.gameWrap}>
          <View
            style={[styles.swatch, { backgroundColor: challenge.gameBg }]}
          />
          <Text style={styles.gameName} numberOfLines={1}>
            {challenge.game}
          </Text>
          <View style={styles.platformPill}>
            <Text style={styles.platformText}>{challenge.platform}</Text>
          </View>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: sv.color + '22' }]}
          testID={`card-status-${challenge.id}`}
        >
          {sv.pulse && (
            <View style={[styles.dot, { backgroundColor: sv.color }]} />
          )}
          <Text style={[styles.statusText, { color: sv.color }]}>
            {sv.label}
          </Text>
        </View>
      </View>

      {/* Creator row */}
      {showCreatorRow && (
        <View style={styles.creatorRow}>
          <Avatar
            firstName={challenge.creator.firstName}
            lastName={challenge.creator.lastName}
            avatarUrl={challenge.creator.avatarUrl}
            size={28}
          />
          <Text style={styles.username}>@{challenge.creator.username}</Text>
          <View style={styles.formatPill}>
            <Text style={styles.formatText}>{challenge.format}</Text>
          </View>
        </View>
      )}

      {/* VS row */}
      {showVsRow && challenge.opponent && (
        <View style={styles.vsRow}>
          <View style={styles.vsSide}>
            <Avatar
              firstName={challenge.creator.firstName}
              lastName={challenge.creator.lastName}
              avatarUrl={challenge.creator.avatarUrl}
              size={28}
            />
            <Text style={styles.vsName} numberOfLines={1}>
              @{challenge.creator.username}
            </Text>
          </View>
          <Text style={styles.vsLabel}>VS</Text>
          <View style={styles.vsSide}>
            <Avatar
              firstName={challenge.opponent.firstName}
              lastName={challenge.opponent.lastName}
              avatarUrl={challenge.opponent.avatarUrl}
              size={28}
            />
            <Text style={styles.vsName} numberOfLines={1}>
              @{challenge.opponent.username}
            </Text>
          </View>
        </View>
      )}

      {/* Stake section */}
      <View style={styles.stakeRow}>
        <Text style={styles.stakeText}>
          Stake: {naira(challenge.stake)}
        </Text>
        <Text style={styles.winText}>
          Win: {naira(challenge.potentialWin)}
        </Text>
      </View>
      <Text style={styles.feeNote}>5% platform fee included</Text>

      {/* Time row */}
      <View style={styles.timeRow}>
        <View style={styles.timeCol}>
          <ClockIcon size={12} color={acceptBy.urgent ? colors.error : colors.textMuted} />
          <Text
            style={[
              styles.timeText,
              acceptBy.urgent && styles.timeUrgent,
            ]}
            numberOfLines={1}
          >
            Accept by: {acceptBy.label}
          </Text>
        </View>
        <View style={styles.timeCol}>
          <ClockIcon size={12} color={colors.textMuted} />
          <Text style={styles.timeText} numberOfLines={1}>
            Starts: {startLabel}
          </Text>
        </View>
      </View>

      {/* Rules snippet */}
      {challenge.rules.trim().length > 0 && (
        <Text style={styles.rules} numberOfLines={1}>
          {challenge.rules}
        </Text>
      )}

      {/* Action row */}
      <View style={styles.actionRow}>
        {variant === 'marketplace' && (
          <Text style={styles.joinLink}>Join Challenge →</Text>
        )}

        {variant === 'invited' && (
          <View style={styles.inviteActions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline]}
              onPress={onReject}
              accessibilityRole="button"
              accessibilityLabel="Reject challenge"
              testID={`card-reject-${challenge.id}`}
            >
              <Text style={styles.btnOutlineText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={onAccept}
              accessibilityRole="button"
              accessibilityLabel="Accept challenge"
              testID={`card-accept-${challenge.id}`}
            >
              <Text style={styles.btnPrimaryText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {challenge.status === 'awaiting_result' && variant === 'my-bet' && (
          <TouchableOpacity
            style={[styles.btn, styles.btnWarning]}
            onPress={onSubmitResult}
            accessibilityRole="button"
            accessibilityLabel="Submit result"
            testID={`card-submit-result-${challenge.id}`}
          >
            <Text style={styles.btnWarningText}>Submit Result →</Text>
          </TouchableOpacity>
        )}

        {challenge.status === 'disputed' && (
          <View style={styles.reviewChip}>
            <Text style={styles.reviewText}>Under Review</Text>
          </View>
        )}

        {challenge.status === 'completed' && (
          <View
            style={[styles.outcomeBadge, { backgroundColor: sv.color + '22' }]}
          >
            <Text style={[styles.outcomeText, { color: sv.color }]}>
              {challenge.outcome === 'win'
                ? `WON ${naira(challenge.potentialWin)}`
                : challenge.outcome === 'loss'
                  ? `LOST ${naira(challenge.stake)}`
                  : 'DRAW'}
            </Text>
          </View>
        )}

        {['cancelled', 'expired', 'rejected', 'void', 'refunded'].includes(
          challenge.status,
        ) && (
          <View style={styles.reasonChip}>
            <Text style={styles.reasonText}>
              {sv.label} · {formatTime(challenge.createdAt).label}
            </Text>
          </View>
        )}

        {variant !== 'marketplace' && variant !== 'invited' && (
          <TouchableOpacity
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="View details"
          >
            <Text style={styles.detailsLink}>View Details →</Text>
          </TouchableOpacity>
        )}

        {(challenge.status === 'open' &&
          challenge.userRole === 'creator' &&
          onCancel) && (
          <TouchableOpacity
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel challenge"
            testID={`card-cancel-${challenge.id}`}
          >
            <Text style={styles.cancelLink}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  gameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flex: 1,
  },
  swatch: { width: 20, height: 20, borderRadius: 10 },
  gameName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  platformPill: {
    backgroundColor: colors.primaryLight + '22',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  platformText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  username: { color: colors.textSecondary, fontSize: 13, flex: 1 },
  formatPill: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  formatText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  vsSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flex: 1,
  },
  vsName: { color: colors.textSecondary, fontSize: 12, flexShrink: 1 },
  vsLabel: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: spacing.sm,
  },
  stakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  stakeText: { color: colors.textSecondary, fontSize: 13 },
  winText: { color: colors.success, fontSize: 14, fontWeight: '700' },
  feeNote: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  timeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  timeText: { color: colors.textMuted, fontSize: 12, flexShrink: 1 },
  timeUrgent: { color: colors.error, fontWeight: '700' },
  rules: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  joinLink: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  detailsLink: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  cancelLink: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  inviteActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flex: 1,
  },
  btn: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnOutlineText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  btnPrimary: { backgroundColor: colors.primary },
  btnPrimaryText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  btnWarning: {
    backgroundColor: AMBER + '22',
    borderWidth: 1,
    borderColor: AMBER + '55',
    minHeight: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    flex: 1,
  },
  btnWarningText: { color: AMBER, fontSize: 14, fontWeight: '700' },
  reviewChip: {
    backgroundColor: colors.error + '22',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  reviewText: { color: colors.error, fontSize: 12, fontWeight: '700' },
  outcomeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  outcomeText: { fontSize: 13, fontWeight: '800' },
  reasonChip: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  reasonText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
});
