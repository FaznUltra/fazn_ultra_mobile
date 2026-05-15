import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { GameRanking, Tier } from '../../types/profile';
import { colors, spacing, radius } from '../../theme';

const TIER_CONFIG: Record<Tier, { color: string; label: string }> = {
  Bronze: { color: '#cd7f32', label: 'Bronze' },
  Silver: { color: '#9ca3af', label: 'Silver' },
  Gold: { color: '#f59e0b', label: 'Gold' },
  Platinum: { color: '#06b6d4', label: 'Platinum' },
  Diamond: { color: '#8b5cf6', label: 'Diamond' },
};

function TierBadge({ tier }: { tier: Tier }) {
  const { color, label } = TIER_CONFIG[tier];
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <View style={[styles.tierDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function RankingRow({ item }: { item: GameRanking }) {
  return (
    <View style={styles.row} testID={`ranking-row-${item.gameId}`}>
      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{item.gameName}</Text>
        <Text style={styles.platform}>{item.platform}</Text>
      </View>
      <View style={styles.rankRight}>
        <TierBadge tier={item.tier} />
        <Text style={styles.rankNum}>#{item.rank.toLocaleString()}</Text>
        <Text style={styles.points}>{item.points.toLocaleString()} pts</Text>
      </View>
    </View>
  );
}

interface Props {
  rankings: GameRanking[];
  testID?: string;
}

export function GameRankingsCard({ rankings, testID }: Props) {
  if (rankings.length === 0) {
    return (
      <View style={styles.empty} testID={testID}>
        <Text style={styles.emptyText}>No game rankings yet.</Text>
        <Text style={styles.emptyHint}>Join a challenge to start climbing the ranks.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card} testID={testID}>
      {rankings.map((item, idx) => (
        <React.Fragment key={item.gameId}>
          <RankingRow item={item} />
          {idx < rankings.length - 1 && <View style={styles.sep} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  sep: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  gameInfo: { flex: 1 },
  gameName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  platform: {
    color: colors.textMuted,
    fontSize: 12,
  },
  rankRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rankNum: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  points: {
    color: colors.textMuted,
    fontSize: 11,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
