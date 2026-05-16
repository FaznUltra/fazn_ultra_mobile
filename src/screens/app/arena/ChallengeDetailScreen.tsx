import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Button } from '../../../components/ui/Button';
import { colors, spacing, radius } from '../../../theme';
import { formatNaira } from '../../../utils/wallet';
import { useArena } from '../../../hooks/useArena';
import type {
  ArenaChallenge,
  ChallengeStatus,
  ChallengeOutcome,
} from '../../../types/arena';
import type { ArenaStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<ArenaStackParamList, 'ChallengeDetail'>;
type Rt = RouteProp<ArenaStackParamList, 'ChallengeDetail'>;

const STATUS_AMBER = '#f59e0b';
const STATUS_BLUE = '#3b82f6';
const STATUS_ORANGE = '#f97316';
const STATUS_GOLD = '#eab308';

function CheckIcon({ size = 28, color = colors.success }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CrossIcon({ size = 28, color = colors.error }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6L18 18"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BackArrow({ size = 22, color = colors.textPrimary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 19L8 12L15 5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function statusLabel(c: ArenaChallenge): string {
  switch (c.status) {
    case 'open':
      return 'Open';
    case 'pending_acceptance':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'live':
      return 'Live';
    case 'awaiting_result':
      return 'Awaiting Result';
    case 'disputed':
      return 'Disputed';
    case 'completed':
      if (c.outcome === 'win') return 'Won';
      if (c.outcome === 'loss') return 'Lost';
      if (c.outcome === 'draw') return 'Draw';
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'rejected':
      return 'Rejected';
    case 'expired':
      return 'Expired';
    case 'void':
      return 'Void';
    case 'refunded':
      return 'Refunded';
    default:
      return c.status;
  }
}

function statusColor(c: ArenaChallenge): string {
  switch (c.status) {
    case 'open':
      return colors.primary;
    case 'pending_acceptance':
    case 'awaiting_result':
      return STATUS_AMBER;
    case 'accepted':
      return STATUS_BLUE;
    case 'live':
      return colors.success;
    case 'disputed':
      return STATUS_ORANGE;
    case 'completed':
      if (c.outcome === 'win') return STATUS_GOLD;
      return colors.textMuted;
    case 'cancelled':
    case 'rejected':
    case 'expired':
    case 'void':
    case 'refunded':
      return colors.error;
    default:
      return colors.textMuted;
  }
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function PulsingDot({ small }: { small?: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const size = small ? 8 : 12;
  return (
    <Animated.View
      testID="cd-pulse-dot"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: small ? colors.success : colors.error,
        opacity: pulse,
      }}
    />
  );
}

function StreamPanel({
  username,
  width,
  expanded,
  onToggle,
}: {
  username: string;
  width: Animated.AnimatedInterpolation<number> | number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const shimmer = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 0.7,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  return (
    <Animated.View style={[styles.streamPanel, { width }]}>
      <Animated.View style={[styles.streamShimmer, { opacity: shimmer }]} />
      <View style={styles.streamLabel}>
        <Text style={styles.streamLabelText} numberOfLines={1}>
          {username}
        </Text>
      </View>
      <View style={styles.streamLiveTag}>
        <PulsingDot small />
      </View>
      <View style={styles.streamCenter} pointerEvents="none">
        <Text style={styles.streamCenterText}>🔴 Live</Text>
      </View>
      <TouchableOpacity
        style={styles.streamBtn}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Compress stream' : 'Expand stream'}
      >
        <Text style={styles.streamBtnText}>{expanded ? '⤡' : '⤢'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DualStreamView({
  creatorName,
  opponentName,
}: {
  creatorName: string;
  opponentName: string;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const available = screenWidth - 20 * 2;
  const half = (available - spacing.sm) / 2;

  const [expanded, setExpanded] = useState<'creator' | 'opponent' | null>(
    null,
  );
  const t = useRef(new Animated.Value(0)).current;

  const animateTo = (
    next: 'creator' | 'opponent' | null,
    toValue: number,
  ) => {
    setExpanded(next);
    Animated.timing(t, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const creatorWidth = t.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, half, available],
  });
  const opponentWidth = t.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [available, half, 0],
  });

  return (
    <View testID="dual-stream-view">
      <Text style={styles.sectionTitle}>Live Streams</Text>
      <View style={styles.streamRow}>
        {expanded !== 'opponent' && (
          <StreamPanel
            username={creatorName}
            width={creatorWidth}
            expanded={expanded === 'creator'}
            onToggle={() =>
              animateTo(
                expanded === 'creator' ? null : 'creator',
                expanded === 'creator' ? 0 : 1,
              )
            }
          />
        )}
        {expanded !== 'creator' && (
          <StreamPanel
            username={opponentName}
            width={opponentWidth}
            expanded={expanded === 'opponent'}
            onToggle={() =>
              animateTo(
                expanded === 'opponent' ? null : 'opponent',
                expanded === 'opponent' ? 0 : -1,
              )
            }
          />
        )}
      </View>
      <Text style={styles.streamNote}>
        Both streams must show the same game. Discrepancies are flagged
        automatically.
      </Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function PlayerCard({
  name,
  roleLabel,
  glow,
  open,
  testID,
}: {
  name: string;
  roleLabel: string;
  glow?: boolean;
  open?: boolean;
  testID: string;
}) {
  const initial = open ? '?' : name.charAt(0).toUpperCase();
  return (
    <View
      style={[styles.playerCard, glow && styles.playerCardGlow]}
      testID={testID}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText} testID={`${testID}-initial`}>
          {initial}
        </Text>
      </View>
      <Text style={styles.playerName} numberOfLines={1}>
        {open ? 'Open slot' : name}
      </Text>
      <Text style={styles.playerRole}>{roleLabel}</Text>
    </View>
  );
}

export function ChallengeDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { challengeId } = route.params;
  const {
    state,
    getChallengeById,
    acceptChallenge,
    rejectChallenge,
    cancelChallenge,
    startChallenge,
    agreeToStart,
    retry,
  } = useArena();

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <ScreenContainer testID="challenge-detail-screen" noScroll>
        <View style={styles.center} testID="cd-loading">
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.mutedText}>Loading challenge…</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (state.status === 'error') {
    return (
      <ScreenContainer testID="challenge-detail-screen" noScroll>
        <View style={styles.center} testID="cd-error">
          <Text style={styles.errorText}>{state.message}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={retry}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            testID="cd-retry"
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const challenge = getChallengeById(challengeId);

  const Header = (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        testID="cd-back-btn"
      >
        <BackArrow />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Challenge Details</Text>
      <View style={styles.headerRight} />
    </View>
  );

  if (!challenge) {
    return (
      <ScreenContainer testID="challenge-detail-screen" noScroll>
        {Header}
        <View style={styles.center} testID="cd-not-found">
          <Text style={styles.errorText}>Challenge not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const c = challenge;
  const badgeColor = statusColor(c);
  const isCreator = c.userRole === 'creator';
  const isOpponent = c.userRole === 'opponent';
  const opponentName = c.opponent ? c.opponent.username : 'opponent';

  const confirm = (
    title: string,
    message: string,
    onYes: () => void,
    yesLabel: string,
  ) =>
    Alert.alert(title, message, [
      { text: 'No', style: 'cancel' },
      { text: yesLabel, style: 'destructive', onPress: onYes },
    ]);

  const renderActions = () => {
    const s: ChallengeStatus = c.status;

    if (s === 'open' && c.userRole === 'spectator') {
      return (
        <View testID="cd-action-accept-open">
          <Text style={styles.stakeWarn}>
            {formatNaira(c.stake)} will be deducted from your wallet
          </Text>
          <Button
            title="Accept Challenge"
            onPress={() => acceptChallenge(c.id)}
            testID="cd-accept-btn"
          />
        </View>
      );
    }

    if (s === 'open' && isCreator) {
      return (
        <View testID="cd-action-creator-open">
          <Text style={styles.infoText}>Waiting for an opponent…</Text>
          <Button
            title="Cancel Challenge"
            variant="outline"
            onPress={() =>
              confirm(
                'Cancel Challenge',
                'Are you sure you want to cancel this challenge?',
                () => cancelChallenge(c.id),
                'Cancel Challenge',
              )
            }
            style={styles.dangerBtn}
            testID="cd-cancel-btn"
          />
        </View>
      );
    }

    if (s === 'pending_acceptance' && isCreator) {
      return (
        <View testID="cd-action-creator-pending">
          <Text style={styles.infoText}>
            Waiting for {opponentName} to accept…
          </Text>
          <Button
            title="Cancel Challenge"
            variant="outline"
            onPress={() =>
              confirm(
                'Cancel Challenge',
                'Are you sure you want to cancel this challenge?',
                () => cancelChallenge(c.id),
                'Cancel Challenge',
              )
            }
            style={styles.dangerBtn}
            testID="cd-cancel-btn"
          />
        </View>
      );
    }

    if (s === 'pending_acceptance' && isOpponent) {
      return (
        <View testID="cd-action-opponent-pending">
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              You've been challenged! Review the match settings above.
            </Text>
          </View>
          <Button
            title="Accept"
            onPress={() => acceptChallenge(c.id)}
            testID="cd-accept-btn"
          />
          <Button
            title="Decline"
            variant="outline"
            onPress={() =>
              confirm(
                'Decline Challenge',
                'Are you sure you want to decline this challenge?',
                () => rejectChallenge(c.id),
                'Decline',
              )
            }
            style={styles.dangerBtn}
            testID="cd-decline-btn"
          />
        </View>
      );
    }

    if (s === 'accepted' && isCreator) {
      return (
        <View testID="cd-action-creator-accepted">
          <Text style={styles.infoText}>
            Both players accepted. You can start the match.
          </Text>
          <Button
            title="Start Match"
            onPress={() => startChallenge(c.id)}
            testID="cd-start-btn"
          />
          <Text style={styles.noteText}>
            Starting the match will notify your opponent to confirm.
          </Text>
        </View>
      );
    }

    if (s === 'accepted' && isOpponent) {
      return (
        <View testID="cd-action-opponent-accepted">
          <Text style={styles.infoText}>
            Waiting for {c.creator.username} to start the match.
          </Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Match Settings</Text>
            <Row label="Match Time" value="10 min" />
            <Row label="Penalties" value="Yes" />
            <Row label="Extra Time" value="Off" />
            <Text style={styles.noteText}>
              Verify these settings in-game before confirming.
            </Text>
          </View>
          <Button
            title="Agree to Start"
            onPress={() => agreeToStart(c.id)}
            testID="cd-agree-btn"
          />
        </View>
      );
    }

    if (s === 'live') {
      return (
        <View testID="cd-action-live">
          <Text style={styles.noteText}>
            Match is live. AI will score from the stream recording.
          </Text>
        </View>
      );
    }

    if (s === 'awaiting_result') {
      return (
        <View style={styles.statusBox} testID="cd-action-awaiting">
          <Text style={styles.statusBoxTitle}>
            ⏳ AI is analysing the match recording…
          </Text>
          <Text style={styles.statusBoxBody}>
            Results are typically ready within 30 minutes.
          </Text>
        </View>
      );
    }

    if (s === 'disputed') {
      return (
        <View style={styles.statusBox} testID="cd-action-disputed">
          <Text style={styles.statusBoxTitle}>
            ⚠️ This challenge is under dispute
          </Text>
          <Text style={styles.statusBoxBody}>
            Our team is reviewing. We'll resolve within 24 hours.
          </Text>
        </View>
      );
    }

    if (s === 'completed') {
      let icon = <CheckIcon color={colors.success} />;
      let title = 'Completed';
      let subtitle = '';
      let titleColor = colors.textPrimary;
      const outcome: ChallengeOutcome = c.outcome;
      if (outcome === 'win') {
        icon = <CheckIcon color={colors.success} />;
        title = 'You Won!';
        subtitle = formatNaira(c.potentialWin);
        titleColor = colors.success;
      } else if (outcome === 'loss') {
        icon = <CrossIcon color={colors.error} />;
        title = 'You Lost';
        subtitle = 'Better luck next time';
        titleColor = colors.error;
      } else if (outcome === 'draw') {
        icon = <Text style={styles.drawGlyph}>~</Text>;
        title = "It's a Draw";
        subtitle = 'Stakes refunded';
        titleColor = colors.textMuted;
      }
      const winnerName =
        outcome === 'win'
          ? c.userRole === 'creator'
            ? c.creator.username
            : c.opponent?.username ?? c.creator.username
          : null;
      return (
        <View style={styles.outcomeBox} testID="cd-action-completed">
          {icon}
          <Text style={[styles.outcomeTitle, { color: titleColor }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.outcomeSub}>{subtitle}</Text>
          ) : null}
          {winnerName ? (
            <Text style={styles.winnerText}>
              Winner: <Text style={styles.winnerName}>{winnerName}</Text>
            </Text>
          ) : null}
        </View>
      );
    }

    const closedMessages: Record<string, { title: string; body: string }> = {
      cancelled: {
        title: 'Challenge cancelled',
        body: 'This challenge was cancelled.',
      },
      rejected: {
        title: 'Challenge declined',
        body: 'This challenge invitation was declined.',
      },
      expired: {
        title: 'Challenge expired',
        body: 'No opponent accepted before the deadline.',
      },
      void: {
        title: 'Challenge voided',
        body: 'This challenge was voided. Stakes refunded.',
      },
      refunded: {
        title: 'Challenge refunded',
        body: 'Stakes refunded to both players.',
      },
    };
    const msg = closedMessages[s];
    if (msg) {
      return (
        <View style={styles.statusBox} testID="cd-action-closed">
          <CrossIcon size={24} color={colors.error} />
          <Text style={styles.statusBoxTitle}>{msg.title}</Text>
          <Text style={styles.statusBoxBody}>{msg.body}</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <ScreenContainer testID="challenge-detail-screen">
      {Header}

      <View style={styles.statusRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeColor + '22', borderColor: badgeColor },
          ]}
          testID="cd-status-badge"
        >
          {c.status === 'live' && <PulsingDot small />}
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {statusLabel(c)}
          </Text>
        </View>
      </View>

      <Text style={styles.challengeTitle}>{c.title}</Text>

      <View style={styles.playersRow} testID="cd-players">
        <PlayerCard
          name={c.creator.username}
          roleLabel="Creator"
          glow={isCreator}
          testID="cd-player-creator"
        />
        <Text style={styles.vsText}>VS</Text>
        <PlayerCard
          name={c.opponent ? c.opponent.username : ''}
          roleLabel="Opponent"
          glow={isOpponent}
          open={!c.opponent}
          testID="cd-player-opponent"
        />
      </View>

      {c.status === 'live' ? (
        <DualStreamView
          creatorName={c.creator.username}
          opponentName={c.opponent ? c.opponent.username : 'Opponent'}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Match Info</Text>
      <View style={styles.card}>
        <Row label="Game" value="eFootball 2025" />
        <Row label="Platform" value="Mobile" />
        <Row label="Format" value="1v1" />
        <Row label="Match Time" value="10 min" />
        <Row label="Penalties" value="Yes" />
        <Row label="Extra Time" value="Off" />
        {c.rules?.trim() ? (
          <View style={styles.rulesBox}>
            <Text style={styles.infoLabel}>Rules / Notes</Text>
            <Text style={styles.rulesText}>{c.rules}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Financial Breakdown</Text>
      <View style={styles.card}>
        <Row label="Your stake" value={formatNaira(c.stake)} />
        <Row label="Opponent stake" value={formatNaira(c.stake)} />
        <Row label="Platform fee (5%)" value={formatNaira(c.platformFee)} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Potential win</Text>
          <Text style={styles.winValue}>{formatNaira(c.potentialWin)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Schedule</Text>
      <View style={styles.card}>
        <Row
          label="Acceptance deadline"
          value={formatDateTime(c.acceptanceDue)}
        />
        <Row label="Match starts" value={formatDateTime(c.gameStartTime)} />
        {c.gameEndTime ? (
          <Row label="Match ended" value={formatDateTime(c.gameEndTime)} />
        ) : null}
      </View>

      <View style={styles.actionSection} testID="cd-actions">
        {renderActions()}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  mutedText: { color: colors.textMuted, fontSize: 13 },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
  },
  retryText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: { width: 44 },
  statusRow: { flexDirection: 'row', marginBottom: spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 13, fontWeight: '700' },
  challengeTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  playerCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  playerCardGlow: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '14',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primaryLight,
    fontSize: 18,
    fontWeight: '700',
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  playerRole: { color: colors.textMuted, fontSize: 12 },
  vsText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: { color: colors.textSecondary, fontSize: 14 },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  winValue: { color: colors.success, fontSize: 16, fontWeight: '700' },
  rulesBox: { paddingTop: spacing.sm, gap: spacing.xs },
  rulesText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actionSection: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  stakeWarn: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  noteText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  dangerBtn: { borderColor: colors.error, marginTop: spacing.sm },
  banner: {
    backgroundColor: colors.primary + '1f',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  bannerText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  liveText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBoxTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusBoxBody: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  outcomeBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  outcomeTitle: { fontSize: 22, fontWeight: '800' },
  outcomeSub: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  drawGlyph: {
    color: colors.textMuted,
    fontSize: 32,
    fontWeight: '800',
  },
  winnerText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  winnerName: { color: colors.primaryLight, fontWeight: '700' },
  streamRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  streamPanel: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  streamShimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
  },
  streamLabel: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: '#000000aa',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    maxWidth: '70%',
  },
  streamLabelText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  streamLiveTag: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  streamCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamCenterText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  streamBtn: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamBtnText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  streamNote: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.sm,
  },
});
